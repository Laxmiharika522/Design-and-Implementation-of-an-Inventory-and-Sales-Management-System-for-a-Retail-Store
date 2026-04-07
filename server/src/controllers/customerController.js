import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';
export const getAllCustomers = async (req, res) => {
  try {
    const [customers] = await pool.query(`
      SELECT 
        c.*,
        COALESCE(SUM(st.grand_total), 0) AS total_spent
      FROM customer c
      LEFT JOIN sales_transaction st ON st.customer_id = c.customer_id
      GROUP BY c.customer_id
    `);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { customer_name, email, phone, address, password } = req.body;
    
    // Check if email already exists
    if (email) {
      const [existing] = await pool.query('SELECT customer_id FROM customer WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const nextCustId = await getNextId(pool, 'customer', 'customer_id');
    const [result] = await pool.query(`
      INSERT INTO customer (customer_id, customer_name, email, phone, address, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nextCustId, customer_name, email || null, phone || null, address || null, password || null]);
    
    const [newCustomer] = await pool.query('SELECT * FROM customer WHERE customer_id = ?', [nextCustId]);
    res.status(201).json(newCustomer[0]);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, email, phone, address, password } = req.body;
    
    const updates = [];
    const values = [];
    
    if (customer_name !== undefined) { updates.push('customer_name = ?'); values.push(customer_name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (password !== undefined) { updates.push('password = ?'); values.push(password); }
    
    if (updates.length > 0) {
      values.push(id);
      const [result] = await pool.query(`
        UPDATE customer 
        SET ${updates.join(', ')}
        WHERE customer_id = ?
      `, values);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    }
    
    const [updatedCustomer] = await pool.query('SELECT * FROM customer WHERE customer_id = ?', [id]);
    if (updatedCustomer.length > 0) {
      return res.json(updatedCustomer[0]);
    }
    return res.status(404).json({ message: 'Customer not found' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer' });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM customer WHERE customer_id = ?', [id]);
    if (result.affectedRows > 0) {
      return res.status(204).send();
    }
    return res.status(404).json({ message: 'Customer not found' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
};
