import AdministrativeClass from '../models/AdministrativeClass.js';
import Cohort from '../models/Cohort.js';
import Department from '../models/Department.js';
import Lecturer from '../models/Lecturer.js';
import Major from '../models/Major.js';
import Person from '../models/Person.js';
import Policy from '../models/Policy.js';
import Program from '../models/Program.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';

const cleanCode = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();

const createPersonCode = (prefix, value) => `${prefix}-${cleanCode(value).slice(0, 14) || 'USER'}`;

const upsertPerson = async ({ existingId, code, fullName, dateOfBirth, gender, email, phone, address }) => {
  const person =
    (existingId && (await Person.findById(existingId))) ||
    (email ? await Person.findOne({ email: email.toLowerCase() }) : null) ||
    null;

  const target = person || new Person({ personCode: code });
  target.personCode = target.personCode || code;
  target.fullName = fullName;
  target.dateOfBirth = dateOfBirth;
  target.gender = gender;
  target.email = email;
  target.phone = phone;
  target.address = address;
  await target.save();
  return target;
};

const attachStudentRefs = async (student) => {
  if (student.policy?.code) {
    const policy = await Policy.findOneAndUpdate(
      { code: student.policy.code.toUpperCase() },
      {
        code: student.policy.code.toUpperCase(),
        name: student.policy.name || student.policy.code,
        discountRate: student.policy.discountRate || 0,
        description: student.policy.name || student.policy.code
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    student.policyId = policy._id;
  }

  if (student.faculty) {
    const department = await Department.findOne({ name: student.faculty });
    if (department) {
      student.departmentId = department._id;
    }
  }

  if (student.major) {
    const major = await Major.findOne({ name: student.major });
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

  if (student.majorId && student.cohortId) {
    const program = await Program.findOne({
      major: student.majorId,
      cohort: student.cohortId,
      programType: student.programType || 'standard'
    });
    if (program) {
      student.programId = program._id;
    }
  }
};

export const syncStudentProfile = async (student) => {
  const person = await upsertPerson({
    existingId: student.userProfile,
    code: createPersonCode('SV', student.studentCode),
    fullName: student.fullName,
    dateOfBirth: student.dateOfBirth,
    gender: student.gender,
    email: student.email,
    phone: student.phone,
    address: student.address
  });

  student.userProfile = person._id;
  await attachStudentRefs(student);
  await student.save();
  return person;
};

export const syncLecturerProfile = async (lecturer) => {
  const person = await upsertPerson({
    existingId: lecturer.userProfile,
    code: createPersonCode('GV', lecturer.lecturerCode),
    fullName: lecturer.fullName,
    dateOfBirth: lecturer.dateOfBirth,
    gender: lecturer.gender,
    email: lecturer.email,
    phone: lecturer.phone,
    address: lecturer.address
  });

  lecturer.userProfile = person._id;

  if (lecturer.department) {
    const department = await Department.findOne({ name: lecturer.department });
    if (department) {
      lecturer.departmentId = department._id;
    }
  }

  await lecturer.save();
  return person;
};

export const syncStaffProfile = async ({ user, displayName, email, staffUnit }) => {
  const existingStaff = user.linkedId ? await Staff.findById(user.linkedId) : null;
  const person = await upsertPerson({
    existingId: user.userProfile || existingStaff?.person,
    code: createPersonCode('NV', user.username || displayName),
    fullName: displayName,
    email,
    gender: 'other'
  });

  const staff =
    existingStaff ||
    new Staff({
      staffCode: cleanCode(`NV-${user.username || displayName}`).slice(0, 20) || `NV-${user._id}`,
      person: person._id
    });

  staff.person = person._id;
  staff.title = staff.title || 'Nhan vien';
  staff.division = staffUnit || staff.division || 'Van phong';
  staff.staffUnit = staffUnit || staff.staffUnit || 'Truong';
  await staff.save();

  user.userProfile = person._id;
  user.linkedModel = 'Staff';
  user.linkedId = staff._id;
  await user.save({ validateBeforeSave: false });

  return { person, staff };
};

export const resolveUserProfileId = async ({ linkedModel, linkedId }) => {
  if (!linkedId) {
    return null;
  }

  if (linkedModel === 'Student') {
    const student = await Student.findById(linkedId).select('userProfile').lean();
    return student?.userProfile || null;
  }

  if (linkedModel === 'Lecturer') {
    const lecturer = await Lecturer.findById(linkedId).select('userProfile').lean();
    return lecturer?.userProfile || null;
  }

  if (linkedModel === 'Staff') {
    const staff = await Staff.findById(linkedId).select('person').lean();
    return staff?.person || null;
  }

  return null;
};
