const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./src/models/user.model');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        console.log('No admin found');
        return;
    }
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: admin._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    
    console.log("Token generated, testing /api/files...");
    const resFiles = await fetch('http://127.0.0.1:3000/api/files?page=1&limit=12', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const filesData = await resFiles.json();
    console.log('Files Response:', resFiles.status, filesData);

  } catch (err) {
    console.error('Script Error:', err);
  } finally {
    mongoose.disconnect();
  }
}
run();
