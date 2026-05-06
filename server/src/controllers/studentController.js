import Enrollment from '../models/Enrollment.js';
import Student from '../models/Student.js';
import TuitionLiability from '../models/TuitionLiability.js';
import User from '../models/User.js';
import { createUserAccount, syncLinkedUserStatus } from '../services/accountService.js';
import { recordAuditLog } from '../services/auditService.js';
import { syncStudentProfile } from '../services/profileSyncService.js';
import {
  cancelEnrollment,
  getRegistrationValidationReport,
  registerStudentToSection
} from '../services/registrationService.js';
import { serializeUser } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  if (req.user.linkedModel !== 'Student') {
    res.status(403);
    throw new Error('Tai khoan nay khong gan voi ho so sinh vien.');
  }

  const student = await Student.findById(req.user.linkedId);
  const tuitionHistory = await TuitionLiability.find({ student: student._id })
    .populate('semester')
    .sort({ createdAt: -1 });

  res.json({
    profile: student,
    tuitionHistory
  });
});

export const listStudents = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.q?.trim()) {
    const keyword = req.query.q.trim();
    filter.$or = [
      { studentCode: { $regex: keyword, $options: 'i' } },
      { fullName: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } }
    ];
  }
  if (req.query.major) {
    filter.major = req.query.major;
  }
  if (req.query.faculty) {
    filter.faculty = req.query.faculty;
  }
  if (req.query.cohort) {
    filter.cohort = req.query.cohort;
  }
  if (req.query.academicStatus) {
    filter.academicStatus = req.query.academicStatus;
  }

  const items = await Student.find(filter).sort({ studentCode: 1 });
  res.json({ items });
});

export const createStudent = asyncHandler(async (req, res) => {
  const { createAccount, accountUsername, accountPassword, ...payload } = req.body;
  const student = await Student.create(payload);
  await syncStudentProfile(student);

  let account = null;
  let temporaryPassword = null;

  if (createAccount) {
    try {
      const createdAccount = await createUserAccount({
        username: accountUsername || student.studentCode,
        password: accountPassword,
        displayName: student.fullName,
        email: student.email,
        roles: ['student'],
        linkedModel: 'Student',
        linkedId: student._id
      });
      account = createdAccount.user;
      temporaryPassword = createdAccount.temporaryPassword;
    } catch (error) {
      await Student.findByIdAndDelete(student._id);
      throw error;
    }
  }

  await recordAuditLog({
    actor: req.user._id,
    action: 'student.create',
    subjectType: 'Student',
    subjectId: String(student._id),
    ipAddress: req.ip,
    details: {
      studentCode: student.studentCode,
      accountProvisioned: Boolean(account)
    }
  });

  res.status(201).json({
    item: student,
    account: account ? await serializeUser(account) : null,
    temporaryPassword
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  if (!student) {
    res.status(404);
    throw new Error('Khong tim thay sinh vien.');
  }

  const previousStatus = student.academicStatus;
  const updatableFields = [
    'fullName',
    'dateOfBirth',
    'gender',
    'citizenId',
    'email',
    'phone',
    'address',
    'faculty',
    'major',
    'cohort',
    'administrativeClass',
    'academicStatus',
    'programType',
    'policy',
    'creditLimits',
    'bankAccount',
    'courseHistory'
  ];

  updatableFields.forEach((field) => {
    if (field in req.body) {
      student[field] = req.body[field];
    }
  });

  await syncStudentProfile(student);

  const linkedUser = await User.findOne({ linkedModel: 'Student', linkedId: student._id });
  if (linkedUser) {
    linkedUser.displayName = student.fullName;
    linkedUser.email = student.email;
    await linkedUser.save({ validateBeforeSave: false });
  }

  if (previousStatus !== student.academicStatus) {
    await syncLinkedUserStatus({
      linkedModel: 'Student',
      linkedId: student._id,
      isActive: student.academicStatus === 'active'
    });
  }

  await recordAuditLog({
    actor: req.user._id,
    action: 'student.updated',
    subjectType: 'Student',
    subjectId: String(student._id),
    ipAddress: req.ip,
    details: {
      studentCode: student.studentCode,
      academicStatus: student.academicStatus
    }
  });

  res.json({ item: student });
});

export const listMyEnrollments = asyncHandler(async (req, res) => {
  if (req.user.linkedModel !== 'Student') {
    res.status(403);
    throw new Error('Tai khoan nay khong gan voi ho so sinh vien.');
  }

  const items = await Enrollment.find({
    student: req.user.linkedId
  })
    .populate({
      path: 'section',
      populate: ['course', 'semester', 'lecturer']
    })
    .sort({ createdAt: -1 });

  res.json({ items });
});

export const registerToSection = asyncHandler(async (req, res) => {
  if (req.user.linkedModel !== 'Student') {
    res.status(403);
    throw new Error('Tai khoan nay khong duoc dang ky hoc phan.');
  }

  const item = await registerStudentToSection({
    studentId: req.user.linkedId,
    sectionId: req.body.sectionId,
    actorId: req.user._id,
    ipAddress: req.ip
  });

  res.status(201).json({ item });
});

export const previewRegistrationToSection = asyncHandler(async (req, res) => {
  if (req.user.linkedModel !== 'Student') {
    res.status(403);
    throw new Error('Tai khoan nay khong duoc dang ky hoc phan.');
  }

  const report = await getRegistrationValidationReport({
    studentId: req.user.linkedId,
    sectionId: req.body.sectionId
  });

  res.json({ report });
});

export const cancelMyEnrollment = asyncHandler(async (req, res) => {
  if (req.user.linkedModel !== 'Student') {
    res.status(403);
    throw new Error('Tai khoan nay khong duoc huy dang ky hoc phan.');
  }

  const enrollment = await Enrollment.findById(req.params.enrollmentId);
  if (!enrollment || String(enrollment.student) !== String(req.user.linkedId)) {
    res.status(404);
    throw new Error('Khong tim thay phieu dang ky can huy.');
  }

  const item = await cancelEnrollment({
    enrollmentId: req.params.enrollmentId,
    actorId: req.user._id,
    ipAddress: req.ip
  });

  res.json({ item });
});
