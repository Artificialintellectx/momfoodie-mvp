# MomFudy - Updated Schema Documentation

## 🗄️ Database Schema Updates

### **Core Tables**

#### **1. Meals Table**
```sql
CREATE TABLE meals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  meal_type VARCHAR(50) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  dietary_preference VARCHAR(50) DEFAULT 'any',
  cooking_time VARCHAR(50) CHECK (cooking_time IN ('quick', 'regular', 'elaborate')),
  prep_time VARCHAR(50),
  difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ingredients TEXT[], -- Array of ingredient strings
  instructions TEXT[], -- Array of instruction strings
  cuisine_type VARCHAR(100) DEFAULT 'Nigerian',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **2. Ingredient Categories Table**
```sql
CREATE TABLE ingredient_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **3. Ingredients Table**
```sql
CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category_id VARCHAR(50) REFERENCES ingredient_categories(id),
  icon VARCHAR(50), -- Icon identifier for display
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **4. User Search History Table**
```sql
CREATE TABLE user_search_history (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  search_criteria JSONB, -- Stores complete search criteria
  selected_ingredients TEXT[],
  meal_type VARCHAR(50),
  cooking_time VARCHAR(50),
  title_threshold INTEGER DEFAULT 50, -- 50% or 25% threshold
  search_phase VARCHAR(50) DEFAULT 'primary_search', -- primary_search or secondary_search
  results_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **5. Progressive Search Cache Table**
```sql
CREATE TABLE progressive_search_cache (
  id SERIAL PRIMARY KEY,
  search_key VARCHAR(255) UNIQUE, -- Hash of search criteria
  selected_ingredients TEXT[],
  title_threshold INTEGER,
  search_phase VARCHAR(50),
  cached_results JSONB, -- Cached search results
  shown_meals INTEGER[] DEFAULT '{}', -- Array of shown meal IDs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **6. User Feedback Table**
```sql
CREATE TABLE user_feedback (
  id SERIAL PRIMARY KEY,
  meal_id INTEGER REFERENCES meals(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  search_context JSONB, -- Store search context for analysis
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **7. Leftover Transformations Table**
```sql
CREATE TABLE leftover_transformations (
  id SERIAL PRIMARY KEY,
  original_meal_id INTEGER REFERENCES meals(id),
  leftover_ingredients TEXT[],
  transformation_rules JSONB,
  suggested_meals JSONB,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  time_estimate VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Updated Ingredient Categories**

#### **Current Category Structure:**
```javascript
export const ingredientCategories = [
  {
    id: "pasta",
    name: "Pasta",
    emoji: "🍝",
    ingredients: ["Spaghetti", "Noodles", "Macaroni", "Penne", "Fusilli", "Lasagna"]
  },
  {
    id: "swallows", 
    name: "Swallows & Starches",
    emoji: "🍚",
    ingredients: ["Garri", "Semovita", "Amala", "Eba", "Pounded yam", "Tuwo", "Fufu", "Rice", "Wheat", "Starch", "Couscous"]
  },
  {
    id: "proteins",
    name: "Proteins & Meats", 
    emoji: "🥩",
    ingredients: ["Chicken", "Beef", "Goat meat", "Fish", "Pork", "Turkey", "Egg", "Shrimp", "Crab", "Snail", "Liver", "Kidney", "Tripe", "Stockfish", "Dried fish", "Smoked fish", "Bush meat", "Ponmo", "Crayfish", "Periwinkle"]
  },
  {
    id: "tubers",
    name: "Tubers",
    emoji: "🍠", 
    ingredients: ["Yam", "Cocoyam", "Sweet potato", "Irish potatoes", "Plantain"]
  },
  {
    id: "vegetables",
    name: "Vegetables & Greens",
    emoji: "🥬",
    ingredients: ["Tomatoes", "Onions", "Spinach", "Okra", "Carrots", "Green beans", "Bell peppers", "Scotch bonnet", "Habanero", "Cucumber", "Lettuce", "Cabbage", "Cauliflower", "Broccoli", "Cassava", "Pumpkin leaves", "Bitter leaf", "Water leaf", "Scent leaf", "Curry leaf", "Basil"]
  },
  {
    id: "fruits",
    name: "Fruits & Tropical",
    emoji: "🍎",
    ingredients: ["Banana", "Orange", "Apple", "Mango", "Pineapple", "Watermelon", "Pawpaw", "Guava", "Grape", "Strawberry", "Avocado", "Lemon", "Lime", "Tangerine", "Grapefruit", "Pomegranate", "Coconut", "Tiger nut"]
  },
  {
    id: "dairy",
    name: "Dairy & Alternatives",
    emoji: "🥛",
    ingredients: ["Milk", "Cheese", "Yogurt", "Butter", "Cream", "Sour cream", "Coconut milk", "Almond milk", "Soy milk", "Coconut cream", "Evaporated milk", "Condensed milk", "Tiger nut milk", "Kunu"]
  },
  {
    id: "spices",
    name: "Spices & Seasonings",
    emoji: "🌶️",
    ingredients: ["Garlic", "Ginger", "Pepper", "Curry powder", "Thyme", "Bay leaves", "Nutmeg", "Cinnamon", "Cumin", "Coriander", "Seasoning cubes", "Salt", "Black pepper", "White pepper", "Cayenne pepper", "Paprika", "Turmeric", "Cloves", "Cardamom"]
  },
  {
    id: "oils",
    name: "Oils & Fats",
    emoji: "🫒",
    ingredients: ["Palm oil", "Vegetable oil", "Olive oil", "Coconut oil", "Groundnut oil", "Sesame oil", "Margarine", "Ghee"]
  },
  {
    id: "legumes",
    name: "Legumes & Beans",
    emoji: "🫘",
    ingredients: ["Beans", "Black-eyed peas", "Lentils", "Chickpeas", "Cowpeas", "Soybeans", "Peanuts", "Groundnuts", "Almonds", "Cashews", "Bambara nuts", "Melon seeds", "Pumpkin seeds"]
  },
  {
    id: "baked",
    name: "Baked Goods & Snacks",
    emoji: "🍞",
    ingredients: ["Bread", "Toast", "Buns", "Cake", "Cookies", "Biscuits", "Puff puff", "Rolls", "Croissants", "Agege bread", "Plantain chips", "Popcorn"]
  },
  {
    id: "traditional",
    name: "Native",
    emoji: "🇳🇬",
    ingredients: ["Ogbono", "Egusi", "Uziza", "Utazi", "Nchawu", "Palm wine", "Zobo", "Locust beans", "Abacha", "Ugba", "Ewedu", "Ofada", "Ayamase", "Akamu", "Nchuanwu", "Tuwon Masara", "Starch"]
  }
];
```

### **Progressive Search System Schema**

#### **Search State Management:**
```javascript
// localStorage keys for progressive search
const SEARCH_CRITERIA_KEY = 'searchCriteria';
const SHOWN_MEALS_KEY = 'shownMeals';
const SEARCH_PHASE_KEY = 'searchPhase';

// Search criteria structure
const searchCriteria = {
  mealType: 'dinner',
  cookingTime: 'quick', 
  showIngredientMode: true,
  selectedIngredients: ['Rice', 'Beef', 'Tomatoes'],
  leftoverMode: false,
  titleThreshold: 50, // 50% or 25%
  searchPhase: 'primary_search' // or 'secondary_search'
};
```

#### **Progressive Search Logic:**
```javascript
// Title relevance calculation
const calculateTitleRelevance = (recipeTitle, selectedIngredients) => {
  const titleWords = recipeTitle.toLowerCase().split(/\s+/);
  const ingredientWords = selectedIngredients.map(ing => ing.toLowerCase());
  
  const matches = titleWords.filter(word => 
    ingredientWords.some(ingredient => 
      ingredient.includes(word) || word.includes(ingredient)
    )
  );
  
  return (matches.length / titleWords.length) * 100;
};

// Priority scoring for results
const calculatePriorityScore = (recipe, selectedIngredients) => {
  const titleWords = recipe.name.toLowerCase().split(/\s+/);
  const ingredientWords = selectedIngredients.map(ing => ing.toLowerCase());
  
  let firstIngredientPriority = 0;
  let bestPriority = 0;
  let totalMatches = 0;
  
  ingredientWords.forEach(ingredient => {
    const matches = titleWords.filter(word => 
      ingredient.includes(word) || word.includes(ingredient)
    );
    
    if (matches.length > 0) {
      const priority = matches.length / titleWords.length;
      if (priority > bestPriority) bestPriority = priority;
      totalMatches += matches.length;
      
      // Bonus for first ingredient match
      if (titleWords[0] && (ingredient.includes(titleWords[0]) || titleWords[0].includes(ingredient))) {
        firstIngredientPriority = 1;
      }
    }
  });
  
  return (firstIngredientPriority * 10000) + (bestPriority * 100) + (totalMatches * 10);
};
```

### **UI/UX Schema Updates**

#### **Enhanced Button States:**
```css
/* Suggestion Button - Enhanced for Maximum Visibility */
.suggestion-button {
  @apply relative px-8 py-4 flex items-center justify-center gap-3;
  @apply group transition-all duration-500 transform hover:scale-110 active:scale-95;
  @apply font-extrabold text-lg rounded-2xl shadow-2xl border-4;
  @apply bg-gradient-to-r from-orange-500 via-red-500 to-pink-500;
  @apply hover:from-orange-600 hover:via-red-600 hover:to-pink-600;
  @apply text-white border-orange-300/50 shadow-orange-500/50 animate-pulse;
}

/* Pulsing background ring */
.suggestion-button::before {
  @apply absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500;
  @apply rounded-2xl animate-ping opacity-75 blur-sm scale-110;
}
```

#### **Modal Schema:**
```javascript
// Category Modal Structure
const categoryModal = {
  overlay: "fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60",
  container: "bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[85vh]",
  header: {
    icon: "w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500",
    title: "text-2xl font-bold text-gray-800",
    description: "text-gray-600 text-sm"
  },
  grid: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4",
  ingredientCard: {
    base: "group relative p-4 pt-6 px-2 rounded-xl transition-all duration-300",
    selected: "bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 shadow-lg scale-105",
    unselected: "bg-gray-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
  }
};
```

### **Analytics Schema**

#### **Event Tracking:**
```javascript
// Analytics events for progressive search
const analyticsEvents = {
  'suggestion_click': {
    buttonType: 'What Can I Make' | 'Get Meal Suggestion' | 'Transform Leftovers',
    searchCriteria: {
      mealType: string,
      cookingTime: string,
      selectedIngredients: string[],
      leftoverMode: boolean
    }
  },
  'progressive_search_phase': {
    phase: 'primary_search' | 'secondary_search',
    titleThreshold: number,
    resultsCount: number,
    selectedIngredients: string[]
  },
  'ingredient_selection': {
    category: string,
    ingredient: string,
    action: 'add' | 'remove',
    totalSelected: number
  }
};
```

### **Configuration Schema**

#### **Environment Variables:**
```bash
# Required for Supabase integration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional analytics
NEXT_PUBLIC_GA_TRACKING_ID=your_ga_tracking_id
```

#### **Search Configuration:**
```javascript
const searchConfig = {
  titleThresholds: {
    primary: 50,    // 50% title relevance for initial search
    secondary: 25   // 25% title relevance for expanded search
  },
  maxResults: {
    primary: 10,    // Max results for primary search
    secondary: 20   // Max results for secondary search
  },
  cacheExpiry: 3600000, // 1 hour in milliseconds
  priorityWeights: {
    firstIngredient: 10000,
    bestMatch: 100,
    totalMatches: 10
  }
};
```

### **Migration Notes**

#### **Recent Changes Applied:**
1. **Ingredient Categories Reorganized:**
   - Added "Pasta" category with 6 pasta types
   - Created "Tubers" category with 5 tuber types
   - Moved "Native" category between "All" and "Pasta" in display order
   - Removed duplicate ingredients across categories

2. **Progressive Search Implementation:**
   - 50% title relevance threshold for primary search
   - 25% title relevance threshold for secondary search
   - Automatic fallback from 50% to 25% if no results
   - Priority-based sorting with composite scoring

3. **UI/UX Enhancements:**
   - Removed Fresh/Leftover toggle temporarily
   - Enhanced suggestion button with vibrant colors and animations
   - Reordered toggle: Smart mode first, Quick mode second
   - Removed search icon from "Find Your Ingredients" header
   - Modal improvements for ingredient selection

4. **Icon System Updates:**
   - Comprehensive ingredient icon mapping
   - Category-specific emojis
   - Animated icons for selected states

This schema reflects all current functionality and recent improvements to the MomFudy application. 