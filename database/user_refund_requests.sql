-- User Refund Request System
-- Created: 2025-10-21

USE sml_library;

-- ============================================
-- USER REFUND REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_refund_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    payment_id INT NOT NULL,
    request_type ENUM('cancellation', 'issue', 'duplicate_payment', 'other') NOT NULL,
    reason TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    expected_amount DECIMAL(10, 2) DEFAULT NULL,
    refund_method ENUM('wallet', 'original') DEFAULT 'wallet',
    status ENUM('pending', 'under_review', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    admin_notes TEXT DEFAULT NULL,
    reviewed_by INT DEFAULT NULL,
    reviewed_at TIMESTAMP NULL,
    refund_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL,
    FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_booking (booking_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGER: Notify Admin on New Refund Request
-- ============================================
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_refund_request_insert
AFTER INSERT ON user_refund_requests
FOR EACH ROW
BEGIN
    -- Insert notification for all admins
    INSERT INTO admin_notifications (
        admin_id, 
        type, 
        title, 
        message, 
        priority, 
        reference_type, 
        reference_id
    )
    SELECT 
        id,
        'refund_request',
        'New Refund Request',
        CONCAT('User ID ', NEW.user_id, ' requested refund for Booking #', NEW.booking_id),
        'high',
        'refund_request',
        NEW.id
    FROM admins
    WHERE is_active = 1;
END//
DELIMITER ;

SHOW TABLES;
