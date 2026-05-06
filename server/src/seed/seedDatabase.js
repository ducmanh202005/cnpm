import mongoose from 'mongoose';
import AdministrativeClass from '../models/AdministrativeClass.js';
import AuditLog from '../models/AuditLog.js';
import Cohort from '../models/Cohort.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Enrollment from '../models/Enrollment.js';
import ExamSchedule from '../models/ExamSchedule.js';
import Lecturer from '../models/Lecturer.js';
import Major from '../models/Major.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import Permission from '../models/Permission.js';
import Person from '../models/Person.js';
import Policy from '../models/Policy.js';
import Program from '../models/Program.js';
import Receipt from '../models/Receipt.js';
import RegistrationPeriod from '../models/RegistrationPeriod.js';
import Role from '../models/Role.js';
import RolePermission from '../models/RolePermission.js';
import Room from '../models/Room.js';
import Schedule from '../models/Schedule.js';
import Section from '../models/Section.js';
import Semester from '../models/Semester.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';
import TimeSlot from '../models/TimeSlot.js';
import TuitionLiability from '../models/TuitionLiability.js';
import TuitionRate from '../models/TuitionRate.js';
import User from '../models/User.js';
import AccountRole from '../models/AccountRole.js';
import CourseCondition from '../models/CourseCondition.js';
import { connectDatabase } from '../config/db.js';
import {
  seedAdministrativeClasses,
  seedCohorts,
  seedCourses,
  seedDepartments,
  seedEnrollments,
  seedLecturers,
  seedMajors,
  seedPolicies,
  seedPrograms,
  seedRegistrationPeriods,
  seedRooms,
  seedSections,
  seedSemesters,
  seedStudents,
  seedTimeSlots,
  seedTuitionRates,
  seedUsers
} from '../data/seedData.js';
import { createUserAccount } from '../services/accountService.js';
import { ensureRbacCatalog } from '../services/rbacService.js';
import { syncLecturerProfile, syncStudentProfile } from '../services/profileSyncService.js';
import { syncCourseConditions, syncSectionCalendars } from '../services/syncCatalogService.js';
import { recalculateTuitionLiability, registerPaymentForLiability } from '../services/tuitionService.js';

const clearDatabase = async () => {
  await Promise.all([
    AuditLog.deleteMany({}),
    Receipt.deleteMany({}),
    PaymentTransaction.deleteMany({}),
    TuitionLiability.deleteMany({}),
    Enrollment.deleteMany({}),
    ExamSchedule.deleteMany({}),
    Schedule.deleteMany({}),
    Section.deleteMany({}),
    RegistrationPeriod.deleteMany({}),
    TuitionRate.deleteMany({}),
    CourseCondition.deleteMany({}),
    Course.deleteMany({}),
    Semester.deleteMany({}),
    AdministrativeClass.deleteMany({}),
    Program.deleteMany({}),
    Cohort.deleteMany({}),
    Major.deleteMany({}),
    Department.deleteMany({}),
    Policy.deleteMany({}),
    Lecturer.deleteMany({}),
    Student.deleteMany({}),
    Staff.deleteMany({}),
    Person.deleteMany({}),
    AccountRole.deleteMany({}),
    RolePermission.deleteMany({}),
    Role.deleteMany({}),
    Permission.deleteMany({}),
    User.deleteMany({}),
    Room.deleteMany({}),
    TimeSlot.deleteMany({})
  ]);

  await dropLegacyCollections();
};

