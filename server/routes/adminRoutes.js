const express = require('express');
const router = express.Router();
const { adminProtect, authorize } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get dashboard statistics
router.get('/dashboard', adminProtect, async (req, res) => {
  try {
    // Total members
    const [totalMembers] = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Active members
    const [activeMembers] = await db.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM bookings WHERE status = "active" AND end_date >= CURDATE()'
    );
    
    // Total expired members
    const [totalExpired] = await db.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM bookings WHERE status = "expired" OR (status = "active" AND end_date < CURDATE())'
    );
    
    // Expiring soon (1-3 days)
    const [expiring1_3] = await db.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM bookings WHERE status = "active" AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)'
    );
    
    // Expiring soon (4-7 days)
    const [expiring4_7] = await db.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM bookings WHERE status = "active" AND end_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 4 DAY) AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)'
    );
    
    // Expiring soon (8-15 days)
    const [expiring8_15] = await db.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM bookings WHERE status = "active" AND end_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 8 DAY) AND DATE_ADD(CURDATE(), INTERVAL 15 DAY)'
    );
    
    // Today's purchases
    const [todayPurchases] = await db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(final_amount), 0) as amount FROM bookings WHERE DATE(created_at) = CURDATE()'
    );
    
    // Last month collection
    const [lastMonthCollection] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as amount FROM payments WHERE status = "completed" AND MONTH(payment_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))'
    );
    
    // Today's birthdays
    const [todayBirthdays] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE DATE_FORMAT(dob, "%m-%d") = DATE_FORMAT(CURDATE(), "%m-%d")'
    );
    
    // Today's expense
    const [todayExpense] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as amount FROM expenses WHERE expense_date = CURDATE()'
    );
    
    // Last 3 months expense
    const [last3MonthsExpense] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as amount FROM expenses WHERE expense_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)'
    );
    
    return successResponse(res, {
      totalMembers: totalMembers[0].count,
      activeMembers: activeMembers[0].count,
      expiredMembers: {
        total: totalExpired[0].count,
        days1_3: expiring1_3[0].count,
        days4_7: expiring4_7[0].count,
        days8_15: expiring8_15[0].count
      },
      todayPurchases: {
        count: todayPurchases[0].count,
        amount: todayPurchases[0].amount
      },
      lastMonthCollection: lastMonthCollection[0].amount,
      todayBirthdays: todayBirthdays[0].count,
      todayExpense: todayExpense[0].amount,
      last3MonthsExpense: last3MonthsExpense[0].amount
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse(res, 'Error fetching dashboard data', 500);
  }
});

// Get all members
router.get('/members', adminProtect, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT u.*, (SELECT MAX(end_date) FROM bookings WHERE user_id = u.id) as last_booking_end FROM users u';
    const params = [];
    
    if (search) {
      query += ' WHERE (u.name LIKE ? OR u.email LIKE ? OR u.mobile LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY u.created_at DESC';
    
    const [members] = await db.query(query, params);
    return successResponse(res, { members });
  } catch (error) {
    return errorResponse(res, 'Error fetching members', 500);
  }
});

// Block/Unblock user
router.put('/members/:id/block', adminProtect, authorize('super_admin'), async (req, res) => {
  try {
    const { is_blocked } = req.body;
    await db.query('UPDATE users SET is_blocked = ? WHERE id = ?', [is_blocked, req.params.id]);
    return successResponse(res, null, `User ${is_blocked ? 'blocked' : 'unblocked'} successfully`);
  } catch (error) {
    return errorResponse(res, 'Error updating user status', 500);
  }
});

module.exports = router;
