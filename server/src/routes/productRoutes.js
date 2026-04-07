import express from 'express';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getHSNCodes } from '../controllers/productController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllProducts);
router.get('/hsn-codes', getHSNCodes);
router.post('/', authorizeRoles('Admin'), createProduct);
router.put('/:id', authorizeRoles('Admin'), updateProduct);
router.delete('/:id', authorizeRoles('Admin'), deleteProduct);

export default router;
