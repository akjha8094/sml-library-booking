const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse, calculateEndDate } = require('../utils/helpers');
const { sendNotification } = require('../utils/notificationService');
const { sendAdminNotification } = require('../utils/adminNotificationService');

// Get user bookings
router.get('/', protect, async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT 
        b.*, 
        p.name as plan_name, 
        s.seat_number,
        py.status as payment_status,
        py.refund_status,
        py.id as payment_id
      FROM bookings b
      JOIN plans p ON b.plan_id = p.id
      JOIN seats s ON b.seat_id = s.id
      LEFT JOIN payments py ON py.booking_id = b.id AND py.status IN ('completed', 'refunded', 'partial_refund')
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    
    return successResponse(res, { bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return errorResponse(res, 'Error fetching bookings', 500);
  }
});

// Create booking
router.post('/', protect, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { plan_id, seat_id, start_date, final_amount, coupon_code, discount_amount } = req.body;
    const user_id = req.user.id;
    
    // Get plan details
    const [plans] = await connection.query('SELECT * FROM plans WHERE id = ? AND is_active = TRUE', [plan_id]);
    if (plans.length === 0) {
      throw new Error('Plan not found or inactive');
    }
    const plan = plans[0];
    
    // Check seat availability
    const [existingBookings] = await connection.query(
      'SELECT id FROM bookings WHERE seat_id = ? AND status = "active" AND end_date >= CURDATE()',
      [seat_id]
    );
    
    if (existingBookings.length > 0) {
      throw new Error('Seat is already booked');
    }
    
    // Calculate end date
    const booking_date = start_date;
    const end_date = calculateEndDate(start_date, plan.duration_days);
    const total_amount = parseFloat(plan.price);
    
    // Create booking
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (user_id, plan_id, seat_id, booking_date, start_date, end_date, total_amount, discount_amount, final_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [user_id, plan_id, seat_id, booking_date, start_date, end_date, total_amount, discount_amount || 0, final_amount]
    );
    
    const booking_id = bookingResult.insertId;
    
    // Update seat status to reserved
    await connection.query(
      'UPDATE seats SET seat_status = "reserved" WHERE id = ?',
      [seat_id]
    );
    
    await connection.commit();
    
    // Send notification to user about booking creation
    const [seatInfo] = await connection.query('SELECT seat_number FROM seats WHERE id = ?', [seat_id]);
    await sendNotification({
      user_id,
      title: '🎫 Booking Created',
      message: `Your booking for ${plan.name} - Seat ${seatInfo[0].seat_number} has been created. Complete payment to confirm.`,
      type: 'booking'
    });
    
    // Send notification to admin about new booking
    const [userInfo] = await connection.query('SELECT name, email FROM users WHERE id = ?', [user_id]);
    await sendAdminNotification({
      title: '🎫 New Seat Booking',
      message: `${userInfo[0].name} (${userInfo[0].email}) booked ${plan.name} - Seat ${seatInfo[0].seat_number} for ₹${final_amount}`,
      type: 'booking',
      related_id: booking_id
    });
    
    return successResponse(res, { 
      id: booking_id,
      booking_id, 
      amount: final_amount 
    }, 'Booking created successfully', 201);
    
  } catch (error) {
    await connection.rollback();
    console.error('Booking error:', error);
    return errorResponse(res, error.message || 'Error creating booking', 500);
  } finally {
    connection.release();
  }
});

module.exports = router;
