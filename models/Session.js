const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    topic: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    durationMinutes: { type: Number, default: 0 },
    interactionCount: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
    ratePerMinute: { type: Number, required: true },
    totalCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', SessionSchema);

