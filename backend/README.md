# 💕 CodeChat Love - Backend Server

Real-time chat backend with Socket.IO, Express, and room management.

## 🚀 Features

- ✅ Real-time messaging with Socket.IO
- ✅ Room management system
- ✅ User presence tracking
- ✅ Typing indicators
- ✅ Message reactions
- ✅ Message persistence (in-memory)
- ✅ Auto-cleanup of inactive rooms
- ✅ Rate limiting
- ✅ CORS enabled
- ✅ Compression
- ✅ Security headers (Helmet)

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🏃 Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 🌐 API Endpoints

### Health Check
```
GET /health
```

### Get All Rooms
```
GET /api/rooms
```

### Get Specific Room
```
GET /api/rooms/:code
```

### Create Room
```
POST /api/rooms
Body: { code, name }
```

## 🔌 Socket Events

### Client to Server

- `join-room` - Join a chat room
- `send-message` - Send a message
- `add-reaction` - Add reaction to message
- `typing` - Send typing indicator
- `get-messages` - Get room messages

### Server to Client

- `joined-room` - Confirm room join
- `user-joined` - New user joined
- `user-left` - User left room
- `new-message` - New message received
- `reaction-added` - Reaction added
- `user-typing` - User is typing
- `error` - Error occurred

## 🚀 Deployment

### Render
1. Push to GitHub
2. Connect to Render
3. Deploy as Web Service
4. Set environment variables

See DEPLOYMENT_GUIDE.md for details.
