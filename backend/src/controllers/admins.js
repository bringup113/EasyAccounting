const { Admin } = require('../models/Admin');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    管理员登录
// @route   POST /api/v1/admins/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // 验证输入
  if (!username || !password) {
    return next(new ErrorResponse('请提供用户名和密码', 400));
  }

  // 查找管理员
  const admin = await Admin.findOne({ username: username.toLowerCase() });

  if (!admin) {
    return next(new ErrorResponse('管理员不存在', 401));
  }

  // 验证密码
  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('密码错误', 401));
  }

  // 更新最后登录时间
  admin.lastLogin = Date.now();
  await admin.save();

  // 生成JWT令牌
  const token = jwt.sign(
    { id: admin._id, username: admin.username, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  res.status(200).json({
    success: true,
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      isSystemAdmin: admin.isSystemAdmin,
      lastLogin: admin.lastLogin
    }
  });
});

// @desc    获取当前管理员信息
// @route   GET /api/v1/admins/me
// @access  Private (Admin)
exports.getMe = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id).select('-password');

  res.status(200).json({
    success: true,
    data: admin
  });
});

// @desc    更新管理员密码
// @route   PUT /api/v1/admins/updatepassword
// @access  Private (Admin)
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('请提供当前密码和新密码', 400));
  }

  // 查找管理员
  const admin = await Admin.findById(req.admin.id);

  // 验证当前密码
  const isMatch = await admin.matchPassword(currentPassword);

  if (!isMatch) {
    return next(new ErrorResponse('当前密码错误', 401));
  }

  // 更新密码
  admin.password = newPassword;
  await admin.save();

  res.status(200).json({
    success: true,
    message: '密码更新成功'
  });
});

// @desc    获取所有管理员
// @route   GET /api/v1/admins
// @access  Private (System Admin)
exports.getAdmins = asyncHandler(async (req, res, next) => {
  // 检查是否为系统管理员
  if (!req.admin.isSystemAdmin) {
    return next(new ErrorResponse('只有系统管理员可以查看所有管理员', 403));
  }

  const admins = await Admin.find().select('-password');

  res.status(200).json({
    success: true,
    count: admins.length,
    data: admins
  });
});

// @desc    创建管理员
// @route   POST /api/v1/admins
// @access  Private (System Admin)
exports.createAdmin = asyncHandler(async (req, res, next) => {
  // 检查是否为系统管理员
  if (!req.admin.isSystemAdmin) {
    return next(new ErrorResponse('只有系统管理员可以创建管理员', 403));
  }

  const { username, password } = req.body;

  // 检查用户名是否已存在
  const adminExists = await Admin.findOne({ username: username.toLowerCase() });

  if (adminExists) {
    return next(new ErrorResponse('该用户名已被使用', 400));
  }

  // 创建管理员
  const admin = await Admin.create({
    username,
    password,
    isSystemAdmin: false // 新创建的管理员不是系统管理员
  });

  res.status(201).json({
    success: true,
    data: {
      id: admin._id,
      username: admin.username,
      isSystemAdmin: admin.isSystemAdmin,
      createdAt: admin.createdAt
    }
  });
});

// @desc    更新管理员
// @route   PUT /api/v1/admins/:id
// @access  Private (System Admin)
exports.updateAdmin = asyncHandler(async (req, res, next) => {
  // 检查是否为系统管理员
  if (!req.admin.isSystemAdmin) {
    return next(new ErrorResponse('只有系统管理员可以更新管理员', 403));
  }

  const { username, password } = req.body;
  const adminId = req.params.id;

  // 查找管理员
  const admin = await Admin.findById(adminId);

  if (!admin) {
    return next(new ErrorResponse('管理员不存在', 404));
  }

  // 防止修改系统管理员的用户名
  if (admin.isSystemAdmin && admin.username === 'admin' && username && username.toLowerCase() !== 'admin') {
    return next(new ErrorResponse('不能修改系统管理员的用户名', 400));
  }

  // 更新管理员
  if (username) {
    admin.username = username;
  }

  if (password) {
    admin.password = password;
  }

  await admin.save();

  res.status(200).json({
    success: true,
    data: {
      id: admin._id,
      username: admin.username,
      isSystemAdmin: admin.isSystemAdmin,
      updatedAt: admin.updatedAt
    }
  });
});

// @desc    删除管理员
// @route   DELETE /api/v1/admins/:id
// @access  Private (System Admin)
exports.deleteAdmin = asyncHandler(async (req, res, next) => {
  // 检查是否为系统管理员
  if (!req.admin.isSystemAdmin) {
    return next(new ErrorResponse('只有系统管理员可以删除管理员', 403));
  }

  const adminId = req.params.id;

  // 查找管理员
  const admin = await Admin.findById(adminId);

  if (!admin) {
    return next(new ErrorResponse('管理员不存在', 404));
  }

  // 防止删除系统管理员
  if (admin.isSystemAdmin && admin.username === 'admin') {
    return next(new ErrorResponse('不能删除系统管理员', 400));
  }

  await admin.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 