import mongoose from 'mongoose';
import AdministrativeClass from '../models/AdministrativeClass.js';
import Cohort from '../models/Cohort.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Enrollment from '../models/Enrollment.js';
import Lecturer from '../models/Lecturer.js';
import Major from '../models/Major.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import RegistrationPeriod from '../models/RegistrationPeriod.js';
import Room from '../models/Room.js';
import Schedule from '../models/Schedule.js';
import Section from '../models/Section.js';
import Semester from '../models/Semester.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';
import TuitionLiability from '../models/TuitionLiability.js';
import User from '../models/User.js';
import { connectDatabase } from '../config/db.js';
import {
  seedAdministrativeClasses,
  seedCohorts,
  seedCourses,
  seedDepartments,
  seedEnrollments,
  seedLecturers,
  seedMajors,
  seedPayments,
  seedRegistrationPeriods,
  seedRooms,
  seedSections,
  seedSemesters,
  seedStudents,
  seedTuitionRates,
  seedUsers
} from '../data/seedData.js';
import { createUserAccount, syncLinkedUserStatus } from '../services/accountService.js';
import { syncLecturerProfile, syncStudentProfile } from '../services/profileSyncService.js';
import { syncCourseConditions, syncSectionCalendars } from '../services/syncCatalogService.js';
import { recalculateTuitionLiability, registerPaymentForLiability } from '../services/tuitionService.js';

const clearDatabase = async () => {
  await Promise.all([
    PaymentTransaction.deleteMany({}),
    TuitionLiability.deleteMany({}),
    Enrollment.deleteMany({}),
    Schedule.deleteMany({}),
    Section.deleteMany({}),
    RegistrationPeriod.deleteMany({}),
    Course.deleteMany({}),
    Semester.deleteMany({}),
    Student.deleteMany({}),
    Lecturer.deleteMany({}),
    Staff.deleteMany({}),
    AdministrativeClass.deleteMany({}),
    Cohort.deleteMany({}),
    Major.deleteMany({}),
    Department.deleteMany({}),
    Room.deleteMany({}),
    User.deleteMany({})
  ]);

  await dropLegacyCollections();
};

const legacyCollections = [
  'NguoiDung',
  'VaiTro',
  'QuyenHan',
  'VaiTroQuyenHan',
  'TaiKhoanVaiTro',
  'DienChinhSach',
  'ChuongTrinhDaoTao',
  'DieuKienMonHoc',
  'LichThi',
  'Ca',
  'BieuPhi',
  'BienLaiDienTu',
  'courses',
  'enrollments',
  'lecturers',
  'paymenttransactions',
  'receipts',
  'registrationperiods',
  'sections',
  'semesters',
  'students',
  'tuitionliabilities',
  'tuitionrates',
  'users'
];

const createMap = (items, key) => new Map(items.map((item) => [item[key], item]));

const buildTuitionRulesForSemester = (semesterCode, academicYear) =>
  seedTuitionRates
    .filter((item) => item.semesterCode === semesterCode)
    .map((item) => ({
      rateCode: item.rateCode,
      name: item.name,
      academicYear: item.academicYear || academicYear,
      programType: item.programType,
      pricePerCredit: item.pricePerCredit,
      effectiveFrom: item.effectiveFrom,
      isActive: true,
      notes: item.notes
    }));

const createPreferredPeriodMap = (items = []) => {
  const map = new Map();

  for (const item of items) {
    const existing = map.get(item.semesterCode);
    if (!existing) {
      map.set(item.semesterCode, item);
      continue;
    }

    if (existing.status !== 'active' && item.status === 'active') {
      map.set(item.semesterCode, item);
    }
  }

  return map;
};

const dropLegacyCollections = async () => {
  const existingCollections = await mongoose.connection.db.listCollections().toArray();
  for (const collectionName of legacyCollections) {
    if (existingCollections.some((item) => item.name === collectionName)) {
      await mongoose.connection.db.dropCollection(collectionName).catch(() => null);
    }
  }
};

const ensureLinkedId = (map, linkedCode, kind) => {
  const linkedItem = map.get(linkedCode);
  if (!linkedItem) {
    throw new Error(`Khong tim thay ${kind} voi ma ${linkedCode}.`);
  }

  return linkedItem._id;
};

