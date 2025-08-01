// Simple Ingredient-Based Recipe Search System
// Clean implementation that finds recipes based on ingredient matches

import { ingredientCategories } from './data.js'

/**
 * Calculate priority score based on ingredient position in title
 */
const calculatePriorityScore = (meal, selectedIngredients) => {
  const mealNameLower = meal.name.toLowerCase()
  const titleWords = mealNameLower.split(/\s+/).filter(word => word.length > 0)
  
  let bestPriority = 999 // Higher number = lower priority (999 = not found)
  let totalMatches = 0
  let firstIngredientPriority = 999 // Priority for the first selected ingredient
  
  // Check each selected ingredient in order of selection
  selectedIngredients.forEach((ingredient, ingredientIndex) => {
    const ingredientLower = ingredient.toLowerCase()
    
    // Check variations for the ingredient
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
    
    const ingredientVariations = variations[ingredientLower] || [ingredientLower]
    
    // Find the earliest position of this ingredient
    let ingredientFound = false
    titleWords.forEach((word, position) => {
      ingredientVariations.forEach(variation => {
        if (word.includes(variation)) {
          if (position < bestPriority) {
            bestPriority = position
          }
          // Track priority for the first selected ingredient specifically
          if (ingredientIndex === 0 && position < firstIngredientPriority) {
            firstIngredientPriority = position
          }
          ingredientFound = true
        }
      })
    })
    
    if (ingredientFound) {
      totalMatches++
    }
  })
  
  // Return a composite score that prioritizes:
  // 1. Recipes that start with the first selected ingredient (highest priority)
  // 2. Recipes with ingredients in earlier positions
  // 3. Recipes with more ingredient matches
  return (firstIngredientPriority * 10000) + (bestPriority * 100) + (totalMatches * 10)
}

/**
 * Find recipes that contain selected ingredients and filter by title relevance
 */
export const performIngredientSearch = async (allMeals, selectedIngredients, titleThreshold = 50, searchPhase = 'primary_search') => {
  console.log(`🔍 Starting ingredient search with: ${selectedIngredients.join(', ')}`)
  console.log(`📊 Title threshold: ${titleThreshold}%`)
  console.log(`📊 Search phase: ${searchPhase}`)
  
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
  
  // Step 2: Filter recipes based on title relevance threshold and calculate priority scores
  const filteredRecipesWithScores = potentialMatches.map(meal => {
    const mealNameLower = meal.name.toLowerCase()
    
    // Split title into words
    const titleWords = mealNameLower.split(/\s+/).filter(word => word.length > 0)
    const totalWords = titleWords.length
    
    if (totalWords === 0) return { meal, score: 0, percentage: 0, meetsThreshold: false }
    
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
    
    // Calculate priority score (position of earliest ingredient match)
    const priorityScore = calculatePriorityScore(meal, selectedIngredients)
    
    console.log(`📊 "${meal.name}": ${associatedWords}/${totalWords} words associated (${percentage.toFixed(1)}%) - Priority: ${priorityScore} - ${meetsThreshold ? '✅' : '❌'}`)
    
    return { meal, score: priorityScore, percentage, meetsThreshold }
  })
  
  // Filter recipes that meet threshold and sort by priority
  const filteredRecipes = filteredRecipesWithScores
    .filter(item => item.meetsThreshold)
    .sort((a, b) => {
      // Sort by priority score (lower = higher priority)
      return a.score - b.score
    })
    .map(item => item.meal)
  
  console.log(`✅ Found ${filteredRecipes.length} recipes meeting ${titleThreshold}% threshold`)
  console.log(`📊 Priority ranking applied - First word matches shown first`)
  
  // Extract additional ingredients for secondary search (25% threshold)
  let additionalIngredients = []
  if (searchPhase === 'secondary_search' && titleThreshold === 25) {
    additionalIngredients = extractAdditionalIngredients(filteredRecipes, selectedIngredients)
    console.log(`🔍 Found ${additionalIngredients.length} additional ingredients: ${additionalIngredients.join(', ')}`)
  }
  
  return {
    suggestions: filteredRecipes,
    searchPhase: searchPhase,
    titleThreshold: titleThreshold,
    totalPotentialMatches: potentialMatches.length,
    totalFilteredMatches: filteredRecipes.length,
    additionalIngredients: additionalIngredients
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

// Function to extract additional ingredients from recipe titles
export const extractAdditionalIngredients = (recipes, selectedIngredients) => {
  const allIngredients = ingredientCategories.flatMap(category => category.ingredients)
  const selectedIngredientsLower = selectedIngredients.map(ing => ing.toLowerCase())
  const additionalIngredients = new Set()
  
  recipes.forEach(recipe => {
    const titleWords = recipe.name.toLowerCase().split(/\s+/).filter(word => word.length > 0)
    
    titleWords.forEach(word => {
      // Check if this word matches any ingredient in our categories
      const matchedIngredient = allIngredients.find(ingredient => {
        const ingredientLower = ingredient.toLowerCase()
        return word.includes(ingredientLower) || ingredientLower.includes(word)
      })
      
      if (matchedIngredient) {
        // Check if this ingredient is not in the user's selected ingredients
        const isNotSelected = !selectedIngredientsLower.some(selected => 
          selected.includes(matchedIngredient.toLowerCase()) || 
          matchedIngredient.toLowerCase().includes(selected)
        )
        
        if (isNotSelected) {
          additionalIngredients.add(matchedIngredient)
        }
      }
    })
  })
  
  return Array.from(additionalIngredients).slice(0, 10) // Limit to 10 ingredients
} 