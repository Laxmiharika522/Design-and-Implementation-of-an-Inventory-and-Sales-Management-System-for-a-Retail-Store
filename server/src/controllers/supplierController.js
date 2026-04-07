import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';
export const getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, sc.phone 
      FROM supplier s
      LEFT JOIN supplier_contact sc ON s.supplier_id = sc.supplier_id
    `);
    
    const suppliersMap = new Map();
    for (const row of rows) {
      if (!suppliersMap.has(row.supplier_id)) {
        suppliersMap.set(row.supplier_id, {
          supplier_id: row.supplier_id,
          supplier_name: row.supplier_name,
          email: row.email,
          SupplierContacts: []
        });
      }
      if (row.phone) {
        suppliersMap.get(row.supplier_id).SupplierContacts.push({
          supplier_id: row.supplier_id,
          phone: row.phone
        });
      }
    }
    
    res.json(Array.from(suppliersMap.values()));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers' });
  }
};

export const createSupplier = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { phones, supplier_name, email } = req.body;
    await connection.beginTransaction();

    const supplierId = await getNextId(connection, 'supplier', 'supplier_id');

    const [result] = await connection.query(`
      INSERT INTO supplier (supplier_id, supplier_name, email) 
      VALUES (?, ?, ?)
    `, [supplierId, supplier_name, email || null]);

    if (phones && phones.length > 0) {
      for (const phone of phones) {
        await connection.query('INSERT INTO supplier_contact (supplier_id, phone) VALUES (?, ?)', [supplierId, phone]);
      }
    }
    
    await connection.commit();
    const [supplier] = await pool.query('SELECT * FROM supplier WHERE supplier_id = ?', [supplierId]);
    res.status(201).json(supplier[0]);
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error creating supplier' });
  } finally {
    connection.release();
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, email } = req.body;
    const updates = [], values = [];
    if (supplier_name !== undefined) { updates.push('supplier_name = ?'); values.push(supplier_name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email || null); }
    
    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE supplier SET ${updates.join(', ')} WHERE supplier_id = ?`, values);
    }
    
    const [updated] = await pool.query('SELECT * FROM supplier WHERE supplier_id = ?', [id]);
    if (updated.length > 0) return res.json(updated[0]);
    res.status(404).json({ message: 'Supplier not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplier' });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM supplier WHERE supplier_id = ?', [id]);
    if (result.affectedRows > 0) return res.status(204).send();
    res.status(404).json({ message: 'Supplier not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier' });
  }
};
