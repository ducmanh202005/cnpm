import mongoose from 'mongoose';

const { Schema } = mongoose;

const timeSlotSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true }
  },
  { timestamps: true }
);

const TimeSlot = mongoose.models.TimeSlot || mongoose.model('TimeSlot', timeSlotSchema, 'Ca');

export default TimeSlot;
