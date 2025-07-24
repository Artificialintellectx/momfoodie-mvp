// Utility to mark current device as "my device" for analytics exclusion
// Run this in your browser console on each of your devices

console.log('🔧 Marking this device as "my device" for analytics exclusion...')

// Method 1: Mark device in localStorage
localStorage.setItem('momfoodie_my_device', 'true')
console.log('✅ Device marked as "my device" in localStorage')

// Method 2: Get current IP for manual blacklisting
async function getCurrentIP() {
  try {
    const response = await fetch('/api/get-ip')
    const data = await response.json()
    console.log('🌐 Current IP Address:', data.ip)
    console.log('📝 Add this IP to the blacklist in admin dashboard if needed')
    return data.ip
  } catch (error) {
    console.error('❌ Error getting IP:', error)
    return null
  }
}

// Method 3: Show device info
console.log('📱 Device Info:')
console.log('   User Agent:', navigator.userAgent)
console.log('   Platform:', navigator.platform)
console.log('   Language:', navigator.language)
console.log('   Cookie Enabled:', navigator.cookieEnabled)

// Method 4: Show current location info
if (typeof window !== 'undefined' && window.location) {
  console.log('📍 Current Location:')
  console.log('   Protocol:', window.location.protocol)
  console.log('   Host:', window.location.host)
  console.log('   Port:', window.location.port)
  console.log('   Pathname:', window.location.pathname)
}

// Get IP
getCurrentIP()

console.log('')
console.log('🎯 This device will now be excluded from analytics tracking!')
console.log('')
console.log('📋 To unmark this device, run:')
console.log('   localStorage.removeItem("momfoodie_my_device")')
console.log('')
console.log('🔄 To check if device is marked, run:')
console.log('   localStorage.getItem("momfoodie_my_device")') 