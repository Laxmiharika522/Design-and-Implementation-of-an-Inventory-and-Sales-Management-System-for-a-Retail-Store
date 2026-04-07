import express from 'express';
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../controllers/supplierController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('Admin'));

router.get('/', getAllSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', authorizeRoles('Admin'), deleteSupplier);

export default router;
