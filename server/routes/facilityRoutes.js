const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');
const { adminProtect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all facilities
router.get('/', async (req, res) => {
  try {
    const [facilities] = await db.query(
      'SELECT * FROM facilities WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    return successResponse(res, { facilities });
  } catch (error) {
    return errorResponse(res, 'Error fetching facilities', 500);
  }
});

// Admin: Create facility
router.post('/', adminProtect, upload.single('facility_image'), async (req, res) => {
  try {
    const { title, description, display_order } = req.body;
    const image = req.file ? req.file.path : null;
    
    const [result] = await db.query(
      'INSERT INTO facilities (title, description, image, display_order) VALUES (?, ?, ?, ?)',
      [title, description, image, display_order || 0]
    );
    
    return successResponse(res, { id: result.insertId }, 'Facility created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Error creating facility', 500);
  }
});

// Admin: Update facility
router.put('/:id', adminProtect, upload.single('facility_image'), async (req, res) => {
  try {
    const { title, description, display_order, is_active } = req.body;
    const image = req.file ? req.file.path : null;
    
    let query = 'UPDATE facilities SET title = ?, description = ?, display_order = ?, is_active = ?';
    const params = [title, description, display_order, is_active];
    
    if (image) {
      query += ', image = ?';
      params.push(image);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await db.query(query, params);
    return successResponse(res, null, 'Facility updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating facility', 500);
  }
});

// Admin: Delete facility
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    await db.query('DELETE FROM facilities WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Facility deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting facility', 500);
  }
});

module.exports = router;
