const ErrorResponse = require('../utils/errorResponse');

/**
 * 错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误信息
  console.error(err);

  // Mongoose 错误处理
  // 处理 Mongoose 无效 ObjectID
  if (err.name === 'CastError') {
    const message = `找不到资源`;
    error = new ErrorResponse(message, 404);
  }

  // 处理 Mongoose 重复键错误
  if (err.code === 11000) {
    const message = '输入的数据已存在';
    error = new ErrorResponse(message, 400);
  }

  // 处理 Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // 返回错误响应
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || '服务器错误'
  });
};

module.exports = errorHandler; 