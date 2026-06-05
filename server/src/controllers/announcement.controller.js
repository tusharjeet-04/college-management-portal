import Announcement from '../models/Announcement.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export async function createAnnouncement(req, res) {
  const { title, body, course, audience } = req.body;

  if (course) {
    const courseDoc = await Course.findById(course);
    if (!courseDoc) throw ApiError.notFound('Course not found');
    if (
      req.user.role === ROLES.FACULTY &&
      String(courseDoc.faculty) !== String(req.user._id)
    ) {
      throw ApiError.forbidden('You are not assigned to this course');
    }
  }

  const announcement = await Announcement.create({
    title,
    body,
    course: course || null,
    audience: course ? 'course' : audience || 'all',
    author: req.user._id,
  });
  res.status(201).json({ success: true, announcement });
}

/* Returns announcements relevant to the authenticated user's role and courses. */
export async function listAnnouncements(req, res) {
  const { user } = req;
  let filter;

  if (user.role === ROLES.ADMIN) {
    filter = {};
  } else if (user.role === ROLES.FACULTY) {
    const courses = await Course.find({ faculty: user._id }).select('_id');
    filter = {
      $or: [
        { audience: { $in: ['all', 'faculty'] } },
        { course: { $in: courses.map((c) => c._id) } },
        { author: user._id },
      ],
    };
  } else {
    const enrollments = await Enrollment.find({ student: user._id }).select('course');
    filter = {
      $or: [
        { audience: { $in: ['all', 'students'] } },
        { course: { $in: enrollments.map((e) => e.course) } },
      ],
    };
  }

  const announcements = await Announcement.find(filter)
    .populate('author', 'name role')
    .populate('course', 'code title')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: announcements.length, announcements });
}

export async function deleteAnnouncement(req, res) {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw ApiError.notFound('Announcement not found');
  if (
    req.user.role !== ROLES.ADMIN &&
    String(announcement.author) !== String(req.user._id)
  ) {
    throw ApiError.forbidden('You can only delete your own announcements');
  }
  await announcement.deleteOne();
  res.json({ success: true, message: 'Announcement deleted' });
}
