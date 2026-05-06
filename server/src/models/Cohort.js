import mongoose from 'mongoose';

const { Schema } = mongoose;

const cohortSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    intakeYear: { type: Number, required: true },
    expectedGraduationYear: { type: Number, required: true }
  },
  { timestamps: true }
);

const Cohort = mongoose.models.Cohort || mongoose.model('Cohort', cohortSchema, 'KhoaDaoTao');

export default Cohort;
