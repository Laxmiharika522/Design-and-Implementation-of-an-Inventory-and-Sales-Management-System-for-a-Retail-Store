import express from 'express';
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
// Cashier can create customers for billing
router.get('/', getAllCustomers);
router.post('/', createCustomer);
router.put('/:id', authorizeRoles('Admin'), updateCustomer);
router.delete('/:id', authorizeRoles('Admin'), deleteCustomer);

export default router;
