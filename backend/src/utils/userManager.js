const users = new Map();

class UserManager {
  addUser(user) {
    users.set(user.id, {
      ...user,
      lastSeen: Date.now()
    });
    return user;
  }

  getUser(userId) {
    return users.get(userId);
  }

  removeUser(userId) {
    return users.delete(userId);
  }

  getAllUsers() {
    return Array.from(users.values());
  }

  getActiveUserCount() {
    return users.size;
  }

  updateLastSeen(userId) {
    const user = users.get(userId);
    if (user) {
      user.lastSeen = Date.now();
    }
  }

  // Cleanup inactive users (not seen in last 30 minutes)
  cleanupInactiveUsers() {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;

    for (const [userId, user] of users.entries()) {
      if ((now - user.lastSeen) > thirtyMinutes) {
        users.delete(userId);
        console.log(`🗑️ User removed (inactive): ${user.name}`);
      }
    }
  }
}

// Cleanup every 10 minutes
setInterval(() => {
  const manager = new UserManager();
  manager.cleanupInactiveUsers();
}, 10 * 60 * 1000);

module.exports = new UserManager();
