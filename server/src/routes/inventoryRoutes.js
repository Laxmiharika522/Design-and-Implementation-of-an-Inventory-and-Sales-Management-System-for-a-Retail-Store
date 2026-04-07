import express from 'express';
import { getAllInventory, adjustStock, updateReorderLevel } from '../controllers/inventoryController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllInventory);
router.post('/adjust', authorizeRoles('Admin'), adjustStock);
router.put('/reorder-level', authorizeRoles('Admin'), updateReorderLevel);

export default router;
