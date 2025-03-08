const cron = require('node-cron');
const User = require('../models/User');
const Book = require('../models/Book');
const SystemLog = require('../models/SystemLog');
const mongoose = require('mongoose');

// 硬删除超过7天的软删除用户
const hardDeleteUsers = async () => {
  try {
    console.log('执行用户硬删除任务...');
    
    // 计算7天前的时间
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // 查找需要硬删除的用户
    const usersToDelete = await User.find({
      isDeleted: true,
      deletedAt: { $lt: sevenDaysAgo }
    });
    
    console.log(`找到 ${usersToDelete.length} 个需要硬删除的用户`);
    
    // 硬删除用户
    for (const user of usersToDelete) {
      console.log(`硬删除用户: ${user._id} (${user.username})`);
      
      // 记录到系统日志
      await SystemLog.create({
        action: 'USER_HARD_DELETE',
        targetId: user._id,
        targetType: 'User',
        details: {
          username: user.username,
          email: user.email,
          deletedAt: user.deletedAt
        },
        performedBy: mongoose.Types.ObjectId('000000000000000000000000') // 系统操作
      });
      
      // 执行硬删除
      await User.deleteOne({ _id: user._id });
    }
    
    console.log('用户硬删除任务完成');
  } catch (error) {
    console.error('用户硬删除任务失败:', error);
  }
};

// 硬删除超过7天的归档账本
const hardDeleteArchivedBooks = async () => {
  try {
    console.log('执行账本硬删除任务...');
    
    // 计算7天前的时间
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // 查找需要硬删除的账本
    const booksToDelete = await Book.find({
      isDeleted: true,
      deletedAt: { $lt: sevenDaysAgo }
    });
    
    console.log(`找到 ${booksToDelete.length} 个需要硬删除的账本`);
    
    // 硬删除账本
    for (const book of booksToDelete) {
      console.log(`硬删除账本: ${book._id} (${book.name})`);
      
      // 记录到系统日志
      await SystemLog.create({
        action: 'BOOK_DELETE',
        targetId: book._id,
        targetType: 'Book',
        details: {
          name: book.name,
          owner: book.owner,
          deletedAt: book.deletedAt
        },
        performedBy: mongoose.Types.ObjectId('000000000000000000000000') // 系统操作
      });
      
      // 执行硬删除
      await Book.deleteOne({ _id: book._id });
      
      // 这里可以添加删除账本相关数据的逻辑
      // 例如删除交易记录、分类、标签等
    }
    
    console.log('账本硬删除任务完成');
  } catch (error) {
    console.error('账本硬删除任务失败:', error);
  }
};

// 初始化定时任务
const initScheduledTasks = () => {
  // 每天凌晨3点执行硬删除任务
  cron.schedule('0 3 * * *', async () => {
    console.log('开始执行定时清理任务...');
    await hardDeleteUsers();
    await hardDeleteArchivedBooks();
    console.log('定时清理任务完成');
  });
  
  console.log('定时任务已初始化');
};

module.exports = {
  initScheduledTasks,
  hardDeleteUsers,
  hardDeleteArchivedBooks
}; 