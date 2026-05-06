import mongoose from 'mongoose';
import { createReference } from '../utils/reference.js';

const { Schema } = mongoose;

const enrollmentSchema = new Schema(
  {
    enrollmentCode: {
      type: String,
      required: true,
      unique: true,
      default: () => createReference('PDK')
    },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    registeredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected', 'cancelled'],
      default: 'approved'
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, trim: true }
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, section: 1 }, { unique: true });

const Enrollment =
  mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema, 'PhieuDangKyHocPhan');

export default Enrollment;
