import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Lecturer from '../models/Lecturer.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import RegistrationPeriod from '../models/RegistrationPeriod.js';
import Section from '../models/Section.js';
import Semester from '../models/Semester.js';
import Student from '../models/Student.js';
import TuitionLiability from '../models/TuitionLiability.js';
import User from '../models/User.js';
import { permissionsCatalog } from '../constants/permissions.js';
import { ROLE_LABELS } from '../constants/roles.js';
import { buildReceiptFromPayment } from '../services/tuitionService.js';
import { serializeUsers } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const sumBy = (items, getValue) => items.reduce((sum, item) => sum + getValue(item), 0);
const ACTIVE_ENROLLMENT_STATUSES = ['approved', 'pending'];
const toSemesterLabel = (semester) =>
  semester ? `${semester.name} ${semester.academicYear}` : 'Khac';

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

const flattenSemesterRates = (semesters = []) =>
  semesters
    .flatMap((semester) =>
      (semester.tuitionRules || []).map((rule) => ({
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
      }))
    )
    .sort((a, b) => new Date(b.effectiveFrom || 0) - new Date(a.effectiveFrom || 0));

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

  const [registrationPeriods, availableSections, myEnrollments, tuitionHistory, payments] =
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
        .sort({ createdAt: -1 })
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
  const receipts = payments
    .filter((item) => item.receiptNumber)
    .map((item) => buildReceiptFromPayment(item, item.liability))
    .filter(Boolean);

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
  const [semesters, courses, sections, registrationPeriods, students, lecturers, enrollments] =
    await Promise.all([
      Semester.find().sort({ startDate: -1 }),
      Course.find().sort({ code: 1 }),
      Section.find()
        .populate('course')
        .populate('semester')
        .populate('lecturer')
        .sort({ createdAt: -1 }),
      RegistrationPeriod.find().populate('semester').sort({ startAt: -1 }),
      Student.find().sort({ studentCode: 1 }),
      Lecturer.find().sort({ lecturerCode: 1 }),
      Enrollment.find({ status: { $in: ACTIVE_ENROLLMENT_STATUSES } })
        .select('student section semester status')
        .sort({ createdAt: -1 })
    ]);

  const studentStatusSummary = Object.entries(
    students.reduce((acc, item) => {
      acc[item.academicStatus] = (acc[item.academicStatus] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ id: status, status, count }));

  const registrationSummary = sections.map((item) => ({
    id: item._id,
    semesterId: item.semester?._id || null,
    semesterCode: item.semester?.code || '',
    semesterName: toSemesterLabel(item.semester),
    sectionCode: item.code,
    courseCode: item.course?.code,
    courseName: item.course?.name,
    lecturerName: item.lecturer?.fullName || '--',
    status: item.status,
    currentEnrollment: item.currentEnrollment,
    minCapacity: item.minCapacity,
    capacity: item.capacity,
    fillRate: item.capacity ? Math.round((item.currentEnrollment / item.capacity) * 100) : 0,
    examDate: item.exam?.examDate || null
  }));

  const activeStudents = students.filter((item) => item.academicStatus === 'active');
  const academicReportsBySemester = semesters.map((semester) => {
    const semesterKey = String(semester._id);
    const semesterSections = sections.filter(
      (item) => String(item.semester?._id || item.semester) === semesterKey
    );
    const semesterEnrollments = enrollments.filter(
      (item) => String(item.semester) === semesterKey
    );
    const registeredStudentIds = new Set(semesterEnrollments.map((item) => String(item.student)));

    const studentsWithoutEnrollment = activeStudents
      .filter((item) => !registeredStudentIds.has(String(item._id)))
      .map((item) => ({
        id: item._id,
        studentCode: item.studentCode,
        fullName: item.fullName,
        major: item.major,
        administrativeClass: item.administrativeClass || '--',
        academicStatus: item.academicStatus
      }));

    const sectionUtilization = semesterSections
      .map((item) => ({
        id: item._id,
        sectionCode: item.code,
        courseCode: item.course?.code,
        courseName: item.course?.name,
        lecturerName: item.lecturer?.fullName || '--',
        status: item.status,
        currentEnrollment: item.currentEnrollment,
        minCapacity: item.minCapacity,
        capacity: item.capacity,
        fillRate: item.capacity ? Math.round((item.currentEnrollment / item.capacity) * 100) : 0
      }))
      .sort((left, right) => right.fillRate - left.fillRate);

    const riskySections = sectionUtilization.filter(
      (item) => item.status === 'open' && item.currentEnrollment < item.minCapacity
    );

    return {
      semester: {
        _id: semester._id,
        code: semester.code,
        name: semester.name,
        academicYear: semester.academicYear
      },
      summary: {
        totalSections: semesterSections.length,
        totalRegistrations: semesterEnrollments.length,
        averageFillRate: sectionUtilization.length
          ? Math.round(
              sectionUtilization.reduce((sum, item) => sum + item.fillRate, 0) /
                sectionUtilization.length
            )
          : 0,
        riskySectionCount: riskySections.length,
        studentsWithoutEnrollmentCount: studentsWithoutEnrollment.length
      },
      sectionUtilization,
      riskySections,
      studentsWithoutEnrollment
    };
  });

  res.json({
    semesters,
    courses,
    sections,
    registrationPeriods,
    students,
    lecturers,
    studentStatusSummary,
    registrationSummary,
    academicReportsBySemester,
    spotlight: {
      openSections: sections.filter((item) => item.status === 'open').length,
      fullSections: sections.filter((item) => item.status === 'full').length,
      onHoldStudents: students.filter((item) => item.academicStatus !== 'active').length,
      activeLecturers: lecturers.filter((item) => item.workingStatus === 'active').length
    }
  });
});

