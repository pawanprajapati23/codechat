const express = require('express');
const { getDirectMessages, getRoomMessages, updateMessageStatus } = require('../controllers/messageController');
const protect = require('../middleware/auth');

const router = express.Router();

router.get('/rooms/:roomCode/messages', protect, getRoomMessages);
router.get('/messages/:userId', protect, getDirectMessages);
router.patch('/messages/:messageId/status', protect, updateMessageStatus);

module.exports = router;
