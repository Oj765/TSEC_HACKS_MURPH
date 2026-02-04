const mongoose = require('mongoose');

const AuthUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true,
    },
    profileId: {
      type: String, // Changed from ObjectId to String to support custom IDs (tea_xxxxx, stu_xxxxx)
      refPath: 'profileModel',
    },
    profileModel: {
      type: String,
      enum: ['Student', 'Teacher'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuthUser', AuthUserSchema);


