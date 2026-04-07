import express from 'express';
import { getAllSales, createSale } from '../controllers/salesController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', authorizeRoles('Admin'), getAllSales);
router.post('/', createSale); // Any role can create sale

export default router;
