-- ============================================
-- OFFERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS offers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    offer_code VARCHAR(50) UNIQUE,
    discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    terms_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_dates (valid_from, valid_until),
    INDEX idx_code (offer_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADVANCE BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS advance_bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    seat_id INT DEFAULT NULL,
    booking_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    booking_status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    payment_id INT DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (booking_status),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUPPORT TICKET ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS support_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    INDEX idx_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT SAMPLE OFFERS
-- ============================================
INSERT INTO offers (title, description, offer_code, discount_type, discount_value, valid_from, valid_until, min_purchase_amount, max_discount_amount, terms_conditions) VALUES
('New Year Special', 'Get 20% off on all yearly plans. Book now and save big!', 'NEWYEAR2025', 'percentage', 20.00, '2025-01-01', '2025-01-31', 5000.00, 3000.00, 'Valid only for yearly plans. Cannot be combined with other offers.'),
('Student Discount', 'Special 15% discount for students on all plans', 'STUDENT15', 'percentage', 15.00, '2025-01-01', '2025-12-31', 0.00, NULL, 'Valid student ID required. Applicable on all plans.'),
('First Booking Offer', 'Flat ₹500 off on your first booking', 'FIRST500', 'fixed', 500.00, '2025-01-01', '2025-12-31', 1000.00, 500.00, 'Valid only for new users. Minimum booking amount ₹1000.'),
('Weekend Special', 'Get 10% off on weekend bookings', 'WEEKEND10', 'percentage', 10.00, '2025-01-01', '2025-12-31', 500.00, 1000.00, 'Valid only on Saturday and Sunday bookings.'),
('Referral Bonus', 'Refer a friend and get ₹300 off on your next booking', 'REFER300', 'fixed', 300.00, '2025-01-01', '2025-12-31', 1000.00, 300.00, 'Valid when you refer a new user who makes their first booking.');
