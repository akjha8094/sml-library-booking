const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse, generateTicketNumber } = require('../utils/helpers');
const { sendNotification } = require('../utils/notificationService');
const { sendAdminNotification } = require('../utils/adminNotificationService');

// Create support ticket
router.post('/tickets', protect, async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    const ticket_number = generateTicketNumber();
    
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Create ticket
      const [result] = await connection.query(
        'INSERT INTO support_tickets (user_id, ticket_number, subject, category, priority) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, ticket_number, subject, category, priority || 'medium']
      );
      
      const ticketId = result.insertId;
      
      // Add initial message
      if (message) {
        await connection.query(
          'INSERT INTO support_messages (ticket_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)',
          [ticketId, 'user', req.user.id, message]
        );
      }
      
      await connection.commit();
      
      // Send notification to admin about new support ticket
      const [userInfo] = await connection.query('SELECT name, email FROM users WHERE id = ?', [req.user.id]);
      await sendAdminNotification({
        title: '🎫 New Support Ticket',
        message: `${userInfo[0].name} (${userInfo[0].email}) created ticket #${ticket_number}: ${subject}`,
        type: 'support',
        related_id: ticketId
      });
      
      return successResponse(res, { id: ticketId, ticket_number }, 'Ticket created successfully', 201);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating ticket:', error);
    return errorResponse(res, 'Error creating ticket', 500);
  }
});

// Get user tickets
router.get('/tickets', protect, async (req, res) => {
  try {
    const [tickets] = await db.query(
      'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return successResponse(res, { tickets });
  } catch (error) {
    return errorResponse(res, 'Error fetching tickets', 500);
  }
});

// Get ticket messages
router.get('/tickets/:id/messages', protect, async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT sm.*, 
              CASE 
                WHEN sm.sender_type = 'user' THEN u.name 
                WHEN sm.sender_type = 'admin' THEN a.name 
              END as sender_name
       FROM support_messages sm
       LEFT JOIN users u ON sm.sender_type = 'user' AND sm.sender_id = u.id
       LEFT JOIN admins a ON sm.sender_type = 'admin' AND sm.sender_id = a.id
       WHERE sm.ticket_id = ?
       ORDER BY sm.created_at ASC`,
      [req.params.id]
    );
    return successResponse(res, { messages });
  } catch (error) {
    return errorResponse(res, 'Error fetching messages', 500);
  }
});

// Add message to ticket
router.post('/tickets/:id/messages', protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Get ticket and user info
    const [tickets] = await db.query(
      'SELECT t.ticket_number, t.subject, u.name, u.email FROM support_tickets t JOIN users u ON t.user_id = u.id WHERE t.id = ?',
      [req.params.id]
    );
    
    if (tickets.length === 0) {
      return errorResponse(res, 'Ticket not found', 404);
    }
    
    const ticket = tickets[0];
    
    await db.query(
      'INSERT INTO support_messages (ticket_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)',
      [req.params.id, 'user', req.user.id, message]
    );
    
    // Send notification to admin about new message
    await sendAdminNotification({
      title: '💬 New Support Message',
      message: `${ticket.name} replied to ticket #${ticket.ticket_number}: "${ticket.subject}". Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
      type: 'support',
      related_id: parseInt(req.params.id)
    });
    
    return successResponse(res, null, 'Message sent successfully', 201);
  } catch (error) {
    console.error('Error sending message:', error);
    return errorResponse(res, 'Error sending message', 500);
  }
});

// Admin: Get all tickets
router.get('/admin/tickets', adminProtect, async (req, res) => {
  try {
    const [tickets] = await db.query(
      `SELECT t.*, u.name as user_name, u.email, u.mobile 
       FROM support_tickets t 
       JOIN users u ON t.user_id = u.id 
       ORDER BY t.created_at DESC`
    );
    return successResponse(res, { tickets });
  } catch (error) {
    return errorResponse(res, 'Error fetching tickets', 500);
  }
});

// Admin: Update ticket status
router.put('/admin/tickets/:id/status', adminProtect, async (req, res) => {
  try {
    const { status } = req.body;
    
    await db.query(
      'UPDATE support_tickets SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    
    if (status === 'resolved' || status === 'closed') {
      await db.query(
        'UPDATE support_tickets SET resolved_at = NOW() WHERE id = ?',
        [req.params.id]
      );
    }
    
    return successResponse(res, null, 'Ticket status updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating ticket', 500);
  }
});

// Admin: Reply to ticket
router.post('/admin/tickets/:id/reply', adminProtect, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Get ticket info
    const [tickets] = await db.query('SELECT user_id, ticket_number, subject FROM support_tickets WHERE id = ?', [req.params.id]);
    if (tickets.length === 0) {
      return errorResponse(res, 'Ticket not found', 404);
    }
    const ticket = tickets[0];
    
    await db.query(
      'INSERT INTO support_messages (ticket_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)',
      [req.params.id, 'admin', req.admin.id, message]
    );
    
    // Update ticket status to in_progress if it was open
    await db.query(
      'UPDATE support_tickets SET status = "in_progress" WHERE id = ? AND status = "open"',
      [req.params.id]
    );
    
    // Send notification to user about admin reply
    await sendNotification({
      user_id: ticket.user_id,
      title: `👨‍💻 Support Reply: ${ticket.ticket_number}`,
      message: `Admin replied to your ticket "${ticket.subject}". Check your support messages.`,
      type: 'support'
    });
    
    return successResponse(res, null, 'Reply sent successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Error sending reply', 500);
  }
});

module.exports = router;
