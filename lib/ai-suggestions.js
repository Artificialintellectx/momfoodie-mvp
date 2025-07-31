// AI-powered ingredient matching system for MomFoodie
// This module provides intelligent recipe suggestions based on user ingredients

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || (typeof window !== 'undefined' ? window.OPENAI_API_KEY : null)

// Cache for AI responses to avoid repeated API calls
const aiResponseCache = new Map()

// Cache cleanup to prevent memory leaks (cost saving)
const CACHE_MAX_SIZE = 100
const CACHE_CLEANUP_INTERVAL = 1000 * 60 * 60 // 1 hour

setInterval(() => {
  if (aiResponseCache.size > CACHE_MAX_SIZE) {
    const entries = Array.from(aiResponseCache.entries())
    const toDelete = entries.slice(0, Math.floor(CACHE_MAX_SIZE / 2))
    toDelete.forEach(([key]) => aiResponseCache.delete(key))
    console.log('🧹 AI cache cleaned up for cost saving')
  }
}, CACHE_CLEANUP_INTERVAL)

/**
 * Get AI-powered recipe suggestions based on user ingredients
 * @param {Array} userIngredients - Array of ingredient names
 * @param {Array} availableMeals - Array of meal objects from database
 * @param {Object} userContext - User preferences and context
 * @returns {Array} Ranked meal suggestions
 */
export const getAISuggestions = async (userIngredients, availableMeals, userContext = {}) => {
  try {
    // Create cache key
    const cacheKey = JSON.stringify({
      ingredients: userIngredients.sort(),
      mealCount: availableMeals.length,
      context: userContext
    })

    // Check cache first (enabled for cost saving)
    if (aiResponseCache.has(cacheKey)) {
      console.log('🤖 Using cached AI response (cost saving)')
      return aiResponseCache.get(cacheKey)
    }

    // COST SAVING: Limit meals sent to AI (max 20 meals)
    const maxMealsForAI = 20
    const mealsForAI = availableMeals
      .slice(0, maxMealsForAI)
      .map(meal => ({
        id: meal.id,
        name: meal.name,
        ingredients: meal.ingredients.slice(0, 8), // Limit ingredients to reduce tokens
        meal_type: meal.meal_type,
        cooking_time: meal.cooking_time,
        difficulty: meal.difficulty
        // Removed description to save tokens
      }))
    
    console.log(`🤖 Passing ${mealsForAI.length} meals to AI (limited for cost saving, out of ${availableMeals.length} total available)`)
    console.log('🤖 Sample meals:', mealsForAI.slice(0, 3).map(m => `${m.name} (${m.ingredients.slice(0, 2).join(', ')})`))
    console.log('🤖 Meals range:', `ID ${mealsForAI[0]?.id} to ${mealsForAI[mealsForAI.length-1]?.id}`)

    // Create AI prompt
    const prompt = createAIPrompt(userIngredients, mealsForAI, userContext)
    
    // Get AI response
    const aiResponse = await callOpenAI(prompt)
    
    console.log('🤖 Raw AI response:', aiResponse)
    console.log('💰 AI call completed (cost: ~$0.002-0.005 per call)')
    
    // Parse and rank results
    const rankedSuggestions = parseAIResponse(aiResponse, availableMeals, userIngredients)
    
    console.log(`🤖 AI returned ${rankedSuggestions.length} suggestions`)
    if (rankedSuggestions.length > 0) {
      console.log('🤖 Top AI suggestions:')
      rankedSuggestions.slice(0, 3).forEach((meal, index) => {
        console.log(`  ${index + 1}. "${meal.name}" - AI Score: ${meal.aiScore}`)
      })
    }
    
    // Cache the result
    aiResponseCache.set(cacheKey, rankedSuggestions)
    
    return rankedSuggestions
  } catch (error) {
    console.error('AI suggestion error:', error)
    // Fallback to rule-based system
    return fallbackToRuleBased(userIngredients, availableMeals)
  }
}

/**
 * Create intelligent prompt for AI
 */
const createAIPrompt = (userIngredients, meals, userContext) => {
  const ingredientsList = userIngredients.join(', ')
  const mealsList = meals.map(m => 
    `ID: ${m.id} - ${m.name} (${m.ingredients.join(', ')})`
  ).join('\n')

  return `Nigerian food expert. User ingredients: ${ingredientsList}

Available recipes (${meals.length}):
${mealsList}

User context: ${JSON.stringify(userContext)}

Rank recipes by:
1. How well they use user's ingredients
2. Nigerian cultural appropriateness
3. Practicality and ease of cooking
4. PRIORITY: If user selected proteins, prioritize meals with protein in title

Return ONLY JSON array of recipe IDs in order of best match: [10, 25, 15, 8]

Focus on:
- Authentic Nigerian dishes
- Practical to cook
- Protein priority (if applicable)
- User preferences`
}

/**
 * Call OpenAI API
 */
