const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    sessionId: { type: String, ref: 'Session', required: true }, // Changed to String for custom IDs
    studentId: { type: String, ref: 'Student', required: true }, // Changed to String for custom IDs
    teacherId: { type: String, ref: 'Teacher', required: true }, // Changed to String for custom IDs
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


