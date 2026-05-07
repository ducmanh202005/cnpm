import AdministrativeClass from '../models/AdministrativeClass.js';
import Cohort from '../models/Cohort.js';
import Department from '../models/Department.js';
import Lecturer from '../models/Lecturer.js';
import Major from '../models/Major.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';

const cleanCode = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();

const attachStudentRefs = async (student) => {
  if (student.faculty) {
    const department = await Department.findOne({
      $or: [{ code: cleanCode(student.faculty) }, { name: student.faculty }]
    });
    if (department) {
      student.departmentId = department._id;
    }
  }

  if (student.major) {
    const major = await Major.findOne({
      $or: [{ code: cleanCode(student.major) }, { name: student.major }]
    });
    if (major) {
      student.majorId = major._id;
    }
  }

  if (student.cohort) {
    const cohort = await Cohort.findOne({
      $or: [{ code: student.cohort.toUpperCase() }, { name: student.cohort }]
    });
    if (cohort) {
      student.cohortId = cohort._id;
    }
  }

  if (student.administrativeClass) {
    const item = await AdministrativeClass.findOne({
      $or: [
        { code: student.administrativeClass.toUpperCase() },
        { name: student.administrativeClass }
      ]
    });
    if (item) {
      student.administrativeClassId = item._id;
    }
  }
};

export const syncStudentProfile = async (student) => {
  await attachStudentRefs(student);
  await student.save();
  return student;
};

export const syncLecturerProfile = async (lecturer) => {
  if (lecturer.department) {
    const department = await Department.findOne({
      $or: [{ code: cleanCode(lecturer.department) }, { name: lecturer.department }]
    });
    if (department) {
      lecturer.departmentId = department._id;
    }
  }

  await lecturer.save();
  return lecturer;
};

export const syncStaffProfile = async ({ user, displayName, email, staffUnit }) => {
  const existingStaff = user.linkedId ? await Staff.findById(user.linkedId) : null;

  const staff =
    existingStaff ||
    new Staff({
      staffCode: cleanCode(`NV-${user.username || displayName}`).slice(0, 20) || `NV-${user._id}`
    });

  staff.fullName = displayName || staff.fullName;
  staff.email = email || staff.email;
  staff.title = staff.title || 'Nhan vien';
  staff.division = staffUnit || staff.division || 'Van phong';
  staff.staffUnit = staffUnit || staff.staffUnit || 'Truong';
  await staff.save();

  user.linkedModel = 'Staff';
  user.linkedId = staff._id;
  await user.save({ validateBeforeSave: false });

  return { staff };
};

export const resolveLinkedProfileId = async ({ linkedModel, linkedId }) => {
  if (!linkedId) {
    return null;
  }

  if (linkedModel === 'Student') {
    const student = await Student.findById(linkedId).select('_id').lean();
    return student?._id || null;
  }

  if (linkedModel === 'Lecturer') {
    const lecturer = await Lecturer.findById(linkedId).select('_id').lean();
    return lecturer?._id || null;
  }

  if (linkedModel === 'Staff') {
    const staff = await Staff.findById(linkedId).select('_id').lean();
    return staff?._id || null;
  }

  return null;
};
