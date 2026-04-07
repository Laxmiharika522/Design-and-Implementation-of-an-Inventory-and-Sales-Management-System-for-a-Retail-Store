import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        po.*,
        pod.po_id AS detail_po_id, pod.product_id, pod.quantity_ordered, pod.batch_no,
        p.product_name, p.unit_price, p.barcode
      FROM purchase_order po
      LEFT JOIN purchase_order_detail pod ON po.po_id = pod.po_id
      LEFT JOIN product p ON pod.product_id = p.product_id
      WHERE po.status != 'Cart'
      ORDER BY po.order_date DESC, po.po_id DESC
    `);

    const poMap = new Map();
    for (const row of rows) {
      if (!poMap.has(row.po_id)) {
        poMap.set(row.po_id, {
          po_id: row.po_id,
          supplier_id: row.supplier_id,
          status: row.status,
          total_amount: row.total_amount,
          createdAt: row.order_date,
          updatedAt: row.delivery_date || row.order_date,
          PurchaseOrderDetails: []
        });
      }
      
      if (row.product_id) {
        poMap.get(row.po_id).PurchaseOrderDetails.push({
          po_id: row.detail_po_id,
          product_id: row.product_id,
          quantity_ordered: row.quantity_ordered,
          unit_price: row.unit_price,
          line_total: (row.quantity_ordered || 0) * (row.unit_price || 0),
          batch_no: row.batch_no,
          Product: { product_name: row.product_name, barcode: row.barcode }
        });
      }
    }
    
    res.json(Array.from(poMap.values()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching purchase orders' });
  }
};

export const createPurchaseOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { supplier_id, details } = req.body;
    let total_amount = 0;

    await connection.beginTransaction();

    const poId = await getNextId(connection, 'purchase_order', 'po_id');

    const [poResult] = await connection.query(`
      INSERT INTO purchase_order (po_id, supplier_id, status, total_amount, order_date)
      VALUES (?, ?, 'Pending', 0, CURDATE())
    `, [poId, supplier_id]);

    for (const item of details) {
      const line_total = item.quantity_ordered * item.unit_price;
      total_amount += line_total;

      await connection.query(`
        INSERT INTO purchase_order_detail (po_id, product_id, quantity_ordered, unit_price, line_total)
        VALUES (?, ?, ?, ?, ?)
      `, [poId, item.product_id, item.quantity_ordered, item.unit_price, line_total]);
    }

    await connection.query(`
      UPDATE purchase_order 
      SET total_amount = ?
      WHERE po_id = ?
    `, [total_amount, poId]);

    await connection.commit();

    const [newPo] = await pool.query('SELECT * FROM purchase_order WHERE po_id = ?', [poId]);
    res.status(201).json(newPo[0]);

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error creating purchase order' });
  } finally {
    connection.release();
  }
};

export const markOrderReceived = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();

    const [poRows] = await connection.query('SELECT * FROM purchase_order WHERE po_id = ?', [id]);
    if (poRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'PO not found' });
    }
    const po = poRows[0];
    
    if (po.status === 'Received') {
      await connection.rollback();
      return res.status(400).json({ message: 'PO already received' });
    }

    await connection.query(`
      UPDATE purchase_order 
      SET status = 'Received', delivery_date = CURDATE()
      WHERE po_id = ?
    `, [id]);

    const [details] = await connection.query('SELECT * FROM purchase_order_detail WHERE po_id = ?', [id]);

    for (const item of details) {
      await connection.query(`
        UPDATE inventory 
        SET current_stock = current_stock + ?, stock_in = stock_in + ?
        WHERE product_id = ?
      `, [item.quantity_ordered, item.quantity_ordered, item.product_id]);
    }

    await connection.commit();
    res.json({ message: 'Order marked as received and stock updated', po: { ...po, status: 'Received' } });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error receiving purchase order' });
  } finally {
    connection.release();
  }
};
