const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get admin notifications
router.get('/', adminProtect, async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 100'
    );
    return successResponse(res, { notifications });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return errorResponse(res, 'Error fetching notifications', 500);
  }
});

// Get unread count
router.get('/unread-count', adminProtect, async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM admin_notifications WHERE is_read = FALSE'
    );
    return successResponse(res, { count: result[0].count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return errorResponse(res, 'Error fetching count', 500);
  }
});

// Mark notification as read
router.put('/:id/read', adminProtect, async (req, res) => {
  try {
    await db.query(
      'UPDATE admin_notifications SET is_read = TRUE WHERE id = ?',
      [req.params.id]
    );
    return successResponse(res, null, 'Notification marked as read');
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return errorResponse(res, 'Error updating notification', 500);
  }
});

// Mark all as read
router.put('/mark-all-read', adminProtect, async (req, res) => {
  try {
    await db.query('UPDATE admin_notifications SET is_read = TRUE WHERE is_read = FALSE');
    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    console.error('Error marking all as read:', error);
    return errorResponse(res, 'Error updating notifications', 500);
  }
});

// Delete notification
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    await db.query('DELETE FROM admin_notifications WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Notification deleted');
  } catch (error) {
    console.error('Error deleting notification:', error);
    return errorResponse(res, 'Error deleting notification', 500);
  }
});

module.exports = router;
