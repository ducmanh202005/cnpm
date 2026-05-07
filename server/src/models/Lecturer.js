import mongoose from 'mongoose';

const { Schema } = mongoose;

const lecturerSchema = new Schema(
  {
    lecturerCode: { type: String, required: true, unique: true, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    citizenId: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    department: { type: String, required: true, trim: true },
    degree: { type: String, trim: true },
    workingStatus: {
      type: String,
      enum: ['active', 'on_leave', 'study_leave', 'retired'],
      default: 'active'
    }
  },
  { timestamps: true }
);

const Lecturer = mongoose.models.Lecturer || mongoose.model('Lecturer', lecturerSchema, 'GiangVien');

export default Lecturer;
