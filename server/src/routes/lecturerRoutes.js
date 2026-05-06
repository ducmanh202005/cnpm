import { Router } from 'express';
import {
  createLecturer,
  deleteLecturer,
  listLecturers,
  updateLecturer
} from '../controllers/lecturerController.js';
import { ROLES } from '../constants/roles.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', authorize(ROLES.ACADEMIC, ROLES.ADMIN), listLecturers);
router.post('/', authorize(ROLES.ACADEMIC, ROLES.ADMIN), createLecturer);
router.patch('/:lecturerId', authorize(ROLES.ACADEMIC, ROLES.ADMIN), updateLecturer);
router.delete('/:lecturerId', authorize(ROLES.ACADEMIC, ROLES.ADMIN), deleteLecturer);

export default router;
