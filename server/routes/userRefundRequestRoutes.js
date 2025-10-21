const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect } = require('../middleware/auth');
const { promisify } = require('util');

const query = promisify(db.query).bind(db);

// @route   POST /api/user-refund-requests
// @desc    Create a new refund request
// @access  Private (User)
router.post('/', protect, async (req, res) => {
  const connection = await db.promise();
  
  try {
    const { 
      booking_id, 
      request_type, 
      reason, 
      description, 
      refund_method = 'wallet' 
    } = req.body;
    
    const user_id = req.user.id;

    console.log('Refund request received:', { booking_id, request_type, reason, user_id });

    // Validate input
    if (!booking_id || !request_type || !reason) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Booking ID, request type, and reason are required'
      });
    }

    // Check if booking belongs to user
    const [bookingRows] = await connection.query(
      `SELECT b.*, p.id as payment_id, p.amount, p.status as payment_status, p.refund_status
       FROM bookings b
       LEFT JOIN payments p ON p.booking_id = b.id
       WHERE b.id = ? AND b.user_id = ?`,
      [booking_id, user_id]
    );

    if (bookingRows.length === 0) {
      console.log('Booking not found or does not belong to user');
      return res.status(404).json({
        success: false,
        message: 'Booking not found or does not belong to you'
      });
    }

    const booking = bookingRows[0];
    console.log('Booking found:', { id: booking.id, payment_id: booking.payment_id, amount: booking.final_amount });

    // Use final_amount from booking if payment doesn't exist
    const refundAmount = booking.amount || booking.final_amount || 0;
    
    if (refundAmount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No payment amount found for this booking'
      });
    }

    // Check if already fully refunded
    if (booking.refund_status === 'full') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been fully refunded'
      });
    }

    // Check if there's already a pending request for this booking
    const [existingRequests] = await connection.query(
      `SELECT id FROM user_refund_requests 
       WHERE booking_id = ? AND user_id = ? AND status IN ('pending', 'under_review')
       LIMIT 1`,
      [booking_id, user_id]
    );

    if (existingRequests.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending refund request for this booking'
      });
    }

    // Calculate expected refund amount based on cancellation policy
    let expected_amount = parseFloat(refundAmount);
    const daysUntilStart = Math.floor((new Date(booking.start_date) - new Date()) / (1000 * 60 * 60 * 24));

    if (request_type === 'cancellation') {
      if (daysUntilStart >= 7) {
        expected_amount = refundAmount; // 100% refund
      } else if (daysUntilStart >= 3) {
        expected_amount = refundAmount * 0.5; // 50% refund
      } else {
        expected_amount = 0; // No refund
      }
    }

    console.log('Creating refund request with expected amount:', expected_amount);

    // Create refund request (payment_id can be NULL if payment doesn't exist yet)
    const [result] = await connection.query(
      `INSERT INTO user_refund_requests 
       (user_id, booking_id, payment_id, request_type, reason, description, 
        expected_amount, refund_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [user_id, booking_id, booking.payment_id || null, request_type, reason, description || '', 
       expected_amount, refund_method]
    );

    console.log('Refund request created with ID:', result.insertId);

    // Create notification for user
    try {
      await connection.query(
        `INSERT INTO notifications 
         (user_id, type, title, message, priority)
         VALUES (?, 'refund_request', 'Refund Request Submitted', ?, 'medium')`,
        [
          user_id,
          `Your refund request for Booking #${booking_id} has been submitted. Expected refund: ₹${expected_amount.toFixed(2)}`
        ]
      );
    } catch (notifError) {
      console.error('Error creating notification (non-critical):', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully',
      data: {
        request_id: result.insertId,
        expected_amount: expected_amount,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Error creating refund request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit refund request: ' + error.message
    });
  }
});

// @route   GET /api/user-refund-requests
// @desc    Get user's refund requests
// @access  Private (User)
router.get('/', protect, async (req, res) => {
  const connection = await db.promise();
  
  try {
    const user_id = req.user.id;
    const { status } = req.query;

    let sql = `
      SELECT 
        urr.*,
        b.seat_id,
        s.seat_number,
        p.amount as payment_amount,
        p.payment_method,
        pl.name as plan_name,
        a.name as reviewed_by_name
      FROM user_refund_requests urr
      LEFT JOIN bookings b ON urr.booking_id = b.id
      LEFT JOIN seats s ON b.seat_id = s.id
      LEFT JOIN payments p ON urr.payment_id = p.id
      LEFT JOIN plans pl ON b.plan_id = pl.id
      LEFT JOIN admins a ON urr.reviewed_by = a.id
      WHERE urr.user_id = ?
    `;
    const params = [user_id];

    if (status) {
      sql += ' AND urr.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY urr.created_at DESC';

    const [requests] = await connection.query(sql, params);

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching refund requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund requests'
    });
  }
});

// @route   GET /api/user-refund-requests/:id
// @desc    Get single refund request details
// @access  Private (User)
router.get('/:id', protect, async (req, res) => {
  const connection = await db.promise();
  
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [requests] = await connection.query(
      `SELECT 
        urr.*,
        b.seat_id,
        b.start_date,
        b.end_date,
        s.seat_number,
        p.amount as payment_amount,
        p.payment_method,
        pl.name as plan_name,
        a.name as reviewed_by_name,
        r.refund_status,
        r.completed_at as refund_completed_at
      FROM user_refund_requests urr
      LEFT JOIN bookings b ON urr.booking_id = b.id
      LEFT JOIN seats s ON b.seat_id = s.id
      LEFT JOIN payments p ON urr.payment_id = p.id
      LEFT JOIN plans pl ON b.plan_id = pl.id
      LEFT JOIN admins a ON urr.reviewed_by = a.id
      LEFT JOIN refunds r ON urr.refund_id = r.id
      WHERE urr.id = ? AND urr.user_id = ?`,
      [id, user_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    res.json({
      success: true,
      data: requests[0]
    });

  } catch (error) {
    console.error('Error fetching refund request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund request details'
    });
  }
});

// @route   DELETE /api/user-refund-requests/:id
// @desc    Cancel a pending refund request
// @access  Private (User)
router.delete('/:id', protect, async (req, res) => {
  const connection = await db.promise();
  
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if request exists and belongs to user
    const [requests] = await connection.query(
      'SELECT * FROM user_refund_requests WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    const request = requests[0];

    // Can only cancel pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled'
      });
    }

    // Delete the request
    await connection.query('DELETE FROM user_refund_requests WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Refund request cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling refund request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel refund request'
    });
  }
});

module.exports = router;
