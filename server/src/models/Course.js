import mongoose from 'mongoose';

const { Schema } = mongoose;

const courseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    name: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 1 },
    theoryCredits: { type: Number, default: 0 },
    practiceCredits: { type: Number, default: 0 },
    courseType: {
      type: String,
      enum: ['required', 'elective'],
      default: 'required'
    },
    faculty: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    rules: {
      prerequisites: { type: [String], default: [] },
      previousCourses: { type: [String], default: [] },
      corequisites: { type: [String], default: [] }
    }
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema, 'MonHoc');

export default Course;
