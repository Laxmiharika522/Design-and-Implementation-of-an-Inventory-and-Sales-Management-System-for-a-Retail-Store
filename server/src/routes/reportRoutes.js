import express from 'express';
import { getDashboardStats, getDetailedSales, getAlerts, getEmployeeStats } from '../controllers/reportController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.get('/dashboard', authorizeRoles('Admin'), getDashboardStats);
router.get('/employee-stats', authorizeRoles('Admin', 'Cashier', 'Employee'), getEmployeeStats);
router.get('/detailed-sales', authorizeRoles('Admin', 'Cashier'), getDetailedSales);
router.get('/alerts', authorizeRoles('Admin', 'Cashier'), getAlerts);

export default router;
