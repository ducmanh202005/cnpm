import mongoose from 'mongoose';

const { Schema } = mongoose;

const receiptSchema = new Schema(
  {
    receiptNumber: { type: String, required: true, unique: true },
    payment: { type: Schema.Types.ObjectId, ref: 'PaymentTransaction', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    amount: { type: Number, required: true, min: 0 },
    issuedAt: { type: Date, default: Date.now },
    content: { type: String, required: true, trim: true },
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', receiptSchema, 'BienLaiDienTu');

export default Receipt;
