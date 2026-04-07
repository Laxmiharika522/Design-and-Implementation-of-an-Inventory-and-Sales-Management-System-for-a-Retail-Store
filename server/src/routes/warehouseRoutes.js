import express from 'express';
import { 
  getAllWarehouses, createWarehouse, updateWarehouse, deleteWarehouse 
} from '../controllers/warehouseController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('Admin'));

router.get('/', getAllWarehouses);
router.post('/', createWarehouse);
router.put('/:id', updateWarehouse);
router.delete('/:id', deleteWarehouse);

export default router;
