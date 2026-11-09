import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurable CORS for AWS and local dev
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins === '*' ? true : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

const PORT = parseInt(process.env.PORT || '5000', 10);

// Health check endpoints (AWS ALB, App Runner, ECS, Route 53)
app.get(['/health', '/api/health'], async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (err) {
    res.status(503).json({
      status: 'DEGRADED',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message,
    });
  }
});

// Lightweight liveness ping
app.get(['/live', '/api/live'], (req, res) => {
  res.status(200).json({ status: 'OK' });
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

// Optional: Serve client build for unified single-container deployment on AWS
const candidateStaticPaths = [
  path.resolve(__dirname, '../../../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../public'),
];
const clientDistPath = candidateStaticPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`Serving static client files from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  // SPA Fallback for client routing (excluding API & health check routes)
  app.use((req, res, next) => {
    if (
      req.method !== 'GET' ||
      req.path.startsWith('/api') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/live')
    ) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

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

const connectWithRetry = async (maxRetries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connecting to database (attempt ${attempt}/${maxRetries})...`);
      const connection = await pool.getConnection();
      console.log('Database connected successfully using raw MySQL.');
      await ensurePurchaseSchema(connection);
      connection.release();
      return true;
    } catch (err) {
      console.error(`Database connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
};

const startServer = async () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });

  // Connect to DB asynchronously so HTTP server can answer liveness probes immediately
  connectWithRetry().then((connected) => {
    if (!connected) {
      console.warn('⚠️ WARNING: Database connection retries exhausted. Check DB_HOST, DB_USER, DB_PASSWORD and AWS Security Groups.');
    }
  });

  // Graceful shutdown handling for AWS ECS / App Runner / Beanstalk / Docker
  const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Closing server gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await pool.end();
        console.log('Database pool closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error closing database pool:', err);
        process.exit(1);
      }
    });

    // Force exit after 10s if connections fail to close
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();
