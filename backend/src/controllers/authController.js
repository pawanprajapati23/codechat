const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { Resend } = require('resend');

// Only initialize if the key exists to prevent crashing if someone doesn't configure it
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const otpStore = new Map(); // email -> { code, expires, verified }

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = signToken(user._id, user.role);

  res.status(statusCode).json({
    token,
    user: user.toSafeObject()
  });
};

const signup = async (req, res, next) => {
  try {
    const { username, email, password, profilePic } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const emailLower = email.toLowerCase();

    const otpRecord = otpStore.get(emailLower);
    if (!otpRecord || !otpRecord.verified) {
      return res.status(400).json({ error: 'Please verify your email first' });
    }

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const user = await User.create({
      username,
      email: emailLower,
      password,
      profilePic
    });

    otpStore.delete(emailLower);

    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'CodeChat <onboarding@resend.dev>',
          to: user.email,
          subject: 'Welcome to CodeChat!',
          html: `<h1>Welcome ${user.username}!</h1><p>Thanks for joining CodeChat. We hope you enjoy chatting.</p>`
        });
      } catch (emailErr) {
        console.error('Welcome email failed:', emailErr);
      }
    }

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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't leak if email exists, just pretend it succeeded
      return res.json({ success: true, message: 'If the email exists, a reset code was sent.' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    await user.save();

    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'CodeChat <onboarding@resend.dev>',
          to: user.email,
          subject: 'Your Password Reset Code',
          html: `<p>Your password reset code is: <strong>${resetCode}</strong></p><p>This code will expire in 15 minutes.</p>`
        });
      } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Failed to send reset email' });
      }
    } else {
      return res.status(500).json({ error: 'Email service is not configured' });
    }

    res.json({ success: true, message: 'Reset code sent to email' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(emailLower, {
      code,
      expires: Date.now() + 10 * 60 * 1000,
      verified: false
    });

    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'CodeChat <onboarding@resend.dev>',
          to: emailLower,
          subject: 'CodeChat Email Verification',
          html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`
        });
        return res.json({ success: true, message: 'OTP sent to email' });
      } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Failed to send OTP email' });
      }
    } else {
      // For local testing without resend API
      console.log(`[TEST MODE] OTP for ${emailLower} is ${code}`);
      return res.status(500).json({ error: 'Email service is not configured' });
    }
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const emailLower = email.toLowerCase();
    const record = otpStore.get(emailLower);

    if (!record || record.expires < Date.now()) {
      return res.status(400).json({ error: 'OTP expired or not requested' });
    }
    if (record.code !== code) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    record.verified = true;
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  me,
  logout,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp
};
