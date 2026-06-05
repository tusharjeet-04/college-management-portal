import { Router } from 'express';
import { body } from 'express-validator';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { ROLES, ROLE_VALUES } from '../constants/roles.js';

const router = Router();

router.use(auth, authorize(ROLES.ADMIN));

router.get('/', listUsers);
router.get('/:id', getUser);

router.post(
  '/',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').isIn(ROLE_VALUES).withMessage('Invalid role'),
  ]),
  createUser,
);

router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
