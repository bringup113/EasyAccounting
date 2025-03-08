/**
 * 异步处理中间件
 * 用于包装异步控制器函数，简化错误处理
 * @param {Function} fn 异步控制器函数
 * @returns {Function} 包装后的中间件函数
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;