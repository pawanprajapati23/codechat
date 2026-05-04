const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }

  return secret;
};

const signToken = (userId) => jwt.sign({ userId }, getJwtSecret(), {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
});

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
  signToken,
  verifyToken
};
