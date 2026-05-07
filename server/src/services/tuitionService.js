import PaymentTransaction from '../models/PaymentTransaction.js';
import Enrollment from '../models/Enrollment.js';
import Semester from '../models/Semester.js';
import Student from '../models/Student.js';
import TuitionLiability from '../models/TuitionLiability.js';
import { createReference } from '../utils/reference.js';
import { recordAuditLog } from './auditService.js';

const resolveLiabilityStatus = ({ amountDue, amountPaid, dueDate }) => {
  if (amountDue === 0 || amountPaid >= amountDue) {
    return 'paid';
  }

  if (amountPaid > 0) {
    return 'partial';
  }

  if (dueDate && new Date(dueDate).getTime() < Date.now()) {
    return 'overdue';
  }

  return 'unpaid';
};

const resolveTuitionRule = ({ semester, student }) => {
  const rules = (semester?.tuitionRules || []).filter((item) => item.isActive !== false);
  const applicableRules = rules.filter((item) => item.programType === (student.programType || 'standard'));
  const pool = applicableRules.length > 0 ? applicableRules : rules;

  return (
    pool
      .filter((item) => !item.effectiveFrom || new Date(item.effectiveFrom).getTime() <= Date.now())
      .sort((a, b) => new Date(b.effectiveFrom || 0) - new Date(a.effectiveFrom || 0))[0] ||
    pool.sort((a, b) => new Date(b.effectiveFrom || 0) - new Date(a.effectiveFrom || 0))[0] ||
    null
  );
};

const createReceiptFromPayment = (payment, liability) => {
  if (!payment?.receiptNumber) {
    return null;
  }

  return {
    _id: payment._id,
    receiptNumber: payment.receiptNumber,
    issuedAt: payment.receiptIssuedAt,
    student: payment.student,
    semester: liability?.semester || payment.liability?.semester || null,
    amount: payment.amount,
    content: payment.receiptContent,
    confirmedBy: payment.confirmedBy,
    payment
  };
};

export const buildReceiptFromPayment = createReceiptFromPayment;

export const recalculateTuitionLiability = async ({ studentId, semesterId }) => {
  const [student, semester, existingLiability] = await Promise.all([
    Student.findById(studentId).lean(),
    Semester.findById(semesterId).lean(),
    TuitionLiability.findOne({ student: studentId, semester: semesterId })
  ]);

  if (!student || !semester) {
    throw new Error('Khong tim thay sinh vien hoac hoc ky de tinh hoc phi.');
  }

  const enrollments = await Enrollment.find({
    student: studentId,
    semester: semesterId,
    status: 'approved'
  }).populate({
    path: 'section',
    populate: { path: 'course' }
  });

  const tuitionRule = resolveTuitionRule({ semester, student });

  const unitPrice = tuitionRule?.pricePerCredit || 0;
  const lines = enrollments.map((enrollment) => {
    const course = enrollment.section.course;
    const credits = course?.credits || 0;
    return {
      section: enrollment.section._id,
      courseCode: course?.code,
      courseName: course?.name,
      credits,
      unitPrice,
      amount: credits * unitPrice
    };
  });

  const totalCredits = lines.reduce((sum, item) => sum + item.credits, 0);
  const subtotal = lines.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = Math.round(subtotal * ((student.policy?.discountRate || 0) / 100));
  const amountDue = Math.max(0, subtotal - discountAmount);
  const amountPaid = existingLiability?.amountPaid || 0;
  const outstandingAmount = Math.max(0, amountDue - amountPaid);
  const status = resolveLiabilityStatus({
    amountDue,
    amountPaid,
    dueDate: semester.paymentDeadline
  });

  const liability = await TuitionLiability.findOneAndUpdate(
    { student: studentId, semester: semesterId },
    {
      student: studentId,
      semester: semesterId,
      rate: tuitionRule
        ? {
            rateCode: tuitionRule.rateCode,
            name: tuitionRule.name,
            academicYear: tuitionRule.academicYear,
            programType: tuitionRule.programType,
            pricePerCredit: tuitionRule.pricePerCredit,
            effectiveFrom: tuitionRule.effectiveFrom,
            notes: tuitionRule.notes
          }
        : null,
      totalCredits,
      subtotal,
      discountAmount,
      amountDue,
      amountPaid,
      outstandingAmount,
      dueDate: semester.paymentDeadline,
      status,
      lines
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  )
    .populate('student')
    .populate('semester');

  return liability;
};

export const registerPaymentForLiability = async ({
  liabilityId,
  studentId,
  amount,
  method,
  actorId,
  ipAddress,
  status = 'success',
  gatewayMessage = ''
}) => {
  const liability = await TuitionLiability.findById(liabilityId)
    .populate('student')
    .populate('semester');

  if (!liability) {
    throw new Error('Khong tim thay nghia vu hoc phi.');
  }

  if (String(liability.student._id) !== String(studentId)) {
    throw new Error('Giao dich khong dung sinh vien.');
  }

  if (amount <= 0) {
    throw new Error('So tien thanh toan phai lon hon 0.');
  }

  if (amount > liability.outstandingAmount) {
    throw new Error('So tien thanh toan vuot qua cong no hien tai.');
  }

  const transaction = await PaymentTransaction.create({
    student: studentId,
    liability: liability._id,
    amount,
    method,
    status,
    referenceCode: createReference('PAY'),
    gatewayMessage,
    createdBy: actorId,
    receiptNumber: status === 'success' ? createReference('RCPT') : undefined,
    receiptIssuedAt: status === 'success' ? new Date() : undefined,
    receiptContent: status === 'success' ? `Thu hoc phi hoc ky ${liability.semester.name}` : undefined,
    confirmedBy: status === 'success' ? actorId : undefined
  });

  if (status === 'success') {
    liability.amountPaid += amount;
    liability.outstandingAmount = Math.max(0, liability.amountDue - liability.amountPaid);
    liability.status = resolveLiabilityStatus({
      amountDue: liability.amountDue,
      amountPaid: liability.amountPaid,
      dueDate: liability.dueDate
    });
    await liability.save();
  }

  await recordAuditLog({
    actor: actorId,
    action: status === 'success' ? 'payment.recorded' : 'payment.failed',
    subjectType: 'TuitionLiability',
    subjectId: String(liability._id),
    ipAddress,
    result: status === 'success' ? 'success' : 'failure',
    details: {
      amount,
      method,
      transactionId: String(transaction._id)
    }
  });

  return {
    transaction,
    receipt: createReceiptFromPayment(transaction, liability),
    liability
  };
};
