const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
  getUserPassword,
  restoreUser,
  getDeletedUsers
} = require('../controllers/adminUsers');

const router = express.Router();

// 引入管理员认证中间件
const { protectAdmin } = require('../middlewares/auth');

// 所有路由都需要管理员认证
router.use(protectAdmin);

// 用户路由
router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/deleted')
  .get(getDeletedUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/:id/resetpassword')
  .put(resetPassword);

router.route('/:id/password')
  .get(getUserPassword);

router.route('/:id/restore')
  .put(restoreUser);

module.exports = router; 