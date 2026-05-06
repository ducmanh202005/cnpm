import mongoose from 'mongoose';

const { Schema } = mongoose;

const roleSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true }
  },
  { timestamps: true }
);

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema, 'VaiTro');

export default Role;
