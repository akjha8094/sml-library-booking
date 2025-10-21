const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');
const { sendNotification } = require('../utils/notificationService');
const { sendAdminNotification } = require('../utils/adminNotificationService');

// Process payment
router.post('/process', protect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { booking_id, amount, payment_gateway, payment_response } = req.body;
    const user_id = req.user.id;
    
    // Get booking details
    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [booking_id, user_id]
    );
    
    if (bookings.length === 0) {
      throw new Error('Booking not found');
    }
    
    const booking = bookings[0];
    
    // Handle wallet payment
    if (payment_gateway === 'wallet') {
      // Get current wallet balance
      const [users] = await connection.query(
        'SELECT wallet_balance FROM users WHERE id = ?',
        [user_id]
      );
      
      const currentBalance = parseFloat(users[0].wallet_balance);
      const paymentAmount = parseFloat(amount);
      
      if (currentBalance < paymentAmount) {
        throw new Error(`Insufficient wallet balance. Available: ₹${currentBalance}, Required: ₹${paymentAmount}`);
      }
      
      // Deduct from wallet
      const newBalance = currentBalance - paymentAmount;
      await connection.query(
        'UPDATE users SET wallet_balance = ? WHERE id = ?',
        [newBalance, user_id]
      );
      
      // Create wallet transaction record
      await connection.query(
        `INSERT INTO wallet_transactions 
         (user_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          'debit',
          paymentAmount,
          currentBalance,
          newBalance,
          `Payment for booking #${booking_id}`,
          'booking',
          booking_id
        ]
      );
    }
    
    // Create payment record
    const [paymentResult] = await connection.query(
      `INSERT INTO payments (booking_id, user_id, transaction_id, payment_gateway, amount, status, payment_date, gateway_response)
       VALUES (?, ?, ?, ?, ?, 'completed', NOW(), ?)`,
      [
        booking_id,
        user_id,
        payment_response.transaction_id,
        payment_gateway,
        amount,
        JSON.stringify(payment_response)
      ]
    );
    
    // Update booking status to active
    await connection.query(
      'UPDATE bookings SET status = "active" WHERE id = ?',
      [booking_id]
    );
    
    // Update seat status to occupied
    await connection.query(
      'UPDATE seats SET seat_status = "occupied" WHERE id = ?',
      [booking.seat_id]
    );
    
    await connection.commit();
    
    // Send notification to user about successful payment
    const [planInfo] = await connection.query(
      'SELECT p.name, s.seat_number FROM bookings b JOIN plans p ON b.plan_id = p.id JOIN seats s ON b.seat_id = s.id WHERE b.id = ?',
      [booking_id]
    );
    
    const paymentMethod = payment_gateway === 'wallet' ? 'Wallet' : payment_gateway;
    await sendNotification({
      user_id,
      title: '✅ Payment Successful',
      message: `Payment of ₹${amount} completed via ${paymentMethod} for ${planInfo[0].name} - Seat ${planInfo[0].seat_number}. Your booking is now active!`,
      type: 'payment'
    });
    
    // Send notification to admin about new payment
    const [userInfo] = await connection.query('SELECT name, email FROM users WHERE id = ?', [user_id]);
    await sendAdminNotification({
      title: '💰 New Payment Received',
      message: `${userInfo[0].name} (${userInfo[0].email}) paid ₹${amount} via ${paymentMethod} for ${planInfo[0].name} - Seat ${planInfo[0].seat_number}`,
      type: 'payment',
      related_id: paymentResult.insertId
    });
    
    return successResponse(res, { payment_id: paymentResult.insertId }, 'Payment processed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('Payment processing error:', error);
    return errorResponse(res, error.message || 'Error processing payment', 500);
  } finally {
    connection.release();
  }
});

// Admin: Get all payments
router.get('/', adminProtect, async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT p.*, u.name as user_name, u.email, b.id as booking_id
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN bookings b ON p.booking_id = b.id
      ORDER BY p.payment_date DESC
      LIMIT 100
    `);
    return successResponse(res, { payments });
  } catch (error) {
    return errorResponse(res, 'Error fetching payments', 500);
  }
});

// Admin: Process refund
router.post('/:id/refund', adminProtect, async (req, res) => {
  try {
    const { refund_amount, refund_reason } = req.body;
    await db.query(
      'UPDATE payments SET status = "refunded", refund_amount = ?, refund_reason = ? WHERE id = ?',
      [refund_amount, refund_reason, req.params.id]
    );
    return successResponse(res, null, 'Refund processed successfully');
  } catch (error) {
    return errorResponse(res, 'Error processing refund', 500);
  }
});

module.exports = router;
