const protect = require('./auth');

const adminProtect = (req, res, next) => {
  // Assuming this middleware runs AFTER the `protect` middleware, so `req.user` is available.
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Access Denied: Admin privileges required' });
  }
};

module.exports = adminProtect;
