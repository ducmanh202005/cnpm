import mongoose from 'mongoose';

const { Schema } = mongoose;

const examScheduleSchema = new Schema(
  {
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room' },
    slot: { type: Schema.Types.ObjectId, ref: 'TimeSlot' },
    examDate: { type: Date, required: true },
    durationMinutes: { type: Number, min: 15, default: 60 },
    format: {
      type: String,
      enum: ['written', 'multiple_choice', 'practical', 'oral'],
      default: 'written'
    },
    notes: { type: String, trim: true },
    roomName: { type: String, trim: true },
    sessionLabel: { type: String, trim: true }
  },
  { timestamps: true }
);

const ExamSchedule =
  mongoose.models.ExamSchedule || mongoose.model('ExamSchedule', examScheduleSchema, 'LichThi');

export default ExamSchedule;
