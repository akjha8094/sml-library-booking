-- SML Library Booking System - Database Schema
-- Created: 2025-10-20

-- Drop database if exists (use with caution in production)
-- DROP DATABASE IF EXISTS sml_library;

-- Create database
CREATE DATABASE IF NOT EXISTS sml_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sml_library;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    referral_code VARCHAR(20) UNIQUE,
    referred_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_mobile (mobile),
    INDEX idx_referral (referral_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'editor') DEFAULT 'editor',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PASSWORD RESET TOKENS
-- ============================================
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    admin_id INT,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PLANS TABLE
-- ============================================
CREATE TABLE plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INT NOT NULL,
    plan_type ENUM('full_day', 'half_day') NOT NULL,
    shift_type ENUM('morning', 'evening', 'night', 'all_day') DEFAULT 'all_day',
    shift_start_time TIME DEFAULT NULL,
    shift_end_time TIME DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    features JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_type (plan_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEATS TABLE
-- ============================================
CREATE TABLE seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seat_number VARCHAR(10) UNIQUE NOT NULL,
    seat_status ENUM('available', 'occupied', 'maintenance', 'reserved') DEFAULT 'available',
    floor INT DEFAULT 1,
    section VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seat_number (seat_number),
    INDEX idx_status (seat_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    seat_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    booking_type ENUM('immediate', 'advance') DEFAULT 'immediate',
    status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    final_amount DECIMAL(10, 2) NOT NULL,
    coupon_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_seat (seat_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    payment_gateway ENUM('razorpay', 'stripe', 'paypal', 'phonepe', 'googlepay', 'paytm', 'wallet') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status ENUM('pending', 'completed', 'failed', 'refunded', 'partial_refund') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT NULL,
    gateway_response JSON DEFAULT NULL,
    refund_amount DECIMAL(10, 2) DEFAULT 0.00,
    refund_reason TEXT DEFAULT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transaction (transaction_id),
    INDEX idx_status (status),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COUPONS TABLE
-- ============================================
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('flat', 'percentage') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COUPON USAGE TABLE
-- ============================================
CREATE TABLE coupon_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_coupon_user (coupon_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- WALLET TRANSACTIONS TABLE
-- ============================================
CREATE TABLE wallet_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    reference_type ENUM('booking', 'refund', 'referral', 'admin_credit', 'cashback') DEFAULT NULL,
    reference_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FACILITIES TABLE
-- ============================================
CREATE TABLE facilities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255) DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BANNERS TABLE
-- ============================================
CREATE TABLE banners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    image VARCHAR(255) NOT NULL,
    link VARCHAR(255) DEFAULT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTICES TABLE
-- ============================================
CREATE TABLE notices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_priority (is_active, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('general', 'booking', 'payment', 'offer', 'reminder') DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    send_to_all BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUPPORT TICKETS TABLE
-- ============================================
CREATE TABLE support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category ENUM('booking', 'payment', 'technical', 'general', 'other') DEFAULT 'general',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_ticket (ticket_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUPPORT MESSAGES TABLE
-- ============================================
CREATE TABLE support_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    sender_type ENUM('user', 'admin') NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    attachments JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    INDEX idx_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PAYMENT GATEWAY SETTINGS TABLE
-- ============================================
CREATE TABLE payment_gateway_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    gateway_name ENUM('razorpay', 'stripe', 'paypal', 'phonepe', 'googlepay', 'paytm') UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    api_key VARCHAR(255) DEFAULT NULL,
    api_secret VARCHAR(255) DEFAULT NULL,
    merchant_id VARCHAR(255) DEFAULT NULL,
    webhook_secret VARCHAR(255) DEFAULT NULL,
    additional_config JSON DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EXPENSE RECORDS TABLE
-- ============================================
CREATE TABLE expense_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50) DEFAULT NULL,
    invoice_number VARCHAR(100) DEFAULT NULL,
    added_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES admins(id) ON DELETE RESTRICT,
    INDEX idx_date (expense_date),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default admin (password: admin123)
INSERT INTO admins (name, email, password, role) VALUES 
('Super Admin', 'admin@smartlibrary.com', '$2a$10$YourHashedPasswordHere', 'super_admin');

-- Insert default seats (S01 to S50)
INSERT INTO seats (seat_number, seat_status, floor) VALUES
('S01', 'available', 1), ('S02', 'available', 1), ('S03', 'available', 1), ('S04', 'available', 1), ('S05', 'available', 1),
('S06', 'available', 1), ('S07', 'available', 1), ('S08', 'available', 1), ('S09', 'available', 1), ('S10', 'available', 1),
('S11', 'available', 1), ('S12', 'available', 1), ('S13', 'available', 1), ('S14', 'available', 1), ('S15', 'available', 1),
('S16', 'available', 1), ('S17', 'available', 1), ('S18', 'available', 1), ('S19', 'available', 1), ('S20', 'available', 1),
('S21', 'available', 2), ('S22', 'available', 2), ('S23', 'available', 2), ('S24', 'available', 2), ('S25', 'available', 2),
('S26', 'available', 2), ('S27', 'available', 2), ('S28', 'available', 2), ('S29', 'available', 2), ('S30', 'available', 2),
('S31', 'available', 2), ('S32', 'available', 2), ('S33', 'available', 2), ('S34', 'available', 2), ('S35', 'available', 2),
('S36', 'available', 2), ('S37', 'available', 2), ('S38', 'available', 2), ('S39', 'available', 2), ('S40', 'available', 2),
('S41', 'available', 3), ('S42', 'available', 3), ('S43', 'available', 3), ('S44', 'available', 3), ('S45', 'available', 3),
('S46', 'available', 3), ('S47', 'available', 3), ('S48', 'available', 3), ('S49', 'available', 3), ('S50', 'available', 3);

-- Insert default plans
INSERT INTO plans (name, description, price, duration_days, plan_type, shift_type, shift_start_time, shift_end_time) VALUES
('Monthly Full Day', 'Access to library for full day, 30 days', 1500.00, 30, 'full_day', 'all_day', '06:00:00', '22:00:00'),
('Monthly Morning Shift', 'Access to library morning shift, 30 days', 1000.00, 30, 'half_day', 'morning', '06:00:00', '14:00:00'),
('Monthly Evening Shift', 'Access to library evening shift, 30 days', 1000.00, 30, 'half_day', 'evening', '14:00:00', '22:00:00'),
('Quarterly Full Day', 'Access to library for full day, 90 days', 4000.00, 90, 'full_day', 'all_day', '06:00:00', '22:00:00'),
('Half Yearly Full Day', 'Access to library for full day, 180 days', 7500.00, 180, 'full_day', 'all_day', '06:00:00', '22:00:00'),
('Yearly Full Day', 'Access to library for full day, 365 days', 14000.00, 365, 'full_day', 'all_day', '06:00:00', '22:00:00');

-- Insert default facilities
INSERT INTO facilities (title, description, display_order, is_active) VALUES
('Free Wi-Fi', 'High-speed internet connectivity available throughout the library', 1, TRUE),
('Air Conditioned', 'Comfortable AC environment for better concentration', 2, TRUE),
('Parking', 'Free parking facility for bikes and cars', 3, TRUE),
('Water & Coffee', 'Complimentary drinking water and coffee', 4, TRUE),
('CCTV Security', '24/7 CCTV surveillance for safety and security', 5, TRUE),
('Power Backup', 'Uninterrupted power supply with backup generator', 6, TRUE);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('currency', 'INR', 'string', 'Default currency for transactions'),
('gst_percentage', '18', 'number', 'GST percentage for payments'),
('tax_enabled', 'true', 'boolean', 'Enable/disable tax calculation'),
('referral_bonus', '100', 'number', 'Bonus amount for successful referral'),
('site_name', 'Smart Library', 'string', 'Website name'),
('support_email', 'support@smartlibrary.com', 'string', 'Support email address'),
('support_phone', '+91-1234567890', 'string', 'Support phone number');

-- Insert default payment gateway settings
INSERT INTO payment_gateway_settings (gateway_name, is_active) VALUES
('razorpay', FALSE),
('stripe', FALSE),
('paypal', FALSE),
('phonepe', FALSE),
('googlepay', FALSE),
('paytm', FALSE);

-- Create indexes for better performance
CREATE INDEX idx_booking_user_date ON bookings(user_id, start_date, end_date);
CREATE INDEX idx_payment_date ON payments(payment_date);
CREATE INDEX idx_wallet_user_date ON wallet_transactions(user_id, created_at);

-- ============================================
-- VIEWS FOR DASHBOARD ANALYTICS
-- ============================================

-- Active members view
CREATE VIEW active_members AS
SELECT u.*, b.end_date as subscription_end_date
FROM users u
INNER JOIN bookings b ON u.id = b.user_id
WHERE b.status = 'active' AND b.end_date >= CURDATE()
GROUP BY u.id;

-- Expired members view
CREATE VIEW expired_members AS
SELECT u.*, MAX(b.end_date) as last_subscription_end_date
FROM users u
INNER JOIN bookings b ON u.id = b.user_id
WHERE b.status = 'expired' OR (b.status = 'active' AND b.end_date < CURDATE())
GROUP BY u.id;

-- Today's revenue view
CREATE VIEW todays_revenue AS
SELECT 
    DATE(payment_date) as date,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM payments
WHERE DATE(payment_date) = CURDATE() AND status = 'completed'
GROUP BY DATE(payment_date);

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure to update seat status based on booking
DELIMITER //
CREATE PROCEDURE update_seat_status()
BEGIN
    -- Mark seats as occupied for active bookings
    UPDATE seats s
    INNER JOIN bookings b ON s.id = b.seat_id
    SET s.seat_status = 'occupied'
    WHERE b.status = 'active' 
    AND CURDATE() BETWEEN b.start_date AND b.end_date;
    
    -- Mark seats as available where booking has expired
    UPDATE seats s
    LEFT JOIN bookings b ON s.id = b.seat_id AND b.status = 'active' AND CURDATE() BETWEEN b.start_date AND b.end_date
    SET s.seat_status = 'available'
    WHERE b.id IS NULL AND s.seat_status = 'occupied';
    
    -- Update booking status to expired
    UPDATE bookings
    SET status = 'expired'
    WHERE status = 'active' AND end_date < CURDATE();
END//
DELIMITER ;

-- ============================================
-- EVENTS FOR AUTOMATED TASKS
-- ============================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Event to update seat status daily
CREATE EVENT IF NOT EXISTS daily_seat_update
ON SCHEDULE EVERY 1 DAY
STARTS CURDATE() + INTERVAL 1 DAY
DO CALL update_seat_status();

-- Event to send birthday reminders
CREATE EVENT IF NOT EXISTS birthday_reminder
ON SCHEDULE EVERY 1 DAY
STARTS CURDATE() + INTERVAL 1 DAY
DO
    INSERT INTO notifications (user_id, title, message, type)
    SELECT id, 'Happy Birthday!', 'Wishing you a wonderful birthday from Smart Library team!', 'general'
    FROM users
    WHERE DATE_FORMAT(dob, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d');

SHOW TABLES;
