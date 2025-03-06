const express = require('express');
const {
  createPerson,
  getPersons,
  getPerson,
  updatePerson,
  deletePerson,
} = require('../controllers/persons');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

router.route('/')
  .get(getPersons)
  .post(createPerson);

router.route('/:id')
  .get(getPerson)
  .put(updatePerson)
  .delete(deletePerson);

module.exports = router; 