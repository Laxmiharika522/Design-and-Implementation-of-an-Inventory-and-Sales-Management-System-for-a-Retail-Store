import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
  console.log('Starting Database Initialization...');
  
  // Create a dedicated connection with multipleStatements true
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Laxmiharika12124@',
    database: process.env.DB_NAME || 'inventory_sales_db',
    multipleStatements: true
  });

  try {
    // 1. Read files from models directory prioritizing file names to maintain foreign key integrity
    const modelsDir = path.join(__dirname, 'src', 'models');
    const files = fs.readdirSync(modelsDir)
                    .filter(f => f.endsWith('.sql'))
                    .sort(); // 01, 02, 03... order is guaranteed

    console.log(`Found ${files.length} model files to execute.`);

    // 2. Disable FK checks during initialization in case of existing cross-dependencies during drops
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // 3. Drop all tables matching our models first to ensure a clean slate
    const tables = [
      'delivery_details', 'purchase_order_detail', 'purchase_order', 'purchase_order_status',
      'stock_adjustment', 'supplier_product_stock', 'product_reorder', 'inventory', 'warehouse', 'warehouse_address',
      'payment', 'sales_transaction_details', 'sales_transaction', 'sales_transaction_fees', 'sales_transaction_rates',
      'product_description', 'product',
      'supplier_contact', 'supplier', 'supplier_bank_details', 'supplier_address',
      'customer', 'employee', 'employee_address',
      'category', 'hsn_tax'
    ];
    for(const t of tables) {
      await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
    }
    console.log('Cleaned old schema tables.');

    // 4. Recreate schema block by block
    for (const file of files) {
      const sqlPath = path.join(modelsDir, file);
      console.log(`Executing ${file}...`);
      const sqlQueries = fs.readFileSync(sqlPath, 'utf8');
      
      // Execute the entire file script block
      await conn.query(sqlQueries);
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Database schema rebuilt successfully.');

    // 5. Run the Data Seeder
    console.log('\\nCalling Data Seeder...');
    
    // We import dynamically to execute run() inside seed_all_products.js 
    // Wait, seed_all_products.js calls run() automatically at the end.
    // We can just use child_process or async import if there's no top-level blocking await.
    const { execSync } = await import('child_process');
    execSync('node seed_all_products.js', { stdio: 'inherit', cwd: __dirname });
    
    console.log('✅ Full initialization and seeding completed.');

  } catch (err) {
    console.error('❌ Database Initialization Failed:', err);
  } finally {
    await conn.end();
  }
}

initDB();
