import AuditLog from '../models/AuditLog.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Lecturer from '../models/Lecturer.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import Receipt from '../models/Receipt.js';
import RegistrationPeriod from '../models/RegistrationPeriod.js';
import Section from '../models/Section.js';
import Semester from '../models/Semester.js';
import Student from '../models/Student.js';
import TuitionLiability from '../models/TuitionLiability.js';
import TuitionRate from '../models/TuitionRate.js';
import User from '../models/User.js';
import { permissionsCatalog } from '../constants/permissions.js';
import { ROLE_LABELS } from '../constants/roles.js';
import { serializeUsers } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const sumBy = (items, getValue) => items.reduce((sum, item) => sum + getValue(item), 0);

const buildExamSchedule = (sections = []) =>
  sections
    .filter((section) => section.exam?.examDate)
    .map((section) => ({
      sectionId: section._id,
      sectionCode: section.code,
      courseName: section.course?.name,
      examDate: section.exam.examDate,
      room: section.exam.room,
      sessionLabel: section.exam.sessionLabel,
      durationMinutes: section.exam.durationMinutes,
      format: section.exam.format,
      notes: section.exam.notes
    }))
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

export const getStudentWorkspace = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user.linkedId);
  if (!student) {
    res.status(404);
    throw new Error('Khong tim thay ho so sinh vien.');
  }

  const activeSemester =
    (await Semester.findOne({ status: { $in: ['registration_open', 'in_session'] } }).sort({
      startDate: -1
    })) || (await Semester.findOne().sort({ startDate: -1 }));

  const [registrationPeriods, availableSections, myEnrollments, tuitionHistory, payments, receipts] =
    await Promise.all([
      RegistrationPeriod.find(activeSemester ? { semester: activeSemester._id } : {})
        .populate('semester')
        .sort({ startAt: -1 }),
      Section.find(
        activeSemester ? { semester: activeSemester._id, status: { $in: ['open', 'full'] } } : {}
      )
        .populate('course')
        .populate('semester')
        .populate('lecturer')
        .sort({ createdAt: -1 }),
      Enrollment.find({ student: student._id })
        .populate({
          path: 'section',
          populate: ['course', 'semester', 'lecturer']
        })
        .sort({ createdAt: -1 }),
      TuitionLiability.find({ student: student._id }).populate('semester').sort({ createdAt: -1 }),
      PaymentTransaction.find({ student: student._id })
        .populate({
          path: 'liability',
          populate: { path: 'semester' }
        })
        .sort({ createdAt: -1 }),
      Receipt.find({ student: student._id })
        .populate('semester')
        .populate('payment')
        .sort({ issuedAt: -1 })
    ]);

  const tuition =
    (activeSemester &&
      tuitionHistory.find((item) => String(item.semester?._id) === String(activeSemester._id))) ||
    tuitionHistory[0] ||
    null;

  const visibleMyEnrollments = myEnrollments.filter((item) => item.status !== 'cancelled');

  const examSchedule = buildExamSchedule(
    visibleMyEnrollments
      .filter((item) => item.status === 'approved')
      .map((item) => item.section)
      .filter(Boolean)
  );

  res.json({
    profile: student,
    activeSemester,
    registrationPeriods,
    availableSections,
    myEnrollments: visibleMyEnrollments,
    tuition,
    tuitionHistory,
    payments,
    receipts,
    examSchedule
  });
});

