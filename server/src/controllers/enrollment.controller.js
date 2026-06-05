import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

/* Ensures a faculty user owns the given course (admins always pass). */
async function assertCourseAccess(user, courseId) {
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  if (
    user.role === ROLES.FACULTY &&
    String(course.faculty) !== String(user._id)
  ) {
    throw ApiError.forbidden('You are not assigned to this course');
  }
  return course;
}

export async function enrollStudent(req, res) {
  const { studentId, courseId } = req.body;
  const student = await User.findById(studentId);
  if (!student || student.role !== ROLES.STUDENT) {
    throw ApiError.badRequest('Provided user is not a student');
  }
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  const existing = await Enrollment.findOne({ student: studentId, course: courseId });
  if (existing) throw ApiError.conflict('Student is already enrolled in this course');

  const enrollment = await Enrollment.create({ student: studentId, course: courseId });
  res.status(201).json({ success: true, enrollment });
}

export async function unenroll(req, res) {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  await enrollment.deleteOne();
  res.json({ success: true, message: 'Enrollment removed' });
}

/* List enrollments for a course (admin or assigned faculty). */
export async function listCourseEnrollments(req, res) {
  await assertCourseAccess(req.user, req.params.courseId);
  const enrollments = await Enrollment.find({ course: req.params.courseId })
    .populate('student', 'name email rollNumber department')
    .sort({ createdAt: 1 });
  res.json({ success: true, count: enrollments.length, enrollments });
}

/* List the authenticated student's own enrollments. */
export async function myEnrollments(req, res) {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      populate: { path: 'faculty', select: 'name email' },
    })
    .sort({ createdAt: -1 });
  res.json({ success: true, count: enrollments.length, enrollments });
}

/* Faculty/admin records grade and/or marks for an enrollment. */
export async function gradeEnrollment(req, res) {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  await assertCourseAccess(req.user, enrollment.course);

  if (req.body.grade !== undefined) enrollment.grade = req.body.grade;
  if (req.body.marks !== undefined) enrollment.marks = req.body.marks;
  await enrollment.save();

  res.json({ success: true, enrollment });
}
