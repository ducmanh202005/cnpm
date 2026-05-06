import { Router } from 'express';
import {
  createRate,
  createStudentPayment,
  getMyTuition,
  listLiabilities,
  listPayments,
  listReceipts,
  listRates,
  recomputeLiability,
  recordManualPayment
} from '../controllers/financeController.js';
import { ROLES } from '../constants/roles.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/tuition/me', authorize(ROLES.STUDENT), getMyTuition);
router.get('/tuition-rates', listRates);
router.post('/tuition-rates', authorize(ROLES.FINANCE, ROLES.ADMIN), createRate);
router.get('/tuition-liabilities', authorize(ROLES.FINANCE, ROLES.ADMIN), listLiabilities);
router.post(
  '/tuition-liabilities/recalculate',
  authorize(ROLES.FINANCE, ROLES.ADMIN),
  recomputeLiability
);
router.get('/payments', authorize(ROLES.FINANCE, ROLES.ADMIN), listPayments);
router.get('/receipts', authorize(ROLES.FINANCE, ROLES.ADMIN), listReceipts);
router.post('/payments', authorize(ROLES.STUDENT), createStudentPayment);
router.post('/payments/manual', authorize(ROLES.FINANCE, ROLES.ADMIN), recordManualPayment);

export default router;
