import mongoose from 'mongoose';
import { createReference } from '../utils/reference.js';

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    logCode: {
      type: String,
      required: true,
      unique: true,
      default: () => createReference('LOG')
    },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, trim: true },
    subjectType: { type: String, trim: true },
    subjectId: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    result: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success'
    },
    details: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema, 'AuditLog');

export default AuditLog;
