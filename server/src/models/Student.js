import mongoose from 'mongoose';

const { Schema } = mongoose;

const courseHistorySchema = new Schema(
  {
    courseCode: { type: String, required: true, trim: true },
    grade: { type: String, trim: true },
    passed: { type: Boolean, default: false },
    attemptedAt: Date
  },
  { _id: false }
);

const studentSchema = new Schema(
  {
    studentCode: { type: String, required: true, unique: true, trim: true },
    userProfile: { type: Schema.Types.ObjectId, ref: 'Person' },
    policyId: { type: Schema.Types.ObjectId, ref: 'Policy' },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    majorId: { type: Schema.Types.ObjectId, ref: 'Major' },
    cohortId: { type: Schema.Types.ObjectId, ref: 'Cohort' },
    programId: { type: Schema.Types.ObjectId, ref: 'Program' },
    administrativeClassId: { type: Schema.Types.ObjectId, ref: 'AdministrativeClass' },
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    citizenId: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    faculty: { type: String, required: true, trim: true },
    major: { type: String, required: true, trim: true },
    cohort: { type: String, required: true, trim: true },
    administrativeClass: { type: String, trim: true },
    academicStatus: {
      type: String,
      enum: ['active', 'leave', 'suspended', 'dismissed', 'graduated'],
      default: 'active'
    },
    programType: {
      type: String,
      enum: ['standard', 'high_quality'],
      default: 'standard'
    },
    policy: {
      code: String,
      name: String,
      discountRate: { type: Number, default: 0 }
    },
    creditLimits: {
      minCredits: { type: Number, default: 12 },
      maxCredits: { type: Number, default: 24 }
    },
    bankAccount: { type: String, trim: true },
    courseHistory: {
      type: [courseHistorySchema],
      default: []
    }
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema, 'SinhVien');

export default Student;
