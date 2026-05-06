import Course from '../models/Course.js';
import Lecturer from '../models/Lecturer.js';
import RegistrationPeriod from '../models/RegistrationPeriod.js';
import Section from '../models/Section.js';
import Semester from '../models/Semester.js';
import { recordAuditLog } from '../services/auditService.js';
import { createCourseIfMissing } from '../services/registrationService.js';
import { syncSectionCalendars } from '../services/syncCatalogService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listSemesters = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const items = await Semester.find(filter).sort({ startDate: -1 });
  res.json({ items });
});

export const createSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.create(req.body);

  await recordAuditLog({
    actor: req.user._id,
    action: 'semester.create',
    subjectType: 'Semester',
    subjectId: String(semester._id),
    ipAddress: req.ip,
    details: { code: semester.code }
  });

  res.status(201).json({ item: semester });
});

export const listCourses = asyncHandler(async (req, res) => {
  const keyword = req.query.q?.trim();
  const filter = keyword
    ? {
        $or: [
          { code: { $regex: keyword, $options: 'i' } },
          { name: { $regex: keyword, $options: 'i' } }
        ]
      }
    : {};

  const items = await Course.find(filter).sort({ code: 1 });
  res.json({ items });
});

export const createCourse = asyncHandler(async (req, res) => {
  const course = await createCourseIfMissing(req.body);

  await recordAuditLog({
    actor: req.user._id,
    action: 'course.create',
    subjectType: 'Course',
    subjectId: String(course._id),
    ipAddress: req.ip,
    details: { code: course.code }
  });

  res.status(201).json({ item: course });
});

export const listSections = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.q?.trim()) {
    const keyword = req.query.q.trim();
    const matchingCourses = await Course.find({
      $or: [
        { code: { $regex: keyword, $options: 'i' } },
        { name: { $regex: keyword, $options: 'i' } }
      ]
    }).select('_id');

    filter.$or = [
      { code: { $regex: keyword, $options: 'i' } },
      { course: { $in: matchingCourses.map((item) => item._id) } }
    ];
  }
  if (req.query.semesterId) {
    filter.semester = req.query.semesterId;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.lecturerId) {
    filter.lecturer = req.query.lecturerId;
  }

  const items = await Section.find(filter)
    .populate('course')
    .populate('semester')
    .populate('lecturer')
    .sort({ createdAt: -1 });

  res.json({ items });
});

export const createSection = asyncHandler(async (req, res) => {
  const { course, semester, lecturer } = req.body;

  const [courseExists, semesterExists, lecturerExists] = await Promise.all([
    Course.findById(course),
    Semester.findById(semester),
    lecturer ? Lecturer.findById(lecturer) : Promise.resolve(true)
  ]);

  if (!courseExists || !semesterExists || !lecturerExists) {
    res.status(400);
    throw new Error('Thong tin mon hoc, hoc ky hoac giang vien khong hop le.');
  }

  const section = await Section.create({
    ...req.body,
    status: req.body.status || 'open'
  });
  await syncSectionCalendars(section);

  await recordAuditLog({
    actor: req.user._id,
    action: 'section.create',
    subjectType: 'Section',
    subjectId: String(section._id),
    ipAddress: req.ip,
    details: { code: section.code }
  });

  res.status(201).json({
    item: await Section.findById(section._id).populate('course semester lecturer')
  });
});

