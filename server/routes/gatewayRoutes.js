const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get gateway settings
router.get('/', adminProtect, async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM gateway_settings ORDER BY id DESC LIMIT 1'
    );
    
    if (settings.length === 0) {
      // Return default settings if none exist
      return successResponse(res, {
        settings: {
          razorpay_key: '',
          razorpay_secret: '',
          stripe_key: '',
          stripe_secret: '',
          paypal_client_id: '',
          paypal_secret: '',
          phonepe_merchant_id: '',
          phonepe_salt: '',
          currency: 'INR',
          gst_percentage: 18,
          service_charge: 0
        }
      });
    }
    
    return successResponse(res, { settings: settings[0] });
  } catch (error) {
    console.error('Get gateway settings error:', error);
    return errorResponse(res, 'Error fetching settings', 500);
  }
});

// Update gateway settings
router.post('/', adminProtect, async (req, res) => {
  try {
    const {
      razorpay_key,
      razorpay_secret,
      stripe_key,
      stripe_secret,
      paypal_client_id,
      paypal_secret,
      phonepe_merchant_id,
      phonepe_salt,
      currency,
      gst_percentage,
      service_charge
    } = req.body;
    
    // Check if settings exist
    const [existing] = await db.query('SELECT id FROM gateway_settings LIMIT 1');
    
    if (existing.length > 0) {
      // Update existing settings
      await db.query(
        `UPDATE gateway_settings SET 
          razorpay_key = ?, razorpay_secret = ?,
          stripe_key = ?, stripe_secret = ?,
          paypal_client_id = ?, paypal_secret = ?,
          phonepe_merchant_id = ?, phonepe_salt = ?,
          currency = ?, gst_percentage = ?, service_charge = ?
        WHERE id = ?`,
        [
          razorpay_key, razorpay_secret,
          stripe_key, stripe_secret,
          paypal_client_id, paypal_secret,
          phonepe_merchant_id, phonepe_salt,
          currency, gst_percentage, service_charge,
          existing[0].id
        ]
      );
    } else {
      // Insert new settings
      await db.query(
        `INSERT INTO gateway_settings 
          (razorpay_key, razorpay_secret, stripe_key, stripe_secret, 
           paypal_client_id, paypal_secret, phonepe_merchant_id, phonepe_salt,
           currency, gst_percentage, service_charge)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          razorpay_key, razorpay_secret,
          stripe_key, stripe_secret,
          paypal_client_id, paypal_secret,
          phonepe_merchant_id, phonepe_salt,
          currency, gst_percentage, service_charge
        ]
      );
    }
    
    return successResponse(res, null, 'Settings saved successfully');
  } catch (error) {
    console.error('Update gateway settings error:', error);
    return errorResponse(res, 'Error saving settings', 500);
  }
});

module.exports = router;
