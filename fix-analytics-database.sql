-- Fix Analytics Database Schema
-- Run this in your Supabase SQL Editor to create the correct analytics tables

-- Drop existing tables if they exist (to recreate with correct schema)
DROP TABLE IF EXISTS user_feedback CASCADE;
DROP TABLE IF EXISTS device_tracking CASCADE;
DROP TABLE IF EXISTS suggestion_clicks CASCADE;
DROP TABLE IF EXISTS website_visits CASCADE;

-- Create website_visits table with correct schema
CREATE TABLE website_visits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    page_visited VARCHAR(255),
    visit_time TIMESTAMP DEFAULT NOW(),
    session_id VARCHAR(255)
);

-- Create suggestion_clicks table with correct schema
CREATE TABLE suggestion_clicks (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    button_clicked VARCHAR(100),
    click_time TIMESTAMP DEFAULT NOW(),
    session_id VARCHAR(255)
);

-- Create device_tracking table with correct schema
CREATE TABLE device_tracking (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_id VARCHAR(255),
    marked_time TIMESTAMP DEFAULT NOW(),
    is_blacklisted BOOLEAN DEFAULT FALSE
);

-- Create user_feedback table with correct schema
CREATE TABLE user_feedback (
    id SERIAL PRIMARY KEY,
    meal_id VARCHAR(255),
    meal_name VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_type VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE website_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for website_visits
CREATE POLICY "Enable insert for all users" ON website_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON website_visits FOR SELECT USING (true);

-- Create RLS policies for suggestion_clicks
CREATE POLICY "Enable insert for all users" ON suggestion_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON suggestion_clicks FOR SELECT USING (true);

-- Create RLS policies for device_tracking
CREATE POLICY "Enable insert for all users" ON device_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON device_tracking FOR SELECT USING (true);

-- Create RLS policies for user_feedback
CREATE POLICY "Enable insert for all users" ON user_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON user_feedback FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_website_visits_ip ON website_visits(ip_address);
CREATE INDEX idx_website_visits_time ON website_visits(visit_time);
CREATE INDEX idx_website_visits_session ON website_visits(session_id);

CREATE INDEX idx_suggestion_clicks_ip ON suggestion_clicks(ip_address);
CREATE INDEX idx_suggestion_clicks_time ON suggestion_clicks(click_time);
CREATE INDEX idx_suggestion_clicks_session ON suggestion_clicks(session_id);

CREATE INDEX idx_device_tracking_ip ON device_tracking(ip_address);
CREATE INDEX idx_device_tracking_blacklisted ON device_tracking(is_blacklisted);

CREATE INDEX idx_user_feedback_created ON user_feedback(created_at);
CREATE INDEX idx_user_feedback_meal ON user_feedback(meal_id);

-- Verify the tables were created correctly
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

-- Show table schemas to verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'website_visits' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'suggestion_clicks' 
ORDER BY ordinal_position; 