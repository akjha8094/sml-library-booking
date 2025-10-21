const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');
const { sendNotification } = require('../utils/notificationService');

// Get all plans
router.get('/', async (req, res) => {
  try {
    const [plans] = await db.query('SELECT * FROM plans WHERE is_active = TRUE ORDER BY price ASC');
    return successResponse(res, { plans });
  } catch (error) {
    return errorResponse(res, 'Error fetching plans', 500);
  }
});

// Get plan by ID
router.get('/:id', async (req, res) => {
  try {
    const [plans] = await db.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);
    if (plans.length === 0) {
      return errorResponse(res, 'Plan not found', 404);
    }
    return successResponse(res, { plan: plans[0] });
  } catch (error) {
    return errorResponse(res, 'Error fetching plan', 500);
  }
});

// Admin: Create plan
router.post('/', adminProtect, async (req, res) => {
  try {
    const { name, description, price, duration_days, plan_type, shift_type, shift_start_time, shift_end_time } = req.body;
    const [result] = await db.query(
      'INSERT INTO plans (name, description, price, duration_days, plan_type, shift_type, shift_start_time, shift_end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, duration_days, plan_type, shift_type, shift_start_time, shift_end_time]
    );
    
    // Send notification to all users about new plan
    await sendNotification({
      send_to_all: true,
      title: `🎯 New Plan Available: ${name}`,
      message: `${description} - Starting at ₹${price} for ${duration_days} days. Check it out now!`,
      type: 'general'
    });
    
    return successResponse(res, { id: result.insertId }, 'Plan created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Error creating plan', 500);
  }
});

// Admin: Update plan
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const { name, description, price, duration_days, plan_type, shift_type, shift_start_time, shift_end_time, is_active } = req.body;
    await db.query(
      'UPDATE plans SET name = ?, description = ?, price = ?, duration_days = ?, plan_type = ?, shift_type = ?, shift_start_time = ?, shift_end_time = ?, is_active = ? WHERE id = ?',
      [name, description, price, duration_days, plan_type, shift_type, shift_start_time, shift_end_time, is_active, req.params.id]
    );
    return successResponse(res, null, 'Plan updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating plan', 500);
  }
});

// Admin: Delete plan
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    await db.query('DELETE FROM plans WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Plan deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting plan', 500);
  }
});

module.exports = router;
