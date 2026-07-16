require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

async function test() {
  await connectDB();
  console.log("State:", mongoose.connection.readyState);
  try {
    const user = await User.findOne({ email: 'test@example.com' });
    console.log("User query successful:", user);
  } catch(e) {
    console.error("Error:", e.message);
  }
  process.exit();
}
test();
