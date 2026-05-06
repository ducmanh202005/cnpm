import mongoose from 'mongoose';

const { Schema } = mongoose;

const majorSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true }
  },
  { timestamps: true }
);

const Major = mongoose.models.Major || mongoose.model('Major', majorSchema, 'Nganh');

export default Major;
