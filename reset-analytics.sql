-- Reset Analytics Data Script
-- This script will clear all analytics data to start fresh

-- Clear website visits
DELETE FROM website_visits;

-- Clear suggestion clicks
DELETE FROM suggestion_clicks;

-- Clear user feedback
DELETE FROM user_feedback;

-- Clear device tracking
DELETE FROM device_tracking;

-- Reset sequences (if they exist)
-- Note: This is optional and depends on your database setup
-- ALTER SEQUENCE website_visits_id_seq RESTART WITH 1;
-- ALTER SEQUENCE suggestion_clicks_id_seq RESTART WITH 1;
-- ALTER SEQUENCE user_feedback_id_seq RESTART WITH 1;
-- ALTER SEQUENCE device_tracking_id_seq RESTART WITH 1;

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
SELECT '✅ Analytics data has been reset successfully!' as status; 