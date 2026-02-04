const mongoose = require('mongoose');
const crypto = require('crypto');

const LiveSessionSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: function () {
                return 'ses_' + crypto.randomBytes(5).toString('hex');
            },
        },
        studentId: { type: String, ref: 'Student' }, // Optional until booked
        teacherId: { type: String, ref: 'Teacher', required: true },
        topic: { type: String, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date },
        durationMinutes: { type: Number, default: 0 },
        ratePerMinute: { type: Number, required: true },
        status: {
            type: String,
            enum: ['scheduled', 'live', 'completed', 'cancelled'],
            default: 'scheduled',
        },
        description: { type: String }, // Saving description if provided
        languages: [{ type: String }], // Saving languages array
    },
    { timestamps: true, _id: false }
);

module.exports = mongoose.model('LiveSession', LiveSessionSchema);
