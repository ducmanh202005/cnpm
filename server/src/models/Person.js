import mongoose from 'mongoose';

const { Schema } = mongoose;

const personSchema = new Schema(
  {
    personCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  { timestamps: true }
);

const Person = mongoose.models.Person || mongoose.model('Person', personSchema, 'NguoiDung');

export default Person;
