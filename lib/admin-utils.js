// Admin utilities for MomFoodie
// Handles data export, import, and bulk operations

/**
 * Export recipes to JSON file
 */
export const exportRecipes = (recipes) => {
  const dataStr = JSON.stringify(recipes, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `momfoodie-recipes-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(link.href)
}

/**
 * Import recipes from JSON file
 */
export const importRecipes = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const recipes = JSON.parse(e.target.result)
        
        // Validate recipes structure
        const validRecipes = recipes.filter(recipe => {
          return recipe.name && 
                 recipe.description && 
                 recipe.ingredients && 
                 recipe.instructions &&
                 Array.isArray(recipe.ingredients) &&
                 Array.isArray(recipe.instructions)
        })
        
        if (validRecipes.length === 0) {
          reject(new Error('No valid recipes found in file'))
          return
        }
        
        resolve(validRecipes)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Validate recipe structure
 */
export const validateRecipeStructure = (recipe) => {
  const errors = []
  
  if (!recipe.name || recipe.name.trim() === '') {
    errors.push('Recipe name is required')
  }
  
  if (!recipe.description || recipe.description.trim() === '') {
    errors.push('Recipe description is required')
  }
  
  if (!recipe.meal_type || !['breakfast', 'lunch', 'dinner'].includes(recipe.meal_type)) {
    errors.push('Valid meal type is required (breakfast, lunch, dinner)')
  }
  
  if (!recipe.cooking_time || !['quick', 'regular', 'elaborate'].includes(recipe.cooking_time)) {
    errors.push('Valid cooking time is required (quick, regular, elaborate)')
  }
  
  if (!recipe.prep_time || recipe.prep_time.trim() === '') {
    errors.push('Prep time is required')
  }
  
  if (!recipe.difficulty || !['easy', 'medium', 'hard'].includes(recipe.difficulty)) {
    errors.push('Valid difficulty is required (easy, medium, hard)')
  }
  
  if (!recipe.dietary_preference || !['any', 'vegetarian', 'vegan', 'halal', 'pescatarian', 'lacto_vegetarian', 'gluten_free', 'low_sodium', 'diabetic_friendly', 'low_fat', 'high_protein', 'soft_foods', 'high_fiber', 'traditional', 'rice_based', 'swallow_based'].includes(recipe.dietary_preference)) {
    errors.push('Valid dietary preference is required')
  }
  
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    errors.push('At least one ingredient is required')
  }
  
  if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
    errors.push('At least one instruction is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Bulk insert recipes to database
 */
export const bulkInsertRecipes = async (supabase, recipes) => {
  const results = {
    success: [],
    errors: []
  }
  
  for (const recipe of recipes) {
    try {
      const validation = validateRecipeStructure(recipe)
      
      if (!validation.isValid) {
        results.errors.push({
          recipe: recipe.name || 'Unknown',
          errors: validation.errors
        })
        continue
      }
      
      const { error } = await supabase
        .from('meals')
        .insert([recipe])
      
      if (error) {
        results.errors.push({
          recipe: recipe.name,
          error: error.message
        })
      } else {
        results.success.push(recipe.name)
      }
    } catch (error) {
      results.errors.push({
        recipe: recipe.name || 'Unknown',
        error: error.message
      })
    }
  }
  
  return results
}

/**
 * Generate recipe template
 */
export const generateRecipeTemplate = () => {
  return {
    name: '',
    description: '',
    meal_type: '',
    dietary_preference: 'any',
    cooking_time: '',
    prep_time: '',
    difficulty: 'easy',
    ingredients: [''],
    instructions: [''],
    cuisine_type: 'Nigerian'
  }
}

/**
 * Duplicate recipe with new ID
 */
export const duplicateRecipe = (recipe) => {
  const { id, created_at, ...recipeData } = recipe
  return {
    ...recipeData,
    name: `${recipe.name} (Copy)`,
    ingredients: [...recipe.ingredients],
    instructions: [...recipe.instructions]
  }
}

/**
 * Search recipes with advanced filters
 */
export const searchRecipes = (recipes, filters) => {
  return recipes.filter(recipe => {
    // Text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesSearch = 
        recipe.name.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchLower))
      
      if (!matchesSearch) return false
    }
    
    // Meal type filter
    if (filters.mealType && recipe.meal_type !== filters.mealType) {
      return false
    }
    
    // Cooking time filter
    if (filters.cookingTime && recipe.cooking_time !== filters.cookingTime) {
      return false
    }
    
    // Difficulty filter
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
      return false
    }
    
    // Dietary preference filter
    if (filters.dietaryPreference && recipe.dietary_preference !== filters.dietaryPreference) {
      return false
    }
    
    return true
  })
}

/**
 * Get recipe statistics
 */
export const getRecipeStats = (recipes) => {
  const stats = {
    total: recipes.length,
    byMealType: {
      breakfast: 0,
      lunch: 0,
      dinner: 0
    },
    byDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0
    },
    byCookingTime: {
      quick: 0,
      regular: 0,
      elaborate: 0
    },
    byDietaryPreference: {
      any: 0,
      vegetarian: 0,
      vegan: 0
    },
    averageIngredients: 0,
    averageInstructions: 0
  }
  
  let totalIngredients = 0
  let totalInstructions = 0
  
  recipes.forEach(recipe => {
    stats.byMealType[recipe.meal_type]++
    stats.byDifficulty[recipe.difficulty]++
    stats.byCookingTime[recipe.cooking_time]++
    stats.byDietaryPreference[recipe.dietary_preference]++
    
    totalIngredients += recipe.ingredients.length
    totalInstructions += recipe.instructions.length
  })
  
  stats.averageIngredients = Math.round(totalIngredients / recipes.length)
  stats.averageInstructions = Math.round(totalInstructions / recipes.length)
  
  return stats
}

/**
 * Generate recipe report
 */
export const generateRecipeReport = (recipes) => {
  const stats = getRecipeStats(recipes)
  
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalRecipes: stats.total,
      averageIngredients: stats.averageIngredients,
      averageInstructions: stats.averageInstructions
    },
    breakdown: {
      mealTypes: stats.byMealType,
      difficulties: stats.byDifficulty,
      cookingTimes: stats.byCookingTime,
      dietaryPreferences: stats.byDietaryPreference
    },
    topRecipes: recipes
      .sort((a, b) => (b.ingredients.length + b.instructions.length) - (a.ingredients.length + a.instructions.length))
      .slice(0, 5)
      .map(recipe => ({
        name: recipe.name,
        complexity: recipe.ingredients.length + recipe.instructions.length,
        mealType: recipe.meal_type,
        difficulty: recipe.difficulty
      }))
  }
}

const adminUtils = {
  exportRecipes,
  importRecipes,
  validateRecipeStructure,
  bulkInsertRecipes,
  generateRecipeTemplate,
  duplicateRecipe,
  searchRecipes,
  getRecipeStats,
  generateRecipeReport
}

export default adminUtils 