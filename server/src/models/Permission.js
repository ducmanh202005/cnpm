import mongoose from 'mongoose';

const { Schema } = mongoose;

const permissionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    resource: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    description: { type: String, trim: true }
  },
  { timestamps: true }
);

const Permission =
  mongoose.models.Permission || mongoose.model('Permission', permissionSchema, 'QuyenHan');

export default Permission;
