require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const roomManager = require('./utils/roomManager');
const messageHandler = require('./utils/messageHandler');
const userManager = require('./utils/userManager');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const messageRoutes = require('./routes/messageRoutes');
const authenticateSocket = require('./utils/socketAuth');
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const { toClientMessage } = require('./controllers/messageController');

const app = express();
const httpServer = createServer(app);

// Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 8 * 1024 * 1024
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    rooms: roomManager.getRoomCount(),
    activeUsers: userManager.getActiveUserCount()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', messageRoutes);

app.get('/api/rooms', (req, res) => {
  res.json({ rooms: roomManager.getAllRooms() });
});

app.get('/api/rooms/:code', (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ room });
});

app.post('/api/rooms', (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'Code and name required' });
  }
  const room = roomManager.createRoom(code, name);
  res.json({ room });
});

io.use(authenticateSocket);

const getMessageType = (message, attachment) => {
  if (message.messageType) return message.messageType;
  if (!attachment) return 'text';
  if (attachment.type?.startsWith('image/')) return 'image';
  if (attachment.type?.startsWith('audio/')) return 'audio';
  return 'file';
};

const upsertConversation = async ({ roomCode, senderId, text, timestamp }) => {
  let conversation = await Conversation.findOneAndUpdate(
    { roomCode },
    {
      $addToSet: { participants: senderId },
      $set: {
        lastMessage: text || '[media]',
        lastMessageTime: timestamp
      }
    },
    { new: true, upsert: true }
  );

  const senderUnread = conversation.unreadCount.find((entry) => (
    entry.userId.toString() === senderId.toString()
  ));

  if (!senderUnread) {
    conversation.unreadCount.push({ userId: senderId, count: 0 });
  }

  conversation.unreadCount.forEach((entry) => {
    if (entry.userId.toString() !== senderId.toString()) {
      entry.count += 1;
    }
  });

  await conversation.save();
  return conversation;
};

const addConversationParticipant = async (roomCode, userId) => {
  const conversation = await Conversation.findOneAndUpdate(
    { roomCode },
    { $addToSet: { participants: userId } },
    { new: true, upsert: true }
  );

  const hasUnreadEntry = conversation.unreadCount.some((entry) => (
    entry.userId.toString() === userId.toString()
  ));

  if (!hasUnreadEntry) {
    conversation.unreadCount.push({ userId, count: 0 });
    await conversation.save();
  }

  return conversation;
};

