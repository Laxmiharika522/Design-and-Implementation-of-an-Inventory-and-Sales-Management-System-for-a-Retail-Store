import express from 'express';
import { 
  getAllEmployees, createEmployee, updateEmployee, deleteEmployee,
  getEmployeeProfile, updateEmployeeProfile, getAddresses 
} from '../controllers/employeeController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Profile routes (Any authenticated employee)
router.get('/profile', getEmployeeProfile);
router.put('/profile', updateEmployeeProfile);
router.get('/addresses', getAddresses);


// Admin-only management routes
router.use(authorizeRoles('Admin'));

router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
