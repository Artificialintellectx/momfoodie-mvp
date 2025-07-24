const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkFeedbackTable() {
  try {
    console.log('🔍 Checking user feedback table structure...')

    // Get table structure using a simple query
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_feedback' })
      .catch(() => {
        // Fallback: try to get structure by querying the table
        return supabase
          .from('user_feedback')
          .select('*')
          .limit(0)
      })

    if (columnError) {
      console.log('❌ Error getting table structure:', columnError.message)
      return
    }

    console.log('✅ Table structure check completed')
    console.log('📋 Available columns:', Object.keys(columns || {}).join(', '))

    // Test inserting data with all required columns
    const testData = {
      meal_id: 'test-meal-fix',
      meal_name: 'Test Jollof Rice',
      rating: 5,
      feedback_type: 'recipe_rating',
      user_agent: 'Test Fix Script'
    }

    console.log('🧪 Testing data insertion...')
    const { error: insertError } = await supabase
      .from('user_feedback')
      .insert(testData)

    if (insertError) {
      console.log('❌ Error inserting test data:', insertError.message)
      console.log('🔧 Please run the fix-feedback-table.sql script in your Supabase dashboard')
      return
    }

    console.log('✅ Test data inserted successfully!')
    
    // Clean up test data
    await supabase
      .from('user_feedback')
      .delete()
      .eq('meal_id', 'test-meal-fix')
    
    console.log('🧹 Test data cleaned up.')

    // Test reading data
    const { data: feedbackData, error: readError } = await supabase
      .from('user_feedback')
      .select('*')
      .limit(5)

    if (readError) {
      console.log('❌ Error reading data:', readError.message)
    } else {
      console.log(`✅ Successfully read ${feedbackData.length} feedback entries`)
      if (feedbackData.length > 0) {
        console.log('📊 Sample data structure:', Object.keys(feedbackData[0]))
      }
    }

    console.log('🎉 User feedback table is working correctly!')
    console.log('📊 You can now use the feedback system in your app.')

  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkFeedbackTable() 