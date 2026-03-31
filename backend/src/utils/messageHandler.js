const messages = new Map(); // roomCode -> array of messages
const reactions = new Map(); // messageId -> array of reactions

class MessageHandler {
  saveMessage(roomCode, message) {
    if (!messages.has(roomCode)) {
      messages.set(roomCode, []);
    }

    const roomMessages = messages.get(roomCode);
    roomMessages.push(message);

    // Keep only last 100 messages per room
    if (roomMessages.length > 100) {
      roomMessages.shift();
    }

    return message;
  }

  getMessages(roomCode, limit = 50) {
    const roomMessages = messages.get(roomCode) || [];
    return roomMessages.slice(-limit);
  }

  addReaction(roomCode, messageId, reaction) {
    const key = `${roomCode}-${messageId}`;
    if (!reactions.has(key)) {
      reactions.set(key, []);
    }

    const messageReactions = reactions.get(key);
    
    // Check if user already reacted with same emoji
    const existingIndex = messageReactions.findIndex(
      r => r.userId === reaction.userId && r.emoji === reaction.emoji
    );

    if (existingIndex === -1) {
      messageReactions.push(reaction);
    }

    return messageReactions;
  }

  getReactions(roomCode, messageId) {
    const key = `${roomCode}-${messageId}`;
    return reactions.get(key) || [];
  }

  getMessageCount(roomCode) {
    return messages.get(roomCode)?.length || 0;
  }

  // Cleanup old messages (older than 24 hours)
  cleanupOldMessages() {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    for (const [roomCode, roomMessages] of messages.entries()) {
      const filtered = roomMessages.filter(msg => (now - msg.timestamp) < dayInMs);
      if (filtered.length === 0) {
        messages.delete(roomCode);
      } else {
        messages.set(roomCode, filtered);
      }
    }
  }
}

// Cleanup every hour
setInterval(() => {
  const handler = new MessageHandler();
  handler.cleanupOldMessages();
}, 60 * 60 * 1000);

module.exports = new MessageHandler();
