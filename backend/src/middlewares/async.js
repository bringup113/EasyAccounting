// 异步处理中间件
// 用于捕获异步路由处理器中的错误，避免使用try-catch块
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler; 