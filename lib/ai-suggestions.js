// AI-powered ingredient matching system for MomFoodie
// This module provides intelligent recipe suggestions based on user ingredients

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || (typeof window !== 'undefined' ? window.OPENAI_API_KEY : null)

// Cache for AI responses to avoid repeated API calls
const aiResponseCache = new Map()

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

    // Check cache first (temporarily disabled for testing)
    if (aiResponseCache.has(cacheKey) && false) {
      console.log('🤖 Using cached AI response')
      return aiResponseCache.get(cacheKey)
    }

    // Prepare meals data for AI
    const mealsForAI = availableMeals.map(meal => ({
      id: meal.id,
      name: meal.name,
      ingredients: meal.ingredients,
      meal_type: meal.meal_type,
      cooking_time: meal.cooking_time,
      difficulty: meal.difficulty,
      description: meal.description
    }))
    
    console.log(`🤖 Passing ${mealsForAI.length} meals to AI`)
    console.log('🤖 Sample meals:', mealsForAI.slice(0, 3).map(m => `${m.name} (${m.ingredients.slice(0, 2).join(', ')})`))

    // Create AI prompt
    const prompt = createAIPrompt(userIngredients, mealsForAI, userContext)
    
    // Get AI response
    const aiResponse = await callOpenAI(prompt)
    
    console.log('🤖 Raw AI response:', aiResponse)
    
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

  return `You are a Nigerian food expert helping users find recipes based on their available ingredients.

User has these ingredients: ${ingredientsList}

Available Nigerian recipes:
${mealsList}

User context: ${JSON.stringify(userContext)}

Please analyze and rank the recipes by:
1. How well they use the user's ingredients
2. Cultural appropriateness for Nigerian cuisine
3. Practicality and ease of cooking
4. Nutritional balance
5. Popularity and traditional appeal

IMPORTANT: Return ONLY a valid JSON array of recipe IDs (numbers) in order of best match.
Example format: [10, 25, 15, 8]

Do not include any explanations, markdown formatting, or additional text.
Only return the JSON array with the recipe ID numbers.

Focus on recipes that:
- Use the user's ingredients effectively
- Are authentic Nigerian dishes
- Are practical to cook
- Don't require ingredients the user doesn't have
- Match the user's preferences (if provided)

Consider that:
- Some ingredients can be substituted (e.g., different types of oil)
- Common ingredients like salt, water, seasoning are usually available
- Nigerian dishes often use similar base ingredients
- User preferences matter (spicy, quick, traditional, etc.)`
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
      model: 'gpt-4',
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
      max_tokens: 500
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