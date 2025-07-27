# 🍽️ Ingredient Search Documentation

## Overview

The ingredient search feature allows users to find recipes based on ingredients they have available. This is a core feature of MomFoodie that solves the common problem: "What can I make with what I have?"

## 🎯 How It Works

### 1. **User Interface Flow**

```
Homepage → Toggle "My Ingredients" → Select Ingredients → Click "What Can I Make?" → View Results
```

### 2. **Technical Process Flow**

```
1. User Selection → 2. Supabase Query → 3. Ingredient Filtering → 4. Adaptive Thresholds → 5. Meal Selection → 6. Display Results
```

## 🔧 Technical Implementation

### **Core Files**
- `pages/index.js` - Initial ingredient search and filtering
- `pages/result.js` - "Get New Suggestion" functionality
- `lib/data.js` - Available ingredients list
- `lib/supabase.js` - Database connection

### **Key Components**

#### 1. **Ingredient Selection Interface**
```javascript
// Available ingredients from lib/data.js
const commonIngredients = [
  "Rice", "Plantain", "Tomatoes", "Onions", "Pepper", 
  "Garri", "Semovita", "Wheat", "Starch", "Spaghetti", 
  "Noodles", "Irish potatoes", "Beans", "Yam", "Cassava"
]
```

#### 2. **Search Criteria Storage**
```javascript
const searchCriteria = {
  mealType: 'any',
  cookingTime: 'any', 
  showIngredientMode: true,
  selectedIngredients: ["Rice", "Plantain"]
}
```

## 🧠 Smart Filtering Algorithm

### **Phase 1: Ingredient Detection**

The system searches for ingredients in two places per recipe:

1. **Recipe Name** (Score: +3 points)
   - Example: "Fried Rice and Chicken" → "Rice" found in name
   
2. **Ingredients List** (Score: +5 points)
   - Example: `["1 cup rice", "2 tomatoes"]` → "Rice" found in ingredients

### **Phase 2: Scoring System**

```javascript
let score = 0
let matchedIngredients = []

// Check recipe name
if (meal.name.toLowerCase().includes(ingredient.toLowerCase())) {
  score += 3
  matchedIngredients.push(ingredient)
}

// Check ingredients list
if (meal.ingredients.some(ing => ing.toLowerCase().includes(ingredient))) {
  score += 5
  if (!matchedIngredients.includes(ingredient)) {
    matchedIngredients.push(ingredient)
  }
}

// Bonus for multiple ingredients
if (matchedIngredients.length > 1) {
  score += matchedIngredients.length * 2
}

// Bonus for perfect match (all selected ingredients found)
if (matchedIngredients.length === selectedIngredients.length) {
  score += 10
}
```

### **Phase 3: Optional Ingredient Exclusion**

Recipes are excluded if any selected ingredient is marked as optional:

```javascript
const optionalIndicators = ['(optional)', '(opt)', 'optional', 'opt']
const isOptional = meal.ingredients.some(mealIngredient => {
  return mealIngredient.toLowerCase().includes(ingredientLower) && 
         optionalIndicators.some(indicator => mealIngredientLower.includes(indicator))
})
```

## 🎯 Adaptive Threshold System

The system uses intelligent thresholds based on the number of selected ingredients:

### **Threshold Logic**
```javascript
const getThresholdForIngredients = (ingredientCount) => {
  if (ingredientCount === 1) {
    return { primary: 0, fallback: 1, final: 1 } // Show any meal with the ingredient
  } else if (ingredientCount === 2) {
    return { primary: 100, fallback: 1, final: 1 } // 100% or at least 1 ingredient
  } else if (ingredientCount === 3) {
    return { primary: 70, fallback: 2, final: 1 } // 70% or at least 2, else at least 1
  } else if (ingredientCount === 4) {
    return { primary: 70, fallback: 2, final: 1 } // 70% or at least 2, else at least 1
  } else if (ingredientCount >= 5 && ingredientCount <= 6) {
    return { primary: 70, fallback: 3, final: 2 } // 70% or at least 3, else at least 2
  } else if (ingredientCount > 6 && ingredientCount <= 10) {
    return { primary: 70, fallback: 4, final: 2 } // 70% or at least 4, else at least 2
  } else if (ingredientCount > 10 && ingredientCount <= 15) {
    return { primary: 70, fallback: 5, final: 2 } // 70% or at least 5, else at least 2
  } else {
    return { primary: 70, fallback: 6, final: 2 } // 70% or at least 6, else at least 2
  }
}
```

### **Three-Tier Filtering Process**

1. **Primary Threshold**: Try to find meals with the specified percentage match
2. **Fallback Threshold**: If no results, try with a minimum number of ingredients
3. **Final Threshold**: If still no results, use the most lenient criteria

## 🔄 Repetition Prevention

### **Shown Meals Tracking**
```javascript
const currentFilterKey = JSON.stringify({
  mealType, cookingTime, showIngredientMode, selectedIngredients
})
const shownMealsKey = `shownMeals_${btoa(currentFilterKey).slice(0, 20)}`
const shownMeals = JSON.parse(localStorage.getItem(shownMealsKey) || '[]')
```

### **Meal Selection Logic**
```javascript
// Filter out already shown meals
const availableMeals = suggestions.filter(meal => !shownMeals.includes(meal.id))

// Also exclude current meal to prevent immediate repetition
const finalAvailableMeals = meal ? availableMeals.filter(m => m.id !== meal.id) : availableMeals
```

## 📊 Example Scenarios

### **Scenario 1: Single Ingredient Search**
- **User selects**: "Rice"
- **Threshold**: Primary 0%, Fallback 1, Final 1
- **Result**: Shows all recipes containing rice (name or ingredients)

### **Scenario 2: Multiple Ingredient Search**
- **User selects**: ["Rice", "Tomatoes", "Onions", "Pepper"]
- **Threshold**: Primary 70%, Fallback 2, Final 1
- **Process**:
  1. Try to find recipes with 70% match (3 out of 4 ingredients)
  2. If none found, try recipes with at least 2 ingredients
  3. If still none, show recipes with at least 1 ingredient

### **Scenario 3: Three Ingredient Search**
- **User selects**: ["Beef", "Okra", "Garri"]
- **Threshold**: Primary 70%, Fallback 2, Final 1
- **Process**:
  1. Try to find recipes with 70% match (2 out of 3 ingredients)
  2. If none found, try recipes with at least 2 ingredients
  3. If still none, show recipes with at least 1 ingredient
- **Expected Result**: Should show meals containing at least 1 of the selected ingredients

### **Scenario 4: Optional Ingredient Exclusion**
- **User selects**: "Plantain"
- **Recipe has**: "Plantain (optional)"
- **Result**: Recipe is excluded from results

## 🎨 User Experience Features

### **1. Ingredient Reminder**
On the result page, users see their selected ingredients:
```
🍚 Selected Ingredients: Rice, Plantain, Tomatoes
```

### **2. Previous Recipe Navigation**
- Button appears from second suggestion onwards
- Shows count of previous suggestions
- Allows users to go back through their search history

### **3. Exhaustion Modal**
When all available recipes have been shown:
- "Reset & Continue" - Start fresh with same ingredients
- "Go to Homepage" - Return to main search

## 🔧 Configuration

### **Adding New Ingredients**
To add new ingredients, update `lib/data.js`:
```javascript
export const commonIngredients = [
  // ... existing ingredients
  "New Ingredient"
]
```

### **Ingredient Icons**
Icons are automatically assigned based on ingredient names:
```javascript
const getIngredientIcon = (ingredient) => {
  const iconMap = {
    'Rice': '🍚',
    'Plantain': '🍌', 
    'Tomatoes': '🍅',
    'Onions': '🧅',
    // ... more mappings
  }
  return iconMap[ingredient] || '🥘'
}
```

## 🐛 Common Issues & Solutions

### **Issue 1: "No meals found" despite ingredients existing**
**Cause**: Variable shadowing in filtering logic
**Solution**: Ensure `suggestions` variable is properly scoped

### **Issue 2: Repetitive suggestions**
**Cause**: Shown meals tracking not working
**Solution**: Check localStorage key generation and meal ID tracking

### **Issue 3: Wrong ingredient matches**
**Cause**: Case sensitivity or partial matches
**Solution**: Use `toLowerCase()` for consistent matching

### **Issue 4: "No meals found" for 3 ingredients**
**Cause**: Missing threshold case for exactly 3 ingredients, causing fallback to 6 ingredients
**Solution**: Added specific case for `ingredientCount === 3` with appropriate thresholds
**Fixed**: Now uses Primary 70%, Fallback 2, Final 1 for 3 ingredients

## 📈 Performance Considerations

### **Database Optimization**
- Limit queries to 50 meals maximum
- Use efficient string matching
- Cache results when possible

### **User Experience**
- Show loading states during filtering
- Provide immediate feedback for selections
- Handle edge cases gracefully

## 🔮 Future Enhancements

### **Planned Features**
1. **Fuzzy Matching**: Handle typos and variations
2. **Ingredient Synonyms**: "Tomato" = "Tomatoes"
3. **Quantity Matching**: "2 cups rice" vs "1 cup rice"
4. **Dietary Restrictions**: Filter by dietary preferences
5. **Cooking Time Integration**: Combine with time-based filtering

### **Advanced Features**
1. **Smart Suggestions**: Learn from user preferences
2. **Ingredient Substitutions**: Suggest alternatives
3. **Nutritional Information**: Include health data
4. **Seasonal Ingredients**: Time-based availability

## 📝 API Reference

### **Key Functions**

#### `getSuggestion()`
Main function for ingredient-based meal suggestions
- **Location**: `pages/index.js`
- **Parameters**: None (uses component state)
- **Returns**: Redirects to result page with selected meal

#### `getNewSuggestion()`
Get additional suggestions for same ingredients
- **Location**: `pages/result.js`
- **Parameters**: None (uses stored search criteria)
- **Returns**: Updates current meal state

#### `getThresholdForIngredients(count)`
Calculate adaptive thresholds
- **Parameters**: `count` (number of selected ingredients)
- **Returns**: Object with `primary`, `fallback`, `final` thresholds

## 🧪 Testing

### **Test Cases**
1. **Single ingredient search**
2. **Multiple ingredient search**
3. **Optional ingredient exclusion**
4. **Repetition prevention**
5. **Edge cases (no results, all shown)**

### **Debug Mode**
Enable detailed logging by uncommenting console.log statements in the code.

---

**Last Updated**: July 2025
**Version**: 1.0
**Status**: Production Ready ✅ 