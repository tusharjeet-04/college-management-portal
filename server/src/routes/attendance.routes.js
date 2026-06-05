import { Router } from 'express';
import { body } from 'express-validator';
import {
  markAttendance,
  myAttendance,
} from '../controllers/attendance.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(auth);

router.get('/me', authorize(ROLES.STUDENT), myAttendance);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.FACULTY),
  validate([
    body('courseId').isMongoId().withMessage('Valid courseId is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('records').isArray({ min: 1 }).withMessage('records must be a non-empty array'),
    body('records.*.student').isMongoId().withMessage('Valid student id is required'),
    body('records.*.status').isIn(['present', 'absent', 'late']),
  ]),
  markAttendance,
);

export default router;
