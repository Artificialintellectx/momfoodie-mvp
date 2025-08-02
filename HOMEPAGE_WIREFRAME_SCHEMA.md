# MomFudy - Homepage Wireframe & Schema Documentation

## 🎨 Current Homepage Structure

### **📱 Responsive Layout Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    Animated Background                     │
│  ┌─────────┐                    ┌─────────┐              │
│  │ Orange  │                    │ Yellow  │              │
│  │ Blur    │                    │ Blur    │              │
│  └─────────┘                    └─────────┘              │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Hero Section                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🍳 MomFudy Logo (Animated)                       │   │
│  │  Your Smart Kitchen Assistant                      │   │
│  │  Never wonder what to cook again                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Mode Toggle                             │
│  ┌─────────────┐              ┌─────────────┐            │
│  │   Smart     │              │   Quick     │            │
│  │ Ingredients │              │ Suggestion  │            │
│  └─────────────┴──────────────┴─────────────┘            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│              Popular Smart Suggestions                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🎯 Most Popular Feature                           │   │
│  │  72% of users prefer ingredient-based suggestions! │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Main Content                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Smart Mode Content                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Find Your Ingredients                     │   │   │
│  │  │  Search and select ingredients you have   │   │   │
│  │  │  ┌─────────────────────────────────────┐   │   │   │
│  │  │  │  🔍 Search ingredients...          │   │   │   │
│  │  │  └─────────────────────────────────────┘   │   │   │
│  │  │  Selected (3) [Clear All]                │   │   │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐                │   │   │
│  │  │  │🍝   │ │🥩   │ │🥬   │                │   │   │
│  │  │  │Rice │ │Beef │ │Spin │                │   │   │
│  │  │  └─────┘ └─────┘ └─────┘                │   │   │
│  │  │  Filter by Category                      │   │   │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │   │   │
│  │  │  │🇳🇬  │ │🍝   │ │🍚   │ │🥩   │      │   │   │
│  │  │  │All  │ │Pasta│ │Swall│ │Prote│      │   │   │
│  │  │  └─────┘ └─────┘ └─────┘ └─────┘      │   │   │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │   │   │
│  │  │  │🍠   │ │🥬   │ │🍎   │ │🥛   │      │   │   │
│  │  │  │Tuber│ │Veg  │ │Fruit│ │Dairy│      │   │   │
│  │  │  └─────┘ └─────┘ └─────┘ └─────┘      │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Quick Mode Content                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  What is your meal preference?             │   │   │
│  │  │  Choose the perfect meal for your mood     │   │   │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐                  │   │   │
│  │  │  │🌅   │ │☀️   │ │🌙   │                  │   │   │
│  │  │  │Break│ │Lunch│ │Dinne│                  │   │   │
│  │  │  └─────┘ └─────┘ └─────┘                  │   │   │
│  │  │  How much time do you have?               │   │   │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │   │   │
│  │  │  │⚡   │ │⏰   │ │🕐   │ │🍽️  │        │   │   │
│  │  │  │Quick│ │Regul│ │Elabo│ │Any  │        │   │   │
│  │  │  └─────┘ └─────┘ └─────┘ └─────┘        │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│              Floating Suggestion Button                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🍳 Suggest Recipe (3) →                          │   │
│  │  [Pulsing Orange/Red Gradient]                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Component Schema

### **1. Hero Section**
```javascript
const HeroSection = {
  container: "text-center mb-4 sm:mb-6 animate-slide-in-up",
  logo: {
    container: "relative group",
    icon: "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
    heart: "absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-rose-400 to-pink-500",
    floatingElements: [
      "absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-purple-300",
      "absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-indigo-300"
    ]
  },
  typography: {
    title: "text-2xl sm:text-3xl md:text-4xl font-fun bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600",
    subtitle: "text-gray-600 text-sm sm:text-base md:text-lg font-medium",
    tagline: "text-xs sm:text-sm text-gray-500 font-medium"
  }
}
```

### **2. Mode Toggle**
```javascript
const ModeToggle = {
  container: "flex justify-center mb-4 sm:mb-6 animate-slide-in-up",
  toggleContainer: "w-full max-w-sm sm:max-w-md",
  buttons: [
    {
      id: "smart",
      icon: "CircleCheck",
      label: "Smart Ingredients",
      mobileLabel: "Smart",
      onClick: "setShowIngredientMode(true)",
      activeClass: "active",
      inactiveClass: "inactive"
    },
    {
      id: "quick", 
      icon: "Sparkles",
      label: "Quick Suggestion",
      mobileLabel: "Quick",
      onClick: "setShowIngredientMode(false)",
      activeClass: "active",
      inactiveClass: "inactive"
    }
  ]
}
```

