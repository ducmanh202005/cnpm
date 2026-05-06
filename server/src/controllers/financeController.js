import PaymentTransaction from '../models/PaymentTransaction.js';
import Receipt from '../models/Receipt.js';
import Student from '../models/Student.js';
import TuitionLiability from '../models/TuitionLiability.js';
import TuitionRate from '../models/TuitionRate.js';
import { recordAuditLog } from '../services/auditService.js';
import {
  recalculateTuitionLiability,
  registerPaymentForLiability
} from '../services/tuitionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
  const items = await TuitionRate.find().populate('semester').sort({ createdAt: -1 });
  res.json({ items });
});

export const createRate = asyncHandler(async (req, res) => {
  const rate = await TuitionRate.create(req.body);

  await recordAuditLog({
    actor: req.user._id,
    action: 'tuition_rate.create',
    subjectType: 'TuitionRate',
    subjectId: String(rate._id),
    ipAddress: req.ip,
    details: { name: rate.name }
  });

  res.status(201).json({
    item: await TuitionRate.findById(rate._id).populate('semester')
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
  if (req.query.semesterId) {
    filter.semester = req.query.semesterId;
  }

  const items = await Receipt.find(filter)
    .populate('student')
    .populate('semester')
    .populate({
      path: 'payment',
      populate: ['student', 'liability']
    })
    .sort({ issuedAt: -1 });

  res.json({ items });
});
