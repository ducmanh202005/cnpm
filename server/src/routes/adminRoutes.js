import { Router } from 'express';
import {
  createUser,
  listAuditLogs,
  listUsers,
  resetPassword,
  toggleUserLock,
  updateUserRoles
} from '../controllers/adminController.js';
import { ROLES } from '../constants/roles.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/users', listUsers);
router.post('/users', createUser);
router.patch('/users/:userId/toggle-lock', toggleUserLock);
router.patch('/users/:userId/roles', updateUserRoles);
router.post('/users/:userId/reset-password', resetPassword);
router.get('/audit-logs', listAuditLogs);

export default router;