### **3. Popular Smart Suggestions**
```javascript
const PopularSmartSuggestions = {
  condition: "showIngredientMode",
  container: "mb-6 sm:mb-8 animate-slide-in-up",
  card: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-4 shadow-sm",
  content: {
    icon: "w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl",
    title: "🎯 Most Popular Feature",
    description: "72% of users prefer ingredient-based suggestions!"
  }
}
```

### **4. Smart Mode Content**
```javascript
const SmartModeContent = {
  container: "card mb-8 sm:mb-12",
  searchSection: {
    header: {
      title: "Find Your Ingredients",
      description: "Search and select ingredients you have available"
    },
    searchBar: {
      placeholder: "Search ingredients",
      icon: "Search",
      addButton: "Add"
    },
    selectedIngredients: {
      header: "Selected (count)",
      clearButton: "Clear All",
      display: "circular tags with icons"
    }
  },
  categoryFilter: {
    title: "Filter by Category",
    grid: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2",
    categories: [
      { id: "all", name: "All", emoji: "🇳🇬" },
      { id: "pasta", name: "Pasta", emoji: "🍝" },
      { id: "swallows", name: "Swallows & Starches", emoji: "🍚" },
      { id: "proteins", name: "Proteins & Meats", emoji: "🥩" },
      { id: "tubers", name: "Tubers", emoji: "🍠" },
      { id: "vegetables", name: "Vegetables & Greens", emoji: "🥬" },
      { id: "fruits", name: "Fruits & Tropical", emoji: "🍎" },
      { id: "dairy", name: "Dairy & Alternatives", emoji: "🥛" },
      { id: "spices", name: "Spices & Seasonings", emoji: "🌶️" },
      { id: "oils", name: "Oils & Fats", emoji: "🫒" },
      { id: "legumes", name: "Legumes & Beans", emoji: "🫘" },
      { id: "baked", name: "Baked Goods & Snacks", emoji: "🍞" }
    ]
  }
}
```

### **5. Quick Mode Content**
```javascript
const QuickModeContent = {
  container: "card mb-8 sm:mb-12",
  mealType: {
    header: {
      icon: "ChefHat",
      title: "What is your meal preference?",
      description: "Choose the perfect meal for your current mood and time of day!"
    },
    options: [
      { value: "breakfast", label: "Breakfast", emoji: "🌅" },
      { value: "lunch", label: "Lunch", emoji: "☀️" },
      { value: "dinner", label: "Dinner", emoji: "🌙" }
    ]
  },
  cookingTime: {
    title: "How much time do you have?",
    options: [
      { value: "quick", label: "Quick (Under 30 mins)", emoji: "⚡" },
      { value: "regular", label: "Regular (30-60 mins)", emoji: "⏰" },
      { value: "elaborate", label: "Elaborate (60+ mins)", emoji: "🕐" }
    ]
  },
  dietaryPreferences: {
    title: "Any dietary preferences?",
    options: [
      { value: "any", label: "Any", emoji: "🍽️" },
      { value: "vegetarian", label: "Vegetarian", emoji: "🥬" },
      { value: "vegan", label: "Vegan", emoji: "🌱" },
      { value: "halal", label: "Halal", emoji: "☪️" },
      { value: "traditional", label: "Traditional", emoji: "🇳🇬" },
      { value: "pescatarian", label: "Pescatarian", emoji: "🐟" },
      { value: "rice_based", label: "Rice-Based", emoji: "🍚" },
      { value: "high_protein", label: "High-Protein", emoji: "🥩" }
    ]
  }
}
```

