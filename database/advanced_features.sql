-- Advanced Admin Features Database Schema
-- Created: 2025-10-21

USE sml_library;

-- ============================================
-- REFUNDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS refunds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_type ENUM('full', 'partial') NOT NULL,
    refund_method ENUM('wallet', 'original', 'bank_transfer') NOT NULL,
    refund_reason TEXT NOT NULL,
    refund_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    processed_by INT NOT NULL,
    transaction_reference VARCHAR(255) DEFAULT NULL,
    refund_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    notes TEXT DEFAULT NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE RESTRICT,
    INDEX idx_payment (payment_id),
    INDEX idx_user (user_id),
    INDEX idx_status (refund_status),
    INDEX idx_date (refund_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADMIN ACTIONS LOG (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type ENUM(
        'user_block', 'user_unblock', 'wallet_credit', 'wallet_debit',
        'booking_extend', 'booking_cancel', 'seat_change', 'refund_process',
        'login_as_user', 'payment_update', 'plan_change', 'other'
    ) NOT NULL,
    target_user_id INT DEFAULT NULL,
    target_resource_type VARCHAR(50) DEFAULT NULL,
    target_resource_id INT DEFAULT NULL,
    action_details JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_admin (admin_id),
    INDEX idx_user (target_user_id),
    INDEX idx_action (action_type),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADMIN USER SESSIONS (Login as User)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    actions_performed JSON DEFAULT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (session_token),
    INDEX idx_active (is_active),
    INDEX idx_admin_user (admin_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BOOKING MODIFICATIONS LOG
-- ============================================
CREATE TABLE IF NOT EXISTS booking_modifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    modified_by INT NOT NULL,
    modification_type ENUM('extend', 'seat_change', 'plan_change', 'cancel', 'reactivate') NOT NULL,
    old_value JSON DEFAULT NULL,
    new_value JSON DEFAULT NULL,
    reason TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (modified_by) REFERENCES admins(id) ON DELETE RESTRICT,
    INDEX idx_booking (booking_id),
    INDEX idx_type (modification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUTO-REFUND RULES
-- ============================================
CREATE TABLE IF NOT EXISTS auto_refund_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) NOT NULL,
    trigger_event ENUM('booking_cancel', 'seat_unavailable', 'payment_duplicate', 'system_error') NOT NULL,
    refund_percentage DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    refund_method ENUM('wallet', 'original', 'auto') DEFAULT 'auto',
    min_days_before INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_trigger (trigger_event),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT AUTO-REFUND RULES
-- ============================================
INSERT INTO auto_refund_rules (rule_name, trigger_event, refund_percentage, refund_method) VALUES
('Full Refund on Cancellation (7+ days)', 'booking_cancel', 100.00, 'wallet'),
('50% Refund on Cancellation (3-7 days)', 'booking_cancel', 50.00, 'wallet'),
('No Refund on Cancellation (< 3 days)', 'booking_cancel', 0.00, 'wallet'),
('System Error Full Refund', 'system_error', 100.00, 'original');

-- ============================================
-- UPDATE PAYMENTS TABLE (if columns don't exist)
-- ============================================
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS refund_status ENUM('none', 'partial', 'full') DEFAULT 'none',
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS refunded_by INT DEFAULT NULL,
ADD INDEX IF NOT EXISTS idx_refund_status (refund_status);

-- ============================================
-- STORED PROCEDURE: Process Automatic Refund
-- ============================================
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS process_auto_refund(
    IN p_booking_id INT,
    IN p_trigger_event VARCHAR(50),
    IN p_admin_id INT
)
BEGIN
    DECLARE v_payment_id INT;
    DECLARE v_user_id INT;
    DECLARE v_amount DECIMAL(10, 2);
    DECLARE v_refund_percentage DECIMAL(5, 2);
    DECLARE v_refund_amount DECIMAL(10, 2);
    DECLARE v_refund_method VARCHAR(20);
    DECLARE v_days_difference INT;
    
    -- Get payment and user details
    SELECT p.id, p.user_id, p.amount, DATEDIFF(b.start_date, CURDATE())
    INTO v_payment_id, v_user_id, v_amount, v_days_difference
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    WHERE b.id = p_booking_id AND p.status = 'completed'
    LIMIT 1;
    
    -- Determine refund percentage based on days
    IF v_days_difference >= 7 THEN
        SET v_refund_percentage = 100.00;
    ELSEIF v_days_difference >= 3 THEN
        SET v_refund_percentage = 50.00;
    ELSE
        SET v_refund_percentage = 0.00;
    END IF;
    
    -- Calculate refund amount
    SET v_refund_amount = v_amount * (v_refund_percentage / 100);
    
    IF v_refund_amount > 0 THEN
        -- Create refund record
        INSERT INTO refunds (
            payment_id, booking_id, user_id, refund_amount, 
            refund_type, refund_method, refund_reason, 
            refund_status, processed_by
        ) VALUES (
            v_payment_id, p_booking_id, v_user_id, v_refund_amount,
            IF(v_refund_percentage = 100, 'full', 'partial'),
            'wallet',
            CONCAT('Auto-refund: ', v_refund_percentage, '% refund for cancellation'),
            'completed',
            p_admin_id
        );
        
        -- Update payment status
        UPDATE payments 
        SET status = IF(v_refund_percentage = 100, 'refunded', 'partial_refund'),
            refund_amount = v_refund_amount,
            refund_status = IF(v_refund_percentage = 100, 'full', 'partial'),
            refunded_at = NOW(),
            refunded_by = p_admin_id
        WHERE id = v_payment_id;
        
        -- Credit to wallet
        UPDATE users 
        SET wallet_balance = wallet_balance + v_refund_amount
        WHERE id = v_user_id;
        
        -- Log wallet transaction
        INSERT INTO wallet_transactions (
            user_id, transaction_type, amount, 
            balance_before, balance_after, description, 
            reference_type, reference_id
        )
        SELECT 
            v_user_id, 'credit', v_refund_amount,
            wallet_balance - v_refund_amount, wallet_balance,
            CONCAT('Refund for booking #', p_booking_id, ' - ', v_refund_percentage, '% refund'),
            'refund', p_booking_id
        FROM users WHERE id = v_user_id;
    END IF;
END//
DELIMITER ;

SHOW TABLES;
