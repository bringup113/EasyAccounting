const express = require('express');
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getBookStats,
} = require('../controllers/transactions');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

router.route('/stats/:bookId')
  .get(getBookStats);

module.exports = router; 