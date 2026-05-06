import mongoose from 'mongoose';

const { Schema } = mongoose;

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
    }
  },
  { timestamps: true }
);

const Semester = mongoose.models.Semester || mongoose.model('Semester', semesterSchema, 'HocKy');

export default Semester;
