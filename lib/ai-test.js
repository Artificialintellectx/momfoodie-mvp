// Test file for AI suggestions system
import { getAISuggestions, getIngredientSimilarity } from './ai-suggestions'

// Mock meals data for testing
const mockMeals = [
  {
    id: 'jollof_rice',
    name: 'Jollof Rice',
    ingredients: ['rice', 'tomatoes', 'tomato paste', 'onion', 'scotch bonnet', 'vegetable oil'],
    meal_type: 'lunch',
    cooking_time: '45 mins',
    difficulty: 'medium',
    description: 'Classic Nigerian jollof rice with rich tomato sauce'
  },
  {
    id: 'fried_rice',
    name: 'Fried Rice',
    ingredients: ['rice', 'carrots', 'green beans', 'onion', 'vegetable oil'],
    meal_type: 'lunch',
    cooking_time: '30 mins',
    difficulty: 'easy',
    description: 'Quick and delicious fried rice'
  },
  {
    id: 'fish_stew',
    name: 'Fish Stew',
    ingredients: ['fish', 'tomatoes', 'onion', 'scotch bonnet', 'vegetable oil'],
    meal_type: 'dinner',
    cooking_time: '40 mins',
    difficulty: 'medium',
    description: 'Traditional Nigerian fish stew'
  }
]

// Test function
export const testAISystem = async () => {
  console.log('🧪 Testing AI system...')
  
  try {
    // Test 1: Check API key
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    console.log('🔑 API Key available:', !!apiKey)
    
    // Test 2: Test ingredient similarity
    const similarity = getIngredientSimilarity('tomato', 'tomatoes')
    console.log('🔍 Ingredient similarity test:', similarity)
    
    // Test 3: Test AI suggestions
    const userIngredients = ['rice', 'tomatoes', 'fish']
    const userContext = { mealType: 'lunch', spicy: true }
    
    console.log('🤖 Testing AI suggestions...')
    const suggestions = await getAISuggestions(userIngredients, mockMeals, userContext)
    
    console.log('✅ AI suggestions result:', suggestions.length, 'suggestions')
    suggestions.forEach((meal, index) => {
      console.log(`  ${index + 1}. ${meal.name} (Score: ${meal.aiScore || meal.ingredientScore})`)
    })
    
    return {
      success: true,
      apiKeyAvailable: !!apiKey,
      similarityTest: similarity,
      suggestionsCount: suggestions.length
    }
    
  } catch (error) {
    console.error('❌ AI test failed:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Test ingredient similarity
export const testIngredientSimilarity = () => {
  const tests = [
    ['tomato', 'tomatoes'],
    ['fish', 'tilapia'],
    ['pepper', 'scotch bonnet'],
    ['rice', 'white rice'],
    ['oil', 'vegetable oil']
  ]
  
  console.log('🔍 Testing ingredient similarity...')
  tests.forEach(([ing1, ing2]) => {
    const similarity = getIngredientSimilarity(ing1, ing2)
    console.log(`  ${ing1} ↔ ${ing2}: ${similarity}`)
  })
} 