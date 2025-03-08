const jwt = require('jsonwebtoken');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const { Admin } = require('../models/Admin');

// 保护管理员路由
exports.protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  // 从请求头或cookie中获取token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 从Bearer token中提取
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 从cookie中获取
    token = req.cookies.token;
  }

  // 确保token存在
  if (!token) {
    return next(new ErrorResponse('未授权访问', 401));
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 确保是管理员token
    if (!decoded.isAdmin) {
      return next(new ErrorResponse('需要管理员权限', 403));
    }

    // 查找管理员
    req.admin = await Admin.findById(decoded.id);

    if (!req.admin) {
      return next(new ErrorResponse('找不到具有此ID的管理员', 404));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('未授权访问', 401));
  }
}); 