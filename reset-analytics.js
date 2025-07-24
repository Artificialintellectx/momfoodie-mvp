const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function resetAnalytics() {
  try {
    console.log('🗑️ Resetting analytics data...')
    
    // Delete all analytics data
    const { error: visitsError } = await supabase
      .from('analytics_visits')
      .delete()
      .neq('id', 0) // Delete all rows
    
    const { error: suggestionsError } = await supabase
      .from('analytics_suggestions')
      .delete()
      .neq('id', 0) // Delete all rows
    
    const { error: sessionsError } = await supabase
      .from('analytics_sessions')
      .delete()
      .neq('id', 0) // Delete all rows
    
    if (visitsError) console.error('Error deleting visits:', visitsError)
    if (suggestionsError) console.error('Error deleting suggestions:', suggestionsError)
    if (sessionsError) console.error('Error deleting sessions:', sessionsError)
    
    console.log('✅ Analytics data reset successfully!')
  } catch (error) {
    console.error('❌ Error resetting analytics:', error)
  }
}

resetAnalytics() 