const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function inspectTable() {
  try {
    console.log('🔍 Inspecting user_feedback table structure...')

    // Try to get table structure by attempting a simple query
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .limit(1)

    if (error) {
      console.log('❌ Error accessing table:', error.message)
      
      // If table doesn't exist, show that
      if (error.code === '42P01') {
        console.log('📋 The user_feedback table does not exist.')
        console.log('🔧 Please run the complete-feedback-table-fix.sql script in your Supabase dashboard.')
        return
      }
      
      // If it's a column issue, show what we can determine
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('📋 The table exists but is missing columns.')
        console.log('🔧 Please run the complete-feedback-table-fix.sql script in your Supabase dashboard.')
        return
      }
      
      return
    }

    // If we get here, the table exists and has some structure
    console.log('✅ Table exists and is accessible!')
    
    if (data && data.length > 0) {
      console.log('📊 Available columns:', Object.keys(data[0]).join(', '))
      console.log('📋 Sample data structure:', data[0])
    } else {
      console.log('📊 Table is empty but accessible')
    }

    // Try to insert a test record to see what columns are missing
    console.log('🧪 Testing insertion...')
    const testData = {
      meal_id: 'test-inspect',
      meal_name: 'Test Meal',
      rating: 5,
      feedback_type: 'recipe_rating',
      user_agent: 'Inspection Script'
    }

    const { error: insertError } = await supabase
      .from('user_feedback')
      .insert(testData)

    if (insertError) {
      console.log('❌ Insert error:', insertError.message)
      console.log('🔧 This indicates missing columns. Run the complete-feedback-table-fix.sql script.')
    } else {
      console.log('✅ Insert successful! Table structure is correct.')
      
      // Clean up
      await supabase
        .from('user_feedback')
        .delete()
        .eq('meal_id', 'test-inspect')
      
      console.log('🧹 Test data cleaned up.')
    }

  } catch (error) {
    console.error('❌ Inspection failed:', error)
  }
}

inspectTable() 