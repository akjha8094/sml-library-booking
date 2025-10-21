const express = require('express');
const router = express.Router();
const { protect, adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get user's advance bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT ab.*, p.name as plan_name, p.price as plan_price, 
              s.seat_number, s.floor
       FROM advance_bookings ab
       LEFT JOIN plans p ON ab.plan_id = p.id
       LEFT JOIN seats s ON ab.seat_id = s.id
       WHERE ab.user_id = ?
       ORDER BY ab.created_at DESC`,
      [req.user.id]
    );
    return successResponse(res, { bookings });
  } catch (error) {
    console.error('Error fetching advance bookings:', error);
    return errorResponse(res, 'Error fetching bookings', 500);
  }
});

// Create advance booking
router.post('/', protect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      plan_id, seat_id, start_date, end_date, total_amount, notes
    } = req.body;

    // Check if seat is already booked for the date range
    if (seat_id) {
      const [existingBookings] = await connection.query(
        `SELECT id FROM advance_bookings 
         WHERE seat_id = ? 
         AND booking_status IN ('scheduled', 'active')
         AND ((start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?) 
              OR (start_date <= ? AND end_date >= ?))`,
        [seat_id, start_date, end_date, start_date, end_date, start_date, end_date]
      );

      if (existingBookings.length > 0) {
        await connection.rollback();
        return errorResponse(res, 'Seat already booked for selected dates', 400);
      }
    }

    const [result] = await connection.query(
      `INSERT INTO advance_bookings 
       (user_id, plan_id, seat_id, booking_date, start_date, end_date, total_amount, notes) 
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
      [req.user.id, plan_id, seat_id, start_date, end_date, total_amount, notes]
    );

    await connection.commit();
    return successResponse(res, { id: result.insertId }, 'Advance booking created successfully', 201);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating advance booking:', error);
    return errorResponse(res, 'Error creating booking', 500);
  } finally {
    connection.release();
  }
});

// Cancel advance booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const [bookings] = await db.query(
      'SELECT * FROM advance_bookings WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (bookings.length === 0) {
      return errorResponse(res, 'Booking not found', 404);
    }

    if (bookings[0].booking_status === 'cancelled') {
      return errorResponse(res, 'Booking already cancelled', 400);
    }

    await db.query(
      'UPDATE advance_bookings SET booking_status = "cancelled" WHERE id = ?',
      [req.params.id]
    );

    return successResponse(res, null, 'Booking cancelled successfully');
  } catch (error) {
    return errorResponse(res, 'Error cancelling booking', 500);
  }
});

// Admin: Get all advance bookings
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT ab.*, 
              u.name as user_name, u.email as user_email, u.mobile,
              p.name as plan_name, p.price as plan_price,
              s.seat_number, s.floor
       FROM advance_bookings ab
       LEFT JOIN users u ON ab.user_id = u.id
       LEFT JOIN plans p ON ab.plan_id = p.id
       LEFT JOIN seats s ON ab.seat_id = s.id
       ORDER BY ab.created_at DESC`
    );
    return successResponse(res, { bookings });
  } catch (error) {
    return errorResponse(res, 'Error fetching bookings', 500);
  }
});

// Admin: Update booking status
router.put('/admin/:id/status', adminProtect, async (req, res) => {
  try {
    const { booking_status, payment_status } = req.body;
    
    await db.query(
      `UPDATE advance_bookings 
       SET booking_status = ?, payment_status = ?
       WHERE id = ?`,
      [booking_status, payment_status, req.params.id]
    );

    return successResponse(res, null, 'Booking status updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating booking', 500);
  }
});

// Admin: Delete advance booking
router.delete('/admin/:id', adminProtect, async (req, res) => {
  try {
    await db.query('DELETE FROM advance_bookings WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Booking deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting booking', 500);
  }
});

module.exports = router;
