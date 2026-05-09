const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    token,
    user: user.toSafeObject()
  });
};

const signup = async (req, res, next) => {
  try {
    const { username, email, password, profilePic, securityQuestion, securityAnswer } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const user = await User.create({
      username,
      email,
      password,
      profilePic,
      securityQuestion,
      securityAnswer
    });

    sendAuthResponse(res, user, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    sendAuthResponse(res, user);
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

const logout = async (req, res, next) => {
  try {
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const getQuestion = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.securityQuestion) {
      return res.status(400).json({ error: 'No security question is set for this user' });
    }

    res.json({ question: user.securityQuestion });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;
    
    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ error: 'Email, security answer, and new password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+securityAnswer');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.securityAnswer) {
      return res.status(400).json({ error: 'No security answer is set for this user' });
    }

    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(securityAnswer, user.securityAnswer);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect security answer' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  me,
  logout,
  getQuestion,
  resetPassword
};
