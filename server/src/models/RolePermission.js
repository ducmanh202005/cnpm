import mongoose from 'mongoose';

const { Schema } = mongoose;

const rolePermissionSchema = new Schema(
  {
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    permission: { type: Schema.Types.ObjectId, ref: 'Permission', required: true },
    assignedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

rolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

const RolePermission =
  mongoose.models.RolePermission ||
  mongoose.model('RolePermission', rolePermissionSchema, 'VaiTroQuyenHan');

export default RolePermission;
