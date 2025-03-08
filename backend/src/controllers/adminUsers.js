const User = require('../models/User');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    获取所有用户
// @route   GET /api/admins/users
// @access  Private (Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ isDeleted: false }).select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    获取单个用户
// @route   GET /api/admins/users/:id
// @access  Private (Admin)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse(`用户ID ${req.params.id} 不存在`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    创建用户
// @route   POST /api/admins/users
// @access  Private (Admin)
exports.createUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  // 检查用户名是否已存在
  const existingUserByName = await User.findOne({ username });
  if (existingUserByName) {
    return next(new ErrorResponse('用户名已被使用', 400));
  }

  // 检查邮箱是否已存在
  const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingUserByEmail) {
    return next(new ErrorResponse('邮箱已被注册', 400));
  }

  // 创建用户
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password
  });

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

// @desc    更新用户
// @route   PUT /api/admins/users/:id
// @access  Private (Admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;
  const userId = req.params.id;

  // 查找用户
  let user = await User.findById(userId);

  if (!user) {
    return next(new ErrorResponse(`用户ID ${userId} 不存在`, 404));
  }

  // 检查用户名是否已被其他用户使用
  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== userId) {
      return next(new ErrorResponse('用户名已被使用', 400));
    }
  }

  // 检查邮箱是否已被其他用户使用
  if (email && email.toLowerCase() !== user.email) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== userId) {
      return next(new ErrorResponse('邮箱已被注册', 400));
    }
  }

  // 如果提供了密码，直接更新用户对象并保存
  // 这样可以触发密码加密的中间件
  if (password) {
    if (username) user.username = username;
    if (email) user.email = email.toLowerCase();
    user.password = password;
    
    await user.save();
    
    // 返回更新后的用户（不包含密码）
    const updatedUser = await User.findById(userId).select('-password');
    
    return res.status(200).json({
      success: true,
      data: updatedUser
    });
  }
  
  // 如果没有提供密码，使用findByIdAndUpdate方法
  const updateFields = {};
  if (username) updateFields.username = username;
  if (email) updateFields.email = email.toLowerCase();

  user = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    重置用户密码
// @route   PUT /api/admins/users/:id/resetpassword
// @access  Private (Admin)
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;
  const userId = req.params.id;

  if (!newPassword) {
    return next(new ErrorResponse('请提供新密码', 400));
  }

  // 查找用户
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorResponse(`用户ID ${userId} 不存在`, 404));
  }

  // 更新密码
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: '密码重置成功'
  });
});

// @desc    删除用户（软删除）
// @route   DELETE /api/admins/users/:id
// @access  Private (Admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const { transferToUserId } = req.body; // 接收转移账本的用户ID

  // 查找用户
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorResponse(`用户ID ${userId} 不存在`, 404));
  }

  // 查找用户拥有的账本
  const Book = require('../models/Book');
  const userBooks = await Book.find({ owner: userId, isDeleted: false });
  
  // 查找用户共享的账本（用户是成员但不是所有者）
  const sharedBooks = await Book.find({ 
    members: userId, 
    owner: { $ne: userId },
    isDeleted: false 
  });

  // 处理用户拥有的账本
  if (userBooks.length > 0) {
    // 如果没有提供转移用户ID，则返回错误
    if (!transferToUserId) {
      return next(new ErrorResponse(`用户拥有 ${userBooks.length} 个账本，请提供转移账本的用户ID`, 400));
    }

    // 检查转移用户是否存在
    const transferToUser = await User.findById(transferToUserId);
    if (!transferToUser || transferToUser.isDeleted) {
      return next(new ErrorResponse(`转移目标用户ID ${transferToUserId} 不存在或已删除`, 404));
    }

    // 转移账本所有权
    for (const book of userBooks) {
      book.owner = transferToUserId;
      
      // 如果转移用户不在成员列表中，添加到成员列表
      if (!book.members.includes(transferToUserId)) {
        book.members.push(transferToUserId);
      }
      
      // 从成员列表中移除被删除的用户
      book.members = book.members.filter(memberId => 
        memberId.toString() !== userId.toString()
      );
      
      // 添加转移记录
      book.transferHistory = book.transferHistory || [];
      book.transferHistory.push({
        fromUser: userId,
        toUser: transferToUserId,
        date: Date.now(),
        reason: 'User deletion'
      });
      
      await book.save();
    }
  }

  // 从共享账本的成员列表中移除用户
  for (const book of sharedBooks) {
    book.members = book.members.filter(memberId => 
      memberId.toString() !== userId.toString()
    );
    await book.save();
  }

  // 软删除用户
  user.isDeleted = true;
  user.deletedAt = Date.now(); // 记录删除时间，用于7天后硬删除
  await user.save();

  // 记录删除操作到系统日志
  const SystemLog = require('../models/SystemLog');
  await SystemLog.create({
    action: 'USER_SOFT_DELETE',
    targetId: userId,
    targetType: 'User',
    details: {
      username: user.username,
      email: user.email,
      booksTransferred: userBooks.length,
      transferredTo: transferToUserId || null,
      sharedBooksRemoved: sharedBooks.length
    },
    performedBy: req.admin.id
  });

  res.status(200).json({
    success: true,
    data: {
      message: '用户已软删除',
      booksTransferred: userBooks.length,
      sharedBooksRemoved: sharedBooks.length
    }
  });
});

// @desc    恢复已删除的用户
// @route   PUT /api/admin-users/:id/restore
// @access  Private (Admin)
exports.restoreUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  // 查找用户
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorResponse(`用户ID ${userId} 不存在`, 404));
  }

  if (!user.isDeleted) {
    return next(new ErrorResponse(`用户未被删除，无需恢复`, 400));
  }

  // 恢复用户
  user.isDeleted = false;
  user.deletedAt = null;
  await user.save();

  // 记录恢复操作到系统日志
  const SystemLog = require('../models/SystemLog');
  await SystemLog.create({
    action: 'USER_RESTORE',
    targetId: userId,
    targetType: 'User',
    details: {
      username: user.username,
      email: user.email
    },
    performedBy: req.admin.id
  });

  res.status(200).json({
    success: true,
    data: {
      message: '用户已恢复',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    }
  });
});

// @desc    获取已删除的用户列表
// @route   GET /api/admin-users/deleted
// @access  Private (Admin)
exports.getDeletedUsers = asyncHandler(async (req, res, next) => {
  // 查找已删除的用户
  const users = await User.find({ isDeleted: true }).select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    获取用户密码（仅限管理员使用）
// @route   GET /api/admin-users/:id/password
// @access  Private (Admin)
exports.getUserPassword = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  // 查找用户，包括密码字段
  const user = await User.findById(userId).select('+password');

  if (!user) {
    return next(new ErrorResponse(`用户ID ${userId} 不存在`, 404));
  }

  // 获取原始密码（未加密）
  // 注意：由于密码在数据库中是加密存储的，我们无法获取原始密码
  // 这里返回的是加密后的密码，仅用于显示
  res.status(200).json({
    success: true,
    data: {
      password: user.password
    }
  });
}); 