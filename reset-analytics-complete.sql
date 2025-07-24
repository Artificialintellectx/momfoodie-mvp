-- Complete Analytics Reset Script
-- This script will clear all analytics data and reset sequences

-- First, ensure all analytics tables exist
CREATE TABLE IF NOT EXISTS website_visits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    page_visited VARCHAR(255),
    visit_time TIMESTAMP DEFAULT NOW(),
    session_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS suggestion_clicks (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    button_clicked VARCHAR(100),
    click_time TIMESTAMP DEFAULT NOW(),
    session_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS device_tracking (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_id VARCHAR(255),
    marked_time TIMESTAMP DEFAULT NOW(),
    is_blacklisted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    meal_id VARCHAR(255),
    meal_name VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_type VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE website_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Clear all data from analytics tables
DELETE FROM user_feedback;
DELETE FROM device_tracking;
DELETE FROM suggestion_clicks;
DELETE FROM website_visits;

-- Reset sequences to start from 1
ALTER SEQUENCE website_visits_id_seq RESTART WITH 1;
ALTER SEQUENCE suggestion_clicks_id_seq RESTART WITH 1;
ALTER SEQUENCE device_tracking_id_seq RESTART WITH 1;
ALTER SEQUENCE user_feedback_id_seq RESTART WITH 1;

-- Verify the reset
SELECT 
    'website_visits' as table_name, COUNT(*) as record_count 
FROM website_visits
UNION ALL
SELECT 
    'suggestion_clicks' as table_name, COUNT(*) as record_count 
FROM suggestion_clicks
UNION ALL
SELECT 
    'device_tracking' as table_name, COUNT(*) as record_count 
FROM device_tracking
UNION ALL
SELECT 
    'user_feedback' as table_name, COUNT(*) as record_count 
FROM user_feedback;

-- Success message
SELECT 'Analytics data has been completely reset!' as status; 