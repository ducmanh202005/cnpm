import mongoose from 'mongoose';
import { createReference } from '../utils/reference.js';

const { Schema } = mongoose;

const tuitionRateSchema = new Schema(
  {
    rateCode: {
      type: String,
      required: true,
      unique: true,
      default: () => createReference('BP')
    },
    name: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester' },
    programType: {
      type: String,
      enum: ['standard', 'high_quality'],
      default: 'standard'
    },
    pricePerCredit: { type: Number, required: true, min: 0 },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: Date,
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const TuitionRate =
  mongoose.models.TuitionRate || mongoose.model('TuitionRate', tuitionRateSchema, 'BieuPhi');

export default TuitionRate;
