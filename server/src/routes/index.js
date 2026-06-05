import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import courseRoutes from './course.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import announcementRoutes from './announcement.routes.js';
import attendanceRoutes from './attendance.routes.js';
import statsRoutes from './stats.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/announcements', announcementRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/stats', statsRoutes);

export default router;
