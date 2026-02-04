const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    rating: { type: Number, required: true }, // 1-5
    comment: { type: String },
    sessionDuration: { type: Number, default: 0 }, // minutes
    interactionCount: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
    ratingDeviation: { type: Number, default: 0 },
    studentPastReviewConsistency: { type: Number, default: 0 },
    credibilityScore: { type: Number, default: 0 },
    credibleLabel: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Review', ReviewSchema);

