// Test script to verify admin insert functionality
// Run this after applying the RLS policy fix

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
  console.log('🧪 Testing admin insert functionality...')
  
  const testRecipe = {
    name: 'Test Recipe - RLS Fix',
    description: 'This is a test recipe to verify RLS policies are working',
    meal_type: 'lunch',
    dietary_preference: 'any',
    cooking_time: 'quick',
    prep_time: '15 mins',
    difficulty: 'easy',
    ingredients: ['Test ingredient 1', 'Test ingredient 2'],
    instructions: ['Test step 1', 'Test step 2'],
    cuisine_type: 'Nigerian'
  }

  try {
    console.log('📝 Attempting to insert test recipe...')
    const { data, error } = await supabase
      .from('meals')
      .insert([testRecipe])
      .select()

    if (error) {
      console.error('❌ Insert failed:', error)
      return false
    }

    console.log('✅ Insert successful!')
    console.log('📊 Inserted recipe:', data[0])
    
    // Clean up - delete the test recipe
    console.log('🧹 Cleaning up test recipe...')
    const { error: deleteError } = await supabase
      .from('meals')
      .delete()
      .eq('name', 'Test Recipe - RLS Fix')

    if (deleteError) {
      console.error('⚠️ Cleanup failed:', deleteError)
    } else {
      console.log('✅ Test recipe cleaned up successfully')
    }

    return true
  } catch (err) {
    console.error('❌ Test failed:', err)
    return false
  }
}

// Run the test
testInsert().then(success => {
  if (success) {
    console.log('🎉 RLS policy fix is working! Admin can now insert recipes.')
  } else {
    console.log('💥 RLS policy fix failed. Check the error messages above.')
  }
}) 