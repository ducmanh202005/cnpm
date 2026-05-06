import AuditLog from '../models/AuditLog.js';

export const recordAuditLog = async ({
  actor,
  action,
  subjectType,
  subjectId,
  ipAddress,
  result = 'success',
  details = {}
}) => {
  try {
    await AuditLog.create({
      actor,
      action,
      subjectType,
      subjectId,
      ipAddress,
      result,
      details
    });
  } catch (error) {
    console.error('Cannot write audit log:', error.message);
  }
};
