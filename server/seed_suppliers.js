/**
 * Supplier Portal Seed Script (Raw SQL - mysql2)
 * Creates: supplier addresses, bank details, contacts, links products, creates POs + delivery details
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('🌱 Starting Supplier Portal seed...');

    // ────────────────────────────────────────────
    // 1. Supplier Addresses (upsert by pincode)
    // ────────────────────────────────────────────
    const addresses = [
      { pincode: '400001', city: 'Mumbai',    state: 'Maharashtra' },
      { pincode: '560001', city: 'Bangalore', state: 'Karnataka' },
      { pincode: '600001', city: 'Chennai',   state: 'Tamil Nadu' },
      { pincode: '110001', city: 'New Delhi', state: 'Delhi' },
    ];
    for (const a of addresses) {
      await conn.query(
        `INSERT INTO supplier_address (pincode, city, state)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE city = VALUES(city), state = VALUES(state)`,
        [a.pincode, a.city, a.state]
      );
    }
    console.log('✅ Supplier addresses seeded');

    // ────────────────────────────────────────────
    // 2. Supplier Bank Details (upsert by account number)
    // ────────────────────────────────────────────
    const banks = [
      { bank_account_number: 'SBI001234567890',    ifsc_code: 'SBIN0001234', branch_name: 'Mumbai Main',       bank_name: 'State Bank of India' },
      { bank_account_number: 'HDFC009876543210',   ifsc_code: 'HDFC0009876', branch_name: 'Bangalore Central', bank_name: 'HDFC Bank' },
      { bank_account_number: 'ICICI001122334455',  ifsc_code: 'ICIC0001122', branch_name: 'Chennai North',     bank_name: 'ICICI Bank' },
      { bank_account_number: 'AXIS006677889900',   ifsc_code: 'UTIB0006677', branch_name: 'Delhi Connaught',   bank_name: 'Axis Bank' },
    ];
    for (const b of banks) {
      await conn.query(
        `INSERT INTO supplier_bank_details (bank_account_number, ifsc_code, branch_name, bank_name)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE ifsc_code = VALUES(ifsc_code), branch_name = VALUES(branch_name), bank_name = VALUES(bank_name)`,
        [b.bank_account_number, b.ifsc_code, b.branch_name, b.bank_name]
      );
    }
    console.log('✅ Bank details seeded');

    // ────────────────────────────────────────────
    // 3. Update existing supplier (id=1) with bank & pincode
    // ────────────────────────────────────────────
    await conn.query(
      `UPDATE supplier SET pincode = ?, bank_account_number = ? WHERE supplier_id = 1`,
      ['600001', 'SBI001234567890']
    );

    // ────────────────────────────────────────────
    // 4. Create 3 more suppliers (findOrCreate pattern)
    // ────────────────────────────────────────────
    const suppliersToCreate = [
      { supplier_name: 'FreshFarms Agro',      email: 'freshfarms@supply.com', pincode: '400001', bank_account_number: 'HDFC009876543210' },
      { supplier_name: 'NutriPack Industries', email: 'nutripack@supply.com',  pincode: '560001', bank_account_number: 'ICICI001122334455' },
      { supplier_name: 'CleanCo Distributors', email: 'cleanco@supply.com',    pincode: '110001', bank_account_number: 'AXIS006677889900' },
    ];

    const createdSuppliers = [];
    for (const s of suppliersToCreate) {
      // Check if supplier already exists
      const [existing] = await conn.query(
        `SELECT supplier_id, supplier_name FROM supplier WHERE email = ?`,
        [s.email]
      );

      if (existing.length > 0) {
        console.log(`  ↩️  Supplier exists: ${existing[0].supplier_name} (ID: ${existing[0].supplier_id})`);
        createdSuppliers.push(existing[0]);
      } else {
        const hashedPassword = await bcrypt.hash('supplier123', 10);
        // Get next supplier_id
        const [[{ nextId }]] = await conn.query(
          `SELECT IFNULL(MAX(supplier_id), 0) + 1 AS nextId FROM supplier`
        );
        await conn.query(
          `INSERT INTO supplier (supplier_id, supplier_name, email, password, pincode, bank_account_number)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [nextId, s.supplier_name, s.email, hashedPassword, s.pincode, s.bank_account_number]
        );
        console.log(`  ➕ Created supplier: ${s.supplier_name} (ID: ${nextId})`);
        createdSuppliers.push({ supplier_id: nextId, supplier_name: s.supplier_name });
      }
    }

    const [supplier2, supplier3, supplier4] = createdSuppliers;

    // ────────────────────────────────────────────
    // 5. Add contacts for all suppliers
    // ────────────────────────────────────────────
    const contacts = [
      { supplier_id: 1,                    phone: '9876543210' },
      { supplier_id: 1,                    phone: '9876543211' },
      { supplier_id: supplier2.supplier_id, phone: '9123456780' },
      { supplier_id: supplier3.supplier_id, phone: '9234567890' },
      { supplier_id: supplier4.supplier_id, phone: '9345678901' },
    ];
    for (const c of contacts) {
      // Skip if already exists
      const [exists] = await conn.query(
        `SELECT 1 FROM supplier_contact WHERE supplier_id = ? AND phone = ?`,
        [c.supplier_id, c.phone]
      );
      if (exists.length === 0) {
        await conn.query(
          `INSERT INTO supplier_contact (supplier_id, phone) VALUES (?, ?)`,
          [c.supplier_id, c.phone]
        );
      }
    }
    console.log('✅ Supplier contacts seeded');

    // ────────────────────────────────────────────
    // 6. Assign products to suppliers by category
    // ────────────────────────────────────────────
    const [allProducts] = await conn.query(`
      SELECT p.product_id, p.unit_price, c.category_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
    `);

    for (const p of allProducts) {
      const cat = p.category_name || '';
      let assignedSupplierId = 1; // default: laxmi (Grocery & Staples)

      if (['Fruits & Vegetables', 'Dairy Products', 'Bakery & Bread'].includes(cat)) {
        assignedSupplierId = supplier2.supplier_id; // FreshFarms
      } else if (['Snacks & Packaged Foods', 'Beverages', 'Health & Wellness', 'Baby & Kids Products'].includes(cat)) {
        assignedSupplierId = supplier3.supplier_id; // NutriPack
      } else if (['Personal Care', 'Household & Cleaning'].includes(cat)) {
        assignedSupplierId = supplier4.supplier_id; // CleanCo
      }

      await conn.query(
        `UPDATE product SET supplier_id = ? WHERE product_id = ?`,
        [assignedSupplierId, p.product_id]
      );
    }
    console.log(`✅ Assigned ${allProducts.length} products to suppliers by category`);

    // ────────────────────────────────────────────
    // 7. Create Purchase Orders
    // ────────────────────────────────────────────
    const getByCategory = (cats, limit) =>
      allProducts.filter(p => cats.includes(p.category_name)).slice(0, limit);

    const groceryProducts = getByCategory(['Grocery & Staples'], 3);
    const freshProducts   = getByCategory(['Fruits & Vegetables'], 3);
    const snackProducts   = getByCategory(['Snacks & Packaged Foods'], 3);
    const cleanProducts   = getByCategory(['Personal Care', 'Household & Cleaning'], 3);

    const poData = [
      { supplier_id: 1,                    status: 'Delivered',   order_date: '2026-03-01', delivery_date: '2026-03-07', products: groceryProducts,         qty: 50  },
      { supplier_id: 1,                    status: 'Shipped',     order_date: '2026-03-15', delivery_date: '2026-03-22', products: groceryProducts.slice(0,2), qty: 30  },
      { supplier_id: 1,                    status: 'Pending',     order_date: '2026-03-20', delivery_date: null,         products: groceryProducts.slice(0,2), qty: 100 },
      { supplier_id: supplier2.supplier_id, status: 'Delivered',  order_date: '2026-03-05', delivery_date: '2026-03-10', products: freshProducts,             qty: 200 },
      { supplier_id: supplier2.supplier_id, status: 'In Progress',order_date: '2026-03-18', delivery_date: '2026-03-25', products: freshProducts.slice(0,2),  qty: 150 },
      { supplier_id: supplier3.supplier_id, status: 'Delivered',  order_date: '2026-03-02', delivery_date: '2026-03-06', products: snackProducts,             qty: 80  },
      { supplier_id: supplier3.supplier_id, status: 'Pending',    order_date: '2026-03-21', delivery_date: null,         products: snackProducts.slice(0,2),  qty: 60  },
      { supplier_id: supplier4.supplier_id, status: 'Shipped',    order_date: '2026-03-12', delivery_date: '2026-03-19', products: cleanProducts,             qty: 40  },
    ];

    const modes  = ['Truck', 'Courier', 'Van', 'Rail'];
    const agents = ['Ramesh Kumar', 'Priya Sharma', 'Anand Patel', 'Kavitha Rao'];

    for (const [idx, po] of poData.entries()) {
      if (po.products.length === 0) {
        console.log(`  ⚠️  Skipping PO for supplier ${po.supplier_id} - no products found`);
        continue;
      }

      const totalAmount = po.products.reduce((sum, p) => sum + (parseFloat(p.unit_price) * po.qty), 0);

      // Get next po_id
      const [[{ nextPoId }]] = await conn.query(
        `SELECT IFNULL(MAX(po_id), 0) + 1 AS nextPoId FROM purchase_order`
      );

      await conn.query(
        `INSERT INTO purchase_order (po_id, supplier_id, status, order_date, delivery_date, total_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nextPoId, po.supplier_id, po.status, po.order_date, po.delivery_date, totalAmount]
      );

      // Order details
      for (const [i, product] of po.products.entries()) {
        const [[{ nextDetailId }]] = await conn.query(
          `SELECT IFNULL(MAX(po_detail_id), 0) + 1 AS nextDetailId FROM purchase_order_detail`
        );
        const [detailExists] = await conn.query(
          `SELECT 1 FROM purchase_order_detail WHERE po_id = ? AND product_id = ?`,
          [nextPoId, product.product_id]
        );
        if (detailExists.length === 0) {
          await conn.query(
            `INSERT INTO purchase_order_detail (po_detail_id, po_id, product_id, quantity_ordered, batch_no)
             VALUES (?, ?, ?, ?, ?)`,
            [
              nextDetailId,
              nextPoId,
              product.product_id,
              po.qty,
              `BATCH-${nextPoId}-${String(i + 1).padStart(2, '0')}`,
            ]
          );
        }
      }

      // Delivery Details for shipped/delivered/in-progress orders
      if (['Shipped', 'Delivered', 'In Progress'].includes(po.status)) {
        const modeIdx = idx % modes.length;
        await conn.query(
          `INSERT INTO delivery_details (po_id, shipping_mode, purchase_agent_name)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE shipping_mode = VALUES(shipping_mode), purchase_agent_name = VALUES(purchase_agent_name)`,
          [nextPoId, modes[modeIdx], agents[modeIdx]]
        );
      }

      console.log(`  ✅ PO #${nextPoId} — supplier ${po.supplier_id} — ₹${totalAmount.toFixed(0)} — ${po.status}`);
    }

    console.log('\n✅✅ Supplier Portal data seeded successfully!');
    console.log('\n📋 Supplier Credentials:');
    console.log('  laxmi (Grocery & Staples)  | Email: supplier1@logistics.com  | Pass: supplier123');
    console.log('  FreshFarms Agro            | Email: freshfarms@supply.com    | Pass: supplier123');
    console.log('  NutriPack Industries       | Email: nutripack@supply.com     | Pass: supplier123');
    console.log('  CleanCo Distributors       | Email: cleanco@supply.com       | Pass: supplier123');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    conn.release();
  }
}

seed();
