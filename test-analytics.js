const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testAnalytics() {
  try {
    console.log('🧪 Testing analytics system...')
    
    // Test 1: Check if analytics tables exist
    console.log('\n1️⃣ Testing analytics tables...')
    
    const tables = ['analytics_visits', 'analytics_suggestions', 'analytics_sessions', 'analytics_ip_blacklist']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: Working`)
      }
    }
    
    // Test 2: Test IP blacklist functions
    console.log('\n2️⃣ Testing IP blacklist functions...')
    
    // Get blacklisted IPs
    const { data: blacklistedIPs, error: getError } = await supabase
      .from('analytics_ip_blacklist')
      .select('*')
      .order('added_at', { ascending: false })
    
    if (getError) {
      console.log(`❌ Error getting blacklisted IPs: ${getError.message}`)
    } else {
      console.log(`✅ Found ${blacklistedIPs.length} blacklisted IPs`)
      blacklistedIPs.forEach(ip => {
        console.log(`   - ${ip.ip_address}: ${ip.description}`)
      })
    }
    
    // Test 3: Test adding a blacklisted IP
    console.log('\n3️⃣ Testing add blacklisted IP...')
    
    const testIP = '192.168.1.999'
    const { error: addError } = await supabase
      .from('analytics_ip_blacklist')
      .insert({
        ip_address: testIP,
        description: 'Test IP for verification'
      })
    
    if (addError && addError.code === '23505') {
      console.log(`✅ IP ${testIP} already exists (expected)`)
    } else if (addError) {
      console.log(`❌ Error adding IP: ${addError.message}`)
    } else {
      console.log(`✅ Successfully added test IP: ${testIP}`)
    }
    
    // Test 4: Test removing the test IP
    console.log('\n4️⃣ Testing remove blacklisted IP...')
    
    const { error: removeError } = await supabase
      .from('analytics_ip_blacklist')
      .delete()
      .eq('ip_address', testIP)
    
    if (removeError) {
      console.log(`❌ Error removing IP: ${removeError.message}`)
    } else {
      console.log(`✅ Successfully removed test IP: ${testIP}`)
    }
    
    // Test 5: Check analytics data
    console.log('\n5️⃣ Checking analytics data...')
    
    const { data: visits, error: visitsError } = await supabase
      .from('analytics_visits')
      .select('*')
    
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('analytics_suggestions')
      .select('*')
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('analytics_sessions')
      .select('*')
    
    console.log(`✅ Analytics data:`)
    console.log(`   - Visits: ${visits?.length || 0}`)
    console.log(`   - Suggestions: ${suggestions?.length || 0}`)
    console.log(`   - Sessions: ${sessions?.length || 0}`)
    
    console.log('\n🎉 All tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAnalytics() 