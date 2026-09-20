const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

    // Payments are verified synchronously by WaafiPay, so a created Enrollment
    // is always the result of a completed, successful charge (status stays
    // 'approved' unless an admin later revokes/refunds it).
    status: {
      type: String,
      enum: ['approved', 'revoked'],
      default: 'approved',
    },

    // Payment details captured from the WaafiPay API_PURCHASE response
    payment: {
      provider: { type: String, default: 'waafipay' },
      paymentMethod: { type: String }, // e.g. MWALLET_ACCOUNT
      accountNo: { type: String }, // masked account number from Waafi response
      amountPaid: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      referenceId: { type: String, required: true }, // our internal reference
      transactionId: { type: String, required: true }, // Waafi transactionId
      issuerTransactionId: { type: String },
    },

    // Access package chosen at enrollment time
    package: {
      key: { type: String, default: 'forever' },
      label: { type: String, default: 'Forever' },
      durationDays: { type: Number, default: 0 }, // 0 = no expiry
    },
    // Date access expires — null/undefined means lifetime access
    expiresAt: { type: Date, default: null },

    revokedReason: { type: String, default: '' },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
