import express from 'express';
import { getTaxRates } from '../controllers/taxRatesController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
// Any authenticated employee can read tax rates (needed by POS cashier)
router.get('/', getTaxRates);

export default router;
