import mongoose from 'mongoose';

const { Schema } = mongoose;

const departmentSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    office: { type: String, trim: true },
    headName: { type: String, trim: true }
  },
  { timestamps: true }
);

const Department =
  mongoose.models.Department || mongoose.model('Department', departmentSchema, 'Khoa');

export default Department;
