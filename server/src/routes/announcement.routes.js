import { Router } from 'express';
import { body } from 'express-validator';
import {
  createAnnouncement,
  listAnnouncements,
  deleteAnnouncement,
} from '../controllers/announcement.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(auth);

router.get('/', listAnnouncements);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.FACULTY),
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('body').trim().notEmpty().withMessage('Body is required'),
    body('audience').optional().isIn(['all', 'students', 'faculty', 'course']),
  ]),
  createAnnouncement,
);

router.delete('/:id', authorize(ROLES.ADMIN, ROLES.FACULTY), deleteAnnouncement);

export default router;
