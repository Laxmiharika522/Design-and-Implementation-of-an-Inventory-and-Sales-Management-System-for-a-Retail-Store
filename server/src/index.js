import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyToken, authorizeUserType } from './middleware/authMiddleware.js';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import warehouseRoutes from './routes/warehouseRoutes.js';
import taxRatesRoutes from './routes/taxRatesRoutes.js';
import supplierPortalRoutes from './routes/supplierPortalRoutes.js';
import customerPortalRoutes from './routes/customerPortalRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
// Backend/Employee core routes (strictly locked to Employee portal)
app.use('/api/categories', verifyToken, authorizeUserType('employee'), categoryRoutes);
app.use('/api/products', verifyToken, authorizeUserType('employee'), productRoutes);
app.use('/api/suppliers', verifyToken, authorizeUserType('employee'), supplierRoutes);
app.use('/api/inventory', verifyToken, authorizeUserType('employee'), inventoryRoutes);
app.use('/api/customers', verifyToken, authorizeUserType('employee'), customerRoutes);
app.use('/api/purchases', verifyToken, authorizeUserType('employee'), purchaseRoutes);
app.use('/api/sales', verifyToken, authorizeUserType('employee'), salesRoutes);
app.use('/api/employees', verifyToken, authorizeUserType('employee'), employeeRoutes);
app.use('/api/reports', verifyToken, authorizeUserType('employee'), reportRoutes);
app.use('/api/warehouses', verifyToken, authorizeUserType('employee'), warehouseRoutes);
app.use('/api/tax-rates', verifyToken, authorizeUserType('employee'), taxRatesRoutes);
app.use('/api/supplier', supplierPortalRoutes);
app.use('/api/customer', customerPortalRoutes);

// Start server
const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully using raw MySQL.');
    connection.release();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
  }
};

startServer();
