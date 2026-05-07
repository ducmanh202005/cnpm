import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import RegistrationPeriod from '../models/RegistrationPeriod.js';
import Section from '../models/Section.js';
import Student from '../models/Student.js';
import { recordAuditLog } from './auditService.js';
import { syncCourseConditions } from './syncCatalogService.js';
import { recalculateTuitionLiability } from './tuitionService.js';

const EFFECTIVE_ENROLLMENT_STATUSES = ['approved'];
const CANCELLABLE_ENROLLMENT_STATUSES = ['approved', 'pending'];

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

const resolveStudentMajorCodes = (student) => {
  const studyMajors = Array.isArray(student?.studyMajors) ? student.studyMajors : [];
  const studyMajorCodes = studyMajors.map((item) => item?.code).filter(Boolean);
  const fallbackCodes = student?.majorCode ? [student.majorCode] : [];

  return [
    ...new Set(
      [...studyMajorCodes, ...fallbackCodes].map((item) => String(item).trim().toUpperCase())
    )
  ];
};

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
        credits: section.course.credits,
        eligibleMajorCodes: section.course.eligibleMajorCodes || []
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
    status: { $in: CANCELLABLE_ENROLLMENT_STATUSES }
  });

  const activeEnrollments = await Enrollment.find({
    student: student._id,
    semester: section.semester._id,
    status: { $in: EFFECTIVE_ENROLLMENT_STATUSES }
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

  const studentMajorCodes = resolveStudentMajorCodes(student);
  const eligibleMajorCodes = (section.course?.eligibleMajorCodes || [])
    .map((item) => String(item).trim().toUpperCase())
    .filter(Boolean);
  const majorEligible =
    eligibleMajorCodes.length === 0 ||
    studentMajorCodes.some((code) => eligibleMajorCodes.includes(code));

  const conflict = comparableEnrollments.find((enrollment) =>
    schedulesConflict(section.schedule, enrollment.section?.schedule || [])
  );
  const sameCourseEnrollment = comparableEnrollments.find(
    (enrollment) => enrollment.section?.course?.code === section.course?.code
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
      key: 'duplicate_course',
      title: 'Không đăng ký trùng môn',
      passed: !sameCourseEnrollment,
      detail: sameCourseEnrollment
        ? `Không được đăng ký hai lớp học phần khác nhau của cùng một môn học trong cùng học kỳ. Bạn đã đăng ký ${sameCourseEnrollment.section?.code} cho môn ${section.course?.code}.`
        : 'Bạn chưa có lớp học phần nào khác của cùng môn học trong học kỳ này.'
    }),
    createCheck({
      key: 'major_eligibility',
      title: 'Phù hợp ngành học',
      passed: majorEligible,
      detail: majorEligible
        ? 'Học phần phù hợp với ngành học hiện có của bạn.'
        : 'Học phần này không thuộc ngành học hiện có của bạn.'
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
      academicStatus: student.academicStatus,
      majorCode: student.majorCode,
      studyMajors: student.studyMajors || []
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

  if (!CANCELLABLE_ENROLLMENT_STATUSES.includes(enrollment.status)) {
    throw new Error('Chỉ có thể hủy phiếu đăng ký đang hiệu lực.');
  }

  await ensureRegistrationPeriodOpen(
    enrollment.section.semester._id,
    enrollment.section.semester.registrationDeadline
  );

  const wasApproved = enrollment.status === 'approved';
  enrollment.status = 'cancelled';
  await enrollment.save();

  const section = await Section.findById(enrollment.section._id);
  if (section && wasApproved) {
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
