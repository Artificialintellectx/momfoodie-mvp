// Simple Ingredient-Based Recipe Search System
// Clean implementation that finds recipes based on ingredient matches

/**
 * Find recipes that contain selected ingredients and filter by title relevance
 */
export const performIngredientSearch = async (allMeals, selectedIngredients, titleThreshold = 50) => {
  console.log(`🔍 Starting ingredient search with: ${selectedIngredients.join(', ')}`)
  console.log(`📊 Title threshold: ${titleThreshold}%`)
  
  // Step 1: Find all meals that contain at least one of the selected ingredients
  const potentialMatches = allMeals.filter(meal => {
    const mealIngredientsLower = meal.ingredients.map(ing => ing.toLowerCase())
    const mealNameLower = meal.name.toLowerCase()
    
    // Check if meal contains at least one of the selected ingredients
    return selectedIngredients.some(ingredient => {
      const ingredientLower = ingredient.toLowerCase()
      
      // Check if ingredient appears in meal name
      if (mealNameLower.includes(ingredientLower)) {
        return true
      }
      
      // Check if ingredient appears in ingredients list
      return mealIngredientsLower.some(mealIng => {
        // Direct match
        if (mealIng.includes(ingredientLower)) {
          return true
        }
        
        // Handle common variations
        const variations = {
          'pounded yam': ['yam', 'pounded yam', 'iyan'],
          'garri': ['garri', 'gari', 'eba'],
          'semovita': ['semovita', 'semolina'],
          'amala': ['amala', 'yam flour'],
          'rice': ['rice', 'white rice', 'brown rice', 'jollof rice'],
          'beef': ['beef', 'cow meat', 'red meat'],
          'chicken': ['chicken', 'poultry', 'fowl'],
          'fish': ['fish', 'tilapia', 'mackerel', 'stockfish'],
          'tomato': ['tomato', 'tomatoes'],
          'onion': ['onion', 'onions'],
          'garlic': ['garlic', 'garlic cloves'],
          'lettuce': ['lettuce', 'green lettuce'],
          'spinach': ['spinach', 'green spinach']
        }
        
        // Check variations
        if (variations[ingredientLower]) {
          return variations[ingredientLower].some(variation => mealIng.includes(variation))
        }
        
        return false
      })
    })
  })
  
  console.log(`📊 Found ${potentialMatches.length} potential matches`)
  
  // Step 2: Filter recipes based on title relevance threshold
  const filteredRecipes = potentialMatches.filter(meal => {
    const mealNameLower = meal.name.toLowerCase()
    
    // Split title into words
    const titleWords = mealNameLower.split(/\s+/).filter(word => word.length > 0)
    const totalWords = titleWords.length
    
    if (totalWords === 0) return false
    
    // Count words that are associated with selected ingredients
    const associatedWords = titleWords.filter(word => {
      return selectedIngredients.some(ingredient => {
        const ingredientLower = ingredient.toLowerCase()
        
        // Check if word contains the ingredient
        if (word.includes(ingredientLower)) {
          return true
        }
        
        // Check variations
        const variations = {
          'pounded yam': ['yam', 'pounded yam', 'iyan'],
          'garri': ['garri', 'gari', 'eba'],
          'semovita': ['semovita', 'semolina'],
          'amala': ['amala', 'yam flour'],
          'rice': ['rice', 'white rice', 'brown rice', 'jollof rice'],
          'beef': ['beef', 'cow meat', 'red meat'],
          'chicken': ['chicken', 'poultry', 'fowl'],
          'fish': ['fish', 'tilapia', 'mackerel', 'stockfish'],
          'tomato': ['tomato', 'tomatoes'],
          'onion': ['onion', 'onions'],
          'garlic': ['garlic', 'garlic cloves'],
          'lettuce': ['lettuce', 'green lettuce'],
          'spinach': ['spinach', 'green spinach']
        }
        
        if (variations[ingredientLower]) {
          return variations[ingredientLower].some(variation => word.includes(variation))
        }
        
        return false
      })
    }).length
    
    // Calculate percentage
    const percentage = (associatedWords / totalWords) * 100
    const meetsThreshold = percentage >= titleThreshold
    
    console.log(`📊 "${meal.name}": ${associatedWords}/${totalWords} words associated (${percentage.toFixed(1)}%) - ${meetsThreshold ? '✅' : '❌'}`)
    
    return meetsThreshold
  })
  
  console.log(`✅ Found ${filteredRecipes.length} recipes meeting ${titleThreshold}% threshold`)
  
  return {
    suggestions: filteredRecipes,
    searchPhase: 'primary_search', // Always primary_search for initial search
    titleThreshold: titleThreshold,
    totalPotentialMatches: potentialMatches.length,
    totalFilteredMatches: filteredRecipes.length
  }
}

/**
 * Get search state for UI display
 */
export const getSearchState = (searchResult) => {
  const { searchPhase, titleThreshold, totalPotentialMatches, totalFilteredMatches } = searchResult
  
  switch (searchPhase) {
    case 'primary_search':
      if (titleThreshold === 50) {
        return {
          message: `Found ${totalFilteredMatches} recipes with ${titleThreshold}% title relevance`,
          type: 'success'
        }
      } else {
        // This is the automatic fallback to 25%
        return {
          message: `Found ${totalFilteredMatches} recipes with ${titleThreshold}% title relevance (relaxed criteria)`,
          type: 'info'
        }
      }
    
    case 'secondary_search':
      return {
        message: `Found ${totalFilteredMatches} additional recipes with ${titleThreshold}% title relevance`,
        type: 'info'
      }
    
    default:
      return {
        message: 'Searching for recipes...',
        type: 'info'
      }
  }
} 