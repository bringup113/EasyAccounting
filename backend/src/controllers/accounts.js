const Account = require('../models/Account');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

// @desc    创建新账户
// @route   POST /api/accounts
// @access  Private
exports.createAccount = async (req, res) => {
  try {
    const { name, bookId, currency, initialBalance } = req.body;

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

    // 检查货币是否有效
    if (!currency) {
      return res.status(400).json({
        success: false,
        message: '请提供货币',
      });
    }

    // 检查货币是否在账本的货币列表中
    const currencyExists = book.currencies.some(c => c.code === currency);
    if (!currencyExists) {
      return res.status(400).json({
        success: false,
        message: '该货币不在账本的货币列表中',
      });
    }

    // 创建账户
    const account = await Account.create({
      name,
      bookId,
      currency,
      initialBalance: initialBalance || 0,
    });

    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取账本的所有账户
// @route   GET /api/accounts
// @access  Private
exports.getAccounts = async (req, res) => {
  try {
    const { bookId } = req.query;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: '请提供账本ID',
      });
    }

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

    // 获取账户
    const accounts = await Account.find({ bookId }).sort('name');

    // 计算每个账户的当前余额
    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        // 获取所有收入交易
        const incomeTransactions = await Transaction.find({
          accountId: account._id,
          type: 'income',
          isDeleted: { $ne: true },
        });

        // 获取所有支出交易
        const expenseTransactions = await Transaction.find({
          accountId: account._id,
          type: 'expense',
          isDeleted: { $ne: true },
        });

        // 计算总收入
        const totalIncome = incomeTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );

        // 计算总支出
        const totalExpense = expenseTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );

        // 计算当前余额
        const currentBalance = account.initialBalance + totalIncome - totalExpense;

        // 获取货币信息
        const currency = book.currencies.find(c => c.code === account.currency);

        // 检查是否有交易记录
        const hasTransactions = incomeTransactions.length > 0 || expenseTransactions.length > 0;

        return {
          ...account.toObject(),
          currentBalance,
          totalIncome,
          totalExpense,
          currencyInfo: currency,
          hasTransactions
        };
      })
    );

    res.status(200).json({
      success: true,
      count: accountsWithBalance.length,
      data: accountsWithBalance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取单个账户
// @route   GET /api/accounts/:id
// @access  Private
exports.getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: '找不到该账户',
      });
    }

    // 检查用户是否有权限访问该账户所属的账本
    const book = await Book.findById(account.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该账户',
      });
    }

    // 获取所有收入交易
    const incomeTransactions = await Transaction.find({
      accountId: account._id,
      type: 'income',
      isDeleted: { $ne: true },
    });

    // 获取所有支出交易
    const expenseTransactions = await Transaction.find({
      accountId: account._id,
      type: 'expense',
      isDeleted: { $ne: true },
    });

    // 计算总收入
    const totalIncome = incomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // 计算总支出
    const totalExpense = expenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // 计算当前余额
    const currentBalance = account.initialBalance + totalIncome - totalExpense;

    // 获取货币信息
    const currency = book.currencies.find(c => c.code === account.currency);

    // 检查是否有交易记录
    const hasTransactions = incomeTransactions.length > 0 || expenseTransactions.length > 0;

    res.status(200).json({
      success: true,
      data: {
        ...account.toObject(),
        currentBalance,
        totalIncome,
        totalExpense,
        currencyInfo: currency,
        hasTransactions
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    更新账户
// @route   PUT /api/accounts/:id
// @access  Private
exports.updateAccount = async (req, res) => {
  try {
    let account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: '找不到该账户',
      });
    }

    // 检查用户是否有权限访问该账户所属的账本
    const book = await Book.findById(account.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该账户',
      });
    }

    // 如果更新了货币，检查货币是否有效
    if (req.body.currency && req.body.currency !== account.currency) {
      // 检查货币是否在账本的货币列表中
      const currencyExists = book.currencies.some(c => c.code === req.body.currency);
      if (!currencyExists) {
        return res.status(400).json({
          success: false,
          message: '该货币不在账本的货币列表中',
        });
      }

      // 检查是否有交易记录使用了该账户
      const transactions = await Transaction.find({
        accountId: account._id,
        isDeleted: { $ne: true },
      });

      if (transactions.length > 0) {
        return res.status(400).json({
          success: false,
          message: '该账户已被交易记录使用，无法更改货币',
        });
      }
    }

    // 更新账户
    account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    删除账户
// @route   DELETE /api/accounts/:id
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: '找不到该账户',
      });
    }

    // 检查用户是否有权限访问该账户所属的账本
    const book = await Book.findById(account.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该账户',
      });
    }

    // 检查是否有交易记录使用了该账户
    const transactions = await Transaction.find({
      accountId: account._id,
      isDeleted: { $ne: true },
    });

    if (transactions.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该账户已被交易记录使用，无法删除',
      });
    }

    // 软删除账户
    account.isDeleted = true;
    await account.save();

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