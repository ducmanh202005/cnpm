import { Router } from 'express';
import {
  createSemester,
  createCourse,
  createRegistrationPeriod,
  createSection,
  listCourses,
  listRegistrationPeriods,
  listSections,
  listSemesters,
  updateRegistrationPeriod,
  updateSection
} from '../controllers/catalogController.js';
import { ROLES } from '../constants/roles.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/semesters', listSemesters);
router.post('/semesters', authorize(ROLES.ACADEMIC, ROLES.ADMIN), createSemester);
router.get('/courses', listCourses);
router.post('/courses', authorize(ROLES.ACADEMIC, ROLES.ADMIN), createCourse);
router.get('/sections', listSections);
router.post('/sections', authorize(ROLES.ACADEMIC, ROLES.ADMIN), createSection);
router.patch('/sections/:sectionId', authorize(ROLES.ACADEMIC, ROLES.ADMIN), updateSection);
router.get('/registration-periods', listRegistrationPeriods);
router.post(
  '/registration-periods',
  authorize(ROLES.ACADEMIC, ROLES.ADMIN),
  createRegistrationPeriod
);
router.patch(
  '/registration-periods/:periodId',
  authorize(ROLES.ACADEMIC, ROLES.ADMIN),
  updateRegistrationPeriod
);

export default router;
