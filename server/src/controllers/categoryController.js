import pool from '../config/db.js';
import { getNextId } from '../utils/dbUtils.js';
export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    const nextCatId = await getNextId(pool, 'category', 'category_id');
    const [result] = await pool.query(`
      INSERT INTO category (category_id, category_name, description) VALUES (?, ?, ?)
    `, [nextCatId, category_name, description || null]);
    const [newCat] = await pool.query('SELECT * FROM category WHERE category_id = ?', [nextCatId]);
    res.status(201).json(newCat[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;
    const updates = [], values = [];
    if (category_name !== undefined) { updates.push('category_name = ?'); values.push(category_name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    
    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE category SET ${updates.join(', ')} WHERE category_id = ?`, values);
    }
    
    const [updatedCat] = await pool.query('SELECT * FROM category WHERE category_id = ?', [id]);
    if (updatedCat.length > 0) return res.json(updatedCat[0]);
    res.status(404).json({ message: 'Category not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM category WHERE category_id = ?', [id]);
    if (result.affectedRows > 0) return res.status(204).send();
    res.status(404).json({ message: 'Category not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
};
