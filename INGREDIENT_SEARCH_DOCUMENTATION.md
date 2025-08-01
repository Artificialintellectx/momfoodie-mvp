# Ingredient Search Logic Documentation

## Overview

The MomFoodie MVP implements a sophisticated ingredient-based recipe search system that uses title relevance thresholds to find recipes matching user-selected ingredients. The system operates on a two-tier threshold approach (50% → 25%) with automatic fallback and manual continuation options. **NEW**: Recipes are now prioritized based on the position of ingredient matches in the title, with first-word matches receiving highest priority.

## Core Components

### 1. Search Function (`lib/progressive-search.js`)

#### `performIngredientSearch(allMeals, selectedIngredients, titleThreshold = 50, searchPhase = 'primary_search')`

**Purpose**: Main search function that filters recipes based on ingredient title relevance and applies priority-based sorting.

**Parameters**:
- `allMeals`: Array of all available meals from database
- `selectedIngredients`: Array of user-selected ingredients
- `titleThreshold`: Percentage threshold for title relevance (default: 50%)
- `searchPhase`: Search phase identifier ('primary_search' or 'secondary_search')

**Process**:
1. **Initial Filtering**: Finds meals containing any of the selected ingredients
2. **Title Analysis**: Analyzes recipe titles for ingredient word matches
3. **Threshold Filtering**: Keeps only recipes meeting the title relevance threshold
4. **Priority Calculation**: Calculates priority scores based on ingredient position in title
5. **Priority Sorting**: Sorts recipes by priority (first-word matches → second-word → third-word, etc.)
6. **Result Formatting**: Returns structured search results

**Priority System**:
- **First Word Matches**: Highest priority (score: 0-99)
- **Second Word Matches**: Medium priority (score: 100-199)
- **Third Word Matches**: Lower priority (score: 200-299)
- **Multiple Ingredient Matches**: Bonus priority points
- **First Selected Ingredient**: Special priority consideration

**Return Object**:
```javascript
{
  suggestions: [...], // Array of matching recipes (priority sorted)
  searchPhase: 'primary_search' | 'secondary_search',
  titleThreshold: number,
  totalPotentialMatches: number,
  totalMatchingRecipes: number
}
```

#### `getSearchState(searchResult)`

**Purpose**: Provides user-friendly messages about search results.

**Returns**: Object with message and type for UI display.

### 2. Search Flow

#### Initial Search (`pages/index.js`)

**Process**:
1. **50% Threshold Attempt**: First tries with 50% title relevance
2. **Automatic Fallback**: If no results, automatically tries 25% threshold
3. **State Storage**: Stores search criteria with threshold and phase information
4. **Priority Sorting**: Results are automatically sorted by ingredient position priority
5. **Recipe Selection**: Randomly selects from available recipes

**Key Code Flow**:
```javascript
// First attempt with 50% threshold
let searchResult = await performIngredientSearch(data, selectedIngredients, 50)
suggestions = searchResult.suggestions

// Automatic fallback to 25% if no results
if (suggestions.length === 0) {
  searchResult = await performIngredientSearch(data, selectedIngredients, 25)
  suggestions = searchResult.suggestions
}

// Store with correct threshold and phase
localStorage.setItem('searchCriteria', JSON.stringify({
  ...searchCriteria,
  searchPhase: searchResult.searchPhase,
  titleThreshold: searchResult.titleThreshold
}))
```

#### Recipe Navigation (`pages/result.js`)

**Process**:
1. **Cached Results**: Uses cached search results for performance
2. **Shown Meals Tracking**: Prevents recipe repetition within same session
3. **Threshold-Aware Caching**: Separate caches for different thresholds
4. **Priority Preservation**: Maintains priority order from cached results
5. **Manual Continuation**: Option to continue with lower threshold

### 3. Caching System

#### Cache Keys

**Ingredient Search Cache**:
```javascript
const ingredientKey = `${selectedIngredients.sort().join(',')}_${titleThreshold}_${searchPhase}`
const cacheKey = `ingredient_search_${ingredientKey}`
```

**Shown Meals Tracking**:
```javascript
const filterKey = JSON.stringify({
  mealType, cookingTime, showIngredientMode, 
  selectedIngredients, leftoverMode, titleThreshold
})
const shownMealsKey = `shownMeals_${simpleHash(filterKey)}`
```

#### Cache Structure

**Ingredient Search Cache**:
```javascript
{
  suggestions: [...], // Array of matching recipes (priority sorted)
  searchState: "Found X recipes with Y% title relevance",
  searchPhase: "primary_search" | "secondary_search",
  titleThreshold: 50 | 25,
  originalIngredients: [...]
}
```

### 4. Threshold Logic

#### 50% Threshold (Primary Search)
- **Purpose**: Find highly relevant recipes
- **Criteria**: At least 50% of recipe title words must match selected ingredients
- **Behavior**: Used for initial search attempt
- **Priority**: Results sorted by ingredient position in title

