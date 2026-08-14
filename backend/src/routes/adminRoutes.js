const express = require('express');
const {
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
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const adminProtect = require('../middleware/adminAuth');

const router = express.Router();

// All routes require authentication + admin role
router.use(protect);
router.use(adminProtect);

// ── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats', getStats);

// ── Users ────────────────────────────────────────────────────────────────────
// GET  /admin/users?page=&limit=&q=&role=&isOnline=
router.get('/users', getAllUsers);

// DELETE /admin/users/:id
router.delete('/users/:id', deleteUser);

// PATCH /admin/users/:id/ban
router.patch('/users/:id/ban', banUser);

// PATCH /admin/users/:id/unban
router.patch('/users/:id/unban', unbanUser);

// PATCH /admin/users/:id/promote
router.patch('/users/:id/promote', promoteUser);

// PATCH /admin/users/:id/demote
router.patch('/users/:id/demote', demoteUser);

// ── Rooms ────────────────────────────────────────────────────────────────────
// GET /admin/rooms?page=&limit=
router.get('/rooms', getAllRooms);

// GET /admin/rooms/:roomCode/messages?page=&limit=
router.get('/rooms/:roomCode/messages', getRoomMessages);

// DELETE /admin/rooms/:id
router.delete('/rooms/:id', deleteRoom);

// ── Broadcast ────────────────────────────────────────────────────────────────
// POST /admin/broadcast  body: { text }
router.post('/broadcast', broadcastMessage);

module.exports = router;
