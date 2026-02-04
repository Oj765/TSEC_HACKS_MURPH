const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    walletBalance: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 }, // minutes
    reviewConsistencyScore: { type: Number, default: 0 },
    totalReviewsGiven: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Student', StudentSchema);

