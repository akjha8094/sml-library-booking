const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get all expenses
router.get('/', adminProtect, async (req, res) => {
  try {
    const [expenses] = await db.query(
      'SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC LIMIT 100'
    );
    return successResponse(res, { expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    return errorResponse(res, 'Error fetching expenses', 500);
  }
});

// Create expense
router.post('/', adminProtect, async (req, res) => {
  try {
    const { category, description, amount, expense_date } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO expenses (category, description, amount, expense_date) VALUES (?, ?, ?, ?)',
      [category, description, amount, expense_date || new Date()]
    );
    
    return successResponse(res, { id: result.insertId }, 'Expense added successfully', 201);
  } catch (error) {
    console.error('Create expense error:', error);
    return errorResponse(res, 'Error creating expense', 500);
  }
});

// Update expense
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const { category, description, amount, expense_date } = req.body;
    
    await db.query(
      'UPDATE expenses SET category = ?, description = ?, amount = ?, expense_date = ? WHERE id = ?',
      [category, description, amount, expense_date, req.params.id]
    );
    
    return successResponse(res, null, 'Expense updated successfully');
  } catch (error) {
    console.error('Update expense error:', error);
    return errorResponse(res, 'Error updating expense', 500);
  }
});

// Delete expense
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    await db.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Expense deleted successfully');
  } catch (error) {
    console.error('Delete expense error:', error);
    return errorResponse(res, 'Error deleting expense', 500);
  }
});

module.exports = router;
