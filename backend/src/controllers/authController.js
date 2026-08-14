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
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">CodeChat</h1>
                <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Join the conversation today</p>
              </div>
              <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Welcome aboard! 👋</h2>
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Thank you for starting your journey with CodeChat. To complete your signup and verify your email address, please use the OTP code below:</p>
                <div style="text-align: center; margin: 35px 0;">
                  <span style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; background-color: #e0e7ff; padding: 20px 35px; border-radius: 12px; border: 2px dashed #818cf8;">${code}</span>
                </div>
                <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">This code is valid for the next 10 minutes.<br>If you didn't request this, you can safely ignore this email.</p>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 13px;">
                <p>&copy; ${new Date().getFullYear()} CodeChat. All rights reserved.</p>
              </div>
            </div>
          `
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

// ADMIN OTP LOGIN — Step 1: send OTP to admin email
const sendAdminOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    // Always respond with success (don't leak if admin exists)
    // But only send OTP if user is actually admin
    if (user && user.role === 'admin') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(`admin:${emailLower}`, {
        code,
        expires: Date.now() + 10 * 60 * 1000, // 10 min
        verified: false
      });

      if (resend) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'CodeChat <onboarding@resend.dev>',
          to: emailLower,
          subject: '🔐 CodeChat Admin Login OTP',
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #0b141a; border-radius: 16px;">
              <div style="text-align:center; margin-bottom: 24px;">
                <h1 style="color: #25d366; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">CodeChat</h1>
                <p style="color: #8696a0; font-size: 14px; margin-top: 6px;">Admin Portal</p>
              </div>
              <div style="background: #1f2c33; border-radius: 12px; padding: 32px; border: 1px solid #2a3942;">
                <h2 style="color: #e9edef; margin-top: 0; font-size: 20px;">Admin Login Request 🛡️</h2>
                <p style="color: #8696a0; font-size: 15px; line-height: 1.6;">Your one-time login code for the CodeChat admin panel:</p>
                <div style="text-align: center; margin: 28px 0;">
                  <span style="display: inline-block; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #25d366; background: #25d36615; padding: 18px 32px; border-radius: 12px; border: 2px dashed #25d36640;">${code}</span>
                </div>
                <p style="color: #8696a0; font-size: 13px; text-align: center;">Valid for <strong style="color:#e9edef;">10 minutes</strong>. Do not share this code.<br>If you did not request this, ignore this email.</p>
              </div>
              <p style="color: #2a3942; font-size: 12px; text-align: center; margin-top: 20px;">© ${new Date().getFullYear()} CodeChat Admin</p>
            </div>
          `
        });
      } else {
        console.log(`[ADMIN OTP] ${emailLower} => ${code}`);
      }
    }
    // Always 200 — don't reveal if admin exists
    res.json({ success: true, message: 'If this is a registered admin email, an OTP has been sent.' });
  } catch (error) {
    next(error);
  }
};

// ADMIN OTP LOGIN — Step 2: verify OTP and return JWT
const verifyAdminOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const emailLower = email.toLowerCase().trim();
    const record = otpStore.get(`admin:${emailLower}`);

    if (!record || record.expires < Date.now()) {
      return res.status(400).json({ error: 'OTP expired or not requested' });
    }
    if (record.code !== code) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const user = await User.findOne({ email: emailLower });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized as admin' });
    }

    otpStore.delete(`admin:${emailLower}`);
    sendAuthResponse(res, user);
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
  verifyOtp,
  sendAdminOtp,
  verifyAdminOtp
};
