import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to backend:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from backend:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error);
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('🔴 Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join room
  joinRoom(roomCode, userName, userId, color) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        return reject(new Error('Socket not connected'));
      }

      this.socket.emit('join-room', {
        roomCode,
        userName,
        userId,
        color
      });

      this.socket.once('joined-room', (data) => {
        if (data.success) {
          resolve(data);
        } else {
          reject(new Error('Failed to join room'));
        }
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Join room timeout'));
      }, 5000);
    });
  }

  // Send message
  sendMessage(roomCode, message) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('send-message', {
      roomCode,
      message
    });
  }

  // Add reaction
  addReaction(roomCode, messageId, emoji, userId) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('add-reaction', {
      roomCode,
      messageId,
      emoji,
      userId
    });
  }

  // Typing indicator
  sendTyping(roomCode, isTyping, userName) {
    if (!this.socket?.connected) return;

    this.socket.emit('typing', {
      roomCode,
      isTyping,
      userName
    });
  }

  // Get messages
  getMessages(roomCode, limit = 50) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        return reject(new Error('Socket not connected'));
      }

      this.socket.emit('get-messages', { roomCode, limit }, (response) => {
        if (response.success) {
          resolve(response.messages);
        } else {
          reject(new Error(response.error || 'Failed to get messages'));
        }
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Get messages timeout'));
      }, 5000);
    });
  }

  // Event listeners
  onNewMessage(callback) {
    this.socket?.on('new-message', callback);
  }

  onUserJoined(callback) {
    this.socket?.on('user-joined', callback);
  }

  onUserLeft(callback) {
    this.socket?.on('user-left', callback);
  }

  onReactionAdded(callback) {
    this.socket?.on('reaction-added', callback);
  }

  onUserTyping(callback) {
    this.socket?.on('user-typing', callback);
  }

  // Remove listeners
  off(event) {
    this.socket?.off(event);
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export default new SocketService();
