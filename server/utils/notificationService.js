const db = require('../config/database');

/**
 * Send notification to user(s)
 * @param {Object} params - Notification parameters
 * @param {number|null} params.user_id - User ID (null for send_to_all)
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type (general, booking, payment, offer, reminder, support)
 * @param {boolean} params.send_to_all - Send to all users
 */
async function sendNotification({ user_id = null, title, message, type = 'general', send_to_all = false }) {
  try {
    if (send_to_all) {
      await db.query(
        'INSERT INTO notifications (title, message, type, send_to_all) VALUES (?, ?, ?, TRUE)',
        [title, message, type]
      );
    } else if (user_id) {
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [user_id, title, message, type]
      );
    }
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * Send notification to multiple users
 */
async function sendBulkNotifications({ user_ids, title, message, type = 'general' }) {
  try {
    const values = user_ids.map(user_id => [user_id, title, message, type]);
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ?',
      [values]
    );
    return true;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    return false;
  }
}

module.exports = {
  sendNotification,
  sendBulkNotifications
};