### **6. Floating Suggestion Button**
```javascript
const FloatingSuggestionButton = {
  condition: "selectedIngredients.length > 0",
  container: "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999]",
  button: {
    className: "px-8 py-4 flex items-center justify-center gap-3 group transition-all duration-500",
    gradient: "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500",
    hoverGradient: "hover:from-orange-600 hover:via-red-600 hover:to-pink-600",
    text: "font-extrabold text-lg text-white",
    border: "border-4 border-orange-300/50",
    shadow: "shadow-2xl shadow-orange-500/50",
    animation: "animate-pulse"
  },
  backgroundRing: "absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl animate-ping opacity-75 blur-sm scale-110",
  floatingParticles: [
    "absolute -top-2 -left-2 w-2 h-2 bg-yellow-300 rounded-full animate-bounce",
    "absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce",
    "absolute -bottom-1 -left-1 w-1 h-1 bg-red-300 rounded-full animate-bounce"
  ],
  content: {
    icon: "Sparkles w-6 h-6 text-white animate-bounce",
    text: "🍳 Suggest Recipe (count)",
    arrow: "ArrowRight w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
  }
}
```

## 🎯 Modal Schemas

### **7. Category Ingredients Modal**
```javascript
const CategoryIngredientsModal = {
  overlay: "fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 flex items-center justify-center z-50",
  container: "bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[85vh] overflow-hidden animate-scale-in shadow-2xl mx-6 flex flex-col",
  header: {
    icon: "w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl",
    title: "text-2xl font-bold text-gray-800",
    description: "text-gray-600 text-sm"
  },
  grid: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 flex-1 overflow-y-auto pb-4 pt-2 px-2",
  ingredientCard: {
    base: "group relative p-4 pt-6 px-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center gap-3",
    selected: "bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 shadow-lg scale-105",
    unselected: "bg-gray-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md",
    checkmark: "absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md animate-scale-in z-10"
  },
  footer: {
    counter: "text-sm text-gray-600",
    clearButton: "text-xs text-red-500 hover:text-red-700 font-medium transition-colors",
    doneButton: "px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium"
  }
}
```

## 📱 Responsive Breakpoints

### **Mobile (sm: 640px)**
- **Hero**: Compact logo and typography
- **Toggle**: Single line with abbreviated labels
- **Categories**: 3 columns grid
- **Modals**: Full width with padding

### **Tablet (md: 768px)**
- **Hero**: Medium logo size
- **Toggle**: Full labels visible
- **Categories**: 4-6 columns grid
- **Modals**: Max width with margins

### **Desktop (lg: 1024px)**
- **Hero**: Large logo with floating elements
- **Toggle**: Full width with proper spacing
- **Categories**: 6+ columns grid
- **Modals**: Large max width

## 🎨 Animation Schema

### **Background Animations**
```css
.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-bounce-light {
  animation: bounce-light 2s ease-in-out infinite;
}
```

### **Component Animations**
```css
.animate-slide-in-up {
  animation: slide-in-up 0.6s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}
```

### **Staggered Delays**
```javascript
const animationDelays = {
  hero: "0s",
  toggle: "0.2s", 
  popular: "0.3s",
  mainContent: "0.4s",
  mealType: "0.5s",
  cookingTime: "0.8s",
  dietary: "1.2s"
}
```

## 🔧 State Management Schema

### **Homepage State**
```javascript
const homepageState = {
  // Mode selection
  showIngredientMode: boolean,
  
  // Smart mode state
  selectedIngredients: string[],
  searchTerm: string,
  currentPage: number,
  
  // Quick mode state  
  mealType: string,
  cookingTime: string,
  dietaryPreference: string,
  
  // UI state
  loading: boolean,
  pageLoading: boolean,
  showValidationModal: boolean,
  showCategoryModal: boolean,
  currentCategory: object,
  
  // Search state
  searchCriteria: {
    mealType: string,
    cookingTime: string,
    showIngredientMode: boolean,
    selectedIngredients: string[],
    leftoverMode: boolean,
    titleThreshold: number,
    searchPhase: string
  }
}
```

### **localStorage Keys**
```javascript
const localStorageKeys = {
  searchCriteria: 'searchCriteria',
  shownMeals: 'shownMeals',
  searchPhase: 'searchPhase',
  savedMeals: 'savedMeals'
}
```

## 📊 Performance Optimizations

### **Lazy Loading**
- **Component splitting** for modals
- **Conditional rendering** for mode-specific content
- **Image optimization** for ingredient icons

### **Caching Strategy**
- **Search results** cached by threshold
- **User preferences** persisted in localStorage
- **Ingredient categories** pre-loaded

### **Animation Performance**
- **CSS transforms** instead of layout changes
- **Hardware acceleration** for smooth animations
- **Reduced motion** support for accessibility

This wireframe and schema accurately reflects the current homepage structure with all recent improvements and optimizations! 