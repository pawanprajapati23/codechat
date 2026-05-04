const User = require('../models/User');
const { verifyToken } = require('./jwt');
const mongoose = require('mongoose');

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const username = socket.handshake.auth?.username;

    if (!token) {
      // Guest flow
      socket.user = {
        _id: new mongoose.Types.ObjectId(),
        username: username || 'Guest',
        isGuest: true
      };
      return next();
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      // If token is invalid or user deleted, still allow as guest
      socket.user = {
        _id: new mongoose.Types.ObjectId(),
        username: username || 'Guest',
        isGuest: true
      };
      return next();
    }

    socket.user = user;
    next();
  } catch (error) {
    // If token verify fails, treat as guest
    const username = socket.handshake.auth?.username;
    socket.user = {
      _id: new mongoose.Types.ObjectId(),
      username: username || 'Guest',
      isGuest: true
    };
    next();
  }
};

module.exports = authenticateSocket;
