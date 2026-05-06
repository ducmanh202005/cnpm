import mongoose from 'mongoose';

const { Schema } = mongoose;

const paymentTransactionSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    liability: { type: Schema.Types.ObjectId, ref: 'TuitionLiability', required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['vnpay', 'momo', 'bank_transfer', 'cash'],
      default: 'vnpay'
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending'
    },
    referenceCode: { type: String, required: true, unique: true },
    gatewayMessage: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const PaymentTransaction =
  mongoose.models.PaymentTransaction ||
  mongoose.model('PaymentTransaction', paymentTransactionSchema, 'GiaoDichThanhToan');

export default PaymentTransaction;
