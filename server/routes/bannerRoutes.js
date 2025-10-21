const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get active banners (for users)
router.get('/', async (req, res) => {
  try {
    const [banners] = await db.query(
      'SELECT id, title, image as image_url, link as link_url, display_order, is_active, start_date, end_date, created_at, updated_at FROM banners WHERE is_active = TRUE AND (start_date IS NULL OR start_date <= CURDATE()) AND (end_date IS NULL OR end_date >= CURDATE()) ORDER BY display_order ASC'
    );
    return successResponse(res, { banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return errorResponse(res, 'Error fetching banners', 500);
  }
});

// Get all banners (for admin)
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const [banners] = await db.query(
      'SELECT id, title, image as image_url, link as link_url, display_order, is_active, start_date, end_date, created_at, updated_at FROM banners ORDER BY display_order ASC, created_at DESC'
    );
    return successResponse(res, { banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return errorResponse(res, 'Error fetching banners', 500);
  }
});

// Admin: Create banner
router.post('/', adminProtect, async (req, res) => {
  try {
    const { title, image_url, link_url, display_order, is_active } = req.body;
    
    if (!title || !image_url) {
      return errorResponse(res, 'Title and image URL are required', 400);
    }
    
    const [result] = await db.query(
      'INSERT INTO banners (title, image, link, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [title, image_url, link_url || null, display_order || 0, is_active !== undefined ? is_active : true]
    );
    
    return successResponse(res, { id: result.insertId }, 'Banner created successfully', 201);
  } catch (error) {
    console.error('Error creating banner:', error);
    return errorResponse(res, error.message || 'Error creating banner', 500);
  }
});

// Admin: Update banner
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const { title, image_url, link_url, display_order, is_active } = req.body;
    
    // Build dynamic update query
    let updateFields = [];
    let updateValues = [];
    
    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (image_url !== undefined) {
      updateFields.push('image = ?');
      updateValues.push(image_url);
    }
    if (link_url !== undefined) {
      updateFields.push('link = ?');
      updateValues.push(link_url);
    }
    if (display_order !== undefined) {
      updateFields.push('display_order = ?');
      updateValues.push(display_order);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }
    
    if (updateFields.length === 0) {
      return errorResponse(res, 'No fields to update', 400);
    }
    
    updateValues.push(req.params.id);
    
    await db.query(
      `UPDATE banners SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    return successResponse(res, null, 'Banner updated successfully');
  } catch (error) {
    console.error('Error updating banner:', error);
    return errorResponse(res, error.message || 'Error updating banner', 500);
  }
});

// Admin: Delete banner
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Banner deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting banner', 500);
  }
});

module.exports = router;
