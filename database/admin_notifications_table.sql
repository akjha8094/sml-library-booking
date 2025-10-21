-- ============================================
-- ADMIN NOTIFICATIONS TABLE
-- For admin-specific notifications (payments, bookings, support tickets, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('payment', 'booking', 'support', 'plan', 'general') DEFAULT 'general',
    related_id INT DEFAULT NULL, -- ID of related entity (payment_id, booking_id, ticket_id, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
