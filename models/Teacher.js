const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    subjects: [{ type: String }],
    pricePerMinute: { type: Number, required: true },
    ratingAvg: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    credibleReviewRatio: { type: Number, default: 0 }, // 0-1
    earnings: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Teacher', TeacherSchema);

