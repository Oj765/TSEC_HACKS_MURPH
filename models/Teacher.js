const mongoose = require('mongoose');
const crypto = require('crypto');

const TeacherSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: function () {
        // Generate custom ID in format: tea_xxxxx (10 random hex characters)
        return 'tea_' + crypto.randomBytes(5).toString('hex');
      }
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    subjects: [{ type: String }],
    pricePerMinute: { type: Number, required: true },
    ratingAvg: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    credibleReviewRatio: { type: Number, default: 0 }, // 0-1
    earnings: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    _id: false // Disable auto _id generation since we're using custom
  }
);

module.exports = mongoose.model('Teacher', TeacherSchema);


