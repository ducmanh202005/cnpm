import { Router } from 'express';
import {
  cancelMyEnrollment,
  createStudent,
  getMyProfile,
  listMyEnrollments,
  listStudents,
  previewRegistrationToSection,
  registerToSection,
  updateStudent
} from '../controllers/studentController.js';
import { ROLES } from '../constants/roles.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/me', authorize(ROLES.STUDENT), getMyProfile);
router.get('/my-enrollments', authorize(ROLES.STUDENT), listMyEnrollments);
router.post('/register/preview', authorize(ROLES.STUDENT), previewRegistrationToSection);
router.post('/register', authorize(ROLES.STUDENT), registerToSection);
router.patch(
  '/enrollments/:enrollmentId/cancel',
  authorize(ROLES.STUDENT),
  cancelMyEnrollment
);
router.get('/', authorize(ROLES.ACADEMIC, ROLES.ADMIN), listStudents);
router.post('/', authorize(ROLES.ACADEMIC, ROLES.ADMIN), createStudent);
router.patch('/:studentId', authorize(ROLES.ACADEMIC, ROLES.ADMIN), updateStudent);

export default router;
