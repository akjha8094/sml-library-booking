const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Validate coupon
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, amount } = req.body;
    
    const [coupons] = await db.query(
      'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND valid_from <= CURDATE() AND valid_until >= CURDATE()',
      [code]
    );
    
    if (coupons.length === 0) {
      return errorResponse(res, 'Invalid or expired coupon code', 400);
    }
    
    const coupon = coupons[0];
    
    if (amount < coupon.min_purchase_amount) {
      return errorResponse(res, `Minimum purchase amount is ₹${coupon.min_purchase_amount}`, 400);
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return errorResponse(res, 'Coupon usage limit reached', 400);
    }
    
    let discount = 0;
    if (coupon.discount_type === 'flat') {
      discount = parseFloat(coupon.discount_value);
    } else {
      discount = (amount * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount && discount > parseFloat(coupon.max_discount_amount)) {
        discount = parseFloat(coupon.max_discount_amount);
      }
    }
    
    return successResponse(res, { 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount
      }
    });
  } catch (error) {
    return errorResponse(res, 'Error validating coupon', 500);
  }
});

// Admin: Create coupon
router.post('/', adminProtect, async (req, res) => {
  try {
    const { code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_from, valid_until } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_from, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_from, valid_until]
    );
    
    return successResponse(res, { id: result.insertId }, 'Coupon created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Error creating coupon', 500);
  }
});

// Admin: Get all coupons
router.get('/', adminProtect, async (req, res) => {
  try {
    const [coupons] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    return successResponse(res, { coupons });
  } catch (error) {
    return errorResponse(res, 'Error fetching coupons', 500);
  }
});

// Admin: Update coupon
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const { is_active } = req.body;
    await db.query('UPDATE coupons SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
    return successResponse(res, null, 'Coupon updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating coupon', 500);
  }
});

module.exports = router;
