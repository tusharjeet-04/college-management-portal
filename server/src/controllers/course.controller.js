import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export async function listCourses(req, res) {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.faculty) filter.faculty = req.query.faculty;
  // Faculty viewing their own courses
  if (req.query.mine === 'true' && req.user.role === ROLES.FACULTY) {
    filter.faculty = req.user._id;
  }
  const courses = await Course.find(filter)
    .populate('faculty', 'name email department')
    .sort({ code: 1 });
  res.json({ success: true, count: courses.length, courses });
}

export async function getCourse(req, res) {
  const course = await Course.findById(req.params.id).populate(
    'faculty',
    'name email department',
  );
  if (!course) throw ApiError.notFound('Course not found');
  res.json({ success: true, course });
}

export async function createCourse(req, res) {
  const { code, title, description, department, credits, semester, faculty } = req.body;
  if (faculty) {
    const facultyUser = await User.findById(faculty);
    if (!facultyUser || facultyUser.role !== ROLES.FACULTY) {
      throw ApiError.badRequest('Assigned faculty must be a valid faculty user');
    }
  }
  const course = await Course.create({
    code,
    title,
    description,
    department,
    credits,
    semester,
    faculty: faculty || null,
  });
  res.status(201).json({ success: true, course });
}

export async function updateCourse(req, res) {
  const allowed = [
    'title',
    'description',
    'department',
    'credits',
    'semester',
    'faculty',
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (updates.faculty) {
    const facultyUser = await User.findById(updates.faculty);
    if (!facultyUser || facultyUser.role !== ROLES.FACULTY) {
      throw ApiError.badRequest('Assigned faculty must be a valid faculty user');
    }
  }
  const course = await Course.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('faculty', 'name email department');
  if (!course) throw ApiError.notFound('Course not found');
  res.json({ success: true, course });
}

export async function deleteCourse(req, res) {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  await Enrollment.deleteMany({ course: course._id });
  await course.deleteOne();
  res.json({ success: true, message: 'Course deleted' });
}
