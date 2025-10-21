const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get wallet balance and transactions
router.get('/', protect, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [req.user.id]
    );
    
    const [transactions] = await db.query(
      'SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    
    return successResponse(res, {
      balance: users[0].wallet_balance,
      transactions
    });
  } catch (error) {
    return errorResponse(res, 'Error fetching wallet data', 500);
  }
});

// Add money to wallet (recharge)
router.post('/recharge', protect, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { amount, payment_method = 'online', transaction_id } = req.body;
    const userId = req.user.id;
    
    if (!amount || parseFloat(amount) <= 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Invalid amount', 400);
    }
    
    const rechargeAmount = parseFloat(amount);
    
    // Get current balance
    const [users] = await connection.query(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [userId]
    );
    
    if (!users || users.length === 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'User not found', 404);
    }
    
    const balanceBefore = parseFloat(users[0].wallet_balance);
    const balanceAfter = balanceBefore + rechargeAmount;
    
    // Update user wallet balance
    await connection.query(
      'UPDATE users SET wallet_balance = ? WHERE id = ?',
      [balanceAfter, userId]
    );
    
    // Create wallet transaction record with proper schema
    await connection.query(
      `INSERT INTO wallet_transactions 
       (user_id, transaction_type, amount, balance_before, balance_after, description, reference_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'credit',
        rechargeAmount,
        balanceBefore,
        balanceAfter,
        `Wallet recharged via ${payment_method} - ${transaction_id || `WR${Date.now()}`}`,
        'admin_credit'
      ]
    );
    
    await connection.commit();
    
    return successResponse(res, {
      balance: balanceAfter,
      message: 'Wallet recharged successfully'
    }, 'Money added to wallet successfully', 201);
    
  } catch (error) {
    await connection.rollback();
    console.error('Error recharging wallet:', error);
    return errorResponse(res, error.message || 'Error adding money to wallet', 500);
  } finally {
    connection.release();
  }
});

module.exports = router;