export const getFinanceWorkspace = asyncHandler(async (req, res) => {
  const [semesters, liabilities, payments] = await Promise.all([
    Semester.find().sort({ startDate: -1 }),
    TuitionLiability.find().populate('student').populate('semester').sort({ updatedAt: -1 }),
    PaymentTransaction.find()
      .populate('student')
      .populate({
        path: 'liability',
        populate: { path: 'semester' }
      })
      .sort({ createdAt: -1 })
  ]);
  const rates = flattenSemesterRates(semesters);
  const receipts = payments
    .filter((item) => item.receiptNumber)
    .map((item) => buildReceiptFromPayment(item, item.liability))
    .filter(Boolean);

  const revenueBySemester = Object.values(
    receipts.reduce((acc, item) => {
      const key = item.semester?._id ? String(item.semester._id) : 'unknown';
      if (!acc[key]) {
        acc[key] = {
          id: key,
          semesterName: toSemesterLabel(item.semester),
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
          semesterName: toSemesterLabel(item.semester),
          outstandingAmount: 0,
          amountDue: 0,
          amountPaid: 0
        };
      }
      acc[key].outstandingAmount += item.outstandingAmount;
      acc[key].amountDue += item.amountDue;
      acc[key].amountPaid += item.amountPaid;
      return acc;
    }, {})
  ).sort((a, b) => b.outstandingAmount - a.outstandingAmount);

  const revenueByMonth = Object.values(
    payments
      .filter((item) => item.status === 'success')
      .reduce((acc, item) => {
        const semester = item.liability?.semester || null;
        const paidAt = new Date(item.createdAt);
        const monthKey = `${paidAt.getFullYear()}-${String(paidAt.getMonth() + 1).padStart(2, '0')}`;
        const key = `${semester?._id ? String(semester._id) : 'unknown'}::${monthKey}`;

        if (!acc[key]) {
          acc[key] = {
            id: key,
            semesterId: semester?._id ? String(semester._id) : 'unknown',
            semesterName: toSemesterLabel(semester),
            monthKey,
            monthLabel: new Intl.DateTimeFormat('vi-VN', {
              month: 'long',
              year: 'numeric'
            }).format(paidAt),
            amount: 0,
            transactionCount: 0
          };
        }

        acc[key].amount += item.amount;
        acc[key].transactionCount += 1;
        return acc;
      }, {})
  ).sort((left, right) => left.monthKey.localeCompare(right.monthKey));

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
      revenueByMonth,
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
  const users = await User.find().sort({ createdAt: -1 });

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
    roleDistribution
  });
});
