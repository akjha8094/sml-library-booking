const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get all seats (public - no auth required for viewing)
router.get('/', async (req, res) => {
  try {
    const { date, shift } = req.query;
    
    // Get all seats with their current booking status
    let query = `
      SELECT s.*, 
        CASE 
          WHEN b.id IS NOT NULL AND b.status = 'active' AND b.end_date >= CURDATE() THEN 'occupied'
          ELSE s.seat_status 
        END as seat_status
      FROM seats s 
      LEFT JOIN bookings b ON s.id = b.seat_id AND b.status = 'active' AND b.end_date >= CURDATE()
    `;
    
    if (date) {
      query += ' WHERE ? BETWEEN b.start_date AND b.end_date';
    }
    
    // Sort by seat number (extract number from S01, S02, etc.)
    query += ' ORDER BY CAST(SUBSTRING(s.seat_number, 2) AS UNSIGNED) ASC';
    
    const params = date ? [date] : [];
    const [seats] = await db.query(query, params);
    
    return successResponse(res, { seats });
  } catch (error) {
    console.error('Error fetching seats:', error);
    return errorResponse(res, 'Error fetching seats', 500);
  }
});

// Admin: Create seat
router.post('/', adminProtect, async (req, res) => {
  try {
    const { seat_number, floor, section } = req.body;
    const [result] = await db.query(
      'INSERT INTO seats (seat_number, floor, section) VALUES (?, ?, ?)',
      [seat_number, floor, section]
    );
    return successResponse(res, { id: result.insertId }, 'Seat created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Error creating seat', 500);
  }
});

// Admin: Update seat
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const { seat_status, floor, section } = req.body;
    await db.query(
      'UPDATE seats SET seat_status = ?, floor = ?, section = ? WHERE id = ?',
      [seat_status, floor, section, req.params.id]
    );
    return successResponse(res, null, 'Seat updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating seat', 500);
  }
});

// Admin: Delete seat
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    await db.query('DELETE FROM seats WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Seat deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting seat', 500);
  }
});

module.exports = router;
