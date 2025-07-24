const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createBlacklistTable() {
  try {
    console.log('🔧 Creating IP blacklist table...')
    
    // First, let's check if the table exists
    const { data: existingTable, error: checkError } = await supabase
      .from('analytics_ip_blacklist')
      .select('*')
      .limit(1)
    
    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, we need to create it
      console.log('📋 Table does not exist, creating...')
      
      // Since we can't use RPC for DDL, let's create it manually
      // We'll use the Supabase dashboard or a direct SQL connection
      console.log('⚠️  Please create the table manually in Supabase dashboard:')
      console.log('')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Go to SQL Editor')
      console.log('3. Run this SQL:')
      console.log('')
      console.log(`
CREATE TABLE IF NOT EXISTS analytics_ip_blacklist (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  description TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by VARCHAR(100) DEFAULT 'admin'
);

CREATE INDEX IF NOT EXISTS idx_analytics_ip_blacklist_ip ON analytics_ip_blacklist(ip_address);

ALTER TABLE analytics_ip_blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON analytics_ip_blacklist
  FOR ALL USING (true);

INSERT INTO analytics_ip_blacklist (ip_address, description) VALUES
  ('127.0.0.1', 'Localhost'),
  ('::1', 'Localhost IPv6'),
  ('192.168.1.1', 'Common router IP'),
  ('10.0.0.1', 'Common router IP'),
  ('172.16.0.1', 'Common router IP')
ON CONFLICT (ip_address) DO NOTHING;
      `)
      console.log('')
      console.log('4. After creating the table, the IP blacklist feature will work!')
      
    } else if (checkError) {
      console.error('❌ Error checking table:', checkError)
    } else {
      console.log('✅ IP blacklist table already exists!')
      
      // Test inserting a record
      const { error: insertError } = await supabase
        .from('analytics_ip_blacklist')
        .insert({
          ip_address: '192.168.1.100',
          description: 'Test IP'
        })
      
      if (insertError && insertError.code === '23505') {
        console.log('✅ Table exists and is working (duplicate key error expected)')
      } else if (insertError) {
        console.error('❌ Error testing table:', insertError)
      } else {
        console.log('✅ Table exists and is working!')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createBlacklistTable() 