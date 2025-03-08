const cron = require('node-cron');
const User = require('../models/User');
const Book = require('../models/Book');
const SystemLog = require('../models/SystemLog');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Person = require('../models/Person');

// 硬删除标记为已删除超过30天的用户
const hardDeleteUsers = async () => {
  try {
    // 查找标记为已删除且删除时间超过30天的用户
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const usersToDelete = await User.find({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo }
    });
    
    // 如果没有符合条件的用户，直接返回
    if (usersToDelete.length === 0) {
      return;
    }
    
    // 遍历并硬删除用户
    for (const user of usersToDelete) {
      // 删除用户相关的所有数据
      await Book.deleteMany({ user: user._id });
      await Transaction.deleteMany({ user: user._id });
      await Account.deleteMany({ user: user._id });
      await Category.deleteMany({ user: user._id });
      await Tag.deleteMany({ user: user._id });
      await Person.deleteMany({ user: user._id });
      
      // 最后删除用户本身
      await User.findByIdAndDelete(user._id);
    }
  } catch (error) {
    // 处理错误
  }
};

// 硬删除标记为已删除超过30天的账本
const hardDeleteBooks = async () => {
  try {
    // 查找标记为已删除且删除时间超过30天的账本
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const booksToDelete = await Book.find({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo }
    });
    
    // 如果没有符合条件的账本，直接返回
    if (booksToDelete.length === 0) {
      return;
    }
    
    // 遍历并硬删除账本
    for (const book of booksToDelete) {
      // 删除账本相关的所有数据
      await Transaction.deleteMany({ book: book._id });
      await Account.deleteMany({ book: book._id });
      await Category.deleteMany({ book: book._id });
      await Tag.deleteMany({ book: book._id });
      await Person.deleteMany({ book: book._id });
      
      // 最后删除账本本身
      await Book.findByIdAndDelete(book._id);
    }
  } catch (error) {
    // 处理错误
  }
};

// 初始化定时任务
const initScheduledTasks = () => {
  // 每天凌晨3点执行清理任务
  cron.schedule('0 3 * * *', async () => {
    // 执行清理任务
    await hardDeleteUsers();
    await hardDeleteBooks();
  });
};

module.exports = {
  initScheduledTasks
}; 