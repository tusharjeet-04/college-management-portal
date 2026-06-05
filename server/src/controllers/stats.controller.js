import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { ROLES } from '../constants/roles.js';

/* Aggregate counts for the admin dashboard. */
export async function adminStats(_req, res) {
  const [students, faculty, courses, enrollments] = await Promise.all([
    User.countDocuments({ role: ROLES.STUDENT }),
    User.countDocuments({ role: ROLES.FACULTY }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
  ]);
  res.json({
    success: true,
    stats: { students, faculty, courses, enrollments },
  });
}
