import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import RegistrationPeriod from '../models/RegistrationPeriod.js';
import Section from '../models/Section.js';
import Student from '../models/Student.js';
import { recordAuditLog } from './auditService.js';
import { syncCourseConditions } from './syncCatalogService.js';
import { recalculateTuitionLiability } from './tuitionService.js';

const periodsOverlap = (aStart, aCount, bStart, bCount) => {
  const aEnd = aStart + aCount - 1;
  const bEnd = bStart + bCount - 1;
  return aStart <= bEnd && bStart <= aEnd;
};

const schedulesConflict = (schedulesA = [], schedulesB = []) =>
  schedulesA.some((slotA) =>
    schedulesB.some(
      (slotB) =>
        slotA.dayOfWeek === slotB.dayOfWeek &&
        periodsOverlap(slotA.startPeriod, slotA.periodCount, slotB.startPeriod, slotB.periodCount)
    )
  );

const ACADEMIC_STATUS_LABELS = {
  active: 'đang hoạt động',
  leave: 'bảo lưu',
  suspended: 'tạm ngưng',
  dismissed: 'buộc thôi học',
  graduated: 'đã tốt nghiệp'
};

const SECTION_STATUS_LABELS = {
  pending: 'chờ mở đăng ký',
  open: 'đang mở đăng ký',
  full: 'đã đầy',
  closed: 'đã đóng',
  cancelled: 'đã hủy'
};

