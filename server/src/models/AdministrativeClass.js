import mongoose from 'mongoose';

const { Schema } = mongoose;

const administrativeClassSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    size: { type: Number, default: 0 },
    major: { type: Schema.Types.ObjectId, ref: 'Major', required: true },
    cohort: { type: Schema.Types.ObjectId, ref: 'Cohort', required: true }
  },
  { timestamps: true }
);

const AdministrativeClass =
  mongoose.models.AdministrativeClass ||
  mongoose.model('AdministrativeClass', administrativeClassSchema, 'LopHanhChinh');

export default AdministrativeClass;
