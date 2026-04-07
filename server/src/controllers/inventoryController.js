import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';
export const getAllInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.*,
        p.product_name, p.barcode,
        pr.reorder_level
      FROM inventory i
      LEFT JOIN product p ON i.product_id = p.product_id
      LEFT JOIN product_reorder pr ON p.product_id = pr.product_id AND i.warehouse_id = pr.warehouse_id
    `);

    const result = rows.map(row => {
      const { product_name, barcode, reorder_level, ...inventoryData } = row;
      return {
        ...inventoryData,
        Product: { product_name, barcode },
        reorder_level: reorder_level ?? 10
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching inventory' });
  }
};

export const adjustStock = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const employee_id = req.user.id;
    const { product_id, adjustment_type, quantity_adjusted, reason } = req.body;

    await connection.beginTransaction();

    const [inventories] = await connection.query('SELECT * FROM inventory WHERE product_id = ? LIMIT 1', [product_id]);
    if (inventories.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Inventory record not found' });
    }
    const inventory = inventories[0];

    let newStock = inventory.current_stock;
    let updateFields = '';
    let updateParams = [];

    if (adjustment_type === 'IN') {
      newStock += quantity_adjusted;
      updateFields = 'current_stock = ?, stock_in = stock_in + ?';
      updateParams = [newStock, quantity_adjusted, inventory.inventory_id];
    } else {
      newStock -= quantity_adjusted;
      updateFields = 'current_stock = ?, stock_out = stock_out + ?';
      updateParams = [newStock, quantity_adjusted, inventory.inventory_id];
    }

    if (newStock < 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Adjustment results in negative stock' });
    }

    // Update inventory
    await connection.query(`UPDATE inventory SET ${updateFields} WHERE inventory_id = ?`, updateParams);
    
    // Create stock adjustment
    const adjId = await getNextId(connection, 'stock_adjustment', 'adjustment_id');
    const [adjResult] = await connection.query(`
      INSERT INTO stock_adjustment (adjustment_id, product_id, employee_id, adjustment_type, quantity_adjusted, reason, adjustment_date)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [adjId, product_id, employee_id, adjustment_type, quantity_adjusted, reason || null]);

    await connection.commit();

    const [updatedInventory] = await pool.query('SELECT * FROM inventory WHERE inventory_id = ?', [inventory.inventory_id]);
    const [newAdjustment] = await pool.query('SELECT * FROM stock_adjustment WHERE adjustment_id = ?', [adjId]);

    res.json({ message: 'Stock adjusted successfully', inventory: updatedInventory[0], adjustment: newAdjustment[0] });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error adjusting stock' });
  } finally {
    connection.release();
  }
};

export const updateReorderLevel = async (req, res) => {
  try {
    const { product_id, warehouse_id, reorder_level } = req.body;
    console.log(`Updating reorder level: Product ${product_id}, Warehouse ${warehouse_id}, Level ${reorder_level}`);
    
    // ON DUPLICATE KEY UPDATE handles findOrCreate securely in raw MySQL
    await pool.query(`
      INSERT INTO product_reorder (product_id, warehouse_id, reorder_level)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE reorder_level = VALUES(reorder_level)
    `, [product_id, warehouse_id, reorder_level]);

    const [reorder] = await pool.query(
      'SELECT * FROM product_reorder WHERE product_id = ? AND warehouse_id = ?', 
      [product_id, warehouse_id]
    );

    res.json({ message: 'Reorder level updated successfully', reorder: reorder[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating reorder level' });
  }
};
