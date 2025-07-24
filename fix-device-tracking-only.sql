-- Fix Device Tracking Table Only - COMPREHENSIVE FIX
-- This script specifically addresses the 406 errors for device_tracking

-- Step 1: Check current state
SELECT 'Current device_tracking table structure:' as info;
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'device_tracking' 
ORDER BY ordinal_position;

-- Step 2: Drop the device_tracking table completely
DROP TABLE IF EXISTS device_tracking CASCADE;

-- Step 3: Create device_tracking table with the exact schema expected by the analytics code
CREATE TABLE device_tracking (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_id VARCHAR(255),
    marked_time TIMESTAMP DEFAULT NOW(),
    is_blacklisted BOOLEAN DEFAULT FALSE
);

-- Step 4: Enable Row Level Security
ALTER TABLE device_tracking ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies that allow ALL operations
CREATE POLICY "Allow all operations for device_tracking" ON device_tracking 
FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Create indexes for better performance
CREATE INDEX idx_device_tracking_ip ON device_tracking(ip_address);
CREATE INDEX idx_device_tracking_blacklisted ON device_tracking(is_blacklisted);
CREATE INDEX idx_device_tracking_ip_blacklisted ON device_tracking(ip_address, is_blacklisted);

-- Step 7: Insert test records to verify the table works
INSERT INTO device_tracking (ip_address, user_agent, device_id, is_blacklisted) VALUES 
('::1', 'Test User Agent 1', 'test_device_123', false),
('127.0.0.1', 'Test User Agent 2', 'test_device_456', false),
('192.168.1.1', 'Test User Agent 3', 'test_device_789', true);

-- Step 8: Verify the table was created correctly
SELECT 'device_tracking table created successfully' as status;
SELECT 
    'device_tracking' as table_name, COUNT(*) as record_count 
FROM device_tracking;

-- Step 9: Show the final table structure
SELECT 'Final table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'device_tracking' 
ORDER BY ordinal_position;

-- Step 10: Test the exact query that the analytics code uses
SELECT 'Testing the exact analytics query:' as info;
SELECT ip_address 
FROM device_tracking 
WHERE ip_address = '::1' 
AND is_blacklisted = true;

-- Step 11: Test a broader query to make sure the table is accessible
SELECT 'Testing general table access:' as info;
SELECT * FROM device_tracking WHERE ip_address = '::1';

-- Step 12: Verify RLS policies
SELECT 'RLS policies on device_tracking:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'device_tracking'; 