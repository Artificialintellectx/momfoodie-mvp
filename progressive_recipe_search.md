# Progressive Recipe Search System

## Overview

The Progressive Recipe Search system uses an intelligent fallback mechanism to ensure users always discover relevant recipes, even when their exact ingredient combination yields no results. This approach eliminates the frustration of empty search results by gradually expanding the search scope while maintaining relevance.

## Core Philosophy

**Always show results, prioritize relevance**

Instead of displaying "no recipes found," the system progressively removes ingredients from the search criteria until it finds matching recipes. This creates a funnel from highly specific to more general suggestions, guaranteeing a successful user experience.

## Search Algorithm

### Phase 1: Exact Match Search
- Search for recipes containing **ALL** user-selected ingredients
- If results found: Display recipes and proceed to Phase 3
- If no results: Continue to Phase 2

### Phase 2: Progressive Ingredient Removal
- Remove one ingredient from the search criteria (starting with least common/optional ingredients)
- Search for recipes with remaining ingredients
- Repeat until recipes are found
- Track which ingredients were removed for user transparency

### Phase 3: Recipe Display & Continuation
- Display found recipes one at a time
- Show "Get Another Recipe" button for same ingredient combination
- When all recipes for current combination are exhausted, trigger continuation flow

### Phase 4: User Choice Modal
When recipes for current ingredient set are exhausted:
- Display modal: "Want to see more recipes with fewer matching ingredients?"
- **Yes**: Remove another ingredient and return to search
- **No**: Show standard end-of-session options (search again or return home)

### Phase 5: Final Fallback
- Continue removing ingredients until only one remains
- Single ingredients should always yield results
- If somehow no results exist for single ingredient, display message: "Sorry, no recipe found but you can see trending recipes"
- Show trending recipes only if user chooses to view them

## User Experience Flow

```
User Input: [Chicken, Mushrooms, Thyme, Lemon]
    ↓
Search: ALL 4 ingredients → No results
    ↓
Remove: Lemon → Search: [Chicken, Mushrooms, Thyme] → 15 recipes found
    ↓
Display: Recipe 1 of 15 → User clicks "Get Another Recipe"
    ↓
Display: Recipe 2 of 15 → ... → Recipe 15 of 15
    ↓
Modal: "Want more recipes? We can show recipes with just Chicken & Mushrooms"
    ↓
User selects: Yes → Search: [Chicken, Mushrooms] → 47 recipes found
    ↓
Continue cycle...
```

## Technical Implementation

### Search Priority Logic
1. **Ingredient Removal Order**
   - Remove least common ingredients first
   - Preserve core proteins and base ingredients longer
   - Use ingredient frequency data to determine removal order

2. **Result Management**
   - Cache results for each ingredient combination
   - Track user progress through result sets
   - Maintain state of removed ingredients for transparency

3. **User Interface Elements**
   - Clear indication of which ingredients are being used in current search
   - Progress indicator showing how many recipes remain in current set
   - Transparent communication about ingredient removal

### Data Structure
```javascript
{
  originalIngredients: ['chicken', 'mushrooms', 'thyme', 'lemon'],
  currentIngredients: ['chicken', 'mushrooms', 'thyme'],
  removedIngredients: ['lemon'],
  currentResults: [...], 
  currentIndex: 2,
  totalResults: 15
}
```

## Key Benefits

**Guaranteed Discovery**: Users never encounter dead ends - they always find recipes they can make

**Relevance Preservation**: Most relevant recipes (exact matches) appear first, with broader suggestions only when needed

**Exploration Enablement**: Users can discover new recipe combinations they might not have considered

**Reduced Frustration**: Eliminates the common "no results found" problem that drives users away

**Flexible Cooking**: Accommodates users who might be missing one or two ingredients

## Success Metrics

- **Zero Empty Results**: No user should ever see "no recipes found"
- **High Engagement**: Users should progress through multiple recipe suggestions
- **Recipe Discovery**: Track how often users find recipes with fewer ingredients than originally searched
- **User Retention**: Measure if users stay engaged longer with this progressive approach

## Edge Cases & Considerations

- **Single Ingredient Failure**: If even single ingredients yield no results, show popular/trending recipes
- **Ingredient Synonyms**: Consider ingredient variations (e.g., "scallions" vs "green onions")
- **Dietary Restrictions**: Maintain any dietary filters throughout the progressive search
- **User Abandonment**: If user exits during progressive search, save their last successful combination for next visit

## Future Enhancements

- **Smart Suggestions**: Recommend ingredient substitutions before removal
- **Seasonal Adjustments**: Prioritize seasonal ingredients in removal order
- **Learning Algorithm**: Track which ingredient combinations users prefer and adjust removal logic
- **Pantry Integration**: Connect with user's pantry to suggest additions rather than removals