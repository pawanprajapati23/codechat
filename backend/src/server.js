const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const roomManager = require('./utils/roomManager');
const messageHandler = require('./utils/messageHandler');
const userManager = require('./utils/userManager');

const app = express();
const httpServer = createServer(app);

// Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
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
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
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

// API Routes
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

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  
  let currentUser = null;
  let currentRoom = null;

  // Join room - supports both 'join' and 'join-room' events
  const handleJoin = ({ roomCode, userName, userId, username, color }) => {
    try {
      const finalUsername = userName || username;
      const finalUserId = userId || socket.id;
      
      currentUser = {
        id: finalUserId,
        socketId: socket.id,
        name: finalUsername,
        color: color || '#ff1744',
        joinedAt: Date.now()
      };
      currentRoom = roomCode;

      // Join socket room
      socket.join(roomCode);

      // Add user to room
      roomManager.addUserToRoom(roomCode, currentUser);
      userManager.addUser(currentUser);

      // Get room info
      const room = roomManager.getRoom(roomCode);

      // Send system message to all users in room
      io.to(roomCode).emit('systemMessage', {
        text: `${finalUsername} joined the room`,
        timestamp: Date.now()
      });

      // Send user count to all users in room
      io.to(roomCode).emit('userCount', room.users.length);

      // Notify user (for backward compatibility)
      socket.emit('joined-room', {
        success: true,
        room: {
          code: roomCode,
          users: room.users,
          onlineCount: room.users.length
        }
      });

      console.log(`👤 ${finalUsername} joined room: ${roomCode} (${room.users.length} users)`);
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  };

  socket.on('join', handleJoin);
  socket.on('join-room', handleJoin);

  // Send message - supports both 'sendMessage' and 'send-message' events
  const handleSendMessage = (data) => {
    try {
      const roomCode = data.roomCode;
      const message = data.message || data;
      
      const room = roomManager.getRoom(roomCode);
      if (!room) {
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
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: message.sender || currentUser?.name,
        text: message.text || '',
        attachment,
        timestamp: message.timestamp || Date.now(),
        roomCode: roomCode
      };

      // Save message
      messageHandler.saveMessage(roomCode, messageData);

      // Broadcast to ALL users in room (including sender)
      io.to(roomCode).emit('message', messageData);

      console.log(`💬 Message in ${roomCode}: ${message.text?.substring(0, 30) || '[media]'}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  };

  socket.on('sendMessage', handleSendMessage);
  socket.on('send-message', handleSendMessage);

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
    try {
      const messages = messageHandler.getMessages(roomCode, limit);
      if (callback) {
        callback({ success: true, messages });
      }
    } catch (error) {
      console.error('Get messages error:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, httpServer, io };
