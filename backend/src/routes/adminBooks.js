const express = require('express');
const {
  getAllBooks,
  getArchivedBooks,
  getDeletedBooks,
  archiveBook,
  restoreBook,
  undeleteBook,
  transferBook
} = require('../controllers/adminBooks');

const router = express.Router();

// 引入管理员认证中间件
const { protectAdmin } = require('../middleware/auth');

// 所有路由都需要管理员认证
router.use(protectAdmin);

// 获取账本列表
router.get('/', getAllBooks);
router.get('/archived', getArchivedBooks);
router.get('/deleted', getDeletedBooks);

// 账本操作
router.put('/:id/archive', archiveBook);
router.put('/:id/restore', restoreBook);
router.put('/:id/undelete', undeleteBook);
router.put('/:id/transfer', transferBook);

module.exports = router; 