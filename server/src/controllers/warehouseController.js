import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';
export const getAllWarehouses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        w.*,
        wa.city, wa.state
      FROM warehouse w
      LEFT JOIN warehouse_address wa ON w.pincode = wa.pincode
    `);
    
    const warehouses = rows.map(row => ({
      warehouse_id: row.warehouse_id,
      warehouse_manager: row.warehouse_manager,
      pincode: row.pincode,
      WarehouseAddress: row.city ? {
        pincode: row.pincode,
        city: row.city,
        state: row.state
      } : null
    }));
    
    res.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ message: 'Error fetching warehouses' });
  }
};

export const createWarehouse = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { warehouse_manager, pincode, city, state } = req.body;
    await connection.beginTransaction();

    if (pincode && city && state) {
      await connection.query(`
        INSERT INTO warehouse_address (pincode, city, state) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE city = VALUES(city), state = VALUES(state)
      `, [pincode, city, state]);
    }

    const nextWarehouseId = await getNextId(connection, 'warehouse', 'warehouse_id');
    const [result] = await connection.query(`
      INSERT INTO warehouse (warehouse_id, warehouse_manager, pincode) VALUES (?, ?, ?)
    `, [nextWarehouseId, warehouse_manager || null, pincode || null]);
    
    await connection.commit();
    const [warehouse] = await pool.query('SELECT * FROM warehouse WHERE warehouse_id = ?', [nextWarehouseId]);
    res.status(201).json(warehouse[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating warehouse:', error);
    res.status(500).json({ message: 'Error creating warehouse' });
  } finally {
    connection.release();
  }
};

export const updateWarehouse = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { warehouse_manager, pincode, city, state } = req.body;
    await connection.beginTransaction();

    if (pincode && city && state) {
      await connection.query(`
        INSERT INTO warehouse_address (pincode, city, state) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE city = VALUES(city), state = VALUES(state)
      `, [pincode, city, state]);
    }

    const updates = [], values = [];
    if (warehouse_manager !== undefined) { updates.push('warehouse_manager = ?'); values.push(warehouse_manager || null); }
    if (pincode !== undefined) { updates.push('pincode = ?'); values.push(pincode || null); }
    
    if (updates.length > 0) {
      values.push(id);
      await connection.query(`UPDATE warehouse SET ${updates.join(', ')} WHERE warehouse_id = ?`, values);
    }
    
    await connection.commit();
    
    const [rows] = await pool.query(`
      SELECT w.*, wa.city, wa.state 
      FROM warehouse w 
      LEFT JOIN warehouse_address wa ON w.pincode = wa.pincode 
      WHERE w.warehouse_id = ?
    `, [id]);
    
    if (rows.length > 0) {
      const row = rows[0];
      return res.json({
        ...row,
        WarehouseAddress: row.city ? { pincode: row.pincode, city: row.city, state: row.state } : null
      });
    }
    return res.status(404).json({ message: 'Warehouse not found' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating warehouse:', error);
    res.status(500).json({ message: 'Error updating warehouse' });
  } finally {
    connection.release();
  }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM warehouse WHERE warehouse_id = ?', [id]);
    if (result.affectedRows > 0) return res.status(204).send();
    return res.status(404).json({ message: 'Warehouse not found' });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({ message: 'Error deleting warehouse' });
  }
};
