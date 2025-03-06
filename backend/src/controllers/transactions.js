const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Account = require('../models/Account');

// @desc    创建新交易记录
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const {
      bookId,
      amount,
      type,
      categoryId,
      date,
      description,
      personIds,
      tagIds,
      accountId,
    } = req.body;

    // 检查账本是否存在
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否有权限访问该账本
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该账本',
      });
    }

    // 检查账户是否存在
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: '找不到该账户',
      });
    }

    // 创建交易记录
    const transaction = await Transaction.create({
      bookId,
      amount,
      type,
      categoryId,
      date: date || new Date(),
      description,
      personIds: personIds || [],
      tagIds: tagIds || [],
      accountId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取所有交易记录
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    let query = {};

    // 如果提供了账本ID，则只获取该账本的交易记录
    if (req.query.bookId) {
      // 检查账本是否存在
      const book = await Book.findById(req.query.bookId);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: '找不到该账本',
        });
      }

      // 检查用户是否有权限访问该账本
      if (
        book.ownerId.toString() !== req.user.id &&
        !book.members.includes(req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message: '无权访问该账本',
        });
      }

      query.bookId = req.query.bookId;
    } else {
      // 获取用户有权限访问的所有账本
      const books = await Book.find({
        $or: [
          { ownerId: req.user.id },
          { members: { $in: [req.user.id] } },
        ],
      });

      const bookIds = books.map((book) => book._id);
      query.bookId = { $in: bookIds };
    }

    // 日期范围过滤
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }

    // 交易类型过滤
    if (req.query.type) {
      query.type = req.query.type;
    }

    // 类别过滤
    if (req.query.categoryId) {
      query.categoryId = req.query.categoryId;
    }

    // 标签过滤
    if (req.query.tagId) {
      query.tagIds = { $in: [req.query.tagId] };
    }

    // 人员过滤
    if (req.query.personId) {
      query.personIds = { $in: [req.query.personId] };
    }

    // 账户过滤
    if (req.query.accountId) {
      query.accountId = req.query.accountId;
    }

    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Transaction.countDocuments(query);

    // 排序
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort.date = -1; // 默认按日期降序排序
    }

    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .populate('categoryId', 'name type')
      .populate('personIds', 'name')
      .populate('tagIds', 'name color')
      .populate('accountId', 'name currency');

    // 分页结果
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination,
      total,
      data: transactions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取单个交易记录
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('categoryId', 'name type')
      .populate('personIds', 'name')
      .populate('tagIds', 'name color')
      .populate('accountId', 'name currency');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: '找不到该交易记录',
      });
    }

    // 检查用户是否有权限访问该交易记录所属的账本
    const book = await Book.findById(transaction.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该交易记录',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    更新交易记录
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: '找不到该交易记录',
      });
    }

    // 检查用户是否有权限访问该交易记录所属的账本
    const book = await Book.findById(transaction.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该交易记录',
      });
    }

    // 如果更新了账户，检查新账户是否存在
    if (req.body.accountId && req.body.accountId !== transaction.accountId.toString()) {
      const account = await Account.findById(req.body.accountId);
      if (!account) {
        return res.status(404).json({
          success: false,
          message: '找不到该账户',
        });
      }
    }

    // 更新交易记录
    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('categoryId', 'name type')
      .populate('personIds', 'name')
      .populate('tagIds', 'name color')
      .populate('accountId', 'name currency');

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    删除交易记录
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: '找不到该交易记录',
      });
    }

    // 检查用户是否有权限访问该交易记录所属的账本
    const book = await Book.findById(transaction.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该交易记录',
      });
    }

    // 软删除交易记录
    transaction.isDeleted = true;
    await transaction.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取账本统计信息
// @route   GET /api/transactions/stats/:bookId
// @access  Private
exports.getBookStats = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { startDate, endDate } = req.query;

    // 检查账本是否存在
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否有权限访问该账本
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该账本',
      });
    }

    // 构建查询条件
    const query = { bookId, isDeleted: { $ne: true } };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    // 获取收入和支出统计
    const incomeStats = await Transaction.aggregate([
      { $match: { ...query, type: 'income' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const expenseStats = await Transaction.aggregate([
      { $match: { ...query, type: 'expense' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // 按类别统计
    const categoryStats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: { categoryId: '$categoryId', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id.categoryId',
          type: '$_id.type',
          total: 1,
          count: 1,
          categoryName: { $arrayElemAt: ['$category.name', 0] },
        },
      },
    ]);

    // 按账户统计
    const accountStats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: { accountId: '$accountId', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: '_id.accountId',
          foreignField: '_id',
          as: 'account',
        },
      },
      {
        $project: {
          _id: 0,
          accountId: '$_id.accountId',
          type: '$_id.type',
          total: 1,
          count: 1,
          accountName: { $arrayElemAt: ['$account.name', 0] },
          currency: { $arrayElemAt: ['$account.currency', 0] },
        },
      },
    ]);

    // 按月份统计
    const monthlyStats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          type: '$_id.type',
          total: 1,
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        income: incomeStats.length > 0 ? incomeStats[0].total : 0,
        expense: expenseStats.length > 0 ? expenseStats[0].total : 0,
        balance:
          (incomeStats.length > 0 ? incomeStats[0].total : 0) -
          (expenseStats.length > 0 ? expenseStats[0].total : 0),
        categoryStats,
        accountStats,
        monthlyStats,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}; 