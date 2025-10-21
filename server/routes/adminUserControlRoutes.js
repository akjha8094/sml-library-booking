const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse, calculateEndDate } = require('../utils/helpers');
const { sendNotification } = require('../utils/notificationService');

// ============================================
// WALLET MANAGEMENT
// ============================================

// Get user wallet details
router.get('/:user_id/wallet', adminProtect, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, wallet_balance FROM users WHERE id = ?',
      [req.params.user_id]
    );
    
    if (users.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }
    
    const [transactions] = await db.query(
      'SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.params.user_id]
    );
    
    return successResponse(res, {
      user: users[0],
      transactions
    });
  } catch (error) {
    console.error('Error fetching wallet details:', error);
    return errorResponse(res, 'Error fetching wallet details', 500);
  }
});

// Add money to user wallet
router.post('/:user_id/wallet/credit', adminProtect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const user_id = req.params.user_id;
    const { amount, reason } = req.body;
    const admin_id = req.admin.id;
    
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    const creditAmount = parseFloat(amount);
    
    // Get current balance
    const [users] = await connection.query(
      'SELECT wallet_balance, name FROM users WHERE id = ?',
      [user_id]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const balanceBefore = parseFloat(users[0].wallet_balance);
    const balanceAfter = balanceBefore + creditAmount;
    
    // Update wallet balance
    await connection.query(
      'UPDATE users SET wallet_balance = ? WHERE id = ?',
      [balanceAfter, user_id]
    );
    
    // Create wallet transaction
    await connection.query(`
      INSERT INTO wallet_transactions (
        user_id, transaction_type, amount, balance_before, 
        balance_after, description, reference_type
      ) VALUES (?, 'credit', ?, ?, ?, ?, 'admin_credit')
    `, [
      user_id,
      creditAmount,
      balanceBefore,
      balanceAfter,
      reason || `Admin credited ₹${creditAmount} to wallet`
    ]);
    
    // Log admin action
    await connection.query(`
      INSERT INTO admin_action_logs (
        admin_id, action_type, target_user_id, 
        target_resource_type, target_resource_id, action_details
      ) VALUES (?, 'wallet_credit', ?, 'wallet', ?, ?)
    `, [
      admin_id,
      user_id,
      user_id,
      JSON.stringify({ amount: creditAmount, reason, balance_after: balanceAfter })
    ]);
    
    await connection.commit();
    
    // Send notification
    await sendNotification({
      user_id,
      title: '💰 Wallet Credited',
      message: `₹${creditAmount} has been added to your wallet by admin. ${reason ? 'Reason: ' + reason : ''}`,
      type: 'general'
    });
    
    return successResponse(res, {
      new_balance: balanceAfter,
      credited_amount: creditAmount
    }, 'Wallet credited successfully');
    
  } catch (error) {
    await connection.rollback();
    console.error('Wallet credit error:', error);
    return errorResponse(res, error.message || 'Error crediting wallet', 500);
  } finally {
    connection.release();
  }
});

// Deduct money from user wallet
router.post('/:user_id/wallet/debit', adminProtect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const user_id = req.params.user_id;
    const { amount, reason } = req.body;
    const admin_id = req.admin.id;
    
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    const debitAmount = parseFloat(amount);
    
    // Get current balance
    const [users] = await connection.query(
      'SELECT wallet_balance, name FROM users WHERE id = ?',
      [user_id]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const balanceBefore = parseFloat(users[0].wallet_balance);
    
    if (balanceBefore < debitAmount) {
      throw new Error('Insufficient wallet balance');
    }
    
    const balanceAfter = balanceBefore - debitAmount;
    
    // Update wallet balance
    await connection.query(
      'UPDATE users SET wallet_balance = ? WHERE id = ?',
      [balanceAfter, user_id]
    );
    
    // Create wallet transaction
    await connection.query(`
      INSERT INTO wallet_transactions (
        user_id, transaction_type, amount, balance_before, 
        balance_after, description, reference_type
      ) VALUES (?, 'debit', ?, ?, ?, ?, 'admin_credit')
    `, [
      user_id,
      debitAmount,
      balanceBefore,
      balanceAfter,
      reason || `Admin debited ₹${debitAmount} from wallet`
    ]);
    
    // Log admin action
    await connection.query(`
      INSERT INTO admin_action_logs (
        admin_id, action_type, target_user_id, 
        target_resource_type, target_resource_id, action_details
      ) VALUES (?, 'wallet_debit', ?, 'wallet', ?, ?)
    `, [
      admin_id,
      user_id,
      user_id,
      JSON.stringify({ amount: debitAmount, reason, balance_after: balanceAfter })
    ]);
    
    await connection.commit();
    
    // Send notification
    await sendNotification({
      user_id,
      title: '💳 Wallet Debited',
      message: `₹${debitAmount} has been deducted from your wallet by admin. ${reason ? 'Reason: ' + reason : ''}`,
      type: 'general'
    });
    
    return successResponse(res, {
      new_balance: balanceAfter,
      debited_amount: debitAmount
    }, 'Wallet debited successfully');
    
  } catch (error) {
    await connection.rollback();
    console.error('Wallet debit error:', error);
    return errorResponse(res, error.message || 'Error debiting wallet', 500);
  } finally {
    connection.release();
  }
});

// ============================================
// BOOKING MANAGEMENT
// ============================================

// Get user bookings
router.get('/:user_id/bookings', adminProtect, async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT b.*, 
             p.name as plan_name, 
             s.seat_number,
             pm.transaction_id, pm.amount as payment_amount, pm.status as payment_status
      FROM bookings b
      JOIN plans p ON b.plan_id = p.id
      JOIN seats s ON b.seat_id = s.id
      LEFT JOIN payments pm ON b.id = pm.booking_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [req.params.user_id]);
    
    return successResponse(res, { bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return errorResponse(res, 'Error fetching bookings', 500);
  }
});

// Extend booking
router.post('/:user_id/bookings/:booking_id/extend', adminProtect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { booking_id, user_id } = req.params;
    const { extend_days, reason } = req.body;
    const admin_id = req.admin.id;
    
    if (!extend_days || parseInt(extend_days) <= 0) {
      throw new Error('Invalid extension days');
    }
    
    // Get booking details
    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [booking_id, user_id]
    );
    
    if (bookings.length === 0) {
      throw new Error('Booking not found');
    }
    
    const booking = bookings[0];
    const oldEndDate = new Date(booking.end_date);
    const newEndDate = new Date(oldEndDate);
    newEndDate.setDate(newEndDate.getDate() + parseInt(extend_days));
    
    // Update booking
    await connection.query(
      'UPDATE bookings SET end_date = ? WHERE id = ?',
      [newEndDate.toISOString().split('T')[0], booking_id]
    );
    
    // Log modification
    await connection.query(`
      INSERT INTO booking_modifications (
        booking_id, modified_by, modification_type, 
        old_value, new_value, reason
      ) VALUES (?, ?, 'extend', ?, ?, ?)
    `, [
      booking_id,
      admin_id,
      JSON.stringify({ end_date: booking.end_date }),
      JSON.stringify({ end_date: newEndDate.toISOString().split('T')[0], extended_days: extend_days }),
      reason || 'Extended by admin'
    ]);
    
    // Log admin action
    await connection.query(`
      INSERT INTO admin_action_logs (
        admin_id, action_type, target_user_id, 
        target_resource_type, target_resource_id, action_details
      ) VALUES (?, 'booking_extend', ?, 'booking', ?, ?)
    `, [
      admin_id,
      user_id,
      booking_id,
      JSON.stringify({ extend_days, old_end_date: booking.end_date, new_end_date: newEndDate.toISOString().split('T')[0] })
    ]);
    
    await connection.commit();
    
    // Send notification
    await sendNotification({
      user_id,
      title: '📅 Booking Extended',
      message: `Your booking has been extended by ${extend_days} days. New end date: ${newEndDate.toLocaleDateString('en-IN')}`,
      type: 'booking'
    });
    
    return successResponse(res, {
      new_end_date: newEndDate.toISOString().split('T')[0],
      extended_days: extend_days
    }, 'Booking extended successfully');
    
  } catch (error) {
    await connection.rollback();
    console.error('Booking extension error:', error);
    return errorResponse(res, error.message || 'Error extending booking', 500);
  } finally {
    connection.release();
  }
});