#### 25% Threshold (Secondary Search)
- **Purpose**: Find moderately relevant recipes when primary search fails
- **Criteria**: At least 25% of recipe title words must match selected ingredients
- **Behavior**: Automatic fallback or manual continuation
- **Priority**: Results sorted by ingredient position in title

#### Title Relevance Calculation
```javascript
// Example: "Beef Stew with Rice" with ingredients ["Beef", "Rice"]
// Title words: ["Beef", "Stew", "with", "Rice"]
// Matching words: ["Beef", "Rice"] (2 out of 4 = 50% relevance)
// Priority: Beef is first word (priority 0), Rice is fourth word (priority 3)
```

### 5. Priority-Based Sorting

#### Priority Calculation Algorithm
```javascript
const calculatePriorityScore = (meal, selectedIngredients) => {
  // Find earliest position of first selected ingredient
  // Find earliest position of any ingredient
  // Count total ingredient matches
  return (firstIngredientPriority * 10000) + (bestPriority * 100) + (totalMatches * 10)
}
```

#### Priority Rules
1. **First Selected Ingredient**: Recipes starting with the first selected ingredient get highest priority
2. **Position-Based**: Earlier positions in title get higher priority
3. **Multiple Matches**: Recipes with more ingredient matches get bonus priority
4. **Ingredient Order**: Order of ingredients in user selection affects priority

#### Example Priority Order
For ingredients ["Rice", "Beef"]:
1. "Rice and Stew" (Rice first word)
2. "Rice with Beef" (Rice first word)
3. "Beef Stew with Rice" (Beef first word)
4. "Chicken Rice" (Rice second word)
5. "Stew with Rice and Beef" (Rice third word)

### 6. User Experience Flow

#### Initial Search
1. User selects ingredients
2. System searches with 50% threshold
3. If results found: Display recipes (priority sorted)
4. If no results: Automatically try 25% threshold
5. Display results with appropriate messaging

#### Recipe Navigation
1. User clicks "Get Another Recipe"
2. System checks cached results for current threshold
3. Filters out already shown recipes
4. Randomly selects from available recipes (maintaining priority order)
5. Updates shown meals tracking

#### Manual Continuation
1. When all recipes shown for current threshold
2. System shows modal asking if user wants 25% threshold recipes
3. If accepted: Performs new search with 25% threshold (priority sorted)
4. If declined: Shows exhaustion message

### 7. State Management

#### LocalStorage Keys
- `searchCriteria`: Current search parameters and threshold
- `ingredient_search_${key}`: Cached search results (priority sorted)
- `shownMeals_${hash}`: Tracked shown recipes per filter
- `currentMeal`: Currently displayed recipe
- `previousMeals`: History of shown recipes

#### Search Phases
- `primary_search`: Initial search (50% or 25% threshold)
- `secondary_search`: Manual continuation (25% threshold)

### 8. Error Handling

#### No Results Found
- Automatic fallback from 50% to 25% threshold
- User-friendly error messages
- Suggestions to try different ingredients

#### Cache Misses
- Automatic regeneration of search results
- Fallback to fresh database queries

#### State Inconsistencies
- Validation of stored search criteria
- Recovery mechanisms for corrupted state

### 9. Performance Optimizations

#### Caching Strategy
- Separate caches for different ingredient combinations
- Threshold-aware caching to prevent conflicts
- Hash-based keys for efficient storage
- Priority-sorted results cached for consistent ordering

#### Database Queries
- Single query to fetch all meals
- Client-side filtering for performance
- Minimal server round trips

#### Memory Management
- Limited shown meals tracking
- Automatic cleanup of old cache entries
- Efficient data structures

### 10. Analytics Integration

#### Tracked Events
- Search initiation
- Recipe selection
- Threshold transitions
- User feedback

#### Metrics Collected
- Search success rates
- Threshold usage patterns
- User engagement metrics
- Performance indicators

### 11. Future Enhancements

#### Potential Improvements
- Dynamic threshold adjustment based on ingredient count
- Machine learning for better relevance scoring
- Advanced filtering options
- Recipe recommendation algorithms
- Enhanced priority algorithms

#### Scalability Considerations
- Database indexing for faster queries
- Pagination for large result sets
- Caching optimization strategies
- Performance monitoring

## Technical Implementation Details

### File Structure
```
lib/
  progressive-search.js    # Core search logic with priority sorting
pages/
  index.js                # Initial search and ingredient selection
  result.js               # Recipe display and navigation
```

### Key Functions
- `performIngredientSearch()`: Main search algorithm with priority sorting
- `calculatePriorityScore()`: Priority calculation algorithm
- `getSearchState()`: User messaging
- `getNewSuggestion()`: Recipe navigation
- `continueProgressiveSearch()`: Manual threshold continuation

### Data Flow
1. User Input → Ingredient Selection
2. Search Request → Database Query
3. Result Processing → Threshold Filtering
4. Priority Calculation → Priority Sorting
5. Cache Storage → State Management
6. UI Display → User Interaction
7. Navigation → Recipe Cycling

This documentation provides a comprehensive overview of the current ingredient search system, its implementation details, operational characteristics, and the new priority-based sorting feature. 