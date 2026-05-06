import mongoose from 'mongoose';

const { Schema } = mongoose;

const policySchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    discountRate: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String, trim: true }
  },
  { timestamps: true }
);

const Policy = mongoose.models.Policy || mongoose.model('Policy', policySchema, 'DienChinhSach');

export default Policy;
