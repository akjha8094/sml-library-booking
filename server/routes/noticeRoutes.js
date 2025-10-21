const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');
const { sendNotification } = require('../utils/notificationService');

// Get all notices (public - for users)
router.get('/', async (req, res) => {
  try {
    const [notices] = await db.query(
      'SELECT * FROM notices WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 10'
    );
    return successResponse(res, { notices });
  } catch (error) {
    console.error('Get notices error:', error);
    return errorResponse(res, 'Error fetching notices', 500);
  }
});

// Admin: Get all notices (including inactive)
router.get('/admin', adminProtect, async (req, res) => {
  try {
    const [notices] = await db.query(
      'SELECT * FROM notices ORDER BY created_at DESC'
    );
    return successResponse(res, { notices });
  } catch (error) {
    console.error('Get admin notices error:', error);
    return errorResponse(res, 'Error fetching notices', 500);
  }
});

// Admin: Create notice
router.post('/', adminProtect, async (req, res) => {
  try {
    const { title, content, is_active } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO notices (title, content, is_active) VALUES (?, ?, ?)',
      [title, content, is_active !== undefined ? is_active : true]
    );
    
    // Send notification to all users about new notice
    if (is_active !== false) {
      await sendNotification({
        send_to_all: true,
        title: `📢 New Notice: ${title}`,
        message: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        type: 'general'
      });
    }
    
    return successResponse(res, { id: result.insertId }, 'Notice created successfully', 201);
  } catch (error) {
    console.error('Create notice error:', error);
    return errorResponse(res, 'Error creating notice', 500);
  }
});

// Admin: Update notice
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const { title, content, is_active } = req.body;
    
    await db.query(
      'UPDATE notices SET title = ?, content = ?, is_active = ? WHERE id = ?',
      [title, content, is_active, req.params.id]
    );
    
    return successResponse(res, null, 'Notice updated successfully');
  } catch (error) {
    console.error('Update notice error:', error);
    return errorResponse(res, 'Error updating notice', 500);
  }
});

// Admin: Delete notice
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    await db.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Notice deleted successfully');
  } catch (error) {
    console.error('Delete notice error:', error);
    return errorResponse(res, 'Error deleting notice', 500);
  }
});

module.exports = router;
