const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function setupFeedbackTable() {
  try {
    console.log('🔧 Setting up user feedback table...')

    // Check if table exists
    const { data: existingTable, error: checkError } = await supabase
      .from('user_feedback')
      .select('*')
      .limit(1)

    if (checkError && checkError.code === '42P01') {
      console.log('❌ Table does not exist. Please run the SQL schema manually in Supabase dashboard.')
      console.log('📋 Copy and paste the contents of user-feedback-schema.sql into your Supabase SQL editor.')
      return
    }

    if (checkError) {
      console.log('❌ Error checking table:', checkError.message)
      return
    }

    console.log('✅ User feedback table exists!')

    // Test inserting sample data
    const { error: insertError } = await supabase
      .from('user_feedback')
      .insert({
        meal_id: 'test-meal-1',
        meal_name: 'Test Jollof Rice',
        rating: 5,
        feedback_type: 'recipe_rating',
        user_agent: 'Test Setup Script'
      })

    if (insertError) {
      console.log('❌ Error inserting test data:', insertError.message)
      console.log('🔧 This might be due to RLS policies. Check your Supabase dashboard.')
    } else {
      console.log('✅ Test data inserted successfully!')
      
      // Clean up test data
      await supabase
        .from('user_feedback')
        .delete()
        .eq('meal_id', 'test-meal-1')
      
      console.log('🧹 Test data cleaned up.')
    }

    // Test reading data
    const { data: feedbackData, error: readError } = await supabase
      .from('user_feedback')
      .select('*')
      .limit(5)

    if (readError) {
      console.log('❌ Error reading data:', readError.message)
    } else {
      console.log(`✅ Successfully read ${feedbackData.length} feedback entries`)
    }

    console.log('🎉 User feedback table setup complete!')
    console.log('📊 You can now view feedback analytics in the admin dashboard.')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupFeedbackTable() 