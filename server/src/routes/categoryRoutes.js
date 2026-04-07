import express from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllCategories);
router.post('/', authorizeRoles('Admin'), createCategory);
router.put('/:id', authorizeRoles('Admin'), updateCategory);
router.delete('/:id', authorizeRoles('Admin'), deleteCategory);

export default router;
