const mongoose = require('mongoose');

const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
    try {
      // First try to connect to the provided local URI if it exists
      if (mongoUri) {
        console.log(`Attempting to connect to provided local MongoDB: ${mongoUri}`);
        const connection = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
        console.log(`MongoDB connected: ${connection.connection.host}`);
        return connection;
      }
    } catch (err) {
      console.warn('Local MongoDB connection failed. Falling back to in-memory database...');
      await mongoose.disconnect(); // Reset mongoose state
    }

    try {
      // Fallback to mongodb-memory-server
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('Started in-memory MongoDB fallback server.');
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB fallback:', memErr);
      return null;
    }
  }

  try {
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully to ${mongoUri.includes('memory') ? 'Memory Server' : connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't throw, let the server start
    return null;
  }
};

module.exports = connectDB;
