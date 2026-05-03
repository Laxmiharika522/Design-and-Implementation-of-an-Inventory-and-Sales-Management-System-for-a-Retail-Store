import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';
export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.product_id, p.product_name, p.barcode, p.unit_price, p.category_id, p.supplier_id, p.hsn_code, p.image_url,
        c.category_name AS 'Category.category_name',
        s.supplier_name AS 'Supplier.supplier_name',
        i.current_stock AS 'Inventory.current_stock',
        i.expiry_date AS 'Inventory.expiry_date'
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN supplier s ON p.supplier_id = s.supplier_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      ORDER BY p.product_name ASC
    `);

    // Map flat SQL JOIN rows into nested JSON objects
    const products = rows.map(row => ({
      product_id: row.product_id,
      product_name: row.product_name,
      barcode: row.barcode,
      unit_price: row.unit_price,
      category_id: row.category_id,
      supplier_id: row.supplier_id,
      hsn_code: row.hsn_code,
      image_url: row.image_url,
      Category: row['Category.category_name'] ? { category_name: row['Category.category_name'] } : null,
      Supplier: row['Supplier.supplier_name'] ? { supplier_name: row['Supplier.supplier_name'] } : null,
      Inventory: row['Inventory.current_stock'] !== null ? { 
        current_stock: row['Inventory.current_stock'], 
        expiry_date: row['Inventory.expiry_date'] 
      } : null
    }));

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const createProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { expiry_date, product_name, barcode, unit_price, category_id, supplier_id, hsn_code, image_url } = req.body;
    
    await connection.beginTransaction();

    const productId = await getNextId(connection, 'product', 'product_id');

    const [result] = await connection.query(`
      INSERT INTO product (product_id, product_name, barcode, unit_price, category_id, supplier_id, hsn_code, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [productId, product_name, barcode || null, unit_price, category_id, supplier_id || null, hsn_code || null, image_url || null]);

    const inventoryId = await getNextId(connection, 'inventory', 'inventory_id');

    await connection.query(`
      INSERT INTO inventory (inventory_id, product_id, current_stock, expiry_date)
      VALUES (?, ?, 0, ?)
    `, [inventoryId, productId, expiry_date || null]);

    await connection.commit();

    const [newProduct] = await pool.query('SELECT * FROM product WHERE product_id = ?', [productId]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Create Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        message: 'Duplicate entry: Ensure unique values like barcode.', 
        error: error.message 
      });
    }
    res.status(500).json({ message: 'Error creating product', error: error.message });
  } finally {
    connection.release();
  }
};

export const updateProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { expiry_date, product_name, barcode, unit_price, category_id, supplier_id, hsn_code, image_url } = req.body;
    
    await connection.beginTransaction();

    // Dynamically build UPDATE query for product
    const updates = [];
    const values = [];
    
    if (product_name !== undefined) { updates.push('product_name = ?'); values.push(product_name); }
    if (barcode !== undefined) { updates.push('barcode = ?'); values.push(barcode || null); }
    if (unit_price !== undefined) { updates.push('unit_price = ?'); values.push(unit_price); }
    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
    if (supplier_id !== undefined) { updates.push('supplier_id = ?'); values.push(supplier_id || null); }
    if (hsn_code !== undefined) { updates.push('hsn_code = ?'); values.push(hsn_code || null); }
    if (image_url !== undefined) { updates.push('image_url = ?'); values.push(image_url || null); }

    if (updates.length > 0) {
      values.push(id);
      await connection.query(`
        UPDATE product 
        SET ${updates.join(', ')}
        WHERE product_id = ?
      `, values);
    }

    if (expiry_date !== undefined) {
      const [invRows] = await connection.query('SELECT inventory_id FROM inventory WHERE product_id = ?', [id]);
      if (invRows.length > 0) {
        await connection.query(`
          UPDATE inventory SET expiry_date = ? WHERE product_id = ?
        `, [expiry_date || null, id]);
      } else {
        const inventoryId = await getNextId(connection, 'inventory', 'inventory_id');
        await connection.query(`
          INSERT INTO inventory (inventory_id, product_id, current_stock, expiry_date)
          VALUES (?, ?, 0, ?)
        `, [inventoryId, id, expiry_date || null]);
      }
    }

    await connection.commit();

    const [rows] = await pool.query(`
      SELECT 
        p.product_id, p.product_name, p.barcode, p.unit_price, p.category_id, p.supplier_id, p.hsn_code, p.image_url,
        c.category_name AS 'Category.category_name',
        s.supplier_name AS 'Supplier.supplier_name',
        i.current_stock AS 'Inventory.current_stock',
        i.expiry_date AS 'Inventory.expiry_date'
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN supplier s ON p.supplier_id = s.supplier_id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      WHERE p.product_id = ?
    `, [id]);

    if (rows.length > 0) {
      const row = rows[0];
      const updatedProduct = {
        product_id: row.product_id,
        product_name: row.product_name,
        barcode: row.barcode,
        unit_price: row.unit_price,
        category_id: row.category_id,
        supplier_id: row.supplier_id,
        hsn_code: row.hsn_code,
        image_url: row.image_url,
        Category: row['Category.category_name'] ? { category_name: row['Category.category_name'] } : null,
        Supplier: row['Supplier.supplier_name'] ? { supplier_name: row['Supplier.supplier_name'] } : null,
        Inventory: row['Inventory.current_stock'] !== null ? { 
          current_stock: row['Inventory.current_stock'], 
          expiry_date: row['Inventory.expiry_date'] 
        } : null
      };
      return res.json(updatedProduct);
    }

    return res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    await connection.rollback();
    console.error('Update Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Duplicate entry: Barcode must be unique.', error: error.message });
    }
    res.status(500).json({ message: 'Error updating product', error: error.message });
  } finally {
    connection.release();
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM product WHERE product_id = ?', [id]);
    if (result.affectedRows > 0) {
      return res.status(204).send();
    }
    return res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

export const getHSNCodes = async (req, res) => {
  try {
    const [codes] = await pool.query('SELECT * FROM hsn_tax ORDER BY hsn_code ASC');
    res.json(codes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching HSN codes' });
  }
};
