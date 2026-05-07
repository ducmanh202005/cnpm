import PaymentTransaction from '../models/PaymentTransaction.js';
import Semester from '../models/Semester.js';
import Student from '../models/Student.js';
import TuitionLiability from '../models/TuitionLiability.js';
import { createReference } from '../utils/reference.js';
import { recordAuditLog } from '../services/auditService.js';
import {
  buildReceiptFromPayment,
  recalculateTuitionLiability,
  registerPaymentForLiability
} from '../services/tuitionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const mapRateItem = (semester, rule) => ({
  id: `${semester._id}:${rule.rateCode}`,
  rateCode: rule.rateCode,
  name: rule.name,
  academicYear: rule.academicYear,
  programType: rule.programType,
  pricePerCredit: rule.pricePerCredit,
  effectiveFrom: rule.effectiveFrom,
  notes: rule.notes,
  isActive: rule.isActive !== false,
  semester: {
    _id: semester._id,
    code: semester.code,
    name: semester.name,
    academicYear: semester.academicYear
  }
});

const flattenSemesterRates = (semesters) =>
  semesters
    .flatMap((semester) => (semester.tuitionRules || []).map((rule) => mapRateItem(semester, rule)))
    .sort((a, b) => new Date(b.effectiveFrom || 0) - new Date(a.effectiveFrom || 0));

export const getMyTuition = asyncHandler(async (req, res) => {
  if (req.user.linkedModel !== 'Student') {
    res.status(403);
    throw new Error('Tai khoan nay khong gan voi ho so sinh vien.');
  }

  const liabilities = await TuitionLiability.find({ student: req.user.linkedId })
    .populate('semester')
    .sort({ createdAt: -1 });

  const payments = await PaymentTransaction.find({ student: req.user.linkedId })
    .populate({
      path: 'liability',
      populate: { path: 'semester' }
    })
    .sort({ createdAt: -1 });

  res.json({
    liabilities,
    payments
  });
});

export const listRates = asyncHandler(async (req, res) => {
  const semesters = await Semester.find().sort({ startDate: -1 });
  const items = flattenSemesterRates(semesters);
  res.json({ items });
});

export const createRate = asyncHandler(async (req, res) => {
  const semesterId = req.body.semester || req.body.semesterId;
  if (!semesterId) {
    res.status(400);
    throw new Error('Vui long chon hoc ky de thiet lap bieu phi.');
  }

  const semester = await Semester.findById(semesterId);
  if (!semester) {
    res.status(404);
    throw new Error('Khong tim thay hoc ky.');
  }

  const nextRule = {
    rateCode: (req.body.rateCode || createReference('BP')).toUpperCase(),
    name: req.body.name || `Bieu phi ${semester.name} ${semester.academicYear}`,
    academicYear: req.body.academicYear || semester.academicYear,
    programType: req.body.programType || 'standard',
    pricePerCredit: Number(req.body.pricePerCredit || 0),
    effectiveFrom: req.body.effectiveFrom ? new Date(req.body.effectiveFrom) : new Date(),
    isActive: req.body.isActive !== false,
    notes: req.body.notes || ''
  };

  semester.tuitionRules = [
    ...(semester.tuitionRules || []).filter((item) => item.rateCode !== nextRule.rateCode),
    nextRule
  ];
  await semester.save();

  await recordAuditLog({
    actor: req.user._id,
    action: 'tuition_rate.create',
    subjectType: 'Semester',
    subjectId: String(semester._id),
    ipAddress: req.ip,
    details: { name: nextRule.name, rateCode: nextRule.rateCode }
  });

  res.status(201).json({
    item: mapRateItem(semester, nextRule)
  });
});

export const listLiabilities = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.semesterId) {
    filter.semester = req.query.semesterId;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const items = await TuitionLiability.find(filter)
    .populate('student')
    .populate('semester')
    .sort({ updatedAt: -1 });

  res.json({ items });
});

export const recomputeLiability = asyncHandler(async (req, res) => {
  const item = await recalculateTuitionLiability({
    studentId: req.body.studentId,
    semesterId: req.body.semesterId
  });

  res.json({ item });
});

export const createStudentPayment = asyncHandler(async (req, res) => {
  if (req.user.linkedModel !== 'Student') {
    res.status(403);
    throw new Error('Chi sinh vien moi duoc tu thanh toan.');
  }

  const { liabilityId, amount, method } = req.body;
  const payment = await registerPaymentForLiability({
    liabilityId,
    studentId: req.user.linkedId,
    amount: Number(amount),
    method,
    actorId: req.user._id,
    ipAddress: req.ip,
    status: 'success',
    gatewayMessage: 'Demo online payment accepted'
  });

  res.status(201).json(payment);
});

export const recordManualPayment = asyncHandler(async (req, res) => {
  const { liabilityId, studentId, amount, method } = req.body;

  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Khong tim thay sinh vien.');
  }

  const payment = await registerPaymentForLiability({
    liabilityId,
    studentId,
    amount: Number(amount),
    method,
    actorId: req.user._id,
    ipAddress: req.ip,
    status: 'success',
    gatewayMessage: 'Manual confirmation from finance office'
  });

  res.status(201).json(payment);
});

export const listPayments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.studentId) {
    filter.student = req.query.studentId;
  }

  const items = await PaymentTransaction.find(filter)
    .populate('student')
    .populate({
      path: 'liability',
      populate: { path: 'semester' }
    })
    .sort({ createdAt: -1 });

  res.json({ items });
});

export const listReceipts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.studentId) {
    filter.student = req.query.studentId;
  }
  filter.receiptNumber = { $exists: true, $ne: null };

  const payments = await PaymentTransaction.find(filter)
    .populate('student')
    .populate({
      path: 'liability',
      populate: { path: 'semester' }
    })
    .sort({ receiptIssuedAt: -1 });

  const items = payments
    .map((payment) => buildReceiptFromPayment(payment, payment.liability))
    .filter(Boolean)
    .filter((item) =>
      req.query.semesterId ? String(item.semester?._id) === String(req.query.semesterId) : true
    );

  res.json({ items });
});
