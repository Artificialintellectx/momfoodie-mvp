import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://qzljwqmdswtidhmnldpa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6bGp3cW1kc3d0aWRobW5sZHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMzU1NjYsImV4cCI6MjA2ODcxMTU2Nn0.Z6TecPOGF4C8KfYMAbqvD2CTeYrr8xmnPsFHXc3qSQI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugRepetition() {
  console.log('🔍 Debugging repetition issue...')
  
  try {
    // Get all dinner + regular meals
    const { data: meals, error } = await supabase
      .from('meals')
      .select('*')
      .eq('meal_type', 'dinner')
      .eq('cooking_time', 'regular')
    
    if (error) {
      console.error('❌ Error fetching meals:', error.message)
      return
    }
    
    console.log(`📊 Found ${meals.length} dinner + regular meals:`)
    
    // Check for duplicate names
    const mealNames = meals.map(m => m.name)
    const uniqueNames = [...new Set(mealNames)]
    
    if (mealNames.length !== uniqueNames.length) {
      console.log('⚠️ DUPLICATE NAMES FOUND:')
      const duplicates = mealNames.filter((name, index) => mealNames.indexOf(name) !== index)
      console.log('Duplicate names:', [...new Set(duplicates)])
      
      // Show details of duplicate meals
      duplicates.forEach(duplicateName => {
        const duplicateMeals = meals.filter(m => m.name === duplicateName)
        console.log(`\n📋 "${duplicateName}" appears ${duplicateMeals.length} times:`)
        duplicateMeals.forEach((meal, index) => {
          console.log(`   ${index + 1}. ID: ${meal.id}, Name: "${meal.name}"`)
        })
      })
    } else {
      console.log('✅ No duplicate names found')
    }
    
    // Check for duplicate IDs
    const mealIds = meals.map(m => m.id)
    const uniqueIds = [...new Set(mealIds)]
    
    if (mealIds.length !== uniqueIds.length) {
      console.log('⚠️ DUPLICATE IDs FOUND:')
      const duplicateIds = mealIds.filter((id, index) => mealIds.indexOf(id) !== index)
      console.log('Duplicate IDs:', [...new Set(duplicateIds)])
    } else {
      console.log('✅ No duplicate IDs found')
    }
    
    // Show all meals with their IDs
    console.log('\n📋 All dinner + regular meals:')
    meals.forEach(meal => {
      console.log(`   ID: ${meal.id}, Name: "${meal.name}"`)
    })
    
    // Check specifically for "Groundnut Stew with Rice and Spinach"
    const groundnutMeals = meals.filter(m => m.name === 'Groundnut Stew with Rice and Spinach')
    console.log(`\n🔍 "Groundnut Stew with Rice and Spinach" appears ${groundnutMeals.length} times:`)
    groundnutMeals.forEach((meal, index) => {
      console.log(`   ${index + 1}. ID: ${meal.id}, Name: "${meal.name}"`)
    })
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the debug
debugRepetition().catch(console.error) 