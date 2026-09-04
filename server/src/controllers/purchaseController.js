import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';

export const getAllPurchaseOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        po.po_id, po.supplier_id, po.order_date, po.total_amount, po.status, po.delivery_date,
        po.payment_status, po.amount_paid, po.payment_method, po.notes,
        s.supplier_name, s.email AS supplier_email,
        pod.product_id, pod.quantity_ordered, pod.batch_no, pod.unit_price AS pod_unit_price,
        p.product_name, p.unit_price AS catalog_mrp, p.barcode,
        dd.shipping_mode, dd.purchase_agent_name
      FROM purchase_order po
      LEFT JOIN supplier s ON po.supplier_id = s.supplier_id
      LEFT JOIN purchase_order_detail pod ON po.po_id = pod.po_id
      LEFT JOIN product p ON pod.product_id = p.product_id
      LEFT JOIN delivery_details dd ON po.po_id = dd.po_id
      WHERE po.status != 'Cart'
      ORDER BY po.order_date DESC, po.po_id DESC
    `);

    const poMap = new Map();
    for (const row of rows) {
      if (!poMap.has(row.po_id)) {
        const totalAmt = parseFloat(row.total_amount || 0);
        const amtPaid = parseFloat(row.amount_paid || 0);
        let payStatus = row.payment_status;
        if (!payStatus) {
          if (amtPaid >= totalAmt && totalAmt > 0) payStatus = 'Paid';
          else if (amtPaid > 0) payStatus = 'Partial';
          else payStatus = 'Pending';
        }

        poMap.set(row.po_id, {
          po_id: row.po_id,
          supplier_id: row.supplier_id,
          supplier_name: row.supplier_name || `Supplier #${row.supplier_id}`,
          supplier_email: row.supplier_email,
          status: row.status || 'Pending',
          total_amount: totalAmt,
          payment_status: payStatus,
          amount_paid: amtPaid,
          pending_balance: Math.max(0, totalAmt - amtPaid),
          payment_method: row.payment_method || 'Bank Transfer',
          notes: row.notes || '',
          order_date: row.order_date,
          delivery_date: row.delivery_date,
          createdAt: row.order_date,
          updatedAt: row.delivery_date || row.order_date,
          PurchaseOrderDetails: [],
          DeliveryDetail: row.shipping_mode ? {
            shipping_mode: row.shipping_mode,
            purchase_agent_name: row.purchase_agent_name
          } : null
        });
      }
      
      if (row.product_id) {
        const mrp = parseFloat(row.catalog_mrp || 0);
        const effectivePrice = parseFloat(row.pod_unit_price !== null && row.pod_unit_price !== undefined ? row.pod_unit_price : mrp);
        const qty = parseInt(row.quantity_ordered || 0);
        poMap.get(row.po_id).PurchaseOrderDetails.push({
          po_id: row.po_id,
          product_id: row.product_id,
          quantity_ordered: qty,
          unit_price: effectivePrice,
          mrp: mrp,
          line_total: qty * effectivePrice,
          batch_no: row.batch_no,
          Product: { product_name: row.product_name, barcode: row.barcode, unit_price: mrp }
        });
      }
    }
    
    res.json(Array.from(poMap.values()));
  } catch (error) {
    console.error('getAllPurchaseOrders error:', error);
    res.status(500).json({ message: 'Error fetching purchase orders', error: error.message });
  }
};

export const createPurchaseOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { 
      supplier_id, 
      details, 
      status = 'Pending', 
      payment_status = 'Pending', 
      amount_paid = 0, 
      payment_method = 'Bank Transfer', 
      notes = '',
      delivery_date = null 
    } = req.body;

    if (!supplier_id || !details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ message: 'Supplier and at least one order detail item are required.' });
    }

    await connection.beginTransaction();

    const poId = await getNextId(connection, 'purchase_order', 'po_id');

    // Deduplicate details array by product_id to prevent ER_DUP_ENTRY
    const itemMap = new Map();
    for (const item of details) {
      const pid = parseInt(item.product_id);
      if (!pid || isNaN(pid)) continue;
      const qty = parseInt(item.quantity_ordered || 0);
      const price = parseFloat(item.unit_price || 0);
      if (itemMap.has(pid)) {
        itemMap.get(pid).quantity_ordered += qty;
      } else {
        itemMap.set(pid, { product_id: pid, quantity_ordered: qty, unit_price: price, batch_no: item.batch_no || null });
      }
    }

    const consolidatedItems = Array.from(itemMap.values());
    if (consolidatedItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'No valid product line items provided.' });
    }

    let total_amount = 0;
    for (const item of consolidatedItems) {
      total_amount += (item.quantity_ordered * item.unit_price);
    }

    const paidAmt = parseFloat(amount_paid || 0);
    const feePctMap = { 'Credit Card': 2.0, 'Net Banking': 1.5, 'Debit Card': 1.0, 'UPI': 0.5, 'Cash': 0 };
    const feePct = feePctMap[payment_method] || 0;
    const processingFee = (total_amount * feePct) / 100;
    const finalTotalAmount = total_amount + processingFee;

    let computedPaymentStatus = payment_status;
    if (paidAmt >= finalTotalAmount && finalTotalAmount > 0) {
      computedPaymentStatus = 'Paid';
    } else if (paidAmt > 0) {
      computedPaymentStatus = 'Partial';
    } else {
      computedPaymentStatus = 'Pending';
    }

    const delivDate = (status === 'Delivered' || status === 'Received') ? (delivery_date || new Date().toISOString().slice(0, 10)) : delivery_date;

    // 1. INSERT PARENT RECORD FIRST (purchase_order)
    await connection.query(`
      INSERT INTO purchase_order (po_id, supplier_id, order_date, total_amount, status, delivery_date, payment_status, amount_paid, payment_method, notes)
      VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)
    `, [poId, supplier_id, finalTotalAmount, status, delivDate, computedPaymentStatus, paidAmt, payment_method, notes]);

    // 2. INSERT CHILD RECORDS SECOND (purchase_order_detail)
    for (const item of consolidatedItems) {
      await connection.query(`
        INSERT INTO purchase_order_detail (po_id, product_id, quantity_ordered, unit_price, batch_no)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          quantity_ordered = quantity_ordered + VALUES(quantity_ordered),
          unit_price = VALUES(unit_price)
      `, [poId, item.product_id, item.quantity_ordered, item.unit_price, item.batch_no]);
    }

    // 3. Update stock if created directly as Delivered/Received
    if (status === 'Delivered' || status === 'Received') {
      for (const item of consolidatedItems) {
        await connection.query(`
          UPDATE inventory 
          SET current_stock = current_stock + ?, stock_in = stock_in + ?
          WHERE product_id = ?
        `, [item.quantity_ordered, item.quantity_ordered, item.product_id]);
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Purchase order created successfully', po_id: poId });

  } catch (error) {
    await connection.rollback();
    console.error('createPurchaseOrder error:', error);
    res.status(500).json({ message: 'Error creating purchase order', error: error.message });
  } finally {
    connection.release();
  }
};

export const updateOrderStatus = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status, delivery_date } = req.body;

    await connection.beginTransaction();

    const [poRows] = await connection.query('SELECT * FROM purchase_order WHERE po_id = ?', [id]);
    if (poRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'PO not found' });
    }
    const oldPo = poRows[0];
    const isNowDelivered = (status === 'Delivered' || status === 'Received');
    const wasAlreadyDelivered = (oldPo.status === 'Delivered' || oldPo.status === 'Received');

    const updateDelivDate = isNowDelivered ? (delivery_date || new Date().toISOString().slice(0, 10)) : oldPo.delivery_date;

    await connection.query(`
      UPDATE purchase_order 
      SET status = ?, delivery_date = ?
      WHERE po_id = ?
    `, [status, updateDelivDate, id]);

    if (isNowDelivered && !wasAlreadyDelivered) {
      const [details] = await connection.query('SELECT * FROM purchase_order_detail WHERE po_id = ?', [id]);
      for (const item of details) {
        const qty = parseInt(item.quantity_ordered || 0);
        await connection.query(`
          UPDATE inventory 
          SET current_stock = current_stock + ?, stock_in = stock_in + ?
          WHERE product_id = ?
        `, [qty, qty, item.product_id]);
      }
    }

    await connection.commit();
    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    await connection.rollback();
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  } finally {
    connection.release();
  }
};

export const updateOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, amount_paid, payment_method, notes } = req.body;

    const [poRows] = await pool.query('SELECT * FROM purchase_order WHERE po_id = ?', [id]);
    if (poRows.length === 0) {
      return res.status(404).json({ message: 'PO not found' });
    }

    const totalAmt = parseFloat(poRows[0].total_amount || 0);
    const paidAmt = parseFloat(amount_paid !== undefined ? amount_paid : poRows[0].amount_paid);

    let computedStatus = payment_status;
    if (!computedStatus) {
      if (paidAmt >= totalAmt && totalAmt > 0) computedStatus = 'Paid';
      else if (paidAmt > 0) computedStatus = 'Partial';
      else computedStatus = 'Pending';
    }

    await pool.query(`
      UPDATE purchase_order 
      SET payment_status = ?, amount_paid = ?, payment_method = COALESCE(?, payment_method), notes = COALESCE(?, notes)
      WHERE po_id = ?
    `, [computedStatus, paidAmt, payment_method || null, notes || null, id]);

    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('updateOrderPayment error:', error);
    res.status(500).json({ message: 'Error updating order payment', error: error.message });
  }
};

export const markOrderReceived = async (req, res) => {
  return updateOrderStatus(req, res);
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM purchase_order WHERE po_id = ?', [id]);
    if (result.affectedRows > 0) return res.status(200).json({ message: 'Purchase order deleted' });
    res.status(404).json({ message: 'Purchase order not found' });
  } catch (error) {
    console.error('deletePurchaseOrder error:', error);
    res.status(500).json({ message: 'Error deleting purchase order' });
  }
};
