import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

// Email domain rules per portal type
const DOMAIN_RULES = {
  admin:    '@admininventory.com',
  employee: '@inventory.com',
  supplier: '@logistics.com',
  customer: null, // any domain allowed
};

const validateEmailDomain = (email, userType) => {
  const required = DOMAIN_RULES[userType];
  if (!required) return true; // customers: any email OK
  return email.toLowerCase().endsWith(required);
};

export const login = async (req, res) => {
  try {
    const { email, password, userType = 'employee' } = req.body;

    // Enforce email domain rules silently
    if (!validateEmailDomain(email, userType)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let entity = null;
    let tokenPayload = {};
    let userResponse = {};

    if (userType === 'admin') {
      const [rows] = await pool.query('SELECT * FROM employee WHERE email = ?', [email]);
      entity = rows[0];
      if (!entity) return res.status(404).json({ message: 'User not found' });
      const isMatch = await bcrypt.compare(password, entity.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      
      if (entity.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin portal requires Admin role.' });
      }

      tokenPayload = { id: entity.employee_id, name: entity.employee_name, role: entity.role, userType: 'employee' };
      userResponse = { id: entity.employee_id, name: entity.employee_name, email: entity.email, role: entity.role, userType: 'employee' };

    } else if (userType === 'employee') {
      const [rows] = await pool.query('SELECT * FROM employee WHERE email = ?', [email]);
      entity = rows[0];
      if (!entity) return res.status(404).json({ message: 'User not found' });
      const isMatch = await bcrypt.compare(password, entity.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      if (entity.role !== 'Cashier') {
         return res.status(403).json({ message: 'Access denied. Employee portal requires Cashier role.' });
      }

      tokenPayload = { id: entity.employee_id, name: entity.employee_name, role: entity.role, userType: 'employee' };
      userResponse = { id: entity.employee_id, name: entity.employee_name, email: entity.email, role: entity.role, userType: 'employee' };

    } else if (userType === 'supplier') {
      const [rows] = await pool.query('SELECT * FROM supplier WHERE email = ?', [email]);
      entity = rows[0];
      if (!entity) return res.status(404).json({ message: 'Supplier not found' });
      if (!entity.password) return res.status(401).json({ message: 'Supplier account not set up for portal login.' });
      const isMatch = await bcrypt.compare(password, entity.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      tokenPayload = { id: entity.supplier_id, name: entity.supplier_name, role: 'Supplier', userType: 'supplier' };
      userResponse = { id: entity.supplier_id, name: entity.supplier_name, email: entity.email, role: 'Supplier', userType: 'supplier' };

    } else if (userType === 'customer') {
      const [rows] = await pool.query('SELECT * FROM customer WHERE email = ?', [email]);
      entity = rows[0];
      if (!entity) return res.status(404).json({ message: 'Customer not found' });
      if (!entity.password) return res.status(401).json({ message: 'Customer account not set up for portal login.' });
      const isMatch = await bcrypt.compare(password, entity.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      tokenPayload = { id: entity.customer_id, name: entity.customer_name, role: 'Customer', userType: 'customer' };
      userResponse = { id: entity.customer_id, name: entity.customer_name, email: entity.email, role: 'Customer', userType: 'customer' };

    } else {
      return res.status(400).json({ message: 'Invalid userType. Must be admin, employee, supplier, or customer.' });
    }

    const token = signToken(tokenPayload);
    res.json({ message: 'Login successful', token, user: userResponse });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, userType = 'employee' } = req.body;

    // Enforce email domain rules silently
    if (!validateEmailDomain(email, userType)) {
      return res.status(400).json({ message: 'Invalid email format for the selected role.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (userType === 'customer') {
      const [existing] = await pool.query('SELECT * FROM customer WHERE email = ?', [email]);
      if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });
      
      if (phone) {
        const [existingPhone] = await pool.query('SELECT * FROM customer WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) return res.status(400).json({ message: 'Phone number already registered' });
      }

      const nextCustomerId = await getNextId(pool, 'customer', 'customer_id');

      const [result] = await pool.query(`
        INSERT INTO customer (customer_id, customer_name, email, password, phone)
        VALUES (?, ?, ?, ?, ?)
      `, [nextCustomerId, name, email, hashedPassword, phone || null]);

      const token = signToken({ id: nextCustomerId, name, role: 'Customer', userType: 'customer' });
      return res.status(201).json({
        message: 'Customer registration successful', token,
        user: { id: nextCustomerId, name, email, role: 'Customer', userType: 'customer' }
      });
    }

    if (userType === 'supplier') {
      const [existing] = await pool.query('SELECT * FROM supplier WHERE email = ?', [email]);
      if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });
      const nextSupplierId = await getNextId(pool, 'supplier', 'supplier_id');
      const [result] = await pool.query(`
        INSERT INTO supplier (supplier_id, supplier_name, email, password)
        VALUES (?, ?, ?, ?)
      `, [nextSupplierId, name, email, hashedPassword]);
      
      const supplierId = nextSupplierId;
      if (phone) {
        await pool.query('INSERT INTO supplier_contact (supplier_id, phone) VALUES (?, ?)', [supplierId, phone]);
      }
      const token = signToken({ id: supplierId, name, role: 'Supplier', userType: 'supplier' });
      return res.status(201).json({
        message: 'Supplier registration successful', token,
        user: { id: supplierId, name, email, role: 'Supplier', userType: 'supplier' }
      });
    }

    const [existing] = await pool.query('SELECT * FROM employee WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });
    
    if (phone) {
      const [existingPhone] = await pool.query('SELECT * FROM employee WHERE phone_number = ?', [phone]);
      if (existingPhone.length > 0) return res.status(400).json({ message: 'Phone number already associated with an employee' });
    }

    const nextEmployeeId = await getNextId(pool, 'employee', 'employee_id');
    const [result] = await pool.query(`
      INSERT INTO employee (employee_id, employee_name, email, password, role, phone_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nextEmployeeId, name, email, hashedPassword, role || 'Cashier', phone || null]);

    const token = signToken({ id: nextEmployeeId, name, role: role || 'Cashier', userType: 'employee' });
    res.status(201).json({
      message: 'Registration successful', token,
      user: { id: nextEmployeeId, name, email, role: role || 'Cashier', userType: 'employee' }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const getMe = async (req, res) => {
  try {
    const { id, userType, role, name } = req.user;
    
    if (userType === 'employee') {
      const [rows] = await pool.query('SELECT employee_id, employee_name, email, role FROM employee WHERE employee_id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
      const entity = rows[0];
      return res.json({ id: entity.employee_id, name: entity.employee_name, email: entity.email, role: entity.role, userType: 'employee' });

    } else if (userType === 'supplier') {
      const [rows] = await pool.query('SELECT supplier_id, supplier_name, email FROM supplier WHERE supplier_id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Supplier not found' });
      const entity = rows[0];
      return res.json({ id: entity.supplier_id, name: entity.supplier_name, email: entity.email, role: 'Supplier', userType: 'supplier' });

    } else if (userType === 'customer') {
      const [rows] = await pool.query('SELECT customer_id, customer_name, email FROM customer WHERE customer_id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
      const entity = rows[0];
      return res.json({ id: entity.customer_id, name: entity.customer_name, email: entity.email, role: 'Customer', userType: 'customer' });
    }

    return res.json({ id, name, role, userType });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
