const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Admin: Send notification
router.post('/', adminProtect, async (req, res) => {
  try {
    const { user_id, title, message, type, send_to_all } = req.body;
    
    if (send_to_all) {
      await db.query(
        'INSERT INTO notifications (title, message, type, send_to_all) VALUES (?, ?, ?, TRUE)',
        [title, message, type]
      );
    } else {
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [user_id, title, message, type]
      );
    }
    
    return successResponse(res, null, 'Notification sent successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Error sending notification', 500);
  }
});

// Admin: Get all notifications
router.get('/', adminProtect, async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100'
    );
    return successResponse(res, { notifications });
  } catch (error) {
    return errorResponse(res, 'Error fetching notifications', 500);
  }
});

module.exports = router;
