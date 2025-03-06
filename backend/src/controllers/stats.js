const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Account = require('../models/Account');
const Category = require('../models/Category');

// @desc    获取账本统计数据
// @route   GET /api/books/:bookId/stats
// @access  Private
exports.getBookStats = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { startDate, endDate } = req.query;
    
    // 验证账本是否存在
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: '账本不存在' });
    }
    
    // 验证用户是否有权限访问该账本
    if (!book.members.includes(req.user.id) && book.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: '您没有权限访问该账本' });
    }
    
    // 构建查询条件
    const query = { bookId, isDeleted: { $ne: true } };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    // 获取所有交易记录
    const transactions = await Transaction.find(query)
      .populate('categoryId', 'name type')
      .populate('accountId', 'name currency');
    
    // 获取账本的所有账户
    const accounts = await Account.find({ bookId });
    
    // 获取账本的所有类别
    const categories = await Category.find({ bookId });
    
    // 获取账本的货币信息
    const defaultCurrency = book.defaultCurrency;
    const currencies = book.currencies || [];
    
    // 计算总收入和总支出（按本位币）
    let totalIncome = 0;
    let totalExpense = 0;
    
    // 按类别统计
    const categoryStats = {};
    
    // 按账户统计
    const accountStats = {};
    
    // 按日期统计
    const dateStats = {};
    
    // 初始化账户统计
    accounts.forEach(account => {
      accountStats[account._id.toString()] = {
        id: account._id,
        name: account.name,
        income: 0,
        expense: 0,
        transfer: 0,
        currency: account.currency
      };
    });
    
    // 初始化类别统计
    categories.forEach(category => {
      categoryStats[category._id.toString()] = {
        id: category._id,
        name: category.name,
        type: category.type,
        amount: 0,
        count: 0
      };
    });
    
    // 处理每个交易记录
    transactions.forEach(transaction => {
      const { type, amount, date, categoryId, accountId } = transaction;
      const dateStr = new Date(date).toISOString().split('T')[0];
      
      // 查找账户及其货币
      const account = accounts.find(a => a._id.toString() === accountId.toString());
      if (!account) return;
      
      const accountCurrency = account.currency;
      
      // 获取货币汇率
      const currencyInfo = currencies.find(c => c.code === accountCurrency);
      const exchangeRate = currencyInfo ? currencyInfo.rate : 1;
      
      // 转换为本位币金额
      const amountInDefaultCurrency = amount / exchangeRate;
      
      // 更新账户统计
      if (accountStats[accountId.toString()]) {
        if (type === 'income') {
          accountStats[accountId.toString()].income += amount;
        } else if (type === 'expense') {
          accountStats[accountId.toString()].expense += amount;
        } else if (type === 'transfer') {
          accountStats[accountId.toString()].transfer += amount;
        }
      }
      
      // 更新总收入和总支出（按本位币）
      if (type === 'income') {
        totalIncome += amountInDefaultCurrency;
      } else if (type === 'expense') {
        totalExpense += amountInDefaultCurrency;
      }
      
      // 更新类别统计
      if (categoryId && categoryStats[categoryId.toString()]) {
        if (type === categoryStats[categoryId.toString()].type) {
          categoryStats[categoryId.toString()].amount += amountInDefaultCurrency;
          categoryStats[categoryId.toString()].count += 1;
        }
      }
      
      // 更新日期统计
      if (!dateStats[dateStr]) {
        dateStats[dateStr] = {
          date: dateStr,
          income: 0,
          expense: 0,
          transfer: 0
        };
      }
      
      if (type === 'income') {
        dateStats[dateStr].income += amountInDefaultCurrency;
      } else if (type === 'expense') {
        dateStats[dateStr].expense += amountInDefaultCurrency;
      } else if (type === 'transfer') {
        dateStats[dateStr].transfer += amountInDefaultCurrency;
      }
    });
    
    // 返回统计结果
    res.json({
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      accountStats: Object.values(accountStats),
      categoryStats: Object.values(categoryStats).filter(stat => stat.count > 0),
      dateStats: Object.values(dateStats).sort((a, b) => a.date.localeCompare(b.date)),
      defaultCurrency
    });
  } catch (error) {
    console.error('获取账本统计数据失败:', error);
    res.status(500).json({ message: '获取账本统计数据失败' });
  }
}; 