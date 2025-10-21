const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken, generateReferralCode, generateRandomToken } = require('../utils/helpers');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, mobile, password, dob, gender, referred_by } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? OR mobile = ?',
      [email, mobile]
    );

    if (existingUsers.length > 0) {
      return errorResponse(res, 'User with this email or mobile already exists', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate referral code
    const referralCode = generateReferralCode();

    // Check if referred by valid code
    let referredById = null;
    if (referred_by) {
      const [referrer] = await db.query(
        'SELECT id FROM users WHERE referral_code = ?',
        [referred_by]
      );
      if (referrer.length > 0) {
        referredById = referrer[0].id;
      }
    }

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (name, email, mobile, password, dob, gender, referral_code, referred_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, mobile, hashedPassword, dob, gender, referralCode, referredById]
    );

    const userId = result.insertId;

    // If referred, give bonus to both users
    if (referredById) {
      const bonusAmount = 100; // Default bonus, should come from settings
      
      // Credit to referrer
      await db.query(
        `UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?`,
        [bonusAmount, referredById]
      );
      
      await db.query(
        `INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_before, balance_after, description, reference_type)
         SELECT ?, 'credit', ?, wallet_balance - ?, wallet_balance, 'Referral bonus', 'referral' FROM users WHERE id = ?`,
        [referredById, bonusAmount, bonusAmount, referredById]
      );

      // Credit to new user
      await db.query(
        `UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?`,
        [bonusAmount, userId]
      );
      
      await db.query(
        `INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_before, balance_after, description, reference_type)
         SELECT ?, 'credit', ?, wallet_balance - ?, wallet_balance, 'Welcome bonus', 'referral' FROM users WHERE id = ?`,
        [userId, bonusAmount, bonusAmount, userId]
      );
    }

    // Generate token
    const token = generateToken(userId);

    // Get user data
    const [users] = await db.query(
      'SELECT id, name, email, mobile, dob, gender, wallet_balance, referral_code FROM users WHERE id = ?',
      [userId]
    );

    return successResponse(res, {
      token,
      user: users[0]
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse(res, 'Error registering user', 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or mobile

    // Find user by email or mobile
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? OR mobile = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const user = users[0];

    // Check if user is blocked
    if (user.is_blocked) {
      return errorResponse(res, 'Your account has been blocked. Please contact support.', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.password;

    return successResponse(res, {
      token,
      user
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Error logging in', 500);
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const [admins] = await db.query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (admins.length === 0) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const admin = admins[0];

    // Check if admin is active
    if (!admin.is_active) {
      return errorResponse(res, 'Your account has been deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Update last login
    await db.query(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [admin.id]
    );

    // Generate token
    const token = generateToken(admin.id, 'admin');

    // Remove password from response
    delete admin.password;

    return successResponse(res, {
      token,
      admin
    }, 'Admin login successful');

  } catch (error) {
    console.error('Admin login error:', error);
    return errorResponse(res, 'Error logging in', 500);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const [users] = await db.query(
      'SELECT id, email, name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return errorResponse(res, 'No user found with this email', 404);
    }

    const user = users[0];

    // Generate reset token
    const resetToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt]
    );

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    return successResponse(res, {
      resetToken // In production, don't send token in response, only via email
    }, 'Password reset link sent to your email');

  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse(res, 'Error sending reset link', 500);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find valid token
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    const resetToken = tokens[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    if (resetToken.user_id) {
      await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, resetToken.user_id]
      );
    } else if (resetToken.admin_id) {
      await db.query(
        'UPDATE admins SET password = ? WHERE id = ?',
        [hashedPassword, resetToken.admin_id]
      );
    }

    // Delete used token
    await db.query(
      'DELETE FROM password_reset_tokens WHERE id = ?',
      [resetToken.id]
    );

    return successResponse(res, null, 'Password reset successful');

  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse(res, 'Error resetting password', 500);
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current password
    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    return successResponse(res, null, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Error changing password', 500);
  }
};