// Change seat
router.post('/:user_id/bookings/:booking_id/change-seat', adminProtect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { booking_id, user_id } = req.params;
    const { new_seat_id, reason } = req.body;
    const admin_id = req.admin.id;
    
    // Get booking details
    const [bookings] = await connection.query(
      'SELECT b.*, s.seat_number as old_seat_number FROM bookings b JOIN seats s ON b.seat_id = s.id WHERE b.id = ? AND b.user_id = ?',
      [booking_id, user_id]
    );
    
    if (bookings.length === 0) {
      throw new Error('Booking not found');
    }
    
    const booking = bookings[0];
    
    // Check if new seat is available
    const [existingBookings] = await connection.query(
      'SELECT id FROM bookings WHERE seat_id = ? AND status = "active" AND id != ? AND end_date >= CURDATE()',
      [new_seat_id, booking_id]
    );
    
    if (existingBookings.length > 0) {
      throw new Error('New seat is already occupied');
    }
    
    // Get new seat details
    const [newSeats] = await connection.query(
      'SELECT seat_number FROM seats WHERE id = ?',
      [new_seat_id]
    );
    
    if (newSeats.length === 0) {
      throw new Error('New seat not found');
    }
    
    // Release old seat
    await connection.query(
      'UPDATE seats SET seat_status = "available" WHERE id = ?',
      [booking.seat_id]
    );
    
    // Update booking with new seat
    await connection.query(
      'UPDATE bookings SET seat_id = ? WHERE id = ?',
      [new_seat_id, booking_id]
    );
    
    // Occupy new seat
    await connection.query(
      'UPDATE seats SET seat_status = "occupied" WHERE id = ?',
      [new_seat_id]
    );
    
    // Log modification
    await connection.query(`
      INSERT INTO booking_modifications (
        booking_id, modified_by, modification_type, 
        old_value, new_value, reason
      ) VALUES (?, ?, 'seat_change', ?, ?, ?)
    `, [
      booking_id,
      admin_id,
      JSON.stringify({ seat_id: booking.seat_id, seat_number: booking.old_seat_number }),
      JSON.stringify({ seat_id: new_seat_id, seat_number: newSeats[0].seat_number }),
      reason || 'Seat changed by admin'
    ]);
    
    // Log admin action
    await connection.query(`
      INSERT INTO admin_action_logs (
        admin_id, action_type, target_user_id, 
        target_resource_type, target_resource_id, action_details
      ) VALUES (?, 'seat_change', ?, 'booking', ?, ?)
    `, [
      admin_id,
      user_id,
      booking_id,
      JSON.stringify({ 
        old_seat: booking.old_seat_number, 
        new_seat: newSeats[0].seat_number,
        reason 
      })
    ]);
    
    await connection.commit();
    
    // Send notification
    await sendNotification({
      user_id,
      title: '🪑 Seat Changed',
      message: `Your seat has been changed from ${booking.old_seat_number} to ${newSeats[0].seat_number}. ${reason ? 'Reason: ' + reason : ''}`,
      type: 'booking'
    });
    
    return successResponse(res, {
      old_seat: booking.old_seat_number,
      new_seat: newSeats[0].seat_number
    }, 'Seat changed successfully');
    
  } catch (error) {
    await connection.rollback();
    console.error('Seat change error:', error);
    return errorResponse(res, error.message || 'Error changing seat', 500);
  } finally {
    connection.release();
  }
});

// Cancel booking
router.post('/:user_id/bookings/:booking_id/cancel', adminProtect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { booking_id, user_id } = req.params;
    const { reason, process_refund } = req.body;
    const admin_id = req.admin.id;
    
    // Get booking details
    const [bookings] = await connection.query(
      'SELECT b.*, s.seat_number FROM bookings b JOIN seats s ON b.seat_id = s.id WHERE b.id = ? AND b.user_id = ?',
      [booking_id, user_id]
    );
    
    if (bookings.length === 0) {
      throw new Error('Booking not found');
    }
    
    const booking = bookings[0];
    
    // Update booking status
    await connection.query(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [booking_id]
    );
    
    // Release seat
    await connection.query(
      'UPDATE seats SET seat_status = "available" WHERE id = ?',
      [booking.seat_id]
    );
    
    // Log modification
    await connection.query(`
      INSERT INTO booking_modifications (
        booking_id, modified_by, modification_type, 
        old_value, new_value, reason
      ) VALUES (?, ?, 'cancel', ?, ?, ?)
    `, [
      booking_id,
      admin_id,
      JSON.stringify({ status: booking.status }),
      JSON.stringify({ status: 'cancelled' }),
      reason || 'Cancelled by admin'
    ]);
    
    // Log admin action
    await connection.query(`
      INSERT INTO admin_action_logs (
        admin_id, action_type, target_user_id, 
        target_resource_type, target_resource_id, action_details
      ) VALUES (?, 'booking_cancel', ?, 'booking', ?, ?)
    `, [
      admin_id,
      user_id,
      booking_id,
      JSON.stringify({ reason, seat_number: booking.seat_number })
    ]);
    
    // Process auto-refund if requested
    if (process_refund) {
      await connection.query('CALL process_auto_refund(?, "booking_cancel", ?)', 
        [booking_id, admin_id]
      );
    }
    
    await connection.commit();
    
    // Send notification
    await sendNotification({
      user_id,
      title: '❌ Booking Cancelled',
      message: `Your booking for seat ${booking.seat_number} has been cancelled by admin. ${reason ? 'Reason: ' + reason : ''}${process_refund ? ' Refund will be processed.' : ''}`,
      type: 'booking'
    });
    
    return successResponse(res, null, 'Booking cancelled successfully');
    
  } catch (error) {
    await connection.rollback();
    console.error('Booking cancellation error:', error);
    return errorResponse(res, error.message || 'Error cancelling booking', 500);
  } finally {
    connection.release();
  }
});

module.exports = router;
