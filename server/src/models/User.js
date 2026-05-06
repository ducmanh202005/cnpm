import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ALL_ROLES } from '../constants/roles.js';
import { createReference } from '../utils/reference.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    accountCode: {
      type: String,
      required: true,
      unique: true,
      default: () => createReference('TK')
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    roles: {
      type: [String],
      enum: ALL_ROLES,
      default: []
    },
    accountStatus: {
      type: String,
      enum: ['active', 'locked'],
      default: 'active'
    },
    mustChangePassword: {
      type: Boolean,
      default: false
    },
    userProfile: {
      type: Schema.Types.ObjectId,
      ref: 'Person'
    },
    primaryRole: {
      type: Schema.Types.ObjectId,
      ref: 'Role'
    },
    linkedModel: {
      type: String,
      enum: ['Student', 'Lecturer', 'Staff']
    },
    linkedId: {
      type: Schema.Types.ObjectId,
      refPath: 'linkedModel'
    },
    staffUnit: {
      type: String,
      trim: true
    },
    lastLoginAt: Date
  },
  { timestamps: true }
);

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema, 'TaiKhoan');

export default User;
