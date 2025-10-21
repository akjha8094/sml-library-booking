const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');
const upload = require('../middleware/upload');

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, mobile, dob, gender, profile_image, wallet_balance, referral_code, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    return successResponse(res, { user: users[0] });
  } catch (error) {
    return errorResponse(res, 'Error fetching profile', 500);
  }
});

// Update user profile
router.put('/profile', protect, upload.single('profile_image'), async (req, res) => {
  try {
    const { name, dob, gender } = req.body;
    const updates = { name, dob, gender };
    
    if (req.file) {
      updates.profile_image = req.file.path;
    }
    
    await db.query(
      'UPDATE users SET name = ?, dob = ?, gender = ?, profile_image = COALESCE(?, profile_image) WHERE id = ?',
      [name, dob, gender, updates.profile_image, req.user.id]
    );
    
    return successResponse(res, null, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating profile', 500);
  }
});

// Get user notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE (user_id = ? OR send_to_all = TRUE) ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    
    return successResponse(res, { notifications });
  } catch (error) {
    return errorResponse(res, 'Error fetching notifications', 500);
  }
});

// Mark notification as read
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    return successResponse(res, null, 'Notification marked as read');
  } catch (error) {
    return errorResponse(res, 'Error updating notification', 500);
  }
});

module.exports = router;
