import { Router } from 'express';
import {
  getAcademicWorkspace,
  getAdminWorkspace,
  getFinanceWorkspace,
  getLecturerWorkspace,
  getStudentWorkspace
} from '../controllers/workspaceController.js';
import { ROLES } from '../constants/roles.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/student', authorize(ROLES.STUDENT), getStudentWorkspace);
router.get('/academic', authorize(ROLES.ACADEMIC, ROLES.ADMIN), getAcademicWorkspace);
router.get('/finance', authorize(ROLES.FINANCE, ROLES.ADMIN), getFinanceWorkspace);
router.get('/lecturer', authorize(ROLES.LECTURER), getLecturerWorkspace);
router.get('/admin', authorize(ROLES.ADMIN), getAdminWorkspace);

export default router;
