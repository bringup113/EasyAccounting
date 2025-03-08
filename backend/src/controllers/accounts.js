const Account = require('../models/Account');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

/**
 * 计算账户余额和相关统计信息
 * @param {Object} account - 账户对象
 * @param {Object} book - 账本对象
 * @returns {Object} 包含余额和统计信息的账户对象
 */
const calculateAccountBalance = async (account, book) => {
  try {
    // 使用聚合查询一次性获取所有交易数据并计算总额
    const transactionStats = await Transaction.aggregate([
      {
        $match: {
          accountId: mongoose.Types.ObjectId(account._id),
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 初始化统计数据
    let totalIncome = 0;
    let totalExpense = 0;
    
    // 处理聚合结果
    transactionStats.forEach(stat => {
      if (stat._id === 'income') {
        totalIncome = stat.total;
      } else if (stat._id === 'expense') {
        totalExpense = stat.total;
      }
    });

    // 计算当前余额
    const currentBalance = account.initialBalance + totalIncome - totalExpense;

    // 获取货币信息
    const currency = book.currencies.find(c => c.code === account.currency);

    // 检查是否有交易记录
    const hasTransactions = totalIncome > 0 || totalExpense > 0;

    // 返回增强的账户对象
    return {
      ...account.toObject(),
      currentBalance,
      totalIncome,
      totalExpense,
      currencyInfo: currency,
      hasTransactions
    };
  } catch (error) {
    throw new Error(`计算账户余额失败: ${error.message}`);
  }
};

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
      message: '创建账户失败',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
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

    // 计算每个账户的当前余额和统计信息
    const accountsWithBalance = await Promise.all(
      accounts.map(account => calculateAccountBalance(account, book))
    );

    res.status(200).json({
      success: true,
      count: accountsWithBalance.length,
      data: accountsWithBalance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: '获取账户列表失败',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
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

    // 计算账户余额和统计信息
    const accountWithBalance = await calculateAccountBalance(account, book);

    res.status(200).json({
      success: true,
      data: accountWithBalance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: '获取账户详情失败',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
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

    // 提取允许更新的字段
    const { name, initialBalance, currency } = req.body;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (initialBalance !== undefined) updateData.initialBalance = initialBalance;
    if (currency !== undefined) updateData.currency = currency;

    // 更新账户
    account = await Account.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: '更新账户失败',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
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
    account.deletedAt = new Date();
    await account.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: '删除账户失败',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}; 