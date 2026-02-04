const mongoose = require('mongoose');
const crypto = require('crypto');

const StudentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: function () {
        // Generate custom ID in format: stu_xxxxx (10 random hex characters)
        return 'stu_' + crypto.randomBytes(5).toString('hex');
      }
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    walletBalance: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 }, // minutes
    reviewConsistencyScore: { type: Number, default: 0 },
    totalReviewsGiven: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    _id: false // Disable auto _id generation since we're using custom
  }
);

module.exports = mongoose.model('Student', StudentSchema);


