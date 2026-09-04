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
app.use('/api/tax-rates', verifyToken, authorizeUserType('employee'), taxRatesRoutes);
app.use('/api/supplier', supplierPortalRoutes);
app.use('/api/customer', customerPortalRoutes);

// Start server
const ensurePurchaseSchema = async (connection) => {
  try {
    const [cols] = await connection.query(`SHOW COLUMNS FROM purchase_order`);
    const colNames = cols.map(c => c.Field);
    
    if (!colNames.includes('payment_status')) {
      await connection.query(`ALTER TABLE purchase_order ADD COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending'`);
    }
    if (!colNames.includes('amount_paid')) {
      await connection.query(`ALTER TABLE purchase_order ADD COLUMN amount_paid DECIMAL(12,2) NOT NULL DEFAULT '0.00'`);
    }
    if (!colNames.includes('payment_method')) {
      await connection.query(`ALTER TABLE purchase_order ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Bank Transfer'`);
    }
    if (!colNames.includes('notes')) {
      await connection.query(`ALTER TABLE purchase_order ADD COLUMN notes TEXT DEFAULT NULL`);
    }

    try {
      const [podCols] = await connection.query(`SHOW COLUMNS FROM purchase_order_detail`);
      const podColNames = podCols.map(c => c.Field);
      if (!podColNames.includes('unit_price')) {
        await connection.query(`ALTER TABLE purchase_order_detail ADD COLUMN unit_price DECIMAL(12,2) DEFAULT '0.00'`);
      }
    } catch (e) {
      console.error('Error checking purchase_order_detail cols:', e.message);
    }

    try {
      await connection.query(`
        INSERT INTO purchase_order_status (status, payment_status) VALUES
        ('Pending', 'Pending'),
        ('Shipped', 'Pending'),
        ('Delivered', 'Paid'),
        ('Received', 'Paid'),
        ('Cancelled', 'Cancelled')
        ON DUPLICATE KEY UPDATE payment_status=VALUES(payment_status)
      `);
    } catch (e) {
      console.error('Error populating purchase_order_status:', e.message);
    }

    try {
      await connection.query(`
        INSERT INTO sales_transaction_fees (payment_type_id, payment_processing_fee) VALUES
        ('Cash', 0.00),
        ('UPI', 0.50),
        ('Debit Card', 1.00),
        ('Credit Card', 2.00),
        ('Net Banking', 1.50),
        ('Online', 0.50)
        ON DUPLICATE KEY UPDATE payment_processing_fee = VALUES(payment_processing_fee)
      `);
    } catch (e) {
      console.error('Error setting standardized processing fee:', e.message);
    }

    console.log('Purchase order schema and processing fees verified.');
  } catch (err) {
    console.error('Error verifying purchase_order schema:', err.message);
  }
};

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully using raw MySQL.');
    await ensurePurchaseSchema(connection);
    connection.release();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
  }
};

startServer();
