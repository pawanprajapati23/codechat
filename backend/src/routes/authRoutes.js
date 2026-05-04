const express = require('express');
const { signup, login, me, logout, getQuestion, resetPassword } = require('../controllers/authController');
const protect = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/get-question', getQuestion);
router.post('/reset-password', resetPassword);
router.get('/me', protect, me);
router.post('/logout', protect, logout);

module.exports = router;
