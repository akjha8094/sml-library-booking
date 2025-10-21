const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get audit logs
router.get('/', adminProtect, async (req, res) => {
  try {
    const { 
      admin_id, 
      user_id, 
      action_type, 
      start_date, 
      end_date,
      limit = 100,
      offset = 0 
    } = req.query;
    
    let query = `
      SELECT l.*, 
             a.name as admin_name, a.email as admin_email,
             u.name as user_name, u.email as user_email
      FROM admin_action_logs l
      JOIN admins a ON l.admin_id = a.id
      LEFT JOIN users u ON l.target_user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (admin_id) {
      query += ' AND l.admin_id = ?';
      params.push(admin_id);
    }
    
    if (user_id) {
      query += ' AND l.target_user_id = ?';
      params.push(user_id);
    }
    
    if (action_type) {
      query += ' AND l.action_type = ?';
      params.push(action_type);
    }
    
    if (start_date) {
      query += ' AND DATE(l.created_at) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND DATE(l.created_at) <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [logs] = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM admin_action_logs l WHERE 1=1';
    const countParams = [];
    
    if (admin_id) {
      countQuery += ' AND l.admin_id = ?';
      countParams.push(admin_id);
    }
    
    if (user_id) {
      countQuery += ' AND l.target_user_id = ?';
      countParams.push(user_id);
    }
    
    if (action_type) {
      countQuery += ' AND l.action_type = ?';
      countParams.push(action_type);
    }
    
    if (start_date) {
      countQuery += ' AND DATE(l.created_at) >= ?';
      countParams.push(start_date);
    }
    
    if (end_date) {
      countQuery += ' AND DATE(l.created_at) <= ?';
      countParams.push(end_date);
    }
    
    const [countResult] = await db.query(countQuery, countParams);
    
    return successResponse(res, {
      logs,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + parseInt(limit)) < countResult[0].total
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return errorResponse(res, 'Error fetching audit logs', 500);
  }
});

// Get audit log statistics
router.get('/stats', adminProtect, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = ' WHERE DATE(created_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    // Action type distribution
    const [actionStats] = await db.query(`
      SELECT 
        action_type,
        COUNT(*) as count
      FROM admin_action_logs
      ${dateFilter}
      GROUP BY action_type
      ORDER BY count DESC
    `, params);
    
    // Admin activity
    const [adminStats] = await db.query(`
      SELECT 
        a.name,
        a.email,
        COUNT(l.id) as action_count
      FROM admins a
      LEFT JOIN admin_action_logs l ON a.id = l.admin_id ${dateFilter.replace('WHERE', 'AND')}
      GROUP BY a.id
      ORDER BY action_count DESC
    `, params);
    
    // Daily activity
    const [dailyStats] = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM admin_action_logs
      ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, params);
    
    // Most affected users
    const [userStats] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(l.id) as action_count
      FROM users u
      INNER JOIN admin_action_logs l ON u.id = l.target_user_id ${dateFilter.replace('WHERE', 'AND')}
      GROUP BY u.id
      ORDER BY action_count DESC
      LIMIT 10
    `, params);
    
    return successResponse(res, {
      action_distribution: actionStats,
      admin_activity: adminStats,
      daily_activity: dailyStats,
      most_affected_users: userStats
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    return errorResponse(res, 'Error fetching audit statistics', 500);
  }
});

// Get specific log details
router.get('/:id', adminProtect, async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT l.*, 
             a.name as admin_name, a.email as admin_email,
             u.name as user_name, u.email as user_email
      FROM admin_action_logs l
      JOIN admins a ON l.admin_id = a.id
      LEFT JOIN users u ON l.target_user_id = u.id
      WHERE l.id = ?
    `, [req.params.id]);
    
    if (logs.length === 0) {
      return errorResponse(res, 'Log not found', 404);
    }
    
    return successResponse(res, { log: logs[0] });
  } catch (error) {
    console.error('Error fetching log details:', error);
    return errorResponse(res, 'Error fetching log details', 500);
  }
});

// Export audit logs (CSV format)
router.get('/export/csv', adminProtect, async (req, res) => {
  try {
    const { start_date, end_date, action_type } = req.query;
    
    let query = `
      SELECT 
        l.id,
        l.action_type,
        a.name as admin_name,
        u.name as user_name,
        l.target_resource_type,
        l.target_resource_id,
        l.ip_address,
        l.created_at
      FROM admin_action_logs l
      JOIN admins a ON l.admin_id = a.id
      LEFT JOIN users u ON l.target_user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (start_date) {
      query += ' AND DATE(l.created_at) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND DATE(l.created_at) <= ?';
      params.push(end_date);
    }
    
    if (action_type) {
      query += ' AND l.action_type = ?';
      params.push(action_type);
    }
    
    query += ' ORDER BY l.created_at DESC';
    
    const [logs] = await db.query(query, params);
    
    // Create CSV
    let csv = 'ID,Action Type,Admin Name,User Name,Resource Type,Resource ID,IP Address,Timestamp\n';
    
    logs.forEach(log => {
      csv += `${log.id},"${log.action_type}","${log.admin_name}","${log.user_name || 'N/A'}","${log.target_resource_type || 'N/A'}","${log.target_resource_id || 'N/A'}","${log.ip_address || 'N/A'}","${new Date(log.created_at).toISOString()}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    return errorResponse(res, 'Error exporting audit logs', 500);
  }
});

module.exports = router;
