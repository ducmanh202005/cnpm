import Course from '../models/Course.js';
import Room from '../models/Room.js';
import Schedule from '../models/Schedule.js';

const normalizeRoomCode = (value = '') => value.replace(/\s+/g, '').toUpperCase();

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

export const syncSectionCalendars = async (section) => {
  await Schedule.deleteMany({ section: section._id });

  for (const slot of section.schedule || []) {
    const room = await ensureRoom(slot.room || section.room);
    await Schedule.create({
      section: section._id,
      room: room?._id,
      dayOfWeek: slot.dayOfWeek,
      startPeriod: slot.startPeriod,
      periodCount: slot.periodCount,
      sessionLabel: slot.sessionLabel,
      roomName: slot.room || section.room,
      weeks: slot.weeks
    });
  }
};

export const syncCourseConditions = async (course) => {
  if (!course.rules) {
    course.rules = {};
  }

  const normalizeList = (items = []) =>
    [...new Set(items.map((item) => String(item).trim().toUpperCase()).filter(Boolean))];

  course.rules.prerequisites = [];
  course.rules.previousCourses = [];
  course.rules.corequisites = [];
  course.eligibleMajorCodes = normalizeList(course.eligibleMajorCodes);
  await course.save();
  return Course.findById(course._id);
};
