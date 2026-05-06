import Lecturer from '../models/Lecturer.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';

const mapStudentProfile = (student) =>
  student
    ? {
        code: student.studentCode,
        faculty: student.faculty,
        major: student.major,
        administrativeClass: student.administrativeClass,
        academicStatus: student.academicStatus
      }
    : null;

const mapLecturerProfile = (lecturer) =>
  lecturer
    ? {
        code: lecturer.lecturerCode,
        department: lecturer.department,
        workingStatus: lecturer.workingStatus,
        degree: lecturer.degree
      }
    : null;

export const resolveLinkedProfile = async (user) => {
  if (!user?.linkedModel || !user?.linkedId) {
    return null;
  }

  if (user.linkedModel === 'Student') {
    const student = await Student.findById(user.linkedId).lean();
    return mapStudentProfile(student);
  }

  if (user.linkedModel === 'Lecturer') {
    const lecturer = await Lecturer.findById(user.linkedId).lean();
    return mapLecturerProfile(lecturer);
  }

  if (user.linkedModel === 'Staff') {
    const staff = await Staff.findById(user.linkedId).lean();
    return {
      unit: staff?.staffUnit || user.staffUnit || 'Truong',
      title: staff?.title || 'Nhan vien',
      division: staff?.division || user.staffUnit || 'Van phong'
    };
  }

  return null;
};

export const serializeUser = async (user) => ({
  id: String(user._id),
  username: user.username,
  displayName: user.displayName,
  email: user.email,
  roles: user.roles,
  accountStatus: user.accountStatus,
  mustChangePassword: user.mustChangePassword,
  lastLoginAt: user.lastLoginAt,
  linkedModel: user.linkedModel,
  staffUnit: user.staffUnit,
  profile: await resolveLinkedProfile(user)
});

export const serializeUsers = async (users) => Promise.all(users.map(serializeUser));