const callOpenAI = async (prompt) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo', // Cheaper model for cost saving
      messages: [
        {
          role: 'system',
          content: 'You are a Nigerian food expert. You must respond with ONLY valid JSON arrays. No explanations, no markdown, no additional text. Only the JSON array.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500 // Reduced for cost saving
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Parse AI response and rank meals
 */
const parseAIResponse = (aiResponse, availableMeals, userIngredients) => {
  try {
    // Clean the response - remove any markdown formatting
    let cleanResponse = aiResponse.trim()
    
    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/```\n?/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/```\n?/, '')
    }
    
    // Try to extract JSON from the response
    const jsonMatch = cleanResponse.match(/\[.*\]/s)
    if (jsonMatch) {
      cleanResponse = jsonMatch[0]
    }
    
    // Extract recipe IDs from AI response
    const recipeIds = JSON.parse(cleanResponse)
    
    // Create ranked suggestions
    const rankedSuggestions = recipeIds.map(id => {
      const meal = availableMeals.find(m => m.id === id)
      return meal ? {
        ...meal,
        aiScore: 100 - recipeIds.indexOf(id), // Higher score for better ranking
        aiRank: recipeIds.indexOf(id) + 1
      } : null
    }).filter(Boolean)

    return rankedSuggestions
  } catch (error) {
    console.error('Error parsing AI response:', error)
    console.log('Raw AI response:', aiResponse)
    return fallbackToRuleBased(userIngredients, availableMeals)
  }
}

/**
 * Fallback to rule-based system
 */
const fallbackToRuleBased = (userIngredients, availableMeals) => {
  console.log('🔄 Falling back to rule-based system')
  
  // Simple scoring based on ingredient matches
  return availableMeals.map(meal => {
    const matchedIngredients = userIngredients.filter(ingredient =>
      meal.ingredients.some(mealIng => 
        mealIng.toLowerCase().includes(ingredient.toLowerCase())
      )
    )
    
    return {
      ...meal,
      aiScore: matchedIngredients.length * 10,
      aiRank: 1
    }
  }).sort((a, b) => b.aiScore - a.aiScore)
}

/**
 * Get semantic similarity between ingredients
 */
export const getIngredientSimilarity = (ingredient1, ingredient2) => {
  const synonyms = {
    'tomato': ['tomatoes', 'fresh tomato', 'tomato paste'],
    'fish': ['tilapia', 'mackerel', 'stockfish', 'dried fish'],
    'pepper': ['scotch bonnet', 'habanero', 'red pepper', 'chili'],
    'rice': ['white rice', 'basmati rice', 'jasmine rice'],
    'oil': ['vegetable oil', 'groundnut oil', 'palm oil', 'olive oil'],
    'onion': ['onions', 'red onion', 'white onion'],
    'garlic': ['garlic cloves', 'minced garlic'],
    'ginger': ['fresh ginger', 'ginger root'],
    'beef': ['beef meat', 'cow meat', 'red meat'],
    'chicken': ['chicken meat', 'poultry', 'fowl']
  }

  const ingredient1Lower = ingredient1.toLowerCase()
  const ingredient2Lower = ingredient2.toLowerCase()

  // Direct match
  if (ingredient1Lower === ingredient2Lower) return 1.0

  // Synonym match
  for (const [key, values] of Object.entries(synonyms)) {
    if (values.includes(ingredient1Lower) && values.includes(ingredient2Lower)) {
      return 0.9
    }
    if (key === ingredient1Lower && values.includes(ingredient2Lower)) {
      return 0.9
    }
    if (key === ingredient2Lower && values.includes(ingredient1Lower)) {
      return 0.9
    }
  }

  // Partial match
  if (ingredient1Lower.includes(ingredient2Lower) || ingredient2Lower.includes(ingredient1Lower)) {
    return 0.7
  }

  return 0.0
}

/**
 * Enhanced ingredient matching with AI assistance
 */
export const enhancedIngredientMatching = (userIngredients, meal) => {
  let totalScore = 0
  let matchedIngredients = []

  userIngredients.forEach(userIngredient => {
    let bestMatch = 0
    let bestMatchIngredient = null

    meal.ingredients.forEach(mealIngredient => {
      const similarity = getIngredientSimilarity(userIngredient, mealIngredient)
      if (similarity > bestMatch) {
        bestMatch = similarity
        bestMatchIngredient = mealIngredient
      }
    })

    if (bestMatch > 0.5) {
      totalScore += bestMatch * 10
      matchedIngredients.push({
        userIngredient,
        mealIngredient: bestMatchIngredient,
        similarity: bestMatch
      })
    }
  })

  return {
    score: totalScore,
    matchedIngredients,
    matchPercentage: (matchedIngredients.length / userIngredients.length) * 100
  }
}

/**
 * Get contextual meal suggestions
 */
export const getContextualSuggestions = async (userIngredients, availableMeals, context = {}) => {
  const {
    mealType = 'any',
    cookingTime = 'any',
    difficulty = 'any',
    spicy = false,
    traditional = true
  } = context

  // Filter meals based on context
  let filteredMeals = availableMeals

  if (mealType !== 'any') {
    filteredMeals = filteredMeals.filter(meal => meal.meal_type === mealType)
  }

  if (cookingTime !== 'any') {
    filteredMeals = filteredMeals.filter(meal => meal.cooking_time === cookingTime)
  }

  if (difficulty !== 'any') {
    filteredMeals = filteredMeals.filter(meal => meal.difficulty === difficulty)
  }

  // Get AI suggestions for filtered meals
  const aiSuggestions = await getAISuggestions(userIngredients, filteredMeals, context)

  return aiSuggestions
} 