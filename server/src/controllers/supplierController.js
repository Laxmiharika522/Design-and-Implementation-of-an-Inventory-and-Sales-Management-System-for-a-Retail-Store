import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';

export const getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.supplier_id, s.supplier_name, s.email, s.pincode, s.bank_account_number,
        sa.city, sa.state,
        sc.phone,
        bd.bank_name, bd.ifsc_code, bd.branch_name,
        COALESCE(po_stats.total_orders, 0) AS total_orders,
        COALESCE(po_stats.total_spent, 0) AS total_spent,
        COALESCE(po_stats.total_paid, 0) AS total_paid
      FROM supplier s
      LEFT JOIN supplier_address sa ON s.pincode = sa.pincode
      LEFT JOIN supplier_bank_details bd ON s.bank_account_number = bd.bank_account_number
      LEFT JOIN supplier_contact sc ON s.supplier_id = sc.supplier_id
      LEFT JOIN (
        SELECT 
          supplier_id,
          COUNT(po_id) AS total_orders,
          SUM(total_amount) AS total_spent,
          SUM(amount_paid) AS total_paid
        FROM purchase_order
        WHERE status != 'Cancelled'
        GROUP BY supplier_id
      ) po_stats ON s.supplier_id = po_stats.supplier_id
      ORDER BY s.supplier_id DESC
    `);
    
    const suppliersMap = new Map();
    for (const row of rows) {
      if (!suppliersMap.has(row.supplier_id)) {
        const totalSpent = parseFloat(row.total_spent || 0);
        const totalPaid = parseFloat(row.total_paid || 0);
        suppliersMap.set(row.supplier_id, {
          supplier_id: row.supplier_id,
          supplier_name: row.supplier_name,
          email: row.email,
          pincode: row.pincode,
          city: row.city,
          state: row.state,
          bank_account_number: row.bank_account_number,
          bank_name: row.bank_name,
          ifsc_code: row.ifsc_code,
          branch_name: row.branch_name,
          total_orders: parseInt(row.total_orders || 0),
          total_spent: totalSpent,
          total_paid: totalPaid,
          pending_balance: Math.max(0, totalSpent - totalPaid),
          SupplierContacts: []
        });
      }
      if (row.phone) {
        const existingPhones = suppliersMap.get(row.supplier_id).SupplierContacts.map(c => c.phone);
        if (!existingPhones.includes(row.phone)) {
          suppliersMap.get(row.supplier_id).SupplierContacts.push({
            supplier_id: row.supplier_id,
            phone: row.phone
          });
        }
      }
    }
    
    res.json(Array.from(suppliersMap.values()));
  } catch (error) {
    console.error('getAllSuppliers error:', error);
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
  }
};

export const createSupplier = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { 
      supplier_name, email, phones, pincode, city, state,
      bank_account_number, bank_name, ifsc_code, branch_name 
    } = req.body;
    
    await connection.beginTransaction();

    if (pincode) {
      await connection.query(`
        INSERT INTO supplier_address (pincode, city, state) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE city=VALUES(city), state=VALUES(state)
      `, [pincode, city || 'City', state || 'State']);
    }

    if (bank_account_number && bank_name) {
      await connection.query(`
        INSERT INTO supplier_bank_details (bank_account_number, bank_name, ifsc_code, branch_name)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE bank_name=VALUES(bank_name), ifsc_code=VALUES(ifsc_code), branch_name=VALUES(branch_name)
      `, [bank_account_number, bank_name, ifsc_code || '', branch_name || '']);
    }

    const supplierId = await getNextId(connection, 'supplier', 'supplier_id');

    await connection.query(`
      INSERT INTO supplier (supplier_id, supplier_name, email, pincode, bank_account_number) 
      VALUES (?, ?, ?, ?, ?)
    `, [supplierId, supplier_name, email || null, pincode || null, bank_account_number || null]);

    if (phones && Array.isArray(phones) && phones.length > 0) {
      for (const phone of phones) {
        if (phone && phone.trim()) {
          await connection.query('INSERT INTO supplier_contact (supplier_id, phone) VALUES (?, ?)', [supplierId, phone.trim()]);
        }
      }
    }
    
    await connection.commit();
    res.status(201).json({ message: 'Supplier created successfully', supplier_id: supplierId });
  } catch (error) {
    await connection.rollback();
    console.error('createSupplier error:', error);
    res.status(500).json({ message: 'Error creating supplier', error: error.message });
  } finally {
    connection.release();
  }
};

export const updateSupplier = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { 
      supplier_name, email, phones, pincode, city, state,
      bank_account_number, bank_name, ifsc_code, branch_name 
    } = req.body;

    await connection.beginTransaction();

    if (pincode) {
      await connection.query(`
        INSERT INTO supplier_address (pincode, city, state) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE city=VALUES(city), state=VALUES(state)
      `, [pincode, city || 'City', state || 'State']);
    }

    if (bank_account_number && bank_name) {
      await connection.query(`
        INSERT INTO supplier_bank_details (bank_account_number, bank_name, ifsc_code, branch_name)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE bank_name=VALUES(bank_name), ifsc_code=VALUES(ifsc_code), branch_name=VALUES(branch_name)
      `, [bank_account_number, bank_name, ifsc_code || '', branch_name || '']);
    }

    const updates = [], values = [];
    if (supplier_name !== undefined) { updates.push('supplier_name = ?'); values.push(supplier_name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email || null); }
    if (pincode !== undefined) { updates.push('pincode = ?'); values.push(pincode || null); }
    if (bank_account_number !== undefined) { updates.push('bank_account_number = ?'); values.push(bank_account_number || null); }
    
    if (updates.length > 0) {
      values.push(id);
      await connection.query(`UPDATE supplier SET ${updates.join(', ')} WHERE supplier_id = ?`, values);
    }

    if (phones && Array.isArray(phones)) {
      await connection.query('DELETE FROM supplier_contact WHERE supplier_id = ?', [id]);
      for (const phone of phones) {
        if (phone && phone.trim()) {
          await connection.query('INSERT INTO supplier_contact (supplier_id, phone) VALUES (?, ?)', [id, phone.trim()]);
        }
      }
    }
    
    await connection.commit();
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('updateSupplier error:', error);
    res.status(500).json({ message: 'Error updating supplier', error: error.message });
  } finally {
    connection.release();
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM supplier WHERE supplier_id = ?', [id]);
    if (result.affectedRows > 0) return res.status(200).json({ message: 'Supplier deleted' });
    res.status(404).json({ message: 'Supplier not found' });
  } catch (error) {
    console.error('deleteSupplier error:', error);
    res.status(500).json({ message: 'Error deleting supplier' });
  }
};