const legacyCollections = [
  'auditlogs',
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

const dropLegacyCollections = async () => {
  const existingCollections = await mongoose.connection.db.listCollections().toArray();
  for (const collectionName of legacyCollections) {
    if (existingCollections.some((item) => item.name === collectionName)) {
      await mongoose.connection.db.dropCollection(collectionName).catch(() => null);
    }
  }
};

const createMap = (items, key) => new Map(items.map((item) => [item[key], item]));

const runSeed = async () => {
  await connectDatabase();
  await clearDatabase();
  await ensureRbacCatalog();

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

  const programs = await Program.insertMany(
    seedPrograms.map((item) => ({
      code: item.code,
      major: majorMap.get(item.majorCode)._id,
      cohort: cohortMap.get(item.cohortCode)._id,
      name: item.name,
      totalCredits: item.totalCredits,
      programType: item.programType,
      description: item.description
    }))
  );
  const programMap = createMap(programs, 'code');

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

  const policies = await Policy.insertMany(
    seedPolicies.map((item) => ({
      code: item.code,
      name: item.name,
      discountRate: item.discountRate,
      description: item.description
    }))
  );
  const policyMap = createMap(policies, 'code');

  await Room.insertMany(seedRooms);
  await TimeSlot.insertMany(seedTimeSlots);

  const semesters = await Semester.insertMany(seedSemesters);
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
      administrativeClassId: classMap.get(item.classCode)?._id || null,
      programId: programMap.get(item.programCode)?._id || null,
      policyId: policyMap.get(item.policy.code)?._id || null
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
    courses.push(course);
  }
  for (const course of courses) {
    await syncCourseConditions(course);
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
  const periodMap = createMap(periods, 'periodCode');

  const sections = [];
  for (const item of seedSections) {
    const section = await Section.create({
      code: item.code,
      course: courseMap.get(item.courseCode)._id,
      semester: semesterMap.get(item.semesterCode)._id,
      lecturer: lecturerMap.get(item.lecturerCode)._id,
      capacity: item.capacity,
      minCapacity: item.minCapacity,
      currentEnrollment: item.currentEnrollment,
      status: item.status,
      room: item.room,
      schedule: item.schedule,
      exam: item.exam
    });
    await syncSectionCalendars(section);
    sections.push(section);
  }
  const sectionMap = createMap(sections, 'code');

  const rates = await TuitionRate.insertMany(
    seedTuitionRates.map((item) => ({
      rateCode: item.rateCode,
      name: item.name,
      academicYear: item.academicYear,
      semester: semesterMap.get(item.semesterCode)._id,
      programType: item.programType,
      pricePerCredit: item.pricePerCredit,
      effectiveFrom: item.effectiveFrom,
      notes: item.notes
    }))
  );
  const rateMap = createMap(rates, 'rateCode');

  const adminAccount = await createUserAccount({
    ...seedUsers.find((item) => item.username === 'admin1'),
    linkedModel: 'Staff'
  });

  const academicAccount = await createUserAccount({
    ...seedUsers.find((item) => item.username === 'daotao1'),
    linkedModel: 'Staff'
  });

  const financeAccount = await createUserAccount({
    ...seedUsers.find((item) => item.username === 'finance1'),
    linkedModel: 'Staff'
  });

  await createUserAccount({
    ...seedUsers.find((item) => item.username === 'gv001'),
    linkedModel: 'Lecturer',
    linkedId: lecturerMap.get('GV001')._id
  });

  await createUserAccount({
    ...seedUsers.find((item) => item.username === 'sv001'),
    linkedModel: 'Student',
    linkedId: studentMap.get('B23DCKH080')._id
  });

  await Enrollment.insertMany(
    seedEnrollments.map((item) => ({
      student: studentMap.get(item.studentCode)._id,
      section: sectionMap.get(item.sectionCode)._id,
      semester: semesterMap.get(item.semesterCode)._id,
      status: item.status,
      approvedBy: academicAccount.user._id
    }))
  );

  const liability = await recalculateTuitionLiability({
    studentId: studentMap.get('B23DCKH080')._id,
    semesterId: semesterMap.get('2025-2026-HK2')._id
  });

  liability.rate = rateMap.get('BP-2025-HK2')._id;
  await liability.save();

  await registerPaymentForLiability({
    liabilityId: liability._id,
    studentId: studentMap.get('B23DCKH080')._id,
    amount: 1000000,
    method: 'bank_transfer',
    actorId: financeAccount.user._id,
    ipAddress: '127.0.0.1',
    status: 'success',
    gatewayMessage: 'Seed payment'
  });

  await AuditLog.insertMany([
    {
      actor: adminAccount.user._id,
      action: 'seed.bootstrap',
      subjectType: 'System',
      subjectId: 'bootstrap',
      ipAddress: '127.0.0.1',
      result: 'success',
      details: {
        note: 'Khoi tao bo du lieu ERD'
      }
    },
    {
      actor: academicAccount.user._id,
      action: 'section.review',
      subjectType: 'Section',
      subjectId: String(sectionMap.get('DB202-01')._id),
      ipAddress: '127.0.0.1',
      result: 'success',
      details: {
        note: 'Kiem tra hoc phan cho dot dang ky'
      }
    },
    {
      actor: financeAccount.user._id,
      action: 'finance.reconcile',
      subjectType: 'TuitionLiability',
      subjectId: String(liability._id),
      ipAddress: '127.0.0.1',
      result: 'success',
      details: {
        note: 'Doi soat cong no va giao dich mau'
      }
    }
  ]);

  await dropLegacyCollections();

  console.log('Seed completed successfully with ERD-aligned collections.');
  process.exit(0);
};

runSeed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
