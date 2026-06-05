import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me, logout } from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import { ROLE_VALUES } from '../constants/roles.js';

const router = Router();

router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(ROLE_VALUES).withMessage('Invalid role'),
  ]),
  register,
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login,
);

router.get('/me', auth, me);
router.post('/logout', auth, logout);

export default router;
