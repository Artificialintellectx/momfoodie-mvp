-- IP Blacklist table for analytics
CREATE TABLE IF NOT EXISTS analytics_ip_blacklist (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  description TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by VARCHAR(100) DEFAULT 'admin'
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_analytics_ip_blacklist_ip ON analytics_ip_blacklist(ip_address);

-- RLS policies for IP blacklist
ALTER TABLE analytics_ip_blacklist ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admin access)
CREATE POLICY "Allow all operations for authenticated users" ON analytics_ip_blacklist
  FOR ALL USING (true);

-- Insert some common local IPs that should be blacklisted
INSERT INTO analytics_ip_blacklist (ip_address, description) VALUES
  ('127.0.0.1', 'Localhost'),
  ('::1', 'Localhost IPv6'),
  ('192.168.1.1', 'Common router IP'),
  ('10.0.0.1', 'Common router IP'),
  ('172.16.0.1', 'Common router IP')
ON CONFLICT (ip_address) DO NOTHING; 