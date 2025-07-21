// Recipe Improvement System for MomFoodie
// This system helps validate and improve recipe quality

/**
 * Recipe validation and improvement tools
 */

// Recipe validation rules
export const recipeValidationRules = {
  ingredients: {
    minIngredients: 5,
    maxIngredients: 15,
    requireQuantities: true,
    requirePreparation: true
  },
  instructions: {
    minSteps: 4,
    maxSteps: 12,
    requireTiming: true,
    requireTechnique: true
  },
  metadata: {
    requirePrepTime: true,
    requireDifficulty: true,
    requireCookingTime: true
  }
};

// Common Nigerian cooking techniques and tips
export const cookingTechniques = {
  frying: {
    palmOil: "Heat palm oil until hot (test with a drop of water - it should sizzle)",
    vegetableOil: "Heat oil over medium heat until shimmering",
    deepFrying: "Heat oil to 350-375°F (175-190°C) for deep frying"
  },
  boiling: {
    rice: "Use 2:1 ratio of water to rice for fluffy results",
    beans: "Soak overnight and cook until tender but not mushy",
    yam: "Boil in salted water until fork-tender"
  },
  blending: {
    tomatoes: "Blend until smooth but not watery",
    beans: "Blend with minimal water for thick consistency",
    vegetables: "Chop roughly before blending for better texture"
  },
  seasoning: {
    timing: "Add seasoning cubes and salt towards the end of cooking",
    amounts: "Use 1 seasoning cube per 500g of meat/protein",
    balance: "Taste and adjust seasoning before serving"
  }
};

// Recipe improvement suggestions
export const improvementSuggestions = {
  ingredients: [
    "Add specific quantities (cups, tablespoons, pieces)",
    "Include preparation instructions (chopped, diced, soaked)",
    "Specify ingredient quality (fresh, ripe, medium-sized)",
    "Add missing essential ingredients (salt, oil, water)",
    "Include serving suggestions and accompaniments"
  ],
  instructions: [
    "Add cooking times for each step",
    "Include temperature and heat level guidance",
    "Specify cooking techniques (fry, simmer, boil)",
    "Add visual cues for doneness",
    "Include safety tips and equipment guidance",
    "Add troubleshooting tips for common issues"
  ],
  presentation: [
    "Add serving size information",
    "Include nutritional notes",
    "Suggest variations and substitutions",
    "Add cultural context and history",
    "Include storage and reheating instructions"
  ]
};

// Recipe quality scoring system
export const calculateRecipeScore = (recipe) => {
  let score = 0;
  const maxScore = 100;

  // Ingredients scoring (40 points)
  const ingredientScore = Math.min(40, recipe.ingredients.length * 2);
  const hasQuantities = recipe.ingredients.every(ing => /\d/.test(ing)) ? 10 : 0;
  const hasPreparation = recipe.ingredients.some(ing => /\(|,/.test(ing)) ? 10 : 0;
  score += ingredientScore + hasQuantities + hasPreparation;

  // Instructions scoring (40 points)
  const instructionScore = Math.min(30, recipe.instructions.length * 3);
  const hasTiming = recipe.instructions.some(step => /\d+\s*min|hour|minute/.test(step)) ? 5 : 0;
  const hasTechnique = recipe.instructions.some(step => /fry|boil|simmer|blend|mix/.test(step)) ? 5 : 0;
  score += instructionScore + hasTiming + hasTechnique;

  // Metadata scoring (20 points)
  const hasPrepTime = recipe.prep_time ? 5 : 0;
  const hasDifficulty = recipe.difficulty ? 5 : 0;
  const hasCookingTime = recipe.cooking_time ? 5 : 0;
  const hasDescription = recipe.description ? 5 : 0;
  score += hasPrepTime + hasDifficulty + hasCookingTime + hasDescription;

  return Math.min(maxScore, score);
};

// Recipe validation function
export const validateRecipe = (recipe) => {
  const errors = [];
  const warnings = [];

  // Validate ingredients
  if (recipe.ingredients.length < recipeValidationRules.ingredients.minIngredients) {
    errors.push(`Too few ingredients. Need at least ${recipeValidationRules.ingredients.minIngredients}`);
  }
  if (recipe.ingredients.length > recipeValidationRules.ingredients.maxIngredients) {
    warnings.push(`Many ingredients. Consider simplifying to ${recipeValidationRules.ingredients.maxIngredients} or fewer`);
  }

  // Check for missing quantities
  const ingredientsWithoutQuantities = recipe.ingredients.filter(ing => !/\d/.test(ing));
  if (ingredientsWithoutQuantities.length > 0) {
    warnings.push(`Missing quantities for: ${ingredientsWithoutQuantities.join(', ')}`);
  }

  // Validate instructions
  if (recipe.instructions.length < recipeValidationRules.instructions.minSteps) {
    errors.push(`Too few steps. Need at least ${recipeValidationRules.instructions.minSteps}`);
  }
  if (recipe.instructions.length > recipeValidationRules.instructions.maxSteps) {
    warnings.push(`Many steps. Consider combining some steps`);
  }

  // Check for timing information
  const stepsWithoutTiming = recipe.instructions.filter(step => !/\d+\s*min|hour|minute/.test(step));
  if (stepsWithoutTiming.length > recipe.instructions.length * 0.5) {
    warnings.push('Consider adding cooking times to more steps');
  }

  return { errors, warnings, isValid: errors.length === 0 };
};

// Recipe enhancement function
export const enhanceRecipe = (recipe) => {
  const enhanced = { ...recipe };
  const suggestions = [];

  // Enhance ingredients
  enhanced.ingredients = recipe.ingredients.map(ingredient => {
    if (!/\d/.test(ingredient)) {
      suggestions.push(`Add quantity for: ${ingredient}`);
      return ingredient; // Keep original if no quantity found
    }
    return ingredient;
  });

  // Enhance instructions
  enhanced.instructions = recipe.instructions.map((step, index) => {
    let enhancedStep = step;
    
    // Add timing if missing
    if (!/\d+\s*min|hour|minute/.test(step)) {
      if (step.includes('fry') || step.includes('cook')) {
        enhancedStep += ' (about 5-10 minutes)';
        suggestions.push(`Added timing to step ${index + 1}`);
      }
    }

    // Add technique guidance
    if (step.includes('blend') && !step.includes('smooth')) {
      enhancedStep = enhancedStep.replace('blend', 'blend until smooth');
      suggestions.push(`Added technique detail to step ${index + 1}`);
    }

    return enhancedStep;
  });

  return { enhanced, suggestions };
};

// User feedback collection for recipe improvement
export const collectRecipeFeedback = (recipeId, feedback) => {
  const feedbackTypes = {
    ingredientIssues: [
      'Missing ingredients',
      'Wrong quantities',
      'Unclear preparation',
      'Hard to find ingredients'
    ],
    instructionIssues: [
      'Unclear steps',
      'Missing timing',
      'Wrong technique',
      'Too complicated'
    ],
    tasteIssues: [
      'Too bland',
      'Too spicy',
      'Wrong texture',
      'Not authentic'
    ],
    difficultyIssues: [
      'Too easy',
      'Too hard',
      'Takes too long',
      'Too many steps'
    ]
  };

  return {
    recipeId,
    timestamp: new Date().toISOString(),
    feedback,
    feedbackTypes
  };
};

// Recipe improvement recommendations
export const getRecipeRecommendations = (recipe, userFeedback = []) => {
  const recommendations = [];

  // Based on recipe analysis
  const score = calculateRecipeScore(recipe);
  if (score < 70) {
    recommendations.push('Consider adding more detailed instructions and quantities');
  }

  // Based on user feedback
  const feedbackIssues = userFeedback.map(f => f.issue).flat();
  if (feedbackIssues.includes('Missing ingredients')) {
    recommendations.push('Add missing essential ingredients like salt, oil, or water');
  }
  if (feedbackIssues.includes('Unclear steps')) {
    recommendations.push('Break down complex steps into simpler instructions');
  }
  if (feedbackIssues.includes('Wrong quantities')) {
    recommendations.push('Verify and adjust ingredient quantities based on user feedback');
  }

  return recommendations;
};

// Export all functions
const recipeImprovement = {
  recipeValidationRules,
  cookingTechniques,
  improvementSuggestions,
  calculateRecipeScore,
  validateRecipe,
  enhanceRecipe,
  collectRecipeFeedback,
  getRecipeRecommendations
};

export default recipeImprovement; 