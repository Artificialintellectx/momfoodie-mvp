-- Setup and Reset Analytics Data Script
-- This script will create analytics tables if they don't exist, then reset all data

-- First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('website_visits', 'suggestion_clicks', 'user_feedback', 'device_tracking');

-- Create website_visits table if it doesn't exist
CREATE TABLE IF NOT EXISTS website_visits (
  id SERIAL PRIMARY KEY,
  page_name VARCHAR(255) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  visit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(255)
);

-- Create suggestion_clicks table if it doesn't exist
CREATE TABLE IF NOT EXISTS suggestion_clicks (
  id SERIAL PRIMARY KEY,
  button_name VARCHAR(255) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  click_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(255),
  additional_data JSONB
);

-- Create device_tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS device_tracking (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_blacklisted BOOLEAN DEFAULT FALSE,
  visit_count INTEGER DEFAULT 1,
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_feedback table should already exist from previous setup
-- If not, create it
CREATE TABLE IF NOT EXISTS user_feedback (
  id SERIAL PRIMARY KEY,
  meal_id VARCHAR(255) NOT NULL,
  meal_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_type VARCHAR(100) DEFAULT 'recipe_rating',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE website_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for website_visits
DROP POLICY IF EXISTS "Allow anonymous website visits" ON website_visits;
CREATE POLICY "Allow anonymous website visits" ON website_visits
  FOR ALL USING (true);

-- Create RLS policies for suggestion_clicks
DROP POLICY IF EXISTS "Allow anonymous suggestion clicks" ON suggestion_clicks;
CREATE POLICY "Allow anonymous suggestion clicks" ON suggestion_clicks
  FOR ALL USING (true);

-- Create RLS policies for device_tracking
DROP POLICY IF EXISTS "Allow anonymous device tracking" ON device_tracking;
CREATE POLICY "Allow anonymous device tracking" ON device_tracking
  FOR ALL USING (true);

-- Create RLS policies for user_feedback (if not already exists)
DROP POLICY IF EXISTS "Allow anonymous feedback insertion" ON user_feedback;
CREATE POLICY "Allow anonymous feedback insertion" ON user_feedback
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous feedback reading" ON user_feedback;
CREATE POLICY "Allow anonymous feedback reading" ON user_feedback
  FOR SELECT USING (true);

-- Now reset all data
DELETE FROM website_visits;
DELETE FROM suggestion_clicks;
DELETE FROM user_feedback;
DELETE FROM device_tracking;

-- Reset sequences
ALTER SEQUENCE IF EXISTS website_visits_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS suggestion_clicks_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_feedback_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS device_tracking_id_seq RESTART WITH 1;

-- Verify the reset
SELECT 
  'website_visits' as table_name, COUNT(*) as remaining_records 
FROM website_visits
UNION ALL
SELECT 
  'suggestion_clicks' as table_name, COUNT(*) as remaining_records 
FROM suggestion_clicks
UNION ALL
SELECT 
  'user_feedback' as table_name, COUNT(*) as remaining_records 
FROM user_feedback
UNION ALL
SELECT 
  'device_tracking' as table_name, COUNT(*) as remaining_records 
FROM device_tracking;

-- Success message
SELECT '✅ Analytics tables created and data reset successfully!' as status; 