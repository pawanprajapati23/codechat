const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

const toClientMessage = (message) => ({
  id: message._id.toString(),
  senderId: message.senderId?._id?.toString() || message.senderId?.toString(),
  sender: message.senderId?.username || 'Unknown',
  receiverId: message.receiverId?.toString() || null,
  text: message.message,
  messageType: message.messageType,
  mediaUrl: message.mediaUrl,
  attachment: message.attachment?.dataUrl ? message.attachment : undefined,
  status: message.status,
  timestamp: new Date(message.timestamp).getTime(),
  roomCode: message.roomCode
});

const getRoomMessages = async (req, res, next) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    const limit = Math.min(Number(req.query.limit) || 100, 200);

    const messages = await Message.find({ roomCode })
      .sort({ timestamp: 1 })
      .limit(limit)
      .populate('senderId', 'username email profilePic');

    await Message.updateMany(
      { roomCode, senderId: { $ne: req.user._id }, status: { $ne: 'seen' } },
      { $set: { status: 'seen' } }
    );

    await Conversation.updateOne(
      { roomCode, 'unreadCount.userId': req.user._id },
      { $set: { 'unreadCount.$.count': 0 } }
    );

    res.json({ messages: messages.map(toClientMessage) });
  } catch (error) {
    next(error);
  }
};

const getDirectMessages = async (req, res, next) => {
  try {
    const selectedUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(selectedUserId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: req.user._id }
      ]
    })
      .sort({ timestamp: 1 })
      .populate('senderId', 'username email profilePic');

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: req.user._id, status: { $ne: 'seen' } },
      { $set: { status: 'seen' } }
    );

    res.json({ messages: messages.map(toClientMessage) });
  } catch (error) {
    next(error);
  }
};

const updateMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['sent', 'delivered', 'seen'].includes(status)) {
      return res.status(400).json({ error: 'Invalid message status' });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { status },
      { new: true }
    ).populate('senderId', 'username email profilePic');

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: toClientMessage(message) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDirectMessages,
  getRoomMessages,
  updateMessageStatus,
  toClientMessage
};