const createSeedAccounts = async ({ seedUserConfigs, lecturerMap, studentMap }) => {
  const accountMap = new Map();

  for (const config of seedUserConfigs.filter((item) => item.linkedModel === 'Staff')) {
    const account = await createUserAccount({
      ...config,
      linkedModel: 'Staff'
    });
    accountMap.set(config.username.toLowerCase(), account);
  }

  for (const config of seedUserConfigs.filter((item) => item.linkedModel === 'Lecturer')) {
    const linkedId = ensureLinkedId(lecturerMap, config.linkedCode, 'giang vien');
    const account = await createUserAccount({
      ...config,
      linkedModel: 'Lecturer',
      linkedId
    });
    accountMap.set(config.username.toLowerCase(), account);
  }

  for (const config of seedUserConfigs.filter((item) => item.linkedModel === 'Student')) {
    const student = studentMap.get(config.linkedCode);
    if (!student) {
      throw new Error(`Khong tim thay sinh vien voi ma ${config.linkedCode}.`);
    }

    const account = await createUserAccount({
      ...config,
      linkedModel: 'Student',
      linkedId: student._id
    });
    await syncLinkedUserStatus({
      linkedModel: 'Student',
      linkedId: student._id,
      isActive: student.academicStatus === 'active'
    });
    accountMap.set(config.username.toLowerCase(), account);
  }

  return accountMap;
};

const syncSectionOccupancy = async ({ sections, seedSectionConfigMap }) => {
  const occupancyRows = await Enrollment.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$section', total: { $sum: 1 } } }
  ]);

  const occupancyMap = new Map(occupancyRows.map((item) => [String(item._id), item.total]));

  for (const section of sections) {
    const configuredStatus = seedSectionConfigMap.get(section.code)?.status || section.status;
    const approvedCount = occupancyMap.get(String(section._id)) || 0;

    section.currentEnrollment = approvedCount;
    if (configuredStatus === 'open' || configuredStatus === 'full') {
      section.status = approvedCount >= section.capacity ? 'full' : 'open';
    } else {
      section.status = configuredStatus;
    }

    await section.save();
  }
};

const seedLiabilities = async ({ semesterMap, studentMap }) => {
  const liabilityMap = new Map();
  const pairKeys = [
    ...new Set(
      seedEnrollments
        .filter((item) => item.status === 'approved')
        .map((item) => `${item.studentCode}::${item.semesterCode}`)
    )
  ];

  for (const pairKey of pairKeys) {
    const [studentCode, semesterCode] = pairKey.split('::');
    const liability = await recalculateTuitionLiability({
      studentId: studentMap.get(studentCode)._id,
      semesterId: semesterMap.get(semesterCode)._id
    });
    liabilityMap.set(pairKey, liability);
  }

  return liabilityMap;
};

const seedPaymentTransactions = async ({ liabilityMap, semesterMap, studentMap, userAccountMap }) => {
  const financeAccount = userAccountMap.get('finance1');
  if (!financeAccount) {
    throw new Error('Khong tim thay tai khoan finance1 de ghi nhan thanh toan seed.');
  }

  for (const item of seedPayments) {
    const key = `${item.studentCode}::${item.semesterCode}`;
    let liability = liabilityMap.get(key);

    if (!liability) {
      liability = await recalculateTuitionLiability({
        studentId: studentMap.get(item.studentCode)._id,
        semesterId: semesterMap.get(item.semesterCode)._id
      });
      liabilityMap.set(key, liability);
    }

    const result = await registerPaymentForLiability({
      liabilityId: liability._id,
      studentId: studentMap.get(item.studentCode)._id,
      amount: item.amount,
      method: item.method,
      actorId: financeAccount.user._id,
      ipAddress: '127.0.0.1',
      status: item.status,
      gatewayMessage: item.gatewayMessage
    });

    liabilityMap.set(key, result.liability);
  }
};

