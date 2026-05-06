import Course from '../models/Course.js';
import CourseCondition from '../models/CourseCondition.js';
import ExamSchedule from '../models/ExamSchedule.js';
import Room from '../models/Room.js';
import Schedule from '../models/Schedule.js';
import TimeSlot from '../models/TimeSlot.js';

const normalizeRoomCode = (value = '') => value.replace(/\s+/g, '').toUpperCase();

const slotDefaults = {
  SANG: { startTime: '07:00', endTime: '11:20', name: 'Sang' },
  CHIEU: { startTime: '13:00', endTime: '17:20', name: 'Chieu' },
  TOI: { startTime: '18:00', endTime: '21:00', name: 'Toi' },
  CA1: { startTime: '07:00', endTime: '08:30', name: 'Ca 1' },
  CA2: { startTime: '09:00', endTime: '10:30', name: 'Ca 2' },
  CA3: { startTime: '13:30', endTime: '15:00', name: 'Ca 3' },
  CA4: { startTime: '15:30', endTime: '17:00', name: 'Ca 4' }
};

const ensureRoom = async (roomName) => {
  if (!roomName) {
    return null;
  }

  const code = normalizeRoomCode(roomName);
  return Room.findOneAndUpdate(
    { code },
    { code, name: roomName, roomType: 'classroom' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const ensureSlot = async (label) => {
  if (!label) {
    return null;
  }

  const code = normalizeRoomCode(label);
  const defaults = slotDefaults[code] || { name: label };
  return TimeSlot.findOneAndUpdate(
    { code },
    { code, ...defaults },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const syncSectionCalendars = async (section) => {
  await Schedule.deleteMany({ section: section._id });
  await ExamSchedule.deleteMany({ section: section._id });

  for (const slot of section.schedule || []) {
    const [room, timeSlot] = await Promise.all([ensureRoom(slot.room || section.room), ensureSlot(slot.sessionLabel)]);
    await Schedule.create({
      section: section._id,
      room: room?._id,
      slot: timeSlot?._id,
      dayOfWeek: slot.dayOfWeek,
      startPeriod: slot.startPeriod,
      periodCount: slot.periodCount,
      sessionLabel: slot.sessionLabel,
      roomName: slot.room || section.room,
      weeks: slot.weeks
    });
  }

  if (section.exam?.examDate) {
    const [room, timeSlot] = await Promise.all([
      ensureRoom(section.exam.room),
      ensureSlot(section.exam.sessionLabel)
    ]);

    await ExamSchedule.create({
      section: section._id,
      room: room?._id,
      slot: timeSlot?._id,
      examDate: section.exam.examDate,
      durationMinutes: section.exam.durationMinutes,
      format: section.exam.format,
      notes: section.exam.notes,
      roomName: section.exam.room,
      sessionLabel: section.exam.sessionLabel
    });
  }
};

const ruleTypeMap = {
  prerequisites: 'prerequisite',
  previousCourses: 'previous_course',
  corequisites: 'corequisite'
};

export const syncCourseConditions = async (course) => {
  await CourseCondition.deleteMany({ course: course._id });

  for (const [ruleKey, type] of Object.entries(ruleTypeMap)) {
    const codes = course.rules?.[ruleKey] || [];
    if (codes.length === 0) {
      continue;
    }

    const relatedCourses = await Course.find({ code: { $in: codes } }).select('_id code');
    for (const relatedCourse of relatedCourses) {
      await CourseCondition.findOneAndUpdate(
        { course: course._id, relatedCourse: relatedCourse._id, type },
        {
          course: course._id,
          relatedCourse: relatedCourse._id,
          type,
          description: `${course.code} -> ${relatedCourse.code}`
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }
};
