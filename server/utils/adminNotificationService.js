const db = require('../config/database');

/**
 * Send notification to admin
 * @param {Object} params - Notification parameters
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type (payment, booking, support, plan, general)
 * @param {number} params.related_id - Related entity ID (optional)
 */
async function sendAdminNotification({ title, message, type = 'general', related_id = null }) {
  try {
    await db.query(
      'INSERT INTO admin_notifications (title, message, type, related_id) VALUES (?, ?, ?, ?)',
      [title, message, type, related_id]
    );
    console.log(`✅ Admin notification sent: ${title}`);
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
  }
}

module.exports = {
  sendAdminNotification
};
