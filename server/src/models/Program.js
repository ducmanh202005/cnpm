import mongoose from 'mongoose';

const { Schema } = mongoose;

const programSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    major: { type: Schema.Types.ObjectId, ref: 'Major', required: true },
    cohort: { type: Schema.Types.ObjectId, ref: 'Cohort', required: true },
    name: { type: String, required: true, trim: true },
    totalCredits: { type: Number, default: 0 },
    programType: {
      type: String,
      enum: ['standard', 'high_quality'],
      default: 'standard'
    },
    description: { type: String, trim: true }
  },
  { timestamps: true }
);

const Program =
  mongoose.models.Program || mongoose.model('Program', programSchema, 'ChuongTrinhDaoTao');

export default Program;
