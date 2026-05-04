const User = require('../models/User');
const { verifyToken } = require('./jwt');

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error('User no longer exists'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
};

module.exports = authenticateSocket;
