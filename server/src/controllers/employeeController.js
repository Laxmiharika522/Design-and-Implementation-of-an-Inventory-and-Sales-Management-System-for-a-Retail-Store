import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import { getNextId } from '../utils/dbUtils.js';

export const getAllEmployees = async (req, res) => {
  try {
    const [employees] = await pool.query('SELECT employee_id, employee_name, email, role, phone_number, pincode FROM employee');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees' });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { password, employee_name, email, role, phone_number, pincode } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const nextEmpId = await getNextId(pool, 'employee', 'employee_id');
    const [result] = await pool.query(`
      INSERT INTO employee (employee_id, employee_name, email, password, role, phone_number, pincode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [nextEmpId, employee_name, email, hashedPassword, role || 'Cashier', phone_number || null, pincode || null]);
    
    res.status(201).json({ message: 'Employee created', employee_id: nextEmpId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating employee' });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_name, email, role, phone_number, pincode, password } = req.body;
    
    const updates = [];
    const values = [];
    
    if (employee_name !== undefined) { updates.push('employee_name = ?'); values.push(employee_name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (phone_number !== undefined) { updates.push('phone_number = ?'); values.push(phone_number); }
    if (pincode !== undefined) { updates.push('pincode = ?'); values.push(pincode); }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    
    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE employee SET ${updates.join(', ')} WHERE employee_id = ?`, values);
    }
    
    const [updated] = await pool.query('SELECT employee_id, employee_name, email, role, phone_number, pincode FROM employee WHERE employee_id = ?', [id]);
    if (updated.length > 0) return res.json(updated[0]);
    res.status(404).json({ message: 'Employee not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee' });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM employee WHERE employee_id = ?', [id]);
    if (result.affectedRows > 0) return res.status(204).send();
    res.status(404).json({ message: 'Employee not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee' });
  }
};

export const getEmployeeProfile = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT employee_id, employee_name, email, role, phone_number, pincode FROM employee WHERE employee_id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Employee not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const updateEmployeeProfile = async (req, res) => {
  try {
    const { employee_name, email, phone_number, pincode, city, state, password } = req.body;
    
    if (pincode) {
      await pool.query(`
        INSERT INTO employee_address (pincode, city, state) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE city=VALUES(city), state=VALUES(state)
      `, [pincode, city || 'Unknown', state || 'Unknown']);
    }

    const updates = [];
    const values = [];
    
    if (employee_name) { updates.push('employee_name = ?'); values.push(employee_name); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (phone_number) { updates.push('phone_number = ?'); values.push(phone_number); }
    if (pincode) { updates.push('pincode = ?'); values.push(pincode); }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    
    if (updates.length > 0) {
      values.push(req.user.id);
      await pool.query(`UPDATE employee SET ${updates.join(', ')} WHERE employee_id = ?`, values);
    }
    
    const [updated] = await pool.query('SELECT employee_id, employee_name, email, role, phone_number, pincode FROM employee WHERE employee_id = ?', [req.user.id]);
    if (updated.length > 0) return res.json(updated[0]);
    res.status(404).json({ message: 'Employee not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const [addresses] = await pool.query('SELECT * FROM employee_address');
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
};
