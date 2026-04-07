import express from 'express';
import bcrypt from 'bcrypt';
import { verifyToken, authorizeUserType } from '../middleware/authMiddleware.js';
import pool from '../config/db.js';

const router = express.Router();
router.use(verifyToken, authorizeUserType('supplier'));

// ═══════════════════════════════════
// ORDERS
// ═══════════════════════════════════

router.get('/orders', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        po.*,
        pod.product_id, pod.quantity_ordered, pod.batch_no,
        p.product_name, p.unit_price,
        p.product_name,
        c.category_name,
        dd.shipping_mode, dd.purchase_agent_name
      FROM purchase_order po
      LEFT JOIN purchase_order_detail pod ON po.po_id = pod.po_id
      LEFT JOIN product p ON pod.product_id = p.product_id
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN delivery_details dd ON po.po_id = dd.po_id
      WHERE po.supplier_id = ?
      ORDER BY po.order_date DESC, po.po_id DESC
    `, [req.user.id]);

    const orderMap = new Map();
    for (const row of rows) {
      if (!orderMap.has(row.po_id)) {
        orderMap.set(row.po_id, {
          po_id: row.po_id,
          supplier_id: row.supplier_id,
          status: row.status,
          total_amount: row.total_amount,
          createdAt: row.order_date,
          updatedAt: row.delivery_date || row.order_date,
          order_date: row.order_date,
          delivery_date: row.delivery_date,
          PurchaseOrderDetails: [],
          DeliveryDetail: row.shipping_mode ? {
            shipping_mode: row.shipping_mode,
            purchase_agent_name: row.purchase_agent_name
          } : null
        });
      }
      if (row.product_id) {
        orderMap.get(row.po_id).PurchaseOrderDetails.push({
          product_id: row.product_id,
          quantity_ordered: row.quantity_ordered,
          batch_no: row.batch_no,
          unit_price: row.unit_price,
          line_total: (row.quantity_ordered || 0) * (row.unit_price || 0),
          Product: {
            product_name: row.product_name,
            unit_price: row.unit_price,
            Category: { category_name: row.category_name }
          }
        });
      }
    }
    
    res.json(Array.from(orderMap.values()));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const sid = req.user.id;
    
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'Shipped' THEN 1 END) as shipped,
        COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled
      FROM purchase_order
      WHERE supplier_id = ?
    `, [sid]);

    const [deliveredOrders] = await pool.query(`
      SELECT po.po_id, pod.quantity_ordered, p.unit_price, c.category_name
      FROM purchase_order po
      JOIN purchase_order_detail pod ON po.po_id = pod.po_id
      JOIN product p ON pod.product_id = p.product_id
      JOIN category c ON p.category_id = c.category_id
      WHERE po.supplier_id = ? AND po.status = 'Delivered'
    `, [sid]);

    const totalEarned = deliveredOrders.reduce((sum, d) => {
      const qty = d.quantity_ordered || 0;
      const unitPrice = parseFloat(d.unit_price || 0);
      const baseTotal = unitPrice * qty;
      const catName = d.category_name || '';

      let gstRate = 0.05;
      if (['Fruits & Vegetables'].includes(catName)) gstRate = 0.00;
      else if (['Dairy Products', 'Bakery & Bread', 'Grocery & Staples'].includes(catName)) gstRate = 0.05;
      else if (['Beverages', 'Snacks & Packaged Foods'].includes(catName)) gstRate = 0.12;
      else if (['Personal Care', 'Household & Cleaning', 'Health & Wellness', 'Baby & Kids Products'].includes(catName)) gstRate = 0.18;

      return sum + (baseTotal + (baseTotal * gstRate));
    }, 0);

    res.json({
      ...counts[0],
      totalEarned: Number.parseFloat(totalEarned.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { status } = req.body;
    const poId = req.params.id;
    const sid = req.user.id;
    
    await connection.beginTransaction();

    const [orderRows] = await connection.query('SELECT * FROM purchase_order WHERE po_id = ? AND supplier_id = ?', [poId, sid]);
    if (orderRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = orderRows[0];
    const oldStatus = order.status;

    if (status === 'Delivered') {
      await connection.query('UPDATE purchase_order SET status = ?, delivery_date = CURDATE() WHERE po_id = ?', [status, poId]);
    } else {
      await connection.query('UPDATE purchase_order SET status = ? WHERE po_id = ?', [status, poId]);
    }

    if (status === 'Delivered' && oldStatus !== 'Delivered') {
      // Stock update logic for supplier_product_stock was removed.
    }

    await connection.commit();
    res.json({ message: 'Order status updated' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error updating order', error: error.message });
  } finally {
    connection.release();
  }
});

// DELIVERIES
router.get('/delivery', async (req, res) => {
   // Implementation similar to /orders but could filter for delivery relevant info
   // For now, mirroring previous logic
   try {
    const [rows] = await pool.query(`
      SELECT 
        po.*,
        pod.product_id, pod.quantity_ordered, pod.batch_no,
        p.product_name, p.unit_price,
        c.category_name,
        dd.shipping_mode, dd.purchase_agent_name
      FROM purchase_order po
      LEFT JOIN purchase_order_detail pod ON po.po_id = pod.po_id
      LEFT JOIN product p ON pod.product_id = p.product_id
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN delivery_details dd ON po.po_id = dd.po_id
      WHERE po.supplier_id = ?
      ORDER BY po.order_date DESC
    `, [req.user.id]);

    const orderMap = new Map();
    for (const row of rows) {
      if (!orderMap.has(row.po_id)) {
        orderMap.set(row.po_id, {
          ...row,
          PurchaseOrderDetails: [],
          DeliveryDetail: row.shipping_mode ? {
            shipping_mode: row.shipping_mode,
            purchase_agent_name: row.purchase_agent_name
          } : null
        });
      }
      if (row.product_id) {
        orderMap.get(row.po_id).PurchaseOrderDetails.push({
          product_id: row.product_id,
          quantity_ordered: row.quantity_ordered,
          batch_no: row.batch_no,
          unit_price: row.unit_price,
          line_total: (row.quantity_ordered || 0) * (row.unit_price || 0),
          Product: {
            product_name: row.product_name,
            unit_price: row.unit_price,
            Category: { category_name: row.category_name }
          }
        });
      }
    }
    res.json(Array.from(orderMap.values()));
   } catch (error) {
     res.status(500).json({ message: 'Error fetching deliveries' });
   }
});

router.post('/delivery/:po_id', async (req, res) => {
  try {
    const { shipping_mode, purchase_agent_name, delivery_date } = req.body;
    const po_id = req.params.po_id;
    const sid = req.user.id;

    const [orderRows] = await pool.query('SELECT * FROM purchase_order WHERE po_id = ? AND supplier_id = ?', [po_id, sid]);
    if (orderRows.length === 0) return res.status(404).json({ message: 'Order not found' });

    await pool.query(`
      INSERT INTO delivery_details (po_id, shipping_mode, purchase_agent_name)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE shipping_mode = VALUES(shipping_mode), purchase_agent_name = VALUES(purchase_agent_name)
    `, [po_id, shipping_mode, purchase_agent_name]);

    if (delivery_date) {
      await pool.query('UPDATE purchase_order SET delivery_date = ? WHERE po_id = ?', [delivery_date, po_id]);
    }

    res.json({ message: 'Delivery info saved' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving delivery info', error: error.message });
  }
});

// PRODUCTS
router.get('/products', async (req, res) => {
  try {
    const sid = req.user.id;
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        c.category_name,
        i.current_stock, i.expiry_date
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      WHERE p.supplier_id = ?
      ORDER BY p.product_name ASC
    `, [sid, sid]);

    const result = rows.map(row => ({
      ...row,
      Category: { category_name: row.category_name },
      Inventory: { current_stock: row.current_stock, expiry_date: row.expiry_date }
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// PAYMENTS
router.get('/payments', async (req, res) => {
  try {
    const sid = req.user.id;
    const [rows] = await pool.query(`
      SELECT 
        po.po_id, po.order_date, po.total_amount, po.status, po.delivery_date,
        pod.quantity_ordered, p.unit_price, p.product_name, c.category_name
      FROM purchase_order po
      LEFT JOIN purchase_order_detail pod ON po.po_id = pod.po_id
      LEFT JOIN product p ON pod.product_id = p.product_id
      LEFT JOIN category c ON p.category_id = c.category_id
      WHERE po.supplier_id = ?
      ORDER BY po.order_date DESC
    `, [sid]);

    const paymentMap = new Map();
    for (const row of rows) {
      if (!paymentMap.has(row.po_id)) {
        paymentMap.set(row.po_id, {
          po_id: row.po_id,
          order_date: row.order_date,
          total_amount: row.total_amount,
          status: row.status,
          delivery_date: row.delivery_date,
          payment_status: ['Delivered', 'Received', 'Completed'].includes(row.status) ? 'Paid' : 'Pending',
          PurchaseOrderDetails: []
        });
      }
      if (row.product_name) {
        paymentMap.get(row.po_id).PurchaseOrderDetails.push({
          Product: {
            unit_price: row.unit_price,
            product_name: row.product_name,
            Category: { category_name: row.category_name }
          },
          quantity_ordered: row.quantity_ordered
        });
      }
    }
    res.json(Array.from(paymentMap.values()));
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
});

// PROFILE
router.get('/profile', async (req, res) => {
  try {
    const sid = req.user.id;
    const [suppliers] = await pool.query(`
      SELECT s.supplier_id, s.supplier_name, s.email, s.pincode, s.bank_account_number,
             sa.city, sa.state
      FROM supplier s
      LEFT JOIN supplier_address sa ON s.pincode = sa.pincode
      WHERE s.supplier_id = ?
    `, [sid]);
    if (suppliers.length === 0) return res.status(404).json({ message: 'Not found' });
    const s = suppliers[0];

    const [contacts] = await pool.query('SELECT phone FROM supplier_contact WHERE supplier_id = ?', [sid]);
    const [bank] = await pool.query('SELECT * FROM supplier_bank_details WHERE bank_account_number = ?', [s.bank_account_number]);

    res.json({
      ...s,
      SupplierContacts: contacts,
      bankDetails: bank[0] || null
    });
  } catch (error) {
    console.error('GET /profile error:', error);
    res.status(500).json({ message: error.message || 'Error fetching profile' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { supplier_name, email, pincode, city, state, bank_account_number, bank_name, ifsc_code, branch_name } = req.body;
    const sid = req.user.id;
    
    if (pincode) {
      await pool.query(`
        INSERT INTO supplier_address (pincode, city, state) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE city=VALUES(city), state=VALUES(state)
      `, [pincode, city || 'Unknown', state || 'Unknown']);
    }
    
    if (bank_account_number && bank_name) {
      await pool.query(`
        INSERT INTO supplier_bank_details (bank_account_number, bank_name, ifsc_code, branch_name)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE bank_name=VALUES(bank_name), ifsc_code=VALUES(ifsc_code), branch_name=VALUES(branch_name)
      `, [bank_account_number, bank_name, ifsc_code, branch_name]);
    }

    const updates = [];
    const values = [];
    if (supplier_name) { updates.push('supplier_name = ?'); values.push(supplier_name); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (pincode) { updates.push('pincode = ?'); values.push(pincode); }
    if (bank_account_number) { updates.push('bank_account_number = ?'); values.push(bank_account_number); }

    if (updates.length > 0) {
      values.push(sid);
      await pool.query(`UPDATE supplier SET ${updates.join(', ')} WHERE supplier_id = ?`, values);
    }

    res.json({ message: 'Profile updated' });
  } catch (error) {
    console.error('PUT /profile error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
       return res.status(400).json({ message: 'Duplicate entry: Ensure unique values like Bank Account Number or Email.' });
    }
    res.status(500).json({ message: error.message || 'Error updating profile' });
  }
});

router.post('/profile/phone', async (req, res) => {
  try {
    await pool.query('INSERT INTO supplier_contact (supplier_id, phone) VALUES (?, ?)', [req.user.id, req.body.phone]);
    res.json({ message: 'Phone added' });
  } catch (error) {
    console.error('POST /profile/phone error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
       return res.status(400).json({ message: 'Phone number already exists.' });
    }
    res.status(500).json({ message: error.message || 'Error adding phone' });
  }
});

router.delete('/profile/phone/:phone', async (req, res) => {
  try {
    await pool.query('DELETE FROM supplier_contact WHERE supplier_id = ? AND phone = ?', [req.user.id, req.params.phone]);
    res.json({ message: 'Phone removed' });
  } catch (error) {
    console.error('DELETE /profile/phone error:', error);
    res.status(500).json({ message: error.message || 'Error removing phone' });
  }
});

export default router;
