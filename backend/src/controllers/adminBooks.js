const Book = require('../models/Book');
const User = require('../models/User');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const SystemLog = require('../models/SystemLog');

// @desc    获取所有账本（包括已归档和已删除的）
// @route   GET /api/admin-books
// @access  Private (Admin)
exports.getAllBooks = asyncHandler(async (req, res, next) => {
  // 查询所有账本，不使用中间件过滤
  const books = await Book.find()
    .populate('ownerId', 'username email')
    .populate('members', 'username email');

  res.status(200).json({
    success: true,
    count: books.length,
    data: books
  });
});

// @desc    获取已归档的账本
// @route   GET /api/admin-books/archived
// @access  Private (Admin)
exports.getArchivedBooks = asyncHandler(async (req, res, next) => {
  // 查询已归档的账本
  const books = await Book.find({ isArchived: true, isDeleted: false })
    .populate('ownerId', 'username email')
    .populate('members', 'username email');

  res.status(200).json({
    success: true,
    count: books.length,
    data: books
  });
});

// @desc    获取已删除的账本
// @route   GET /api/admin-books/deleted
// @access  Private (Admin)
exports.getDeletedBooks = asyncHandler(async (req, res, next) => {
  // 查询已删除的账本
  const books = await Book.find({ isDeleted: true })
    .populate('ownerId', 'username email')
    .populate('members', 'username email');

  res.status(200).json({
    success: true,
    count: books.length,
    data: books
  });
});

// @desc    归档账本
// @route   PUT /api/admin-books/:id/archive
// @access  Private (Admin)
exports.archiveBook = asyncHandler(async (req, res, next) => {
  const bookId = req.params.id;

  // 查找账本
  const book = await Book.findById(bookId);

  if (!book) {
    return next(new ErrorResponse(`账本ID ${bookId} 不存在`, 404));
  }

  if (book.isDeleted) {
    return next(new ErrorResponse(`账本已删除，无法归档`, 400));
  }

  if (book.isArchived) {
    return next(new ErrorResponse(`账本已归档，无需再次归档`, 400));
  }

  // 归档账本
  book.isArchived = true;
  book.archivedAt = Date.now();
  await book.save();

  // 记录归档操作到系统日志
  await SystemLog.create({
    action: 'BOOK_ARCHIVE',
    targetId: bookId,
    targetType: 'Book',
    details: {
      name: book.name,
      owner: book.ownerId
    },
    performedBy: req.admin.id
  });

  res.status(200).json({
    success: true,
    data: {
      message: '账本已归档',
      book: {
        id: book._id,
        name: book.name
      }
    }
  });
});

// @desc    恢复归档的账本
// @route   PUT /api/admin-books/:id/restore
// @access  Private (Admin)
exports.restoreBook = asyncHandler(async (req, res, next) => {
  const bookId = req.params.id;

  // 查找账本
  const book = await Book.findById(bookId);

  if (!book) {
    return next(new ErrorResponse(`账本ID ${bookId} 不存在`, 404));
  }

  if (book.isDeleted) {
    return next(new ErrorResponse(`账本已删除，请先恢复删除状态`, 400));
  }

  if (!book.isArchived) {
    return next(new ErrorResponse(`账本未归档，无需恢复`, 400));
  }

  // 恢复账本
  book.isArchived = false;
  book.archivedAt = null;
  await book.save();

  // 记录恢复操作到系统日志
  await SystemLog.create({
    action: 'BOOK_RESTORE',
    targetId: bookId,
    targetType: 'Book',
    details: {
      name: book.name,
      owner: book.ownerId
    },
    performedBy: req.admin.id
  });

  res.status(200).json({
    success: true,
    data: {
      message: '账本已恢复',
      book: {
        id: book._id,
        name: book.name
      }
    }
  });
});

// @desc    恢复已删除的账本
// @route   PUT /api/admin-books/:id/undelete
// @access  Private (Admin)
exports.undeleteBook = asyncHandler(async (req, res, next) => {
  const bookId = req.params.id;

  // 查找账本
  const book = await Book.findById(bookId);

  if (!book) {
    return next(new ErrorResponse(`账本ID ${bookId} 不存在`, 404));
  }

  if (!book.isDeleted) {
    return next(new ErrorResponse(`账本未删除，无需恢复`, 400));
  }

  // 恢复账本
  book.isDeleted = false;
  book.deletedAt = null;
  await book.save();

  // 记录恢复操作到系统日志
  await SystemLog.create({
    action: 'BOOK_RESTORE',
    targetId: bookId,
    targetType: 'Book',
    details: {
      name: book.name,
      owner: book.ownerId
    },
    performedBy: req.admin.id
  });

  res.status(200).json({
    success: true,
    data: {
      message: '账本已从删除状态恢复',
      book: {
        id: book._id,
        name: book.name
      }
    }
  });
});

// @desc    转移账本所有权
// @route   PUT /api/admin-books/:id/transfer
// @access  Private (Admin)
exports.transferBook = asyncHandler(async (req, res, next) => {
  const bookId = req.params.id;
  const { newOwnerId } = req.body;

  if (!newOwnerId) {
    return next(new ErrorResponse('请提供新所有者ID', 400));
  }

  // 查找账本
  const book = await Book.findById(bookId);

  if (!book) {
    return next(new ErrorResponse(`账本ID ${bookId} 不存在`, 404));
  }

  if (book.isDeleted) {
    return next(new ErrorResponse(`账本已删除，无法转移`, 400));
  }

  // 检查新所有者是否存在
  const newOwner = await User.findById(newOwnerId);
  if (!newOwner || newOwner.isDeleted) {
    return next(new ErrorResponse(`新所有者ID ${newOwnerId} 不存在或已删除`, 404));
  }

  // 记录原所有者
  const oldOwnerId = book.ownerId;

  // 转移账本所有权
  book.ownerId = newOwnerId;
  
  // 如果新所有者不在成员列表中，添加到成员列表
  if (!book.members.includes(newOwnerId)) {
    book.members.push(newOwnerId);
  }
  
  // 添加转移记录
  book.transferHistory = book.transferHistory || [];
  book.transferHistory.push({
    fromUser: oldOwnerId,
    toUser: newOwnerId,
    date: Date.now(),
    reason: 'Admin action'
  });
  
  await book.save();

  // 记录转移操作到系统日志
  await SystemLog.create({
    action: 'BOOK_TRANSFER',
    targetId: bookId,
    targetType: 'Book',
    details: {
      name: book.name,
      fromUser: oldOwnerId,
      toUser: newOwnerId
    },
    performedBy: req.admin.id
  });

  res.status(200).json({
    success: true,
    data: {
      message: '账本所有权已转移',
      book: {
        id: book._id,
        name: book.name,
        newOwner: newOwnerId
      }
    }
  });
}); 