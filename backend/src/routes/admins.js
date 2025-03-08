const express = require('express');
const {
  login,
  getMe,
  updatePassword,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} = require('../controllers/admins');

const router = express.Router();

// 引入管理员认证中间件
const { protectAdmin } = require('../middleware/auth');

// 公开路由
router.post('/login', login);

// 需要管理员认证的路由
router.get('/me', protectAdmin, getMe);
router.put('/updatepassword', protectAdmin, updatePassword);

// 需要系统管理员权限的路由
router.route('/')
  .get(protectAdmin, getAdmins)
  .post(protectAdmin, createAdmin);

router.route('/:id')
  .put(protectAdmin, updateAdmin)
  .delete(protectAdmin, deleteAdmin);

module.exports = router; 