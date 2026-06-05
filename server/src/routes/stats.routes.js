import { Router } from 'express';
import { adminStats } from '../controllers/stats.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/admin', auth, authorize(ROLES.ADMIN), adminStats);

export default router;
