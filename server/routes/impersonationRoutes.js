const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Generate impersonation token
router.post('/impersonate/:user_id', adminProtect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const user_id = req.params.user_id;
    const admin_id = req.admin.id;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];
    
    // Check if user exists and is not blocked
    const [users] = await connection.query(
      'SELECT id, name, email, is_blocked FROM users WHERE id = ?',
      [user_id]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    if (users[0].is_blocked) {
      throw new Error('Cannot impersonate blocked user');
    }
    
    const user = users[0];
    
    // Generate special impersonation token (valid for 2 hours)
    const impersonationToken = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        type: 'impersonation',
        admin_id: admin_id,
        impersonated_at: Date.now()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '2h' }
    );
    
    // Create session record
    const [sessionResult] = await connection.query(`
      INSERT INTO admin_user_sessions (
        admin_id, user_id, session_token, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?)
    `, [admin_id, user_id, impersonationToken, ip_address, user_agent]);
    
    const session_id = sessionResult.insertId;
    
    // Log admin action
    await connection.query(`
      INSERT INTO admin_action_logs (
        admin_id, action_type, target_user_id, 
        target_resource_type, target_resource_id, 
        action_details, ip_address, user_agent
      ) VALUES (?, 'login_as_user', ?, 'session', ?, ?, ?, ?)
    `, [
      admin_id,
      user_id,
      session_id,
      JSON.stringify({ 
        user_name: user.name,
        user_email: user.email,
        session_started: new Date().toISOString()
      }),
      ip_address,
      user_agent
    ]);
    
    await connection.commit();
    
    return successResponse(res, {
      impersonation_token: impersonationToken,
      session_id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      admin_info: {
        admin_id,
        admin_name: req.admin.name
      },
      expires_in: '2 hours'
    }, 'Impersonation session started');
    
  } catch (error) {
    await connection.rollback();
    console.error('Impersonation error:', error);
    return errorResponse(res, error.message || 'Error starting impersonation', 500);
  } finally {
    connection.release();
  }
});

// End impersonation session
router.post('/exit-impersonation/:session_id', adminProtect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const session_id = req.params.session_id;
    const admin_id = req.admin.id;
    
    // Get session details
    const [sessions] = await connection.query(
      'SELECT * FROM admin_user_sessions WHERE id = ? AND admin_id = ? AND is_active = TRUE',
      [session_id, admin_id]
    );
    
    if (sessions.length === 0) {
      throw new Error('Session not found or already ended');
    }
    
    // End session
    await connection.query(
      'UPDATE admin_user_sessions SET is_active = FALSE, ended_at = NOW() WHERE id = ?',
      [session_id]
    );
    
    // Log admin action
    await connection.query(`
      INSERT INTO admin_action_logs (
        admin_id, action_type, target_user_id, 
        target_resource_type, target_resource_id, action_details
      ) VALUES (?, 'login_as_user', ?, 'session', ?, ?)
    `, [
      admin_id,
      sessions[0].user_id,
      session_id,
      JSON.stringify({ 
        action: 'session_ended',
        duration_minutes: Math.floor((Date.now() - new Date(sessions[0].started_at).getTime()) / 60000)
      })
    ]);
    
    await connection.commit();
    
    return successResponse(res, null, 'Impersonation session ended');
    
  } catch (error) {
    await connection.rollback();
    console.error('Exit impersonation error:', error);
    return errorResponse(res, error.message || 'Error ending impersonation', 500);
  } finally {
    connection.release();
  }
});

// Get active impersonation sessions
router.get('/active-sessions', adminProtect, async (req, res) => {
  try {
    const [sessions] = await db.query(`
      SELECT s.*, 
             u.name as user_name, u.email as user_email,
             a.name as admin_name
      FROM admin_user_sessions s
      JOIN users u ON s.user_id = u.id
      JOIN admins a ON s.admin_id = a.id
      WHERE s.is_active = TRUE
      ORDER BY s.started_at DESC
    `);
    
    return successResponse(res, { sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return errorResponse(res, 'Error fetching active sessions', 500);
  }
});

// Get impersonation history
router.get('/session-history', adminProtect, async (req, res) => {
  try {
    const { user_id, admin_id, limit = 50 } = req.query;
    
    let query = `
      SELECT s.*, 
             u.name as user_name, u.email as user_email,
             a.name as admin_name,
             TIMESTAMPDIFF(MINUTE, s.started_at, COALESCE(s.ended_at, NOW())) as duration_minutes
      FROM admin_user_sessions s
      JOIN users u ON s.user_id = u.id
      JOIN admins a ON s.admin_id = a.id
      WHERE 1=1
    `;
    const params = [];
    
    if (user_id) {
      query += ' AND s.user_id = ?';
      params.push(user_id);
    }
    
    if (admin_id) {
      query += ' AND s.admin_id = ?';
      params.push(admin_id);
    }
    
    query += ' ORDER BY s.started_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [sessions] = await db.query(query, params);
    
    return successResponse(res, { sessions });
  } catch (error) {
    console.error('Error fetching session history:', error);
    return errorResponse(res, 'Error fetching session history', 500);
  }
});

// Log action during impersonation
router.post('/log-action', adminProtect, async (req, res) => {
  try {
    const { session_id, action_type, action_details } = req.body;
    
    // Update session actions
    await db.query(`
      UPDATE admin_user_sessions 
      SET actions_performed = JSON_ARRAY_APPEND(
        COALESCE(actions_performed, JSON_ARRAY()), 
        '$', 
        JSON_OBJECT(
          'action', ?,
          'details', ?,
          'timestamp', NOW()
        )
      )
      WHERE id = ?
    `, [action_type, JSON.stringify(action_details), session_id]);
    
    return successResponse(res, null, 'Action logged');
  } catch (error) {
    console.error('Error logging action:', error);
    return errorResponse(res, 'Error logging action', 500);
  }
});

// Verify impersonation token (middleware helper endpoint)
router.get('/verify-impersonation', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse(res, 'No token provided', 401);
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.type !== 'impersonation') {
      return errorResponse(res, 'Not an impersonation token', 403);
    }
    
    // Check if session is still active
    const [sessions] = await db.query(
      'SELECT * FROM admin_user_sessions WHERE session_token = ? AND is_active = TRUE',
      [token]
    );
    
    if (sessions.length === 0) {
      return errorResponse(res, 'Session expired or ended', 403);
    }
    
    return successResponse(res, {
      is_impersonating: true,
      user_id: decoded.id,
      admin_id: decoded.admin_id,
      session_id: sessions[0].id,
      started_at: sessions[0].started_at
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Impersonation session expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
});

module.exports = router;
