-- Fix user_refund_requests table to allow NULL payment_id
-- This allows refund requests even if payment hasn't been completed yet

USE sml_library;

-- Alter table to allow NULL for payment_id
ALTER TABLE user_refund_requests 
MODIFY COLUMN payment_id INT DEFAULT NULL;

-- Verify the change
DESCRIBE user_refund_requests;
