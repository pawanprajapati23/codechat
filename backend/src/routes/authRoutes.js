const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, login, me, logout, getQuestion, resetPassword } = require('../controllers/authController');
const protect = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

router.post('/signup', signup);
router.post('/login', loginLimiter, login);
router.post('/get-question', getQuestion);
router.post('/reset-password', resetPassword);
router.get('/me', protect, me);
router.post('/logout', protect, logout);

module.exports = router;
