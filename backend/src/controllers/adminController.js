const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Returns a Date object set to 00:00:00.000 local time today (UTC midnight).
 */
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Returns a Date object N days before the given reference date at 00:00:00.000.
 */
const daysAgo = (n, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── 1. getStats ──────────────────────────────────────────────────────────────

/**
 * GET /admin/stats
 * Returns comprehensive platform statistics.
 */
const getStats = async (req, res, next) => {
  try {
    const today = startOfToday();
    const sevenDaysAgo = daysAgo(7);

    const [
      totalUsers,
      totalRooms,
      totalMessages,
      onlineUsers,
      guestUsers,
      todayMessages,
      todayNewUsers,
      messagesPerRoom,
      userGrowthRaw,
      messageActivityRaw
    ] = await Promise.all([
      User.countDocuments({}),
      Room.countDocuments({}),
      Message.countDocuments({}),
      User.countDocuments({ isOnline: true }),
      User.countDocuments({ isGuest: true }),
      Message.countDocuments({ timestamp: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: today } }),

      // Top 5 rooms by message count
      Message.aggregate([
        { $match: { roomCode: { $ne: null } } },
        { $group: { _id: '$roomCode', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, roomCode: '$_id', count: 1 } }
      ]),

      // User growth: registrations per day for the last 7 days
      User.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } }
      ]),

      // Message activity: messages per day for the last 7 days
      Message.aggregate([
        { $match: { timestamp: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRooms,
        totalMessages,
        onlineUsers,
        guestUsers,
        todayMessages,
        todayNewUsers,
        messagesPerRoom,
        userGrowth: userGrowthRaw,
        messageActivity: messageActivityRaw
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2. getAllUsers ────────────────────────────────────────────────────────────

/**
 * GET /admin/users?page=1&limit=20&q=&role=&isOnline=
 * Returns paginated list of users with optional search and filters.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    // Text search by username or email
    if (req.query.q && req.query.q.trim()) {
      const regex = new RegExp(req.query.q.trim(), 'i');
      filter.$or = [{ username: regex }, { email: regex }];
    }

    // Filter by role
    if (req.query.role && ['user', 'admin'].includes(req.query.role)) {
      filter.role = req.query.role;
    }

    // Filter by isOnline
    if (req.query.isOnline !== undefined) {
      filter.isOnline = req.query.isOnline === 'true';
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetPasswordCode -resetPasswordExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// ─── 3. getAllRooms ────────────────────────────────────────────────────────────

/**
 * GET /admin/rooms?page=1&limit=20
 * Returns paginated list of rooms with message count and members count.
 */
const getAllRooms = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [rooms, total, messageCounts] = await Promise.all([
      Room.find({})
        .populate('createdBy', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Room.countDocuments({}),

      // Aggregate message count per room
      Message.aggregate([
        { $match: { roomCode: { $ne: null } } },
        { $group: { _id: '$roomCode', messageCount: { $sum: 1 } } }
      ])
    ]);

    // Build a lookup map: roomCode -> messageCount
    const msgCountMap = {};
    messageCounts.forEach(({ _id, messageCount }) => {
      msgCountMap[_id] = messageCount;
    });

    const data = rooms.map((room) => {
      const obj = room.toObject();
      obj.messageCount = msgCountMap[room.roomCode] || 0;
      obj.membersCount = Array.isArray(room.members) ? room.members.length : 0;
      return obj;
    });

    res.json({
      success: true,
      count: data.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data
    });
  } catch (error) {
    next(error);
  }
};

// ─── 4. deleteUser ────────────────────────────────────────────────────────────

/**
 * DELETE /admin/users/:id
 * Permanently deletes a non-admin user.
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, error: 'Cannot delete another admin' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── 5. banUser ───────────────────────────────────────────────────────────────

/**
 * PATCH /admin/users/:id/ban
 * Sets isBanned = true on a user.
 */
const banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordCode -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, error: 'Cannot ban an admin account' });
    }
    user.isBanned = true;
    await user.save();
    res.json({ success: true, message: 'User banned successfully', data: user });
  } catch (error) {
    next(error);
  }
};

// ─── 6. unbanUser ─────────────────────────────────────────────────────────────

/**
 * PATCH /admin/users/:id/unban
 * Sets isBanned = false on a user.
 */
const unbanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordCode -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    user.isBanned = false;
    await user.save();
    res.json({ success: true, message: 'User unbanned successfully', data: user });
  } catch (error) {
    next(error);
  }
};

// ─── 7. deleteRoom ────────────────────────────────────────────────────────────

/**
 * DELETE /admin/rooms/:id
 * Permanently deletes a room by its MongoDB _id.
 */
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── 8. getRoomMessages ───────────────────────────────────────────────────────

/**
 * GET /admin/rooms/:roomCode/messages?page=1&limit=20
 * Returns paginated messages for a specific room, newest first.
 */
const getRoomMessages = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = { roomCode: roomCode.toUpperCase() };

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .populate('senderId', 'username profilePic')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// ─── 9. broadcastMessage ──────────────────────────────────────────────────────

/**
 * POST /admin/broadcast
 * Body: { text: string }
 * Stub endpoint — actual delivery is handled by socket.io in server.js.
 */
const broadcastMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Broadcast text is required' });
    }

    // Emit to ALL connected socket clients as a system message
    const io = req.app.get('io');
    if (io) {
      io.emit('systemMessage', {
        text: `📢 Admin Announcement: ${text.trim()}`,
        timestamp: Date.now(),
        isAdminBroadcast: true
      });
    }

    res.json({ success: true, message: 'Broadcast sent to all rooms' });
  } catch (error) {
    next(error);
  }
};

// ─── 10. promoteUser ──────────────────────────────────────────────────────────

/**
 * PATCH /admin/users/:id/promote
 * Sets user role to 'admin'.
 */
const promoteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordCode -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: 'User is already an admin' });
    }
    user.role = 'admin';
    await user.save();
    res.json({ success: true, message: 'User promoted to admin', data: user });
  } catch (error) {
    next(error);
  }
};

// ─── 11. demoteUser ───────────────────────────────────────────────────────────

/**
 * PATCH /admin/users/:id/demote
 * Sets user role to 'user'. Cannot demote yourself.
 */
const demoteUser = async (req, res, next) => {
  try {
    // Prevent self-demotion
    if (req.params.id === req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You cannot demote yourself' });
    }

    const user = await User.findById(req.params.id).select('-password -resetPasswordCode -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.role === 'user') {
      return res.status(400).json({ success: false, error: 'User is already a regular user' });
    }
    user.role = 'user';
    await user.save();
    res.json({ success: true, message: 'User demoted to regular user', data: user });
  } catch (error) {
    next(error);
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  getStats,
  getAllUsers,
  getAllRooms,
  deleteUser,
  banUser,
  unbanUser,
  deleteRoom,
  getRoomMessages,
  broadcastMessage,
  promoteUser,
  demoteUser
};
