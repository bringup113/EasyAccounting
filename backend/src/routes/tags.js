const express = require('express');
const {
  createTag,
  getTags,
  getTag,
  updateTag,
  deleteTag,
} = require('../controllers/tags');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

router.route('/')
  .get(getTags)
  .post(createTag);

router.route('/:id')
  .get(getTag)
  .put(updateTag)
  .delete(deleteTag);

module.exports = router; 