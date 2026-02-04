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
      type: mongoose.Schema.Types.ObjectId,
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

