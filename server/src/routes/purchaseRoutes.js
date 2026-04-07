import express from 'express';
import { getAllPurchaseOrders, createPurchaseOrder, markOrderReceived } from '../controllers/purchaseController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('Admin'));

router.get('/', getAllPurchaseOrders);
router.post('/', createPurchaseOrder);
router.put('/:id/receive', markOrderReceived);

export default router;
