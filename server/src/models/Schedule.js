import mongoose from 'mongoose';

const { Schema } = mongoose;

const scheduleSchema = new Schema(
  {
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room' },
    slot: { type: Schema.Types.ObjectId, ref: 'TimeSlot' },
    dayOfWeek: { type: Number, min: 2, max: 8, required: true },
    startPeriod: { type: Number, min: 1, required: true },
    periodCount: { type: Number, min: 1, required: true },
    sessionLabel: { type: String, trim: true },
    roomName: { type: String, trim: true },
    weeks: { type: String, trim: true }
  },
  { timestamps: true }
);

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema, 'LichHoc');

export default Schedule;
