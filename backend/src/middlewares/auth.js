const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Admin } = require('../models/Admin');
const ErrorResponse = require('../utils/errorResponse');

// 保护路由
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 从Bearer token中获取token
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 从cookie中获取token
    token = req.cookies.token;
  }

  // 确保token存在
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未授权访问',
    });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 查找用户
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '找不到具有此ID的用户',
      });
    }

    // 将用户添加到请求对象
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: '未授权访问',
    });
  }
};

// 授权角色
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `用户角色 ${req.user.role} 未被授权访问此路由`,
      });
    }
    next();
  };
};

// 保护管理员路由
exports.protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 从Bearer token中获取token
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 从cookie中获取token
    token = req.cookies.token;
  }

  // 确保token存在
  if (!token) {
    return next(new ErrorResponse('未授权访问', 401));
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 检查是否为管理员token
    if (!decoded.isAdmin) {
      return next(new ErrorResponse('此令牌不是管理员令牌', 401));
    }

    // 查找管理员
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return next(new ErrorResponse('找不到具有此ID的管理员', 401));
    }

    // 将管理员添加到请求对象
    req.admin = admin;
    next();
  } catch (err) {
    return next(new ErrorResponse('未授权访问', 401));
  }
}; 