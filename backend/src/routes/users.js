const express = require('express');
const { register, login, getMe, updateMe, updatePassword } = require('../controllers/users');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/updatepassword', protect, updatePassword);

module.exports = router; 