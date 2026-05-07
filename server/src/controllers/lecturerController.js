import Lecturer from '../models/Lecturer.js';
import Section from '../models/Section.js';
import User from '../models/User.js';
import { createUserAccount, syncLinkedUserStatus } from '../services/accountService.js';
import { recordAuditLog } from '../services/auditService.js';
import { syncLecturerProfile } from '../services/profileSyncService.js';
import { serializeUser } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listLecturers = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.q?.trim()) {
    const keyword = req.query.q.trim();
    filter.$or = [
      { lecturerCode: { $regex: keyword, $options: 'i' } },
      { fullName: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } }
    ];
  }
  if (req.query.department) {
    filter.department = req.query.department;
  }
  if (req.query.workingStatus) {
    filter.workingStatus = req.query.workingStatus;
  }

  const items = await Lecturer.find(filter).sort({ lecturerCode: 1 });
  res.json({ items });
});

export const createLecturer = asyncHandler(async (req, res) => {
  const { createAccount, accountUsername, accountPassword, ...payload } = req.body;
  const lecturer = await Lecturer.create(payload);
  await syncLecturerProfile(lecturer);

  let account = null;
  let temporaryPassword = null;

  if (createAccount) {
    try {
      const createdAccount = await createUserAccount({
        username: accountUsername || lecturer.lecturerCode,
        password: accountPassword,
        displayName: lecturer.fullName,
        email: lecturer.email,
        roles: ['lecturer'],
        linkedModel: 'Lecturer',
        linkedId: lecturer._id
      });
      account = createdAccount.user;
      temporaryPassword = createdAccount.temporaryPassword;
    } catch (error) {
      await Lecturer.findByIdAndDelete(lecturer._id);
      throw error;
    }
  }

  await recordAuditLog({
    actor: req.user._id,
    action: 'lecturer.create',
    subjectType: 'Lecturer',
    subjectId: String(lecturer._id),
    ipAddress: req.ip,
    details: {
      lecturerCode: lecturer.lecturerCode,
      accountProvisioned: Boolean(account)
    }
  });

  res.status(201).json({
    item: lecturer,
    account: account ? await serializeUser(account) : null,
    temporaryPassword
  });
});

export const updateLecturer = asyncHandler(async (req, res) => {
  const lecturer = await Lecturer.findById(req.params.lecturerId);
  if (!lecturer) {
    res.status(404);
    throw new Error('Không tìm thấy giảng viên.');
  }

  const previousStatus = lecturer.workingStatus;
  const updatableFields = [
    'fullName',
    'dateOfBirth',
    'gender',
    'citizenId',
    'email',
    'phone',
    'address',
    'department',
    'degree',
    'workingStatus'
  ];

  updatableFields.forEach((field) => {
    if (field in req.body) {
      lecturer[field] = req.body[field];
    }
  });

  await syncLecturerProfile(lecturer);

  const linkedUser = await User.findOne({ linkedModel: 'Lecturer', linkedId: lecturer._id });
  if (linkedUser) {
    linkedUser.displayName = lecturer.fullName;
    linkedUser.email = lecturer.email;
    await linkedUser.save({ validateBeforeSave: false });
  }

  if (previousStatus !== lecturer.workingStatus) {
    await syncLinkedUserStatus({
      linkedModel: 'Lecturer',
      linkedId: lecturer._id,
      isActive: lecturer.workingStatus === 'active'
    });
  }

  await recordAuditLog({
    actor: req.user._id,
    action: 'lecturer.updated',
    subjectType: 'Lecturer',
    subjectId: String(lecturer._id),
    ipAddress: req.ip,
    details: {
      lecturerCode: lecturer.lecturerCode,
      workingStatus: lecturer.workingStatus
    }
  });

  res.json({ item: lecturer });
});

export const deleteLecturer = asyncHandler(async (req, res) => {
  const lecturer = await Lecturer.findById(req.params.lecturerId);
  if (!lecturer) {
    res.status(404);
    throw new Error('Không tìm thấy giảng viên.');
  }

  const assignedSections = await Section.find({ lecturer: lecturer._id })
    .select('code status')
    .sort({ code: 1 })
    .limit(5)
    .lean();
  const assignedSectionCount = await Section.countDocuments({ lecturer: lecturer._id });

  if (assignedSectionCount > 0) {
    const sampleCodes = assignedSections.map((item) => item.code).filter(Boolean).join(', ');
    const suffix = assignedSectionCount > assignedSections.length ? ', ...' : '';
    res.status(409);
    throw new Error(
      `Không thể xóa giảng viên này vì vẫn đang được phân công ${assignedSectionCount} học phần` +
        `${sampleCodes ? ` (${sampleCodes}${suffix})` : ''}. Hãy gỡ phân công trước khi xóa.`
    );
  }

  const linkedUser = await User.findOne({ linkedModel: 'Lecturer', linkedId: lecturer._id });

  if (linkedUser) {
    await User.findByIdAndDelete(linkedUser._id);
  }

  await Lecturer.findByIdAndDelete(lecturer._id);

  await recordAuditLog({
    actor: req.user._id,
    action: 'lecturer.deleted',
    subjectType: 'Lecturer',
    subjectId: String(lecturer._id),
    ipAddress: req.ip,
    details: {
      lecturerCode: lecturer.lecturerCode,
      linkedAccountDeleted: Boolean(linkedUser)
    }
  });

  res.json({
    message: 'Đã xóa giảng viên.',
    item: {
      id: lecturer._id,
      lecturerCode: lecturer.lecturerCode
    }
  });
});
