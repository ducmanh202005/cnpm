import mongoose from 'mongoose';

const { Schema } = mongoose;

const staffSchema = new Schema(
  {
    staffCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    person: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
    title: { type: String, trim: true },
    division: { type: String, trim: true },
    staffUnit: { type: String, trim: true },
    workingStatus: {
      type: String,
      enum: ['active', 'on_leave', 'retired'],
      default: 'active'
    }
  },
  { timestamps: true }
);

const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema, 'NhanVien');

export default Staff;
