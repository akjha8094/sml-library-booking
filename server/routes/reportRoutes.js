const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get reports/analytics
router.get('/', adminProtect, async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let userDateCondition = '';
    let bookingDateCondition = '';
    let paymentDateCondition = '';
    
    switch(period) {
      case 'today':
        userDateCondition = 'DATE(created_at) = CURDATE()';
        bookingDateCondition = 'DATE(created_at) = CURDATE()';
        paymentDateCondition = 'DATE(payment_date) = CURDATE()';
        break;
      case 'week':
        userDateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        bookingDateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        paymentDateCondition = 'payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        break;
      case 'month':
        userDateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        bookingDateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        paymentDateCondition = 'payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        break;
      case 'year':
        userDateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
        bookingDateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
        paymentDateCondition = 'payment_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
        break;
      default:
        userDateCondition = '1=1';
        bookingDateCondition = '1=1';
        paymentDateCondition = '1=1';
    }
    
    // Total Users
    const [totalUsers] = await db.query(
      `SELECT COUNT(*) as count FROM users WHERE ${userDateCondition}`
    );
    
    // Total Bookings
    const [totalBookings] = await db.query(
      `SELECT COUNT(*) as count FROM bookings WHERE ${bookingDateCondition}`
    );
    
    // Total Revenue
    const [totalRevenue] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE status = 'completed' AND ${paymentDateCondition}`
    );
    
    // Active Members
    const [activeMembers] = await db.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM bookings WHERE status = 'active'`
    );
    
    // Available Seats
    const [availableSeats] = await db.query(
      `SELECT COUNT(*) as count FROM seats WHERE seat_status = 'available'`
    );
    
    // Occupied Seats
    const [occupiedSeats] = await db.query(
      `SELECT COUNT(*) as count FROM seats WHERE seat_status = 'occupied'`
    );
    
    // Recent bookings trend (last 7 days)
    const [bookingTrend] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM bookings 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    
    // Revenue trend (last 7 days)
    const [revenueTrend] = await db.query(`
      SELECT DATE(payment_date) as date, SUM(amount) as total 
      FROM payments 
      WHERE status = 'completed' AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(payment_date)
      ORDER BY date ASC
    `);
    
    return successResponse(res, {
      stats: {
        totalUsers: totalUsers[0].count,
        totalBookings: totalBookings[0].count,
        revenue: parseFloat(totalRevenue[0].revenue || 0).toFixed(2),
        activeMembers: activeMembers[0].count,
        availableSeats: availableSeats[0].count,
        occupiedSeats: occupiedSeats[0].count
      },
      trends: {
        bookings: bookingTrend,
        revenue: revenueTrend
      },
      period
    });
  } catch (error) {
    console.error('Reports error:', error);
    return errorResponse(res, 'Error fetching reports', 500);
  }
});

module.exports = router;