const formatDateTimeVi = (value) => {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

const createCheck = ({ key, title, passed, detail }) => ({
  key,
  title,
  passed,
  status: passed ? 'success' : 'failed',
  detail
});

const createSectionSnapshot = (section) => ({
  id: String(section._id),
  code: section.code,
  status: section.status,
  capacity: section.capacity,
  currentEnrollment: section.currentEnrollment,
  schedule: section.schedule || [],
  course: section.course
    ? {
        code: section.course.code,
        name: section.course.name,
        credits: section.course.credits
      }
    : null,
  lecturer: section.lecturer
    ? {
        fullName: section.lecturer.fullName
      }
    : null,
  semester: section.semester
    ? {
        id: String(section.semester._id),
        name: section.semester.name,
        academicYear: section.semester.academicYear,
        registrationDeadline: section.semester.registrationDeadline
      }
    : null
});

const resolveRegistrationPeriodCheck = async (semesterId, semesterDeadline) => {
  const activePeriod = await RegistrationPeriod.findOne({
    semester: semesterId,
    status: 'active',
    startAt: { $lte: new Date() },
    endAt: { $gte: new Date() }
  }).lean();

  if (activePeriod) {
    return createCheck({
      key: 'registration_period',
      title: 'Thời gian đăng ký',
      passed: true,
      detail: `Đang trong đợt đăng ký "${activePeriod.name}" đến ${formatDateTimeVi(activePeriod.endAt)}.`
    });
  }

  if (semesterDeadline && new Date(semesterDeadline).getTime() < Date.now()) {
    return createCheck({
      key: 'registration_period',
      title: 'Thời gian đăng ký',
      passed: false,
      detail: `Đã quá hạn đăng ký học phần của học kỳ này (${formatDateTimeVi(semesterDeadline)}).`
    });
  }

  return createCheck({
    key: 'registration_period',
    title: 'Thời gian đăng ký',
    passed: false,
    detail: 'Hiện chưa có đợt đăng ký nào đang mở cho học kỳ này.'
  });
};

const ensureRegistrationPeriodOpen = async (semesterId, semesterDeadline) => {
  const check = await resolveRegistrationPeriodCheck(semesterId, semesterDeadline);
  if (!check.passed) {
    throw new Error(check.detail);
  }
};

const buildRegistrationValidationReport = async ({ student, section }) => {
  if (!student) {
    throw new Error('Không tìm thấy sinh viên.');
  }

  if (!section) {
    throw new Error('Không tìm thấy học phần.');
  }

  const existing = await Enrollment.findOne({
    student: student._id,
    section: section._id,
    status: { $in: ['approved', 'pending'] }
  });

  const activeEnrollments = await Enrollment.find({
    student: student._id,
    semester: section.semester._id,
    status: 'approved'
  }).populate({
    path: 'section',
    populate: { path: 'course semester' }
  });

  const comparableEnrollments = activeEnrollments.filter(
    (item) => String(item.section?._id) !== String(section._id)
  );

  const currentCredits = activeEnrollments.reduce(
    (sum, enrollment) => sum + (enrollment.section?.course?.credits || 0),
    0
  );
  const additionalCredits = existing ? 0 : section.course?.credits || 0;
  const targetCredits = currentCredits + additionalCredits;
  const maxCredits = student.creditLimits?.maxCredits || 24;

  const passedCodes = new Set(
    (student.courseHistory || []).filter((item) => item.passed).map((item) => item.courseCode)
  );
  const attemptedCodes = new Set((student.courseHistory || []).map((item) => item.courseCode));
  const enrolledCodes = new Set(
    comparableEnrollments.map((item) => item.section?.course?.code).filter(Boolean)
  );

  const prerequisites = section.course?.rules?.prerequisites || [];
  const previousCourses = section.course?.rules?.previousCourses || [];
  const corequisites = section.course?.rules?.corequisites || [];

  const missingPrerequisites = prerequisites.filter((code) => !passedCodes.has(code));
  const missingPreviousCourses = previousCourses.filter((code) => !attemptedCodes.has(code));
  const missingCorequisites = corequisites.filter(
    (code) => !passedCodes.has(code) && !enrolledCodes.has(code)
  );

  const conflict = comparableEnrollments.find((enrollment) =>
    schedulesConflict(section.schedule, enrollment.section?.schedule || [])
  );

  const registrationPeriodCheck = await resolveRegistrationPeriodCheck(
    section.semester._id,
    section.semester.registrationDeadline
  );

  const checks = [
    createCheck({
      key: 'academic_status',
      title: 'Tình trạng học vụ',
      passed: student.academicStatus === 'active',
      detail:
        student.academicStatus === 'active'
          ? 'Tình trạng học vụ hiện tại là đang hoạt động, được phép đăng ký học phần.'
          : `Tình trạng học vụ hiện tại là "${ACADEMIC_STATUS_LABELS[student.academicStatus] || student.academicStatus}", nên chưa đủ điều kiện đăng ký.`
    }),
    createCheck({
      key: 'section_status',
      title: 'Trạng thái học phần',
      passed: section.status === 'open',
      detail:
        section.status === 'open'
          ? 'Học phần đang mở đăng ký.'
          : `Học phần hiện đang ở trạng thái "${SECTION_STATUS_LABELS[section.status] || section.status}", nên không thể đăng ký.`
    }),
    createCheck({
      key: 'capacity',
      title: 'Sĩ số còn trống',
      passed: section.currentEnrollment < section.capacity,
      detail:
        section.currentEnrollment < section.capacity
          ? `Còn ${section.capacity - section.currentEnrollment} chỗ trống trên tổng ${section.capacity} chỗ.`
          : `Học phần đã đầy (${section.currentEnrollment}/${section.capacity}).`
    }),
    registrationPeriodCheck,
    createCheck({
      key: 'duplicate',
      title: 'Trùng học phần đã đăng ký',
      passed: !existing,
      detail: existing
        ? 'Bạn đã có phiếu đăng ký hiệu lực cho học phần này.'
        : 'Bạn chưa đăng ký học phần này trong đợt hiện tại.'
    }),
    createCheck({
      key: 'credit_limit',
      title: 'Giới hạn số tín chỉ',
      passed: targetCredits <= maxCredits,
      detail:
        targetCredits <= maxCredits
          ? `Sau khi đăng ký, tổng số tín chỉ dự kiến là ${targetCredits}/${maxCredits}.`
          : `Nếu đăng ký học phần này, tổng số tín chỉ sẽ là ${targetCredits}/${maxCredits}, vượt giới hạn tối đa.`
    }),
    createCheck({
      key: 'prerequisites',
      title: 'Môn tiên quyết',
      passed: missingPrerequisites.length === 0,
      detail:
        prerequisites.length === 0
          ? 'Học phần này không yêu cầu môn tiên quyết.'
          : missingPrerequisites.length === 0
            ? `Đã đạt đầy đủ các môn tiên quyết: ${prerequisites.join(', ')}.`
            : `Chưa đạt các môn tiên quyết bắt buộc: ${missingPrerequisites.join(', ')}.`
    }),
    createCheck({
      key: 'previous_courses',
      title: 'Môn học trước',
      passed: missingPreviousCourses.length === 0,
      detail:
        previousCourses.length === 0
          ? 'Học phần này không yêu cầu môn học trước.'
          : missingPreviousCourses.length === 0
            ? `Đã học các môn học trước cần thiết: ${previousCourses.join(', ')}.`
            : `Bạn chưa học các môn học trước bắt buộc: ${missingPreviousCourses.join(', ')}.`
    }),
    createCheck({
      key: 'corequisites',
      title: 'Môn song hành',
      passed: missingCorequisites.length === 0,
      detail:
        corequisites.length === 0
          ? 'Học phần này không yêu cầu môn song hành.'
          : missingCorequisites.length === 0
            ? `Đã đáp ứng điều kiện môn song hành: ${corequisites.join(', ')}.`
            : `Cần hoàn thành hoặc đăng ký cùng lúc các môn song hành: ${missingCorequisites.join(', ')}.`
    }),
    createCheck({
      key: 'schedule_conflict',
      title: 'Trùng lịch học',
      passed: !conflict,
      detail: conflict?.section?.course?.code
        ? `Trùng lịch với học phần ${conflict.section.code} (${conflict.section.course.code} - ${conflict.section.course.name}).`
        : comparableEnrollments.length > 0
          ? 'Không trùng lịch với các học phần đã đăng ký trong học kỳ này.'
          : 'Hiện bạn chưa có học phần nào khác trong học kỳ này, nên không có xung đột lịch.'
    })
  ];

  const reasons = checks.filter((item) => !item.passed).map((item) => item.detail);
  const eligible = reasons.length === 0;

  return {
    eligible,
    summary: eligible
      ? 'Bạn đủ điều kiện đăng ký học phần này.'
      : 'Bạn chưa đủ điều kiện đăng ký học phần này. Xem các mục chưa đạt bên dưới.',
    reasons,
    checks,
    metrics: {
      currentCredits,
      targetCredits,
      maxCredits,
      approvedSectionCount: activeEnrollments.length
    },
    student: {
      id: String(student._id),
      studentCode: student.studentCode,
      fullName: student.fullName,
      academicStatus: student.academicStatus
    },
    section: createSectionSnapshot(section)
  };
};

const assertRegistrationAllowed = (report) => {
  if (report.eligible) {
    return;
  }

  const reasonText = report.reasons.join(' ');
  throw new Error(reasonText || 'Không thể đăng ký học phần này.');
};

export const getRegistrationValidationReport = async ({ studentId, sectionId }) => {
  const [student, section] = await Promise.all([
    Student.findById(studentId),
    Section.findById(sectionId).populate('course semester lecturer')
  ]);

  return buildRegistrationValidationReport({ student, section });
};

export const registerStudentToSection = async ({
  studentId,
  sectionId,
  actorId,
  ipAddress
}) => {
  const [student, section] = await Promise.all([
    Student.findById(studentId),
    Section.findById(sectionId).populate('course semester lecturer')
  ]);

  const report = await buildRegistrationValidationReport({ student, section });
  assertRegistrationAllowed(report);

  // Reuse the existing registration record after a cancellation/rejection so we
  // don't violate the unique student+section constraint on PhieuDangKyHocPhan.
  const reusableEnrollment = await Enrollment.findOne({
    student: student._id,
    section: section._id
  });

  let enrollment;

  if (reusableEnrollment) {
    reusableEnrollment.semester = section.semester._id;
    reusableEnrollment.status = 'approved';
    reusableEnrollment.approvedBy = actorId;
    reusableEnrollment.registeredAt = new Date();
    reusableEnrollment.note = undefined;
    enrollment = await reusableEnrollment.save();
  } else {
    enrollment = await Enrollment.create({
      student: student._id,
      section: section._id,
      semester: section.semester._id,
      status: 'approved',
      approvedBy: actorId
    });
  }

  section.currentEnrollment += 1;
  if (section.currentEnrollment >= section.capacity) {
    section.status = 'full';
  }
  await section.save();

  await recalculateTuitionLiability({
    studentId: student._id,
    semesterId: section.semester._id
  });

  await recordAuditLog({
    actor: actorId,
    action: 'section.register',
    subjectType: 'Enrollment',
    subjectId: String(enrollment._id),
    ipAddress,
    details: {
      studentCode: student.studentCode,
      sectionCode: section.code
    }
  });

  return Enrollment.findById(enrollment._id).populate({
    path: 'section',
    populate: ['course', 'semester', 'lecturer']
  });
};

export const cancelEnrollment = async ({ enrollmentId, actorId, ipAddress }) => {
  const enrollment = await Enrollment.findById(enrollmentId).populate({
    path: 'section',
    populate: ['course', 'semester']
  });

  if (!enrollment) {
    throw new Error('Không tìm thấy phiếu đăng ký học phần.');
  }

  if (enrollment.status !== 'approved') {
    throw new Error('Chỉ có thể hủy phiếu đăng ký đang hiệu lực.');
  }

  await ensureRegistrationPeriodOpen(
    enrollment.section.semester._id,
    enrollment.section.semester.registrationDeadline
  );

  enrollment.status = 'cancelled';
  await enrollment.save();

  const section = await Section.findById(enrollment.section._id);
  if (section) {
    section.currentEnrollment = Math.max(0, section.currentEnrollment - 1);
    if (section.status === 'full') {
      section.status = 'open';
    }
    await section.save();
  }

  await recalculateTuitionLiability({
    studentId: enrollment.student,
    semesterId: enrollment.semester
  });

  await recordAuditLog({
    actor: actorId,
    action: 'section.cancel',
    subjectType: 'Enrollment',
    subjectId: String(enrollment._id),
    ipAddress,
    details: {
      sectionCode: enrollment.section.code
    }
  });

  return enrollment;
};

export const createCourseIfMissing = async (payload) => {
  const existing = await Course.findOne({ code: payload.code }).lean();
  if (existing) {
    throw new Error('Ma mon hoc da ton tai.');
  }
  const course = await Course.create(payload);
  await syncCourseConditions(course);
  return course;
};
