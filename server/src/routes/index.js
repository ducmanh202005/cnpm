import { Router } from 'express';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import catalogRoutes from './catalogRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import financeRoutes from './financeRoutes.js';
import lecturerRoutes from './lecturerRoutes.js';
import studentRoutes from './studentRoutes.js';
import workspaceRoutes from './workspaceRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/catalog', catalogRoutes);
router.use('/students', studentRoutes);
router.use('/lecturers', lecturerRoutes);
router.use('/finance', financeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/admin', adminRoutes);

export default router;
