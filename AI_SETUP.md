# 🤖 AI-Powered Ingredient Matching Setup

## Overview

MomFoodie now includes an AI-powered ingredient matching system that provides intelligent recipe suggestions based on user ingredients. The system uses OpenAI's GPT-4 to understand semantic relationships between ingredients and rank recipes accordingly.

## Features

### 🧠 **Intelligent Ingredient Matching**
- **Semantic understanding** of ingredients and their relationships
- **Cultural context awareness** for Nigerian cuisine
- **Smart substitution** recognition (e.g., different types of oil)
- **Context-aware suggestions** based on user preferences

### 🎯 **Enhanced User Experience**
- **More accurate suggestions** that match user's actual ingredients
- **Better ranking** of recipes based on relevance
- **Fallback system** to rule-based matching if AI fails
- **Caching** to avoid repeated API calls

### 🔄 **Hybrid System**
- **AI-powered ranking** for intelligent suggestions
- **Rule-based fallback** for reliability
- **Semantic similarity** for ingredient matching
- **Contextual filtering** based on user preferences

## Setup Instructions

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the API key

### 2. Configure Environment Variables
Create a `.env.local` file in your project root:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Supabase Configuration (if not already configured)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies
The AI system uses the built-in `fetch` API, so no additional dependencies are required.

### 4. Test the System
1. Start your development server: `npm run dev`
2. Select ingredients and search for recipes
3. Check the console for AI response logs

## How It Works

### 1. **Ingredient Processing**
```javascript
// User selects: ["Tomatoes", "Rice", "Fish", "Scotch bonnet"]
// AI understands semantic relationships and cultural context
```

### 2. **AI Analysis**
```javascript
// AI analyzes available recipes and ranks them by:
// - Ingredient compatibility
// - Cultural appropriateness
// - Practicality
// - User preferences
```

### 3. **Smart Ranking**
```javascript
// AI returns ranked recipe IDs:
// ["jollof_rice", "fried_rice", "fish_stew"]
// System combines AI ranking with rule-based scoring
```

### 4. **Fallback System**
```javascript
// If AI fails, system falls back to rule-based matching
// Ensures reliability even without AI
```

## API Usage

### Basic Usage
```javascript
import { getAISuggestions } from '../lib/ai-suggestions'

const suggestions = await getAISuggestions(
  ['rice', 'tomatoes', 'fish'], // user ingredients
  availableMeals, // from database
  { mealType: 'lunch', spicy: true } // context
)
```

### Enhanced Matching
```javascript
import { enhancedIngredientMatching } from '../lib/ai-suggestions'

const match = enhancedIngredientMatching(
  ['tomato'], // user ingredient
  { ingredients: ['fresh tomatoes', 'tomato paste'] } // meal
)
// Returns: { score: 9.0, matchedIngredients: [...], matchPercentage: 100 }
```

### Contextual Suggestions
```javascript
import { getContextualSuggestions } from '../lib/ai-suggestions'

const suggestions = await getContextualSuggestions(
  userIngredients,
  availableMeals,
  {
    mealType: 'dinner',
    cookingTime: 'quick',
    spicy: true,
    traditional: true
  }
)
```

## Configuration Options

### AI Model Settings
```javascript
// In lib/ai-suggestions.js
const aiConfig = {
  model: 'gpt-4', // or 'gpt-3.5-turbo' for faster/cheaper
  temperature: 0.3, // Lower = more consistent
  max_tokens: 500, // Response length limit
}
```

### Caching Settings
```javascript
// Cache responses to avoid repeated API calls
const aiResponseCache = new Map()
// Cache key includes ingredients, meal count, and context
```

### Fallback Thresholds
```javascript
// If AI fails, fallback to rule-based system
// Ensures system always works
```

## Monitoring & Debugging

### Console Logs
```javascript
// AI system logs:
console.log('🤖 Using cached AI response')
console.log('🤖 AI ranked 15 suggestions')
console.log('🔄 Falling back to rule-based system')
```

### Error Handling
```javascript
try {
  const aiSuggestions = await getAISuggestions(...)
} catch (error) {
  console.error('AI suggestion error:', error)
  // Fallback to rule-based system
}
```

## Performance Considerations

### Caching
- **Response caching** prevents repeated API calls
- **Cache key** includes ingredients, meal count, and context
- **Automatic cache invalidation** when data changes

### Rate Limiting
- **OpenAI rate limits** are handled gracefully
- **Fallback system** ensures reliability
- **Error handling** prevents app crashes

### Cost Optimization
- **Efficient prompts** minimize token usage
- **Caching** reduces API calls
- **Fallback system** reduces dependency on AI

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Check your `.env.local` file
   - Ensure `OPENAI_API_KEY` is set correctly
   - Restart your development server

2. **"AI suggestion error"**
   - Check OpenAI API key validity
   - Verify internet connection
   - System will fallback to rule-based matching

3. **"No meals found"**
   - AI system will still show rule-based results
   - Check ingredient matching logic
   - Verify database has meals

### Debug Mode
Enable detailed logging by uncommenting console.log statements in the code.

## Future Enhancements

### Planned Features
1. **User preference learning** from selections
2. **Seasonal ingredient awareness**
3. **Regional customization** for different Nigerian regions
4. **Nutritional balance** consideration
5. **Cooking skill level** adaptation

### Advanced AI Features
1. **Local embedding models** for offline use
2. **Real-time learning** from user feedback
3. **Personalized recommendations**
4. **Multi-language support**

## Support

For issues with the AI system:
1. Check the console for error messages
2. Verify OpenAI API key configuration
3. Test with simple ingredient combinations
4. The system will fallback to rule-based matching if AI fails

---

**Note**: The AI system is designed to enhance the user experience while maintaining reliability through fallback mechanisms. Even if the AI component fails, the system will continue to work using the rule-based matching system. 