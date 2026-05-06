import mongoose from 'mongoose';

const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    roomType: { type: String, trim: true, default: 'classroom' },
    capacity: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema, 'Phong');

export default Room;
