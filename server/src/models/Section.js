import mongoose from 'mongoose';

const { Schema } = mongoose;

const scheduleSchema = new Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 2, max: 8 },
    sessionLabel: { type: String, trim: true },
    startPeriod: { type: Number, required: true, min: 1 },
    periodCount: { type: Number, required: true, min: 1 },
    room: { type: String, trim: true },
    weeks: { type: String, trim: true }
  },
  { _id: false }
);

const examSchema = new Schema(
  {
    examDate: Date,
    room: { type: String, trim: true },
    sessionLabel: { type: String, trim: true },
    durationMinutes: { type: Number, min: 15 },
    format: {
      type: String,
      enum: ['written', 'multiple_choice', 'practical', 'oral'],
      default: 'written'
    },
    notes: { type: String, trim: true }
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    lecturer: { type: Schema.Types.ObjectId, ref: 'Lecturer' },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    capacity: { type: Number, required: true, min: 1 },
    minCapacity: { type: Number, default: 15 },
    currentEnrollment: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'open', 'full', 'closed', 'cancelled'],
      default: 'pending'
    },
    room: { type: String, trim: true },
    schedule: { type: [scheduleSchema], default: [] },
    exam: examSchema,
    cancelReason: { type: String, trim: true }
  },
  { timestamps: true }
);

const Section = mongoose.models.Section || mongoose.model('Section', sectionSchema, 'HocPhan');

export default Section;
