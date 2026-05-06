import mongoose from 'mongoose';

const { Schema } = mongoose;

const courseConditionSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    relatedCourse: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    type: {
      type: String,
      enum: ['prerequisite', 'previous_course', 'corequisite'],
      required: true
    },
    description: { type: String, trim: true }
  },
  { timestamps: true }
);

courseConditionSchema.index({ course: 1, relatedCourse: 1, type: 1 }, { unique: true });

const CourseCondition =
  mongoose.models.CourseCondition ||
  mongoose.model('CourseCondition', courseConditionSchema, 'DieuKienMonHoc');

export default CourseCondition;
