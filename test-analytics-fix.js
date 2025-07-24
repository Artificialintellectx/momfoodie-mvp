// Test script to verify analytics functions
import { analytics, analyticsDashboard } from './lib/analytics.js'

async function testAnalytics() {
  console.log('🧪 Testing Analytics Functions...')
  
  try {
    // Test 1: Check if tables exist and can be queried
    console.log('\n📊 Test 1: Checking analytics tables...')
    
    const visits = await analyticsDashboard.getWebsiteVisits('7d')
    console.log('✅ Website visits query successful:', visits.total, 'visits')
    
    const clicks = await analyticsDashboard.getSuggestionClicks('7d')
    console.log('✅ Suggestion clicks query successful:', clicks.total, 'clicks')
    
    const feedback = await analyticsDashboard.getUserFeedback('7d')
    console.log('✅ User feedback query successful:', feedback.total, 'ratings')
    
    const blacklist = await analyticsDashboard.getBlacklistedIPs()
    console.log('✅ Blacklist query successful:', blacklist.length, 'blacklisted IPs')
    
    // Test 2: Test IP detection
    console.log('\n🌐 Test 2: Testing IP detection...')
    const ip = await analytics.getClientIP()
    console.log('✅ IP detection successful:', ip)
    
    // Test 3: Test device detection
    console.log('\n📱 Test 3: Testing device detection...')
    const isMyDevice = analytics.isMyDevice(navigator.userAgent, ip)
    console.log('✅ Device detection working:', isMyDevice ? 'My device detected' : 'Not my device')
    
    // Test 4: Test session ID generation
    console.log('\n🆔 Test 4: Testing session ID...')
    const sessionId = analytics.getSessionId()
    console.log('✅ Session ID generated:', sessionId)
    
    console.log('\n🎉 All analytics tests passed!')
    
  } catch (error) {
    console.error('❌ Analytics test failed:', error)
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testAnalytics = testAnalytics
  console.log('🧪 Analytics test function available. Run: testAnalytics()')
} else {
  // Node.js environment
  testAnalytics()
} 