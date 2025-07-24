-- Reset Analytics Data
-- This script will clear all analytics data and reset sequences

-- Clear all data from analytics tables (more reliable syntax)
DELETE FROM user_feedback WHERE id >= 1;
DELETE FROM suggestion_clicks WHERE id >= 1;
DELETE FROM website_visits WHERE id >= 1;

-- Reset sequences to start from 1
ALTER SEQUENCE website_visits_id_seq RESTART WITH 1;
ALTER SEQUENCE suggestion_clicks_id_seq RESTART WITH 1;
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
    'user_feedback' as table_name, COUNT(*) as record_count 
FROM user_feedback;

-- Show message
SELECT 'Analytics data reset successfully!' as message; 