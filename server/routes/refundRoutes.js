const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');
const { sendNotification } = require('../utils/notificationService');

// Admin - Get all user refund requests
router.get('/user-requests', adminProtect, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT urr.*, 
             u.name as user_name, u.email, u.mobile,
             b.start_date, b.end_date,
             s.seat_number,
             p.amount as payment_amount,
             pl.name as plan_name,
             a.name as reviewed_by_name
      FROM user_refund_requests urr
      JOIN users u ON urr.user_id = u.id
      JOIN bookings b ON urr.booking_id = b.id
      JOIN seats s ON b.seat_id = s.id
      JOIN payments p ON urr.payment_id = p.id
      JOIN plans pl ON b.plan_id = pl.id
      LEFT JOIN admins a ON urr.reviewed_by = a.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND urr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY urr.created_at DESC';
    
    const [requests] = await db.query(query, params);
    return successResponse(res, { requests });
  } catch (error) {
    console.error('Error fetching user refund requests:', error);
    return errorResponse(res, 'Error fetching refund requests', 500);
  }
});

// Admin - Get stats for user refund requests
router.get('/user-requests/stats', adminProtect, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(expected_amount) as total_expected_amount
      FROM user_refund_requests
    `);
    
    return successResponse(res, { stats: stats[0] });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return errorResponse(res, 'Error fetching stats', 500);
  }
});

// Admin - Update refund request status (approve/reject)
router.put('/user-requests/:id/review', adminProtect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    const admin_id = req.admin.id;
    
    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      throw new Error('Invalid status');
    }
    
    // Get request details
    const [requests] = await connection.query(
      'SELECT * FROM user_refund_requests WHERE id = ?',
      [id]
    );
    
    if (requests.length === 0) {
      throw new Error('Refund request not found');
    }
    
    const request = requests[0];
    
    // Update request status
    await connection.query(
      `UPDATE user_refund_requests 
       SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [status, admin_notes, admin_id, id]
    );
    
    // If approved, process the refund automatically
    if (status === 'approved') {
      const refundAmount = parseFloat(request.expected_amount);
      
      // Create refund record
      const [refundResult] = await connection.query(`
        INSERT INTO refunds (
          payment_id, booking_id, user_id, refund_amount,
          refund_type, refund_method, refund_reason,
          refund_status, processed_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'processing', ?, ?)
      `, [
        request.payment_id,
        request.booking_id,
        request.user_id,
        refundAmount,
        refundAmount >= request.payment_amount ? 'full' : 'partial',
        request.refund_method,
        request.reason,
        admin_id,
        admin_notes
      ]);
      
      const refundId = refundResult.insertId;
      
      // Process wallet refund
      if (request.refund_method === 'wallet') {
        const [users] = await connection.query(
          'SELECT wallet_balance FROM users WHERE id = ?',
          [request.user_id]
        );
        
        const currentBalance = parseFloat(users[0].wallet_balance);
        const newBalance = currentBalance + refundAmount;
        
        await connection.query(
          'UPDATE users SET wallet_balance = ? WHERE id = ?',
          [newBalance, request.user_id]
        );
        
        await connection.query(`
          INSERT INTO wallet_transactions (
            user_id, transaction_type, amount, balance_before, 
            balance_after, description, reference_type, reference_id
          ) VALUES (?, 'credit', ?, ?, ?, ?, 'refund', ?)
        `, [
          request.user_id,
          refundAmount,
          currentBalance,
          newBalance,
          `Approved refund for booking #${request.booking_id}`,
          refundId
        ]);
        
        await connection.query(
          'UPDATE refunds SET refund_status = "completed", completed_at = NOW() WHERE id = ?',
          [refundId]
        );
      }
      
      // Update payment status
      await connection.query(`
        UPDATE payments 
        SET refund_amount = refund_amount + ?,
            refund_status = 'full',
            refunded_at = NOW(),
            refunded_by = ?
        WHERE id = ?
      `, [refundAmount, admin_id, request.payment_id]);
      
      // Link refund to request
      await connection.query(
        'UPDATE user_refund_requests SET refund_id = ?, status = "completed" WHERE id = ?',
        [refundId, id]
      );
      
      // Send notification to user
      await connection.query(
        `INSERT INTO notifications (user_id, type, title, message, priority)
         VALUES (?, 'refund_approved', 'Refund Request Approved', ?, 'high')`,
        [
          request.user_id,
          `Your refund request for Booking #${request.booking_id} has been approved. ₹${refundAmount.toFixed(2)} has been credited to your wallet.`
        ]
      );
    } else if (status === 'rejected') {
      // Send notification to user
      await connection.query(
        `INSERT INTO notifications (user_id, type, title, message, priority)
         VALUES (?, 'refund_rejected', 'Refund Request Rejected', ?, 'medium')`,
        [
          request.user_id,
          `Your refund request for Booking #${request.booking_id} has been rejected. ${admin_notes || ''}`
        ]
      );
    }
    
    // Log admin action
    await connection.query(
      `INSERT INTO admin_action_logs (admin_id, action_type, target_user_id, target_resource_type, target_resource_id, action_details)
       VALUES (?, 'refund_process', ?, 'refund_request', ?, ?)`,
      [admin_id, request.user_id, id, JSON.stringify({ status, admin_notes })]
    );
    
    await connection.commit();
    
    return successResponse(res, { message: `Refund request ${status}` });
  } catch (error) {
    await connection.rollback();
    console.error('Error reviewing refund request:', error);
    return errorResponse(res, error.message || 'Error processing refund request', 500);
  } finally {
    connection.release();
  }
});

// Get all refunds
router.get('/', adminProtect, async (req, res) => {
  try {
    const { status, user_id } = req.query;
    let query = `
      SELECT r.*, 
             u.name as user_name, u.email as user_email,
             p.transaction_id, p.amount as payment_amount,
             b.id as booking_id,
             a.name as processed_by_name
      FROM refunds r
      JOIN users u ON r.user_id = u.id
      JOIN payments p ON r.payment_id = p.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN admins a ON r.processed_by = a.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND r.refund_status = ?';
      params.push(status);
    }
    
    if (user_id) {
      query += ' AND r.user_id = ?';
      params.push(user_id);
    }
    
    query += ' ORDER BY r.refund_date DESC LIMIT 100';
    
    const [refunds] = await db.query(query, params);
    return successResponse(res, { refunds });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return errorResponse(res, 'Error fetching refunds', 500);
  }
});

// Get refund details
router.get('/:id', adminProtect, async (req, res) => {
  try {
    const [refunds] = await db.query(`
      SELECT r.*, 
             u.name as user_name, u.email as user_email, u.mobile,
             p.transaction_id, p.amount as payment_amount, p.payment_gateway,
             b.start_date, b.end_date,
             pl.name as plan_name,
             s.seat_number,
             a.name as processed_by_name
      FROM refunds r
      JOIN users u ON r.user_id = u.id
      JOIN payments p ON r.payment_id = p.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN plans pl ON b.plan_id = pl.id
      JOIN seats s ON b.seat_id = s.id
      JOIN admins a ON r.processed_by = a.id
      WHERE r.id = ?
    `, [req.params.id]);
    
    if (refunds.length === 0) {
      return errorResponse(res, 'Refund not found', 404);
    }
    
    return successResponse(res, { refund: refunds[0] });
  } catch (error) {
    console.error('Error fetching refund details:', error);
    return errorResponse(res, 'Error fetching refund details', 500);
  }
});

// Process manual refund
router.post('/process', adminProtect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { 
      payment_id, 
      refund_amount, 
      refund_type, 
      refund_method, 
      refund_reason,
      notes 
    } = req.body;
    const admin_id = req.admin.id;
    
    // Validate inputs
    if (!payment_id || !refund_amount || !refund_type || !refund_method || !refund_reason) {
      throw new Error('Missing required fields');
    }
    
    // Get payment details
    const [payments] = await connection.query(`
      SELECT p.*, b.id as booking_id, b.user_id 
      FROM payments p 
      JOIN bookings b ON p.booking_id = b.id 
      WHERE p.id = ?
    `, [payment_id]);
    
    if (payments.length === 0) {
      throw new Error('Payment not found');
    }
    
    const payment = payments[0];
    const refundAmount = parseFloat(refund_amount);
    const paymentAmount = parseFloat(payment.amount);
    
    // Validate refund amount
    if (refundAmount <= 0 || refundAmount > paymentAmount) {
      throw new Error('Invalid refund amount');
    }
    
    // Check if already refunded
    if (payment.status === 'refunded') {
      throw new Error('Payment already fully refunded');
    }
    
    // Create refund record
    const [refundResult] = await connection.query(`
      INSERT INTO refunds (
        payment_id, booking_id, user_id, refund_amount,
        refund_type, refund_method, refund_reason,
        refund_status, processed_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'processing', ?, ?)
    `, [
      payment_id,
      payment.booking_id,
      payment.user_id,
      refundAmount,
      refund_type,
      refund_method,
      refund_reason,
      admin_id,
      notes || null
    ]);
    
    const refundId = refundResult.insertId;
    
    // Process refund based on method
    if (refund_method === 'wallet') {
      // Get current wallet balance
      const [users] = await connection.query(
        'SELECT wallet_balance FROM users WHERE id = ?',
        [payment.user_id]
      );
      
      const currentBalance = parseFloat(users[0].wallet_balance);
      const newBalance = currentBalance + refundAmount;
      
      // Update wallet balance
      await connection.query(
        'UPDATE users SET wallet_balance = ? WHERE id = ?',
        [newBalance, payment.user_id]
      );
      
      // Create wallet transaction
      await connection.query(`
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, 
          balance_after, description, reference_type, reference_id
        ) VALUES (?, 'credit', ?, ?, ?, ?, 'refund', ?)
      `, [
        payment.user_id,
        refundAmount,
        currentBalance,
        newBalance,
        `Refund for booking #${payment.booking_id} - ${refund_reason}`,
        refundId
      ]);
      
      // Update refund status to completed
      await connection.query(
        'UPDATE refunds SET refund_status = "completed", completed_at = NOW() WHERE id = ?',
        [refundId]
      );
    }
    
    // Update payment status
    const newPaymentStatus = refund_type === 'full' ? 'refunded' : 'partial_refund';
    const refundStatus = refund_type === 'full' ? 'full' : 'partial';
    
    await connection.query(`
      UPDATE payments 
      SET status = ?, 
          refund_amount = refund_amount + ?,
          refund_status = ?,
          refunded_at = NOW(),
          refunded_by = ?
      WHERE id = ?
    `, [newPaymentStatus, refundAmount, refundStatus, admin_id, payment_id]);
    
    // Log admin action
    await connection.query(`
      INSERT INTO admin_action_logs (
        admin_id, action_type, target_user_id, 
        target_resource_type, target_resource_id, action_details
      ) VALUES (?, 'refund_process', ?, 'refund', ?, ?)
    `, [
      admin_id,
      payment.user_id,
      refundId,
      JSON.stringify({
        payment_id,
        refund_amount: refundAmount,
        refund_type,
        refund_method,
        reason: refund_reason
      })
    ]);
    
    await connection.commit();
    
    // Send notification to user
    await sendNotification({
      user_id: payment.user_id,
      title: '💰 Refund Processed',
      message: `Your refund of ₹${refundAmount} has been ${refund_method === 'wallet' ? 'credited to your wallet' : 'initiated to your original payment method'}. Reason: ${refund_reason}`,
      type: 'payment'
    });
    
    return successResponse(res, { 
      refund_id: refundId,
      message: 'Refund processed successfully' 
    }, 'Refund processed successfully', 201);
    
  } catch (error) {
    await connection.rollback();
    console.error('Refund processing error:', error);
    return errorResponse(res, error.message || 'Error processing refund', 500);
  } finally {
    connection.release();
  }
});

// Process auto-refund (called when booking is cancelled)
router.post('/auto-refund/:booking_id', adminProtect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const booking_id = req.params.booking_id;
    const admin_id = req.admin.id;
    
    // Call stored procedure
    await connection.query('CALL process_auto_refund(?, "booking_cancel", ?)', 
      [booking_id, admin_id]
    );
    
    await connection.commit();
    
    return successResponse(res, null, 'Auto-refund processed successfully');
    
  } catch (error) {
    await connection.rollback();
    console.error('Auto-refund error:', error);
    return errorResponse(res, error.message || 'Error processing auto-refund', 500);
  } finally {
    connection.release();
  }
});

// Get refund statistics
router.get('/stats/summary', adminProtect, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_refunds,
        SUM(CASE WHEN refund_status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN refund_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN refund_status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN refund_status = 'failed' THEN 1 ELSE 0 END) as failed,
        COALESCE(SUM(refund_amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN refund_status = 'completed' THEN refund_amount ELSE 0 END), 0) as completed_amount
      FROM refunds
    `);
    
    return successResponse(res, { stats: stats[0] });
  } catch (error) {
    console.error('Error fetching refund stats:', error);
    return errorResponse(res, 'Error fetching refund statistics', 500);
  }
});

module.exports = router;
