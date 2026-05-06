import mongoose from 'mongoose';
import { createReference } from '../utils/reference.js';

const { Schema } = mongoose;

const liabilityLineSchema = new Schema(
  {
    section: { type: Schema.Types.ObjectId, ref: 'Section' },
    courseCode: { type: String, trim: true },
    courseName: { type: String, trim: true },
    credits: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  { _id: false }
);

const tuitionLiabilitySchema = new Schema(
  {
    liabilityCode: {
      type: String,
      required: true,
      unique: true,
      default: () => createReference('NV')
    },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    rate: { type: Schema.Types.ObjectId, ref: 'TuitionRate' },
    totalCredits: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },
    dueDate: Date,
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'overdue'],
      default: 'unpaid'
    },
    lines: { type: [liabilityLineSchema], default: [] }
  },
  { timestamps: true }
);

tuitionLiabilitySchema.index({ student: 1, semester: 1 }, { unique: true });

const TuitionLiability =
  mongoose.models.TuitionLiability ||
  mongoose.model('TuitionLiability', tuitionLiabilitySchema, 'NghiaVuHocPhi');

export default TuitionLiability;
