import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

async function assertCourseAccess(user, courseId) {
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  if (user.role === ROLES.FACULTY && String(course.faculty) !== String(user._id)) {
    throw ApiError.forbidden('You are not assigned to this course');
  }
  return course;
}

/* Faculty/admin marks attendance for several students on a date (upsert). */
export async function markAttendance(req, res) {
  const { courseId, date, records } = req.body;
  await assertCourseAccess(req.user, courseId);

  const day = new Date(date);
  const ops = records.map((r) => ({
    updateOne: {
      filter: { course: courseId, student: r.student, date: day },
      update: {
        $set: { status: r.status, markedBy: req.user._id },
      },
      upsert: true,
    },
  }));
  await Attendance.bulkWrite(ops);

  const saved = await Attendance.find({ course: courseId, date: day }).populate(
    'student',
    'name rollNumber',
  );
  res.status(201).json({ success: true, count: saved.length, attendance: saved });
}

export async function courseAttendance(req, res) {
  await assertCourseAccess(req.user, req.params.courseId);
  const attendance = await Attendance.find({ course: req.params.courseId })
    .populate('student', 'name rollNumber')
    .sort({ date: -1 });
  res.json({ success: true, count: attendance.length, attendance });
}

/* A student's own attendance, optionally filtered by course. */
export async function myAttendance(req, res) {
  const filter = { student: req.user._id };
  if (req.query.course) filter.course = req.query.course;
  const attendance = await Attendance.find(filter)
    .populate('course', 'code title')
    .sort({ date: -1 });

  const summary = attendance.reduce(
    (acc, a) => {
      acc.total += 1;
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    { total: 0, present: 0, absent: 0, late: 0 },
  );

  res.json({ success: true, summary, attendance });
}
