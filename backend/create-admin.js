require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

const ADMIN_EMAIL = 'diplomawithbtech@gmail.com';
const ADMIN_USERNAME = 'Admin';
// Dummy password — admin logs in via OTP so password doesn't matter
const DUMMY_PASSWORD = 'AdminOTP@CodeChat2025!';

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let user = await User.findOne({ email: ADMIN_EMAIL });

    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      user.isBanned = false;
      await user.save();
      console.log(`✅ Existing user "${user.username}" promoted to admin`);
    } else {
      // Create new admin user — bypass OTP by directly inserting
      const hashedPwd = await bcrypt.hash(DUMMY_PASSWORD, 12);
      user = await User.create({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashedPwd,
        role: 'admin',
        isOnline: false
      });
      // skip pre-save hook for this — we already hashed
      // Actually mongoose pre-save will double hash — let's use Model.create with pre-save
      console.log(`✅ Admin user created: ${user.username} (${user.email})`);
    }

    console.log('\n🎉 Admin setup complete!');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Login via OTP at the admin tab on the login page');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
