import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';
export const getAllSales = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        st.*,
        p.payment_id, p.payment_method, p.payment_date, p.amount_paid, p.payment_status,
        std.detail_id, std.product_id, std.quantity_sold, std.unit_price, std.tax, std.line_total, std.tax_category,
        pr.product_name, pr.barcode
      FROM sales_transaction st
      LEFT JOIN payment p ON st.transaction_id = p.transaction_id
      LEFT JOIN sales_transaction_details std ON st.transaction_id = std.transaction_id
      LEFT JOIN product pr ON std.product_id = pr.product_id
      ORDER BY st.transaction_date DESC
    `);

    const salesMap = new Map();
    for (const row of rows) {
      if (!salesMap.has(row.transaction_id)) {
        salesMap.set(row.transaction_id, {
          transaction_id: row.transaction_id,
          customer_id: row.customer_id,
          employee_id: row.employee_id,
          transaction_date: row.transaction_date,
          total_items: row.total_items,
          grand_total: row.grand_total,
          payment_type_id: row.payment_type_id,
          Payment: row.payment_id ? {
            payment_id: row.payment_id,
            payment_method: row.payment_method,
            amount_paid: row.amount_paid,
            payment_status: row.payment_status,
            payment_date: row.payment_date
          } : null,
          SalesTransactionDetails: []
        });
      }
      
      if (row.detail_id) {
        salesMap.get(row.transaction_id).SalesTransactionDetails.push({
          detail_id: row.detail_id,
          transaction_id: row.transaction_id,
          product_id: row.product_id,
          quantity_sold: row.quantity_sold,
          unit_price: row.unit_price,
          tax: row.tax,
          line_total: row.line_total,
          tax_category: row.tax_category,
          Product: { 
            product_name: row.product_name, 
            barcode: row.barcode 
          }
        });
      }
    }
    
    res.json(Array.from(salesMap.values()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching sales' });
  }
};

export const createSale = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { customer_id, items, payment_method, amount_paid } = req.body;
    const employee_id = req.user.id;

    await connection.beginTransaction();

    let total_items = 0;
    let grand_total = 0;

    // Preliminary checks for stock
    for (const item of items) {
       const [invRows] = await connection.query('SELECT current_stock FROM inventory WHERE product_id = ?', [item.product_id]);
       if (invRows.length === 0 || invRows[0].current_stock < item.quantity_sold) {
          await connection.rollback();
          return res.status(400).json({ message: `Insufficient stock for product ID ${item.product_id}` });
       }
    }

    const transactionId = await getNextId(connection, 'sales_transaction', 'transaction_id');

    // Insert sale to get transaction_id
    const [saleResult] = await connection.query(`
      INSERT INTO sales_transaction (transaction_id, customer_id, employee_id, transaction_date, total_items, grand_total)
      VALUES (?, ?, ?, NOW(), 0, 0)
    `, [transactionId, customer_id || null, employee_id]);

    for (const item of items) {
      const line_total = (item.quantity_sold * item.unit_price) + (item.tax || 0);
      total_items += Number(item.quantity_sold);
      grand_total += line_total;

      await connection.query(`
        INSERT INTO sales_transaction_details (transaction_id, product_id, quantity_sold, unit_price, tax, tax_category, line_total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [transactionId, item.product_id, item.quantity_sold, item.unit_price, item.tax || 0, item.tax_category || 'GST_5', line_total]);

      await connection.query(`
        UPDATE inventory 
        SET current_stock = current_stock - ?, stock_out = stock_out + ? 
        WHERE product_id = ?
      `, [item.quantity_sold, item.quantity_sold, item.product_id]);
    }

    // Add processing fee
    const [feeRows] = await connection.query('SELECT payment_processing_fee FROM sales_transaction_fees WHERE payment_type_id = ? LIMIT 1', [payment_method]);
    const feeRate = feeRows.length > 0 ? parseFloat(feeRows[0].payment_processing_fee) / 100 : 0;
    const feeAmount = grand_total * feeRate;
    const finalGrandTotal = grand_total + feeAmount;

    await connection.query(`
      UPDATE sales_transaction 
      SET total_items = ?, grand_total = ?, payment_type_id = ? 
      WHERE transaction_id = ?
    `, [total_items, finalGrandTotal, feeRows.length > 0 ? payment_method : null, transactionId]);

    // Payment Processing
    const payment_status = amount_paid >= finalGrandTotal ? 'Completed' : 'Pending';
    const paymentId = await getNextId(connection, 'payment', 'payment_id');
    await connection.query(`
      INSERT INTO payment (payment_id, transaction_id, payment_method, amount_paid, payment_status, payment_date)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [paymentId, transactionId, payment_method, amount_paid, payment_status]);

    await connection.commit();
    res.status(201).json({ 
      message: 'Sale completed successfully', 
      sale: { transaction_id: transactionId, total_items, grand_total: finalGrandTotal, payment_type_id: payment_method } 
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error processing sale' });
  } finally {
    connection.release();
  }
};
