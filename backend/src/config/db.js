const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('MONGODB_URI or MONGO_URI is not set. Persistence APIs will fail until MongoDB is configured.');
    return null;
  }

  try {
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't throw, let the server start
    return null;
  }
};

module.exports = connectDB;
