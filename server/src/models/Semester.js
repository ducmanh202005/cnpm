import mongoose from 'mongoose';

const { Schema } = mongoose;

const tuitionRuleSchema = new Schema(
  {
    rateCode: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    programType: {
      type: String,
      enum: ['standard', 'high_quality'],
      default: 'standard'
    },
    pricePerCredit: { type: Number, required: true, min: 0 },
    effectiveFrom: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true }
  },
  { _id: false }
);

const semesterSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    paymentDeadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['planning', 'registration_open', 'in_session', 'closed'],
      default: 'planning'
    },
    tuitionRules: {
      type: [tuitionRuleSchema],
      default: []
    }
  },
  { timestamps: true }
);

const Semester = mongoose.models.Semester || mongoose.model('Semester', semesterSchema, 'HocKy');

export default Semester;
