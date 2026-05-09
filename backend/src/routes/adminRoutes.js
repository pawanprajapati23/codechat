const express = require('express');
const { getAllUsers, getAllRooms, deleteUser } = require('../controllers/adminController');
const protect = require('../middleware/auth');
const adminProtect = require('../middleware/adminAuth');

const router = express.Router();

// Apply auth and admin middleware to all routes in this file
router.use(protect);
router.use(adminProtect);

router.get('/users', getAllUsers);
router.get('/rooms', getAllRooms);
router.delete('/users/:id', deleteUser);

module.exports = router;
