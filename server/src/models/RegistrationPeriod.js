import mongoose from 'mongoose';
import { createReference } from '../utils/reference.js';

const { Schema } = mongoose;

const registrationPeriodSchema = new Schema(
  {
    periodCode: {
      type: String,
      required: true,
      unique: true,
      default: () => createReference('DOT')
    },
    name: { type: String, required: true, trim: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    targetAudience: { type: String, default: 'Toan truong', trim: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

const RegistrationPeriod =
  mongoose.models.RegistrationPeriod ||
  mongoose.model('RegistrationPeriod', registrationPeriodSchema, 'DotDangKy');

export default RegistrationPeriod;
