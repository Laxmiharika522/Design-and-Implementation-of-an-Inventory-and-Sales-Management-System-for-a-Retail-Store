import express from 'express';
import bcrypt from 'bcrypt';
import { verifyToken, authorizeUserType } from '../middleware/authMiddleware.js';
import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';

const router = express.Router();
router.use(verifyToken, authorizeUserType('customer'));

// GET /api/customer/profile
router.get('/profile', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT customer_id, customer_name, email, phone, address FROM customer WHERE customer_id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// PUT /api/customer/profile
router.put('/profile', async (req, res) => {
  try {
    const { customer_name, phone, email, password, address } = req.body;
    const updates = [];
    const values = [];
    
    if (customer_name !== undefined) { updates.push('customer_name = ?'); values.push(customer_name); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length > 0) {
      values.push(req.user.id);
      await pool.query(`UPDATE customer SET ${updates.join(', ')} WHERE customer_id = ?`, values);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// GET /api/customer/products
router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*, 
        c.category_name,
        i.current_stock, i.expiry_date
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      ORDER BY p.product_name ASC
    `);
    
    const products = rows.map(row => ({
      ...row,
      Category: { category_name: row.category_name },
      Inventory: { current_stock: row.current_stock, expiry_date: row.expiry_date }
    }));
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// GET /api/customer/orders
router.get('/orders', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        st.*,
        std.product_id, std.quantity_sold, std.unit_price as item_price, std.tax, std.line_total, std.tax_category,
        p.product_name,
        pay.payment_method, pay.amount_paid, pay.payment_date,
        stf.payment_processing_fee
      FROM sales_transaction st
      LEFT JOIN sales_transaction_details std ON st.transaction_id = std.transaction_id
      LEFT JOIN product p ON std.product_id = p.product_id
      LEFT JOIN payment pay ON st.transaction_id = pay.transaction_id
      LEFT JOIN sales_transaction_fees stf ON st.payment_type_id = stf.payment_type_id
      WHERE st.customer_id = ?
      ORDER BY st.transaction_date DESC
    `, [req.user.id]);

    const orderMap = new Map();
    for (const row of rows) {
      if (!orderMap.has(row.transaction_id)) {
        const feeRate = row.payment_processing_fee ? parseFloat(row.payment_processing_fee) / 100 : 0;
        orderMap.set(row.transaction_id, {
          transaction_id: row.transaction_id,
          transaction_date: row.transaction_date,
          grand_total: row.grand_total,
          fee_rate: feeRate,
          SalesTransactionDetails: [],
          Payment: row.payment_method ? {
            payment_method: row.payment_method,
            amount_paid: row.amount_paid,
            payment_date: row.payment_date,
            fee_rate: feeRate
          } : null
        });
      }
      if (row.product_id) {
        orderMap.get(row.transaction_id).SalesTransactionDetails.push({
          product_id: row.product_id,
          quantity_sold: row.quantity_sold,
          unit_price: row.item_price,
          tax: row.tax,
          tax_category: row.tax_category,
          line_total: row.line_total,
          Product: { product_name: row.product_name, unit_price: row.item_price }
        });
      }
    }

    // Compute per-order GST subtotal and processing fee
    const orders = Array.from(orderMap.values()).map(order => {
      const itemSubtotal = order.SalesTransactionDetails.reduce((s, d) => {
        const qty = parseInt(d.quantity_sold) || 0;
        const price = parseFloat(d.unit_price) || 0;
        return s + qty * price;
      }, 0);
      const gst_total = order.SalesTransactionDetails.reduce((s, d) => s + (parseFloat(d.tax) || 0), 0);
      const processing_fee = itemSubtotal * order.fee_rate + gst_total * order.fee_rate;
      return { ...order, gst_total, processing_fee };
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// POST /api/customer/orders
router.post('/orders', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { items, payment_method = 'Cash' } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items provided' });

    await connection.beginTransaction();

    let grand_total = 0;
    const detailRows = [];

    for (const item of items) {
      const [prodRows] = await connection.query(`
        SELECT p.*, c.category_name FROM product p 
        JOIN category c ON p.category_id = c.category_id 
        WHERE p.product_id = ?
      `, [item.product_id]);
      
      if (prodRows.length === 0) throw new Error(`Product ${item.product_id} not found`);
      const product = prodRows[0];

      const [invRows] = await connection.query('SELECT * FROM inventory WHERE product_id = ?', [item.product_id]);
      if (invRows.length === 0 || invRows[0].current_stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.product_name}`);
      }
      
      const inv = invRows[0];
      let taxCategory = 'GST_5', taxRate = 0.05;
      const catName = product.category_name || '';
      if (['Fruits & Vegetables'].includes(catName)) { taxCategory = 'GST_0'; taxRate = 0.00; }
      else if (['Dairy Products', 'Bakery & Bread', 'Grocery & Staples'].includes(catName)) { taxCategory = 'GST_5'; taxRate = 0.05; }
      else if (['Beverages', 'Snacks & Packaged Foods'].includes(catName)) { taxCategory = 'GST_12'; taxRate = 0.12; }
      else if (['Personal Care', 'Household & Cleaning', 'Health & Wellness', 'Baby & Kids Products'].includes(catName)) { taxCategory = 'GST_18'; taxRate = 0.18; }

      const unitPrice = parseFloat(product.unit_price);
      const taxAmount = (unitPrice * taxRate) * item.quantity;
      const line_total = (unitPrice * item.quantity) + taxAmount;
      grand_total += line_total;

      detailRows.push({
        product_id: item.product_id,
        quantity_sold: item.quantity,
        unit_price: unitPrice,
        tax_category: taxCategory,
        tax: taxAmount,
        line_total: line_total
      });
      
      await connection.query('UPDATE inventory SET current_stock = current_stock - ?, stock_out = IFNULL(stock_out, 0) + ? WHERE inventory_id = ?', [item.quantity, item.quantity, inv.inventory_id]);
    }

    const validMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card'];
    const payTypeId = validMethods.includes(payment_method) ? payment_method : 'UPI';
    const [feeRows] = await connection.query('SELECT payment_processing_fee FROM sales_transaction_fees WHERE payment_type_id = ?', [payTypeId]);
    const feeRate = feeRows.length > 0 ? parseFloat(feeRows[0].payment_processing_fee) / 100 : 0;
    grand_total += grand_total * feeRate;

    const transactionId = await getNextId(connection, 'sales_transaction', 'transaction_id');
    const [saleResult] = await connection.query(`
      INSERT INTO sales_transaction (transaction_id, customer_id, grand_total, transaction_date, payment_type_id)
      VALUES (?, ?, ?, NOW(), ?)
    `, [transactionId, req.user.id, Math.round(grand_total), payTypeId]);

    for (const row of detailRows) {
      await connection.query(`
        INSERT INTO sales_transaction_details (transaction_id, product_id, quantity_sold, unit_price, tax_category, tax, line_total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [transactionId, row.product_id, row.quantity_sold, row.unit_price, row.tax_category, row.tax, row.line_total]);
    }

    const paymentId = await getNextId(connection, 'payment', 'payment_id');
    await connection.query(`
      INSERT INTO payment (payment_id, transaction_id, payment_method, amount_paid, payment_date, payment_status)
      VALUES (?, ?, ?, ?, NOW(), 'Completed')
    `, [paymentId, transactionId, payment_method, grand_total]);

    await connection.commit();
    res.status(201).json({ message: 'Order placed successfully', transaction_id: transactionId, grand_total });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Order failed', error: error.message });
  } finally {
    connection.release();
  }
});

export default router;
