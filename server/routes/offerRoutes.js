const express = require('express');
const router = express.Router();
const { protect, adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');
const { sendNotification } = require('../utils/notificationService');

// Get all active offers (Public)
router.get('/', async (req, res) => {
  try {
    const [offers] = await db.query(
      `SELECT * FROM offers 
       WHERE is_active = TRUE 
       AND CURDATE() BETWEEN valid_from AND valid_until 
       ORDER BY created_at DESC`
    );
    return successResponse(res, { offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return errorResponse(res, 'Error fetching offers', 500);
  }
});

// Get offer by code
router.get('/code/:code', async (req, res) => {
  try {
    const [offers] = await db.query(
      `SELECT * FROM offers 
       WHERE offer_code = ? 
       AND is_active = TRUE 
       AND CURDATE() BETWEEN valid_from AND valid_until`,
      [req.params.code]
    );
    
    if (offers.length === 0) {
      return errorResponse(res, 'Offer not found or expired', 404);
    }
    
    return successResponse(res, { offer: offers[0] });
  } catch (error) {
    return errorResponse(res, 'Error fetching offer', 500);
  }
});

// Admin: Get all offers
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const [offers] = await db.query('SELECT * FROM offers ORDER BY created_at DESC');
    return successResponse(res, { offers });
  } catch (error) {
    return errorResponse(res, 'Error fetching offers', 500);
  }
});

// Admin: Create offer
router.post('/', adminProtect, async (req, res) => {
  try {
    const {
      title, description, offer_code, discount_type, discount_value,
      image_url, valid_from, valid_until, min_purchase_amount,
      max_discount_amount, usage_limit, terms_conditions
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO offers 
       (title, description, offer_code, discount_type, discount_value, image_url, 
        valid_from, valid_until, min_purchase_amount, max_discount_amount, 
        usage_limit, terms_conditions) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, offer_code, discount_type, discount_value, image_url,
       valid_from, valid_until, min_purchase_amount || 0, max_discount_amount,
       usage_limit, terms_conditions]
    );

    // Send notification to all users about new offer
    const discountText = discount_type === 'percentage' ? `${discount_value}% OFF` : `₹${discount_value} OFF`;
    await sendNotification({
      send_to_all: true,
      title: `🎉 New Offer: ${title}`,
      message: `${discountText} - Use code: ${offer_code}. Valid till ${new Date(valid_until).toLocaleDateString('en-IN')}`,
      type: 'offer'
    });

    return successResponse(res, { id: result.insertId }, 'Offer created successfully', 201);
  } catch (error) {
    console.error('Error creating offer:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 'Offer code already exists', 400);
    }
    return errorResponse(res, 'Error creating offer', 500);
  }
});

// Admin: Update offer
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const {
      title, description, offer_code, discount_type, discount_value,
      image_url, valid_from, valid_until, min_purchase_amount,
      max_discount_amount, usage_limit, is_active, terms_conditions
    } = req.body;

    await db.query(
      `UPDATE offers SET 
       title = ?, description = ?, offer_code = ?, discount_type = ?, 
       discount_value = ?, image_url = ?, valid_from = ?, valid_until = ?, 
       min_purchase_amount = ?, max_discount_amount = ?, usage_limit = ?, 
       is_active = ?, terms_conditions = ?
       WHERE id = ?`,
      [title, description, offer_code, discount_type, discount_value, image_url,
       valid_from, valid_until, min_purchase_amount, max_discount_amount,
       usage_limit, is_active, terms_conditions, req.params.id]
    );

    return successResponse(res, null, 'Offer updated successfully');
  } catch (error) {
    console.error('Error updating offer:', error);
    return errorResponse(res, 'Error updating offer', 500);
  }
});

// Admin: Delete offer
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    await db.query('DELETE FROM offers WHERE id = ?', [req.params.id]);
    return successResponse(res, null, 'Offer deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting offer', 500);
  }
});

module.exports = router;
