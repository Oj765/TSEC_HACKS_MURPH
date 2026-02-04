const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: {
      type: String,
      required: true,
      enum: ['Student', 'Teacher'],
    },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
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

