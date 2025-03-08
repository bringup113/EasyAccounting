const express = require('express');
const {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  addMember,
  removeMember,
  addCurrency,
  updateCurrencyRate,
  deleteCurrency,
  transferBookOwnership,
  inviteUserToBook,
  getBookMembers,
  updateMemberPermission,
} = require('../controllers/books');
const { protect } = require('../middlewares/auth');
const { getBookStats } = require('../controllers/stats');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

router.route('/')
  .get(getBooks)
  .post(createBook);

router.route('/:id')
  .get(getBook)
  .put(updateBook)
  .delete(deleteBook);

// 获取账本成员
router.route('/:id/members')
  .get(getBookMembers)
  .post(addMember);

router.route('/:id/members/:userId')
  .delete(removeMember)
  .put(updateMemberPermission);

// 转让账本所有权
router.route('/:id/transfer')
  .post(transferBookOwnership);

// 邀请用户加入账本
router.route('/:id/invite')
  .post(inviteUserToBook);

// 货币管理路由
router.route('/:id/currencies')
  .post(addCurrency);

router.route('/:id/currencies/:code')
  .put(updateCurrencyRate)
  .delete(deleteCurrency);

// 添加统计路由
router.route('/:bookId/stats').get(getBookStats);

module.exports = router; 