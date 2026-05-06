import Enrollment from '../models/Enrollment.js';
import Section from '../models/Section.js';
import Semester from '../models/Semester.js';
import Student from '../models/Student.js';
import TuitionLiability from '../models/TuitionLiability.js';
import Lecturer from '../models/Lecturer.js';
import Course from '../models/Course.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getOverview = asyncHandler(async (req, res) => {
  const [students, lecturers, courses, openSections, liabilities, semesters, enrollments] =
    await Promise.all([
      Student.countDocuments({ academicStatus: 'active' }),
      Lecturer.countDocuments({ workingStatus: 'active' }),
      Course.countDocuments(),
      Section.countDocuments({ status: { $in: ['open', 'full'] } }),
      TuitionLiability.find().populate('semester'),
      Semester.find().sort({ startDate: -1 }).limit(3),
      Enrollment.find({ status: 'approved' }).populate({
        path: 'section',
        populate: { path: 'course' }
      })
    ]);

  const totalRevenue = liabilities.reduce((sum, item) => sum + item.amountPaid, 0);
  const totalOutstanding = liabilities.reduce((sum, item) => sum + item.outstandingAmount, 0);
  const totalCredits = enrollments.reduce(
    (sum, item) => sum + (item.section?.course?.credits || 0),
    0
  );

  res.json({
    summary: [
      { id: 'students', label: 'Sinh vien dang hoc', value: students },
      { id: 'lecturers', label: 'Giang vien dang cong tac', value: lecturers },
      { id: 'courses', label: 'Mon hoc trong he thong', value: courses },
      { id: 'sections', label: 'Hoc phan dang mo', value: openSections },
      { id: 'credits', label: 'Tong tin chi da dang ky', value: totalCredits },
      { id: 'revenue', label: 'Tong hoc phi da thu', value: totalRevenue },
      { id: 'outstanding', label: 'Tong cong no con lai', value: totalOutstanding }
    ],
    deadlines: semesters.map((semester) => ({
      id: semester._id,
      title: `${semester.name} ${semester.academicYear}`,
      registrationDeadline: semester.registrationDeadline,
      paymentDeadline: semester.paymentDeadline,
      status: semester.status
    }))
  });
});
