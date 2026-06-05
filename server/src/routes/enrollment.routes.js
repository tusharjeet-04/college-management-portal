import { Router } from 'express';
import { body } from 'express-validator';
import {
  enrollStudent,
  unenroll,
  myEnrollments,
  gradeEnrollment,
} from '../controllers/enrollment.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(auth);

// Student: own enrollments + grades.
router.get('/me', authorize(ROLES.STUDENT), myEnrollments);

// Admin: enroll / remove students.
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate([
    body('studentId').isMongoId().withMessage('Valid studentId is required'),
    body('courseId').isMongoId().withMessage('Valid courseId is required'),
  ]),
  enrollStudent,
);
router.delete('/:id', authorize(ROLES.ADMIN), unenroll);

// Faculty/admin: record grade & marks.
router.patch(
  '/:id/grade',
  authorize(ROLES.ADMIN, ROLES.FACULTY),
  validate([
    body('grade').optional().isIn(['', 'A', 'B', 'C', 'D', 'E', 'F']),
    body('marks').optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  ]),
  gradeEnrollment,
);

export default router;