const runSeed = async () => {
  await connectDatabase();
  await clearDatabase();

  const departments = await Department.insertMany(seedDepartments);
  const departmentMap = createMap(departments, 'code');

  const majors = await Major.insertMany(
    seedMajors.map((item) => ({
      code: item.code,
      name: item.name,
      department: departmentMap.get(item.departmentCode)._id
    }))
  );
  const majorMap = createMap(majors, 'code');

  const cohorts = await Cohort.insertMany(
    seedCohorts.map((item) => ({
      code: item.code,
      name: item.name,
      intakeYear: item.intakeYear,
      expectedGraduationYear: item.expectedGraduationYear
    }))
  );
  const cohortMap = createMap(cohorts, 'code');

  const classes = await AdministrativeClass.insertMany(
    seedAdministrativeClasses.map((item) => ({
      code: item.code,
      name: item.name,
      size: item.size,
      major: majorMap.get(item.majorCode)._id,
      cohort: cohortMap.get(item.cohortCode)._id
    }))
  );
  const classMap = createMap(classes, 'code');

  await Room.insertMany(seedRooms);

  const semesters = await Semester.insertMany(
    seedSemesters.map((item) => ({
      ...item,
      tuitionRules: buildTuitionRulesForSemester(item.code, item.academicYear)
    }))
  );
  const semesterMap = createMap(semesters, 'code');

  const lecturers = [];
  for (const item of seedLecturers) {
    const lecturer = await Lecturer.create({
      ...item,
      departmentId: departmentMap.get(item.departmentCode)?._id || null
    });
    await syncLecturerProfile(lecturer);
    lecturers.push(lecturer);
  }
  const lecturerMap = createMap(lecturers, 'lecturerCode');

  const students = [];
  for (const item of seedStudents) {
    const student = await Student.create({
      ...item,
      departmentId: departmentMap.get(item.departmentCode)?._id || null,
      majorId: majorMap.get(item.majorCode)?._id || null,
      cohortId: cohortMap.get(item.cohortCode)?._id || null,
      administrativeClassId: classMap.get(item.classCode)?._id || null
    });
    await syncStudentProfile(student);
    students.push(student);
  }
  const studentMap = createMap(students, 'studentCode');

  const courses = [];
  for (const item of seedCourses) {
    const course = await Course.create({
      ...item,
      departmentId: departmentMap.get(item.departmentCode)?._id || null
    });
    await syncCourseConditions(course);
    courses.push(course);
  }
  const courseMap = createMap(courses, 'code');

  const periods = await RegistrationPeriod.insertMany(
    seedRegistrationPeriods.map((item) => ({
      periodCode: item.periodCode,
      name: item.name,
      semester: semesterMap.get(item.semesterCode)._id,
      startAt: item.startAt,
      endAt: item.endAt,
      targetAudience: item.targetAudience,
      status: item.status
    }))
  );
  createMap(periods, 'periodCode');

  const sections = [];
  for (const item of seedSections) {
    const section = await Section.create({
      code: item.code,
      course: courseMap.get(item.courseCode)._id,
      semester: semesterMap.get(item.semesterCode)._id,
      lecturer: lecturerMap.get(item.lecturerCode)._id,
      capacity: item.capacity,
      minCapacity: item.minCapacity,
      currentEnrollment: item.currentEnrollment || 0,
      status: item.status,
      room: item.room,
      schedule: item.schedule,
      exam: item.exam
    });
    await syncSectionCalendars(section);
    sections.push(section);
  }
  const sectionMap = createMap(sections, 'code');
  const seedSectionConfigMap = createMap(seedSections, 'code');

  const userAccountMap = await createSeedAccounts({
    seedUserConfigs: seedUsers,
    lecturerMap,
    studentMap
  });

  const academicAccount = userAccountMap.get('daotao1');
  if (!academicAccount) {
    throw new Error('Khong tim thay tai khoan daotao1 de duyet seed dang ky.');
  }

  const preferredPeriodMap = createPreferredPeriodMap(seedRegistrationPeriods);

  await Enrollment.insertMany(
    seedEnrollments.map((item) => ({
      student: studentMap.get(item.studentCode)._id,
      section: sectionMap.get(item.sectionCode)._id,
      semester: semesterMap.get(item.semesterCode)._id,
      status: item.status,
      approvedBy: academicAccount.user._id,
      note: `Dang ky trong ${preferredPeriodMap.get(item.semesterCode)?.name || 'dot dang ky'}`
    }))
  );

  await syncSectionOccupancy({
    sections,
    seedSectionConfigMap
  });

  const liabilityMap = await seedLiabilities({
    semesterMap,
    studentMap
  });

  await seedPaymentTransactions({
    liabilityMap,
    semesterMap,
    studentMap,
    userAccountMap
  });

  await dropLegacyCollections();

  console.log('Seed completed successfully with 17 target collections.');
  console.log(
    JSON.stringify(
      {
        departments: departments.length,
        majors: majors.length,
        cohorts: cohorts.length,
        classes: classes.length,
        rooms: seedRooms.length,
        semesters: semesters.length,
        registrationPeriods: periods.length,
        lecturers: lecturers.length,
        students: students.length,
        courses: courses.length,
        sections: sections.length,
        enrollments: seedEnrollments.length,
        users: seedUsers.length,
        liabilities: liabilityMap.size,
        payments: seedPayments.length
      },
      null,
      2
    )
  );
  process.exit(0);
};

runSeed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