const getDirectConversationKey = (userIdA, userIdB) => (
  `direct:${[userIdA.toString(), userIdB.toString()].sort().join(':')}`
);

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  
  let currentUser = {
    id: socket.user._id.toString(),
    socketId: socket.id,
    name: socket.user.username,
    email: socket.user.email,
    color: '#ff1744',
    joinedAt: Date.now()
  };
  let currentRoom = null;

  User.findByIdAndUpdate(socket.user._id, {
    isOnline: true,
    lastSeen: new Date()
  }).catch((error) => console.error('Online status error:', error));

  socket.join(currentUser.id);

  const RoomModel = require('./models/Room');

  // Join room - supports both 'join' and 'join-room' events
  const handleJoin = async ({ roomCode, color }) => {
    try {
      if (!roomCode) {
        return socket.emit('error', { message: 'Room code is required' });
      }

      const normalizedRoomCode = roomCode.trim().toUpperCase();
      
      // Look up or create Room in DB
      let dbRoom = null;
      let isPrivate = socket.user.isGuest;
      
      if (mongoose.connection.readyState === 1) {
        try {
          dbRoom = await RoomModel.findOne({ roomCode: normalizedRoomCode });
          if (!dbRoom) {
            dbRoom = await RoomModel.create({
              roomCode: normalizedRoomCode,
              type: socket.user.isGuest ? 'private' : 'group',
              createdBy: socket.user.isGuest ? null : socket.user._id
            });
          }
          isPrivate = dbRoom.type === 'private';
          
          if (!socket.user.isGuest && !dbRoom.members.includes(socket.user._id)) {
            dbRoom.members.push(socket.user._id);
            await dbRoom.save();
          }
        } catch (dbError) {
          console.warn('Gracefully continuing despite DB error:', dbError.message);
        }
      }

      const inMemoryRoom = roomManager.getRoom(normalizedRoomCode);
      const currentUserCount = inMemoryRoom ? inMemoryRoom.users.length : 0;

      // Strict 2-user limit for private rooms
      if (isPrivate && currentUserCount >= 2 && (!inMemoryRoom || !inMemoryRoom.users.find(u => u.id === socket.user._id.toString() || u.name === socket.user.username))) {
        return socket.emit('error', { message: 'This private room is full (max 2 users)' });
      }

      currentUser = {
        ...currentUser,
        socketId: socket.id,
        color: color || '#ff1744',
        joinedAt: Date.now()
      };
      currentRoom = normalizedRoomCode;

      // Join socket room
      socket.join(normalizedRoomCode);

      // Add user to room
      roomManager.addUserToRoom(normalizedRoomCode, currentUser);
      userManager.addUser(currentUser);
      
      if (mongoose.connection.readyState === 1) {
        try {
          await addConversationParticipant(normalizedRoomCode, socket.user._id);
        } catch (dbError) {
          console.warn('Failed to add conversation participant:', dbError.message);
        }
      }

      // Get room info
      const room = roomManager.getRoom(normalizedRoomCode);

      // Send system message to all users in room
      io.to(normalizedRoomCode).emit('systemMessage', {
        text: `${currentUser.name} joined the room`,
        timestamp: Date.now()
      });

      // Send user count to all users in room
      io.to(normalizedRoomCode).emit('userCount', room.users.length);

      // Notify user (for backward compatibility)
      socket.emit('joined-room', {
        success: true,
        room: {
          code: normalizedRoomCode,
          users: room.users,
          onlineCount: room.users.length,
          type: isPrivate ? 'private' : 'group'
        }
      });

      console.log(`👤 ${currentUser.name} joined room: ${normalizedRoomCode} (${room.users.length} users)`);
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  };

  socket.on('join', handleJoin);
  socket.on('join-room', handleJoin);

  // Send message - supports both 'sendMessage' and 'send-message' events
  const handleSendMessage = async (data) => {
    try {
      const roomCode = data.roomCode;
      const message = data.message || data;
      const normalizedRoomCode = roomCode?.trim().toUpperCase();
      const receiverId = message.receiverId || data.receiverId || null;
      const isDirectMessage = Boolean(receiverId);
      
      if (!currentUser) {
        return socket.emit('error', { message: 'Authentication required' });
      }

      if (isDirectMessage && !mongoose.Types.ObjectId.isValid(receiverId)) {
        return socket.emit('error', { message: 'Invalid receiver' });
      }

      if (!isDirectMessage && (!normalizedRoomCode || currentRoom !== normalizedRoomCode)) {
        return socket.emit('error', { message: 'Join the room before sending messages' });
      }

      const room = normalizedRoomCode ? roomManager.getRoom(normalizedRoomCode) : null;
      if (!isDirectMessage && !room) {
        return socket.emit('error', { message: 'Room not found' });
      }

      const attachment = message.attachment && {
        name: String(message.attachment.name || 'attachment').slice(0, 120),
        type: String(message.attachment.type || ''),
        size: Number(message.attachment.size || 0),
        dataUrl: String(message.attachment.dataUrl || '')
      };

      if (attachment) {
        const isAllowedType = attachment.type.startsWith('image/') || attachment.type === 'application/pdf';
        const isAllowedSize = attachment.size > 0 && attachment.size <= 4 * 1024 * 1024;
        const hasDataUrl = attachment.dataUrl.startsWith('data:');

        if (!isAllowedType || !isAllowedSize || !hasDataUrl) {
          return socket.emit('error', { message: 'Only images and PDFs up to 4 MB can be shared' });
        }
      }

      const messageData = {
        senderId: socket.user._id,
        receiverId,
        roomCode: normalizedRoomCode || getDirectConversationKey(socket.user._id, receiverId),
        message: message.text || '',
        messageType: getMessageType(message, attachment),
        mediaUrl: message.mediaUrl || attachment?.dataUrl || '',
        attachment,
        status: 'sent',
        replyTo: message.replyTo || null,
        timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
      };

      let clientMessage;
      let messageId = new mongoose.Types.ObjectId().toString(); // Default ID for guests

      if (!socket.user.isGuest && mongoose.connection.readyState === 1) {
        try {
          const savedMessage = await Message.create(messageData);
          await savedMessage.populate([
            { path: 'senderId', select: 'username email profilePic' },
            { path: 'replyTo', populate: { path: 'senderId', select: 'username' } }
          ]);
          await upsertConversation({
            roomCode: savedMessage.roomCode,
            senderId: socket.user._id,
            text: savedMessage.message,
            timestamp: savedMessage.timestamp
          });
          messageId = savedMessage._id.toString();
          clientMessage = toClientMessage(savedMessage);
        } catch (dbError) {
          console.warn('DB Error saving message:', dbError.message);
          // Fall back to guest-style in-memory message
          clientMessage = {
            id: messageId,
            roomCode: messageData.roomCode,
            text: messageData.message,
            messageType: messageData.messageType,
            mediaUrl: messageData.mediaUrl,
            attachment: messageData.attachment,
            status: 'sent',
            replyTo: messageData.replyTo,
            timestamp: messageData.timestamp.toISOString(),
            senderId: socket.user._id.toString()
          };
        }
      } else {
        clientMessage = {
          id: messageId,
          roomCode: messageData.roomCode,
          text: messageData.message,
          messageType: messageData.messageType,
          mediaUrl: messageData.mediaUrl,
          attachment: messageData.attachment,
          status: 'sent',
          replyTo: messageData.replyTo,
          timestamp: messageData.timestamp.toISOString(),
          senderId: socket.user._id.toString()
        };
      }

      if (normalizedRoomCode) {
        roomManager.incrementMessageCount(normalizedRoomCode);
      }

      clientMessage.sender = currentUser.name;
      clientMessage.status = isDirectMessage || room.users.length > 1 ? 'delivered' : 'sent';

      if (clientMessage.status === 'delivered' && !socket.user.isGuest && mongoose.connection.readyState === 1) {
        try {
          await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
        } catch (dbError) {}
      }

      // Keep legacy in-memory handlers populated for backward-compatible diagnostics.
      messageHandler.saveMessage(clientMessage.roomCode, {
        ...clientMessage,
        sender: currentUser.name,
        text: message.text || '',
        timestamp: clientMessage.timestamp
      });

      if (isDirectMessage) {
        socket.emit('message', clientMessage);
        io.to(receiverId.toString()).emit('message', clientMessage);
        io.to(receiverId.toString()).emit('message-status', {
          messageId: clientMessage.id,
          status: clientMessage.status
        });
      } else {
        // Broadcast to ALL users in room (including sender)
        io.to(normalizedRoomCode).emit('message', clientMessage);
        socket.to(normalizedRoomCode).emit('message-status', {
          messageId: clientMessage.id,
          status: clientMessage.status
        });
      }

      console.log(`💬 Message in ${clientMessage.roomCode}: ${message.text?.substring(0, 30) || '[media]'}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  };

  socket.on('sendMessage', handleSendMessage);
  socket.on('send-message', handleSendMessage);

  // Edit message
  const handleEditMessage = async (data) => {
    try {
      const { messageId, roomCode, newMessage } = data;
      if (!currentUser) return;
      
      const msg = await Message.findById(messageId);
      if (!msg) return;
      if (msg.senderId.toString() !== currentUser.id) return;

      msg.message = newMessage;
      msg.isEdited = true;
      await msg.save();

      io.to(roomCode).emit('message-edited', {
        messageId,
        roomCode,
        newMessage,
        isEdited: true
      });
    } catch (error) {
      console.error('Edit message error:', error);
    }
  };

  socket.on('edit-message', handleEditMessage);

  // Delete message
  const handleDeleteMessage = async (data) => {
    try {
      const { messageId, roomCode } = data;
      if (!currentUser) return;

      const msg = await Message.findById(messageId);
      if (!msg) return;
      if (msg.senderId.toString() !== currentUser.id) return;

      msg.isDeleted = true;
      await msg.save();

      io.to(roomCode).emit('message-deleted', {
        messageId,
        roomCode,
        isDeleted: true
      });
    } catch (error) {
      console.error('Delete message error:', error);
    }
  };

  socket.on('delete-message', handleDeleteMessage);

  // Reaction - supports both 'reaction' and 'add-reaction' events
  const handleReaction = (data) => {
    try {
      const { roomCode, messageId, emoji, userId, sender } = data;
      
      const reaction = {
        messageId,
        emoji,
        userId: userId || currentUser?.id,
        timestamp: Date.now()
      };

      messageHandler.addReaction(roomCode, messageId, reaction);

      // Broadcast to all users in room
      io.to(roomCode).emit('reaction', {
        messageId,
        sender,
        emoji,
        roomCode
      });

      console.log(`👍 Reaction in ${roomCode}: ${emoji}`);
    } catch (error) {
      console.error('Reaction error:', error);
    }
  };

  socket.on('reaction', handleReaction);
  socket.on('add-reaction', handleReaction);

  // Typing indicator - supports both formats
  socket.on('typing', (data) => {
    const roomCode = data.roomCode;
    const userName = data.userName || data.username;
    
    // Broadcast to others in room (not to sender)
    socket.to(roomCode).emit('typing', {
      username: userName || currentUser?.name
    });
  });

  socket.on('stopTyping', (data) => {
    const roomCode = data.roomCode;
    // Optional: can add stop typing event handling if needed
  });

  // WebRTC call signaling. Media is peer-to-peer; the server only relays metadata.
  socket.on('call:join', ({ roomCode, callType }) => {
    if (!roomCode || !currentUser) return;

    socket.to(roomCode).emit('call:user-joined', {
      socketId: socket.id,
      userId: currentUser.id,
      userName: currentUser.name,
      callType
    });
  });

  socket.on('call:offer', ({ targetSocketId, offer, roomCode, callType }) => {
    if (!targetSocketId || !offer) return;

    io.to(targetSocketId).emit('call:offer', {
      fromSocketId: socket.id,
      fromUserId: currentUser?.id,
      fromUserName: currentUser?.name,
      offer,
      roomCode,
      callType
    });
  });

  socket.on('call:answer', ({ targetSocketId, answer }) => {
    if (!targetSocketId || !answer) return;

    io.to(targetSocketId).emit('call:answer', {
      fromSocketId: socket.id,
      answer
    });
  });

  socket.on('call:ice-candidate', ({ targetSocketId, candidate }) => {
    if (!targetSocketId || !candidate) return;

    io.to(targetSocketId).emit('call:ice-candidate', {
      fromSocketId: socket.id,
      candidate
    });
  });

  socket.on('call:leave', ({ roomCode }) => {
    if (!roomCode) return;

    socket.to(roomCode).emit('call:user-left', {
      socketId: socket.id,
      userName: currentUser?.name
    });
  });

  socket.on('call:end', ({ roomCode }) => {
    if (!roomCode) return;

    socket.to(roomCode).emit('call:ended', {
      socketId: socket.id,
      userName: currentUser?.name
    });
  });

  // Get room messages
  socket.on('get-messages', ({ roomCode, limit = 50 }, callback) => {
    (async () => {
      try {
        const normalizedRoomCode = roomCode.trim().toUpperCase();
        let clientMessages = [];

        if (mongoose.connection.readyState === 1) {
          const messages = await Message.find({ roomCode: normalizedRoomCode })
            .sort({ timestamp: 1 })
            .limit(Math.min(Number(limit) || 50, 200))
            .populate('senderId', 'username email profilePic');

          await Message.updateMany(
            { roomCode: normalizedRoomCode, senderId: { $ne: socket.user._id }, status: { $ne: 'seen' } },
            { $set: { status: 'seen' } }
          );

          clientMessages = messages.map(toClientMessage);
        } else {
          // Fallback to in-memory messages if DB is offline
          const memoryMessages = messageHandler.getMessages(normalizedRoomCode);
          clientMessages = memoryMessages.slice(-(Math.min(Number(limit) || 50, 200)));
        }

        socket.to(normalizedRoomCode).emit('messages-seen', {
          roomCode: normalizedRoomCode,
          seenBy: socket.user._id.toString()
        });

        if (callback) {
          callback({ success: true, messages: clientMessages });
        }
      } catch (error) {
        console.error('Get messages error:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    })();
  });

  socket.on('message-status', async ({ messageId, status }) => {
    try {
      if (!['sent', 'delivered', 'seen'].includes(status)) return;

      const message = await Message.findByIdAndUpdate(messageId, { status }, { new: true });
      if (!message) return;

      io.to(message.roomCode).emit('message-status', {
        messageId: message._id.toString(),
        status
      });
    } catch (error) {
      console.error('Message status error:', error);
    }
  });

  // Leave room
  socket.on('leave', (data) => {
    if (currentUser && currentRoom) {
      const { roomCode } = data;
      const room = roomManager.getRoom(roomCode || currentRoom);
      
      // Send system message
      io.to(currentRoom).emit('systemMessage', {
        text: `${currentUser.name} left the room`,
        timestamp: Date.now()
      });

      // Remove user from room
      roomManager.removeUserFromRoom(currentRoom, currentUser.id);
      userManager.removeUser(currentUser.id);

      // Update user count
      const updatedRoom = roomManager.getRoom(currentRoom);
      if (updatedRoom) {
        io.to(currentRoom).emit('userCount', updatedRoom.users.length);
      }

      console.log(`👋 ${currentUser.name} left room: ${currentRoom}`);
      
      currentUser = null;
      currentRoom = null;
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (currentUser && currentRoom) {
      // Remove user from room
      roomManager.removeUserFromRoom(currentRoom, currentUser.id);
      userManager.removeUser(currentUser.id);

      const room = roomManager.getRoom(currentRoom);

      // Send system message
      io.to(currentRoom).emit('systemMessage', {
        text: `${currentUser.name} left the room`,
        timestamp: Date.now()
      });

      // Update user count
      if (room) {
        io.to(currentRoom).emit('userCount', room.users.length);
      }

      console.log(`👋 ${currentUser.name} disconnected from room: ${currentRoom}`);
    }
    
    if (!socket.user.isGuest) {
      User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: new Date()
      }).catch((error) => console.error('Offline status error:', error));
    }
    console.log(`❌ User disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3001;
connectDB()
  .catch(() => {
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  })
  .finally(() => {
    httpServer.listen(PORT, () => {
      console.log(`
  ╔═══════════════════════════════════════╗
  ║   💕 CodeChat Love Backend Server   ║
  ║                                       ║
  ║   🚀 Server running on port ${PORT}     ║
  ║   🌐 Environment: ${process.env.NODE_ENV || 'development'}        ║
  ║   ⚡ Socket.IO ready                  ║
  ║   💖 Love theme activated             ║
  ╚═══════════════════════════════════════╝
  `);
    });
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, httpServer, io };
