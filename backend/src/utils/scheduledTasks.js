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

/**
 * 记录系统日志
 * @param {string} action - 操作类型
 * @param {string} targetId - 目标ID
 * @param {string} targetType - 目标类型
 * @param {Object} details - 详细信息
 */
const logSystemAction = async (action, targetId, targetType, details) => {
  try {
    await SystemLog.create({
      action,
      targetId,
      targetType,
      details,
      performedBy: mongoose.Types.ObjectId('000000000000000000000000') // 系统操作
    });
  } catch (error) {
    console.error(`记录系统日志失败: ${action}`, error);
  }
};

/**
 * 硬删除标记为已删除超过30天的用户
 * 使用事务确保数据一致性
 */
const hardDeleteUsers = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 查找标记为已删除且删除时间超过30天的用户
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const usersToDelete = await User.find({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo }
    }).session(session);
    
    // 如果没有符合条件的用户，直接返回
    if (usersToDelete.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return;
    }
    
    console.info(`开始硬删除 ${usersToDelete.length} 个用户数据`);
    
    // 遍历并硬删除用户
    for (const user of usersToDelete) {
      // 记录删除操作
      await logSystemAction(
        'USER_HARD_DELETE',
        user._id,
        'User',
        {
          username: user.username,
          email: user.email,
          deletedAt: user.deletedAt
        }
      );
      
      // 删除用户相关的所有数据
      await Book.deleteMany({ user: user._id }).session(session);
      await Transaction.deleteMany({ user: user._id }).session(session);
      await Account.deleteMany({ user: user._id }).session(session);
      await Category.deleteMany({ user: user._id }).session(session);
      await Tag.deleteMany({ user: user._id }).session(session);
      await Person.deleteMany({ user: user._id }).session(session);
      
      // 最后删除用户本身
      await User.findByIdAndDelete(user._id).session(session);
    }
    
    // 提交事务
    await session.commitTransaction();
    console.info(`成功硬删除 ${usersToDelete.length} 个用户数据`);
  } catch (error) {
    // 回滚事务
    await session.abortTransaction();
    console.error('用户硬删除任务失败:', error);
    
    // 记录错误到系统日志
    await logSystemAction(
      'SYSTEM_ERROR',
      null,
      'ScheduledTask',
      {
        task: 'hardDeleteUsers',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    );
  } finally {
    session.endSession();
  }
};

/**
 * 硬删除标记为已删除超过30天的账本
 * 使用事务确保数据一致性
 */
const hardDeleteBooks = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 查找标记为已删除且删除时间超过30天的账本
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const booksToDelete = await Book.find({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo }
    }).session(session);
    
    // 如果没有符合条件的账本，直接返回
    if (booksToDelete.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return;
    }
    
    console.info(`开始硬删除 ${booksToDelete.length} 个账本数据`);
    
    // 遍历并硬删除账本
    for (const book of booksToDelete) {
      // 记录删除操作
      await logSystemAction(
        'BOOK_HARD_DELETE',
        book._id,
        'Book',
        {
          name: book.name,
          owner: book.owner,
          deletedAt: book.deletedAt
        }
      );
      
      // 删除账本相关的所有数据
      await Transaction.deleteMany({ book: book._id }).session(session);
      await Account.deleteMany({ book: book._id }).session(session);
      await Category.deleteMany({ book: book._id }).session(session);
      await Tag.deleteMany({ book: book._id }).session(session);
      await Person.deleteMany({ book: book._id }).session(session);
      
      // 最后删除账本本身
      await Book.findByIdAndDelete(book._id).session(session);
    }
    
    // 提交事务
    await session.commitTransaction();
    console.info(`成功硬删除 ${booksToDelete.length} 个账本数据`);
  } catch (error) {
    // 回滚事务
    await session.abortTransaction();
    console.error('账本硬删除任务失败:', error);
    
    // 记录错误到系统日志
    await logSystemAction(
      'SYSTEM_ERROR',
      null,
      'ScheduledTask',
      {
        task: 'hardDeleteBooks',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    );
  } finally {
    session.endSession();
  }
};

/**
 * 初始化定时任务
 */
const initScheduledTasks = () => {
  // 每天凌晨3点执行清理任务
  cron.schedule('0 3 * * *', async () => {
    console.info('开始执行定时清理任务...');
    
    try {
      // 记录任务开始
      await logSystemAction(
        'SCHEDULED_TASK_START',
        null,
        'System',
        { taskName: 'dailyCleanup', startTime: new Date() }
      );
      
      // 执行清理任务
      await hardDeleteUsers();
      await hardDeleteBooks();
      
      // 记录任务完成
      await logSystemAction(
        'SCHEDULED_TASK_COMPLETE',
        null,
        'System',
        { taskName: 'dailyCleanup', endTime: new Date() }
      );
      
      console.info('定时清理任务完成');
    } catch (error) {
      console.error('定时任务执行失败:', error);
      
      // 记录任务失败
      await logSystemAction(
        'SCHEDULED_TASK_FAIL',
        null,
        'System',
        { 
          taskName: 'dailyCleanup', 
          error: error.message,
          time: new Date() 
        }
      );
    }
  });
  
  console.info('定时任务已初始化');
};

module.exports = {
  initScheduledTasks
}; 