import mongoose from 'mongoose';

const { Schema } = mongoose;

const accountRoleSchema = new Schema(
  {
    account: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    assignedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

accountRoleSchema.index({ account: 1, role: 1 }, { unique: true });

const AccountRole =
  mongoose.models.AccountRole || mongoose.model('AccountRole', accountRoleSchema, 'TaiKhoanVaiTro');

export default AccountRole;
