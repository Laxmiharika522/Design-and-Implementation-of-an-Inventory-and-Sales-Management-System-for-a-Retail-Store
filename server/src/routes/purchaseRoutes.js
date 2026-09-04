import express from 'express';
import { 
  getAllPurchaseOrders, 
  createPurchaseOrder, 
  markOrderReceived, 
  updateOrderStatus, 
  updateOrderPayment, 
  deletePurchaseOrder 
} from '../controllers/purchaseController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('Admin'));

router.get('/', getAllPurchaseOrders);
router.post('/', createPurchaseOrder);
router.put('/:id/receive', markOrderReceived);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/payment', updateOrderPayment);
router.delete('/:id', deletePurchaseOrder);

export default router;
