import { Router } from 'express';
import { body } from 'express-validator';
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/course.controller.js';
import {
  listCourseEnrollments,
} from '../controllers/enrollment.controller.js';
import { courseAttendance } from '../controllers/attendance.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(auth);

router.get('/', listCourses);
router.get('/:id', getCourse);

router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate([
    body('code').trim().notEmpty().withMessage('Course code is required'),
    body('title').trim().notEmpty().withMessage('Course title is required'),
    body('credits').optional().isInt({ min: 0, max: 12 }),
  ]),
  createCourse,
);

router.patch('/:id', authorize(ROLES.ADMIN), updateCourse);
router.delete('/:id', authorize(ROLES.ADMIN), deleteCourse);

// Nested resources scoped to a course (admin or assigned faculty).
router.get(
  '/:courseId/enrollments',
  authorize(ROLES.ADMIN, ROLES.FACULTY),
  listCourseEnrollments,
);
router.get(
  '/:courseId/attendance',
  authorize(ROLES.ADMIN, ROLES.FACULTY),
  courseAttendance,
);

export default router;
