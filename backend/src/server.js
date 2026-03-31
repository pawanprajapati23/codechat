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
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
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

  // Join room
  socket.on('join-room', ({ roomCode, userName, userId, color }) => {
    try {
      currentUser = {
        id: userId,
        socketId: socket.id,
        name: userName,
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

      // Notify user
      socket.emit('joined-room', {
        success: true,
        room: {
          code: roomCode,
          users: room.users,
          onlineCount: room.users.length
        }
      });

      // Notify others
      socket.to(roomCode).emit('user-joined', {
        user: {
          id: userId,
          name: userName,
          color: color
        },
        onlineCount: room.users.length,
        timestamp: Date.now()
      });

      console.log(`👤 ${userName} joined room: ${roomCode} (${room.users.length} users)`);
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Send message
  socket.on('send-message', ({ roomCode, message }) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        return socket.emit('error', { message: 'Room not found' });
      }

      const messageData = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from: message.from,
        fromName: message.fromName,
        text: message.text || '',
        img: message.img,
        audio: message.audio,
        color: message.color,
        timestamp: Date.now()
      };

      // Save message
      messageHandler.saveMessage(roomCode, messageData);

      // Broadcast to room
      io.to(roomCode).emit('new-message', messageData);

      console.log(`💬 Message in ${roomCode}: ${message.text?.substring(0, 30) || '[media]'}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Reaction
  socket.on('add-reaction', ({ roomCode, messageId, emoji, userId }) => {
    try {
      const reaction = {
        messageId,
        emoji,
        userId,
        timestamp: Date.now()
      };

      messageHandler.addReaction(roomCode, messageId, reaction);

      io.to(roomCode).emit('reaction-added', {
        messageId,
        emoji,
        userId
      });

      console.log(`👍 Reaction in ${roomCode}: ${emoji}`);
    } catch (error) {
      console.error('Reaction error:', error);
    }
  });

  // Typing indicator
  socket.on('typing', ({ roomCode, isTyping, userName }) => {
    socket.to(roomCode).emit('user-typing', {
      userId: currentUser?.id,
      userName: userName || currentUser?.name,
      isTyping
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

  // Disconnect
  socket.on('disconnect', () => {
    if (currentUser && currentRoom) {
      // Remove user from room
      roomManager.removeUserFromRoom(currentRoom, currentUser.id);
      userManager.removeUser(currentUser.id);

      const room = roomManager.getRoom(currentRoom);

      // Notify others
      socket.to(currentRoom).emit('user-left', {
        userId: currentUser.id,
        userName: currentUser.name,
        onlineCount: room ? room.users.length : 0,
        timestamp: Date.now()
      });

      console.log(`👋 ${currentUser.name} left room: ${currentRoom}`);
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
