const rooms = new Map();

class RoomManager {
  createRoom(code, creatorName) {
    if (!rooms.has(code)) {
      rooms.set(code, {
        code,
        createdBy: creatorName,
        createdAt: Date.now(),
        users: [],
        messageCount: 0,
        lastActivity: Date.now()
      });
      console.log(`🏠 Room created: ${code}`);
    }
    return rooms.get(code);
  }

  getRoom(code) {
    return rooms.get(code);
  }

  getAllRooms() {
    return Array.from(rooms.values()).map(room => ({
      code: room.code,
      userCount: room.users.length,
      messageCount: room.messageCount,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity
    }));
  }

  getRoomCount() {
    return rooms.size;
  }

  addUserToRoom(roomCode, user) {
    let room = rooms.get(roomCode);
    if (!room) {
      room = this.createRoom(roomCode, user.name);
    }

    // Check if user already exists
    const existingUser = room.users.find(u => u.id === user.id);
    if (!existingUser) {
      room.users.push(user);
      room.lastActivity = Date.now();
    }

    return room;
  }

  removeUserFromRoom(roomCode, userId) {
    const room = rooms.get(roomCode);
    if (room) {
      room.users = room.users.filter(u => u.id !== userId);
      room.lastActivity = Date.now();

      // Delete room if empty and inactive for 5 minutes
      if (room.users.length === 0) {
        setTimeout(() => {
          const currentRoom = rooms.get(roomCode);
          if (currentRoom && currentRoom.users.length === 0) {
            rooms.delete(roomCode);
            console.log(`🗑️ Room deleted (empty): ${roomCode}`);
          }
        }, 5 * 60 * 1000);
      }
    }
  }

  incrementMessageCount(roomCode) {
    const room = rooms.get(roomCode);
    if (room) {
      room.messageCount++;
      room.lastActivity = Date.now();
    }
  }

  getRoomUsers(roomCode) {
    const room = rooms.get(roomCode);
    return room ? room.users : [];
  }

  // Cleanup inactive rooms (older than 24 hours with no users)
  cleanupInactiveRooms() {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    for (const [code, room] of rooms.entries()) {
      if (room.users.length === 0 && (now - room.lastActivity) > dayInMs) {
        rooms.delete(code);
        console.log(`🗑️ Room deleted (inactive): ${code}`);
      }
    }
  }
}

// Cleanup every hour
setInterval(() => {
  const manager = new RoomManager();
  manager.cleanupInactiveRooms();
}, 60 * 60 * 1000);

module.exports = new RoomManager();