export const updateSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.sectionId);
  if (!section) {
    res.status(404);
    throw new Error('Khong tim thay hoc phan.');
  }

  const nextCourseId = req.body.course || section.course;
  const nextSemesterId = req.body.semester || section.semester;
  const nextLecturerId =
    req.body.lecturer === '' ? null : req.body.lecturer !== undefined ? req.body.lecturer : section.lecturer;

  const [courseExists, semesterExists, lecturerExists] = await Promise.all([
    Course.findById(nextCourseId),
    Semester.findById(nextSemesterId),
    nextLecturerId ? Lecturer.findById(nextLecturerId) : Promise.resolve(true)
  ]);

  if (!courseExists || !semesterExists || !lecturerExists) {
    res.status(400);
    throw new Error('Thong tin mon hoc, hoc ky hoac giang vien khong hop le.');
  }

  if (req.body.code !== undefined) {
    section.code = req.body.code;
  }
  if (req.body.course !== undefined) {
    section.course = req.body.course;
  }
  if (req.body.semester !== undefined) {
    section.semester = req.body.semester;
  }
  if (req.body.lecturer !== undefined) {
    section.lecturer = nextLecturerId || null;
  }
  if (req.body.capacity !== undefined) {
    section.capacity = req.body.capacity;
  }
  if (req.body.minCapacity !== undefined) {
    section.minCapacity = req.body.minCapacity;
  }
  if (req.body.status !== undefined) {
    section.status = req.body.status;
  }
  if (req.body.room !== undefined) {
    section.room = req.body.room;
  }
  if (req.body.schedule !== undefined) {
    section.schedule = req.body.schedule;
  }
  if ('exam' in req.body) {
    section.exam = req.body.exam || undefined;
  }
  if ('cancelReason' in req.body) {
    section.cancelReason = req.body.cancelReason || undefined;
  }

  await section.save();
  await syncSectionCalendars(section);

  await recordAuditLog({
    actor: req.user._id,
    action: 'section.updated',
    subjectType: 'Section',
    subjectId: String(section._id),
    ipAddress: req.ip,
    details: {
      code: section.code,
      status: section.status,
      lecturerAssigned: nextLecturerId ? String(nextLecturerId) : null
    }
  });

  res.json({
    item: await Section.findById(section._id).populate('course semester lecturer')
  });
});

export const listRegistrationPeriods = asyncHandler(async (req, res) => {
  const items = await RegistrationPeriod.find()
    .populate('semester')
    .sort({ startAt: -1 });
  res.json({ items });
});

export const createRegistrationPeriod = asyncHandler(async (req, res) => {
  const semesterExists = await Semester.findById(req.body.semester);
  if (!semesterExists) {
    res.status(400);
    throw new Error('Hoc ky khong ton tai.');
  }

  const period = await RegistrationPeriod.create(req.body);

  await recordAuditLog({
    actor: req.user._id,
    action: 'registration_period.create',
    subjectType: 'RegistrationPeriod',
    subjectId: String(period._id),
    ipAddress: req.ip,
    details: { name: period.name }
  });

  res.status(201).json({
    item: await RegistrationPeriod.findById(period._id).populate('semester')
  });
});

export const updateRegistrationPeriod = asyncHandler(async (req, res) => {
  const period = await RegistrationPeriod.findById(req.params.periodId);
  if (!period) {
    res.status(404);
    throw new Error('Khong tim thay dot dang ky.');
  }

  const nextSemesterId = req.body.semester || period.semester;
  const semesterExists = await Semester.findById(nextSemesterId);
  if (!semesterExists) {
    res.status(400);
    throw new Error('Hoc ky khong ton tai.');
  }

  if (req.body.name !== undefined) {
    period.name = req.body.name;
  }
  if (req.body.semester !== undefined) {
    period.semester = req.body.semester;
  }
  if (req.body.startAt !== undefined) {
    period.startAt = req.body.startAt;
  }
  if (req.body.endAt !== undefined) {
    period.endAt = req.body.endAt;
  }
  if (req.body.targetAudience !== undefined) {
    period.targetAudience = req.body.targetAudience;
  }
  if (req.body.status !== undefined) {
    period.status = req.body.status;
  }

  await period.save();

  await recordAuditLog({
    actor: req.user._id,
    action: 'registration_period.updated',
    subjectType: 'RegistrationPeriod',
    subjectId: String(period._id),
    ipAddress: req.ip,
    details: { name: period.name }
  });

  res.json({
    item: await RegistrationPeriod.findById(period._id).populate('semester')
  });
});