export const getAcademicWorkspace = asyncHandler(async (req, res) => {
  const [semesters, courses, sections, registrationPeriods, students, lecturers] = await Promise.all([
    Semester.find().sort({ startDate: -1 }),
    Course.find().sort({ code: 1 }),
    Section.find()
      .populate('course')
      .populate('semester')
      .populate('lecturer')
      .sort({ createdAt: -1 }),
    RegistrationPeriod.find().populate('semester').sort({ startAt: -1 }),
    Student.find().sort({ studentCode: 1 }),
    Lecturer.find().sort({ lecturerCode: 1 })
  ]);

  const studentStatusSummary = Object.entries(
    students.reduce((acc, item) => {
      acc[item.academicStatus] = (acc[item.academicStatus] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ id: status, status, count }));

  const registrationSummary = sections.map((item) => ({
    id: item._id,
    sectionCode: item.code,
    courseCode: item.course?.code,
    courseName: item.course?.name,
    lecturerName: item.lecturer?.fullName || '--',
    status: item.status,
    currentEnrollment: item.currentEnrollment,
    capacity: item.capacity,
    fillRate: item.capacity ? Math.round((item.currentEnrollment / item.capacity) * 100) : 0,
    examDate: item.exam?.examDate || null
  }));

  res.json({
    semesters,
    courses,
    sections,
    registrationPeriods,
    students,
    lecturers,
    studentStatusSummary,
    registrationSummary,
    spotlight: {
      openSections: sections.filter((item) => item.status === 'open').length,
      fullSections: sections.filter((item) => item.status === 'full').length,
      onHoldStudents: students.filter((item) => item.academicStatus !== 'active').length,
      activeLecturers: lecturers.filter((item) => item.workingStatus === 'active').length
    }
  });
});

export const getFinanceWorkspace = asyncHandler(async (req, res) => {
  const [rates, liabilities, payments, receipts] = await Promise.all([
    TuitionRate.find().populate('semester').sort({ createdAt: -1 }),
    TuitionLiability.find().populate('student').populate('semester').sort({ updatedAt: -1 }),
    PaymentTransaction.find()
      .populate('student')
      .populate({
        path: 'liability',
        populate: { path: 'semester' }
      })
      .sort({ createdAt: -1 }),
    Receipt.find()
      .populate('student')
      .populate('semester')
      .populate('payment')
      .sort({ issuedAt: -1 })
  ]);

  const revenueBySemester = Object.values(
    receipts.reduce((acc, item) => {
      const key = item.semester?._id ? String(item.semester._id) : 'unknown';
      if (!acc[key]) {
        acc[key] = {
          id: key,
          semesterName: item.semester ? `${item.semester.name} ${item.semester.academicYear}` : 'Khac',
          amount: 0,
          receiptCount: 0
        };
      }
      acc[key].amount += item.amount;
      acc[key].receiptCount += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.amount - a.amount);

  const outstandingBySemester = Object.values(
    liabilities.reduce((acc, item) => {
      const key = item.semester?._id ? String(item.semester._id) : 'unknown';
      if (!acc[key]) {
        acc[key] = {
          id: key,
          semesterName: item.semester ? `${item.semester.name} ${item.semester.academicYear}` : 'Khac',
          outstandingAmount: 0,
          amountDue: 0
        };
      }
      acc[key].outstandingAmount += item.outstandingAmount;
      acc[key].amountDue += item.amountDue;
      return acc;
    }, {})
  ).sort((a, b) => b.outstandingAmount - a.outstandingAmount);

  const paymentMethodBreakdown = Object.values(
    payments
      .filter((item) => item.status === 'success')
      .reduce((acc, item) => {
        if (!acc[item.method]) {
          acc[item.method] = {
            id: item.method,
            method: item.method,
            amount: 0,
            transactionCount: 0
          };
        }
        acc[item.method].amount += item.amount;
        acc[item.method].transactionCount += 1;
        return acc;
      }, {})
  ).sort((a, b) => b.amount - a.amount);

  res.json({
    rates,
    liabilities,
    payments,
    receipts,
    reports: {
      revenueBySemester,
      outstandingBySemester,
      paymentMethodBreakdown
    },
    spotlight: {
      collected: liabilities.reduce((sum, item) => sum + item.amountPaid, 0),
      outstanding: liabilities.reduce((sum, item) => sum + item.outstandingAmount, 0),
      overdueCount: liabilities.filter((item) => item.status === 'overdue').length
    }
  });
});

export const getLecturerWorkspace = asyncHandler(async (req, res) => {
  const lecturer = await Lecturer.findById(req.user.linkedId);
  if (!lecturer) {
    res.status(404);
    throw new Error('Khong tim thay ho so giang vien.');
  }

  const sections = await Section.find({ lecturer: lecturer._id })
    .populate('course')
    .populate('semester')
    .sort({ createdAt: -1 });

  const sectionIds = sections.map((item) => item._id);
  const enrollments = await Enrollment.find({
    section: { $in: sectionIds },
    status: 'approved'
  })
    .populate('student')
    .populate({
      path: 'section',
      populate: ['course', 'semester']
    });

  const rosters = sections.map((section) => ({
    sectionId: section._id,
    sectionCode: section.code,
    courseName: section.course?.name,
    students: enrollments
      .filter((item) => String(item.section._id) === String(section._id))
      .map((item, index) => ({
        ...item.student.toObject(),
        seatNumber: index + 1
      }))
  }));

  const examSchedule = buildExamSchedule(sections);
  const teachingSummary = {
    totalSections: sections.length,
    totalStudents: enrollments.length,
    upcomingExams: examSchedule.filter((item) => new Date(item.examDate).getTime() >= Date.now()).length,
    totalCredits: sumBy(sections, (item) => item.course?.credits || 0)
  };

  res.json({
    lecturer,
    sections,
    rosters,
    examSchedule,
    teachingSummary
  });
});

export const getAdminWorkspace = asyncHandler(async (req, res) => {
  const [users, auditLogs] = await Promise.all([
    User.find().sort({ createdAt: -1 }),
    AuditLog.find().populate('actor').sort({ createdAt: -1 }).limit(100)
  ]);

  const roleDistribution = Object.entries(
    users.reduce((acc, user) => {
      user.roles.forEach((role) => {
        acc[role] = (acc[role] || 0) + 1;
      });
      return acc;
    }, {})
  ).map(([role, count]) => ({
    id: role,
    role,
    label: ROLE_LABELS[role] || role,
    count
  }));

  res.json({
    users: await serializeUsers(users),
    rolesCatalog: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
    permissionsCatalog,
    roleDistribution,
    auditLogs
  });
});
