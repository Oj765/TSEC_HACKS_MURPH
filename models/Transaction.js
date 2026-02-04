const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, refPath: 'userModel' }, // Changed to String for custom IDs
    userModel: {
      type: String,
      required: true,
      enum: ['Student', 'Teacher'],
    },
    sessionId: { type: String, ref: 'Session' }, // Changed to String for custom IDs
    type: {
      type: String,
      enum: ['lock', 'debit', 'refund', 'credit'],
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);


