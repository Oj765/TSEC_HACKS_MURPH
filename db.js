// db.js
// MongoDB connection helper using Mongoose

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('MONGO_URI is not set in the environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);

    console.log('✅ MongoDB connected:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;

