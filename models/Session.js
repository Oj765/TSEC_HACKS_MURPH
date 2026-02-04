const mongoose = require('mongoose');
const crypto = require('crypto');

const SessionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: function () {
        return 'ses_' + crypto.randomBytes(5).toString('hex');
      },
    },
    studentId: { type: String, ref: 'Student' }, // Optional for scheduled sessions
    teacherId: { type: String, ref: 'Teacher', required: true },
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
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true, _id: false }
);

module.exports = mongoose.model('Session', SessionSchema);



