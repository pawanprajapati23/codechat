const mongoose = require('mongoose');

const unreadCountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  count: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: [unreadCountSchema],
    default: []
  }
});

conversationSchema.index({ roomCode: 1 }, { unique: true });
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
