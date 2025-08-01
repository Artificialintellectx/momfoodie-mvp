import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { mealTypes, cookingTimes, ingredientCategories, commonIngredients, leftoverIngredients, leftoverCombinations } from '../lib/data'
import { analytics } from '../lib/analytics'
import { performIngredientSearch, getSearchState } from '../lib/progressive-search'
import { 
  ChefHat, 
  Heart, 
  Sparkles, 
  CircleCheck, 
  Clock,
  ArrowRight,
  Flame,
  Search,
  Utensils,
  Refrigerator,
  Recycle,
  CheckCircle,
  X
} from 'lucide-react'
import { HomepageSkeleton } from '../components/SkeletonLoader'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [showIngredientMode, setShowIngredientMode] = useState(true) // Changed to true to make ingredient mode default
  const [leftoverMode, setLeftoverMode] = useState(false)
  const [mealType, setMealType] = useState('')
  const [cookingTime, setCookingTime] = useState('quick')
  const [savedMeals, setSavedMeals] = useState([])
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [availableIngredients] = useState(commonIngredients)
  const [availableLeftoverIngredients] = useState(leftoverIngredients)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  // Get all ingredients from categories
  const allIngredients = ingredientCategories.flatMap(category => category.ingredients)
  
  // Filter ingredients based on search term and category
  const getFilteredIngredients = () => {
    let filtered = allIngredients
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(ingredient =>
    ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  )
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      const category = ingredientCategories.find(cat => cat.id === selectedCategory)
      filtered = filtered.filter(ingredient => 
        category?.ingredients.includes(ingredient)
      )
    }
    
    return filtered
  }

  const filteredIngredients = getFilteredIngredients()
  
  // Pagination
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentIngredients = filteredIngredients.slice(startIndex, endIndex)

  // Function to get meal type based on Lagos time
  const getMealTypeByTime = () => {
    const lagosTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos"
    })
    const lagosDate = new Date(lagosTime)
    const hour = lagosDate.getHours()
    
    if (hour >= 5 && hour < 11) {
      return 'breakfast'
    } else if (hour >= 11 && hour < 17) {
      return 'lunch'
    } else {
      return 'dinner'
    }
  }

  useEffect(() => {
    // Set meal type based on Lagos time
    const currentMealType = getMealTypeByTime()
    setMealType(currentMealType)
    
    // Track page visit and session start
    analytics.trackPageVisit('home', navigator.userAgent)
    analytics.trackSessionStart()
    
    // AI test function removed for cost saving
    
    // Simulate page loading
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  // Track session end when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      analytics.trackSessionEnd()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      analytics.trackSessionEnd()
    }
  }, [])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedMeals') || '[]')
    setSavedMeals(saved)
  }, [])

  const getSuggestion = async () => {
    if (showIngredientMode && selectedIngredients.length === 0) {
      setValidationMessage('Please select at least one ingredient to find recipes you can make.')
      setShowValidationModal(true)
      return
    }

    // Validate selections for quick suggestion mode
    if (!showIngredientMode) {
      const missingSelections = []
      
      if (!mealType) {
        missingSelections.push('meal preference')
      }
      if (!cookingTime) {
        missingSelections.push('cooking time')
      }
      
      if (missingSelections.length > 0) {
        const message = `Please select your ${missingSelections.join(' and ')} to get personalized meal suggestions.`
        setValidationMessage(message)
        setShowValidationModal(true)
        return
      }
    }
    
    // Track suggestion button click
    const buttonType = showIngredientMode 
      ? (leftoverMode ? 'Transform Leftovers' : 'What Can I Make') 
      : 'Get Meal Suggestion'
    const searchCriteria = {
      mealType,
      cookingTime,
      selectedIngredients: showIngredientMode ? selectedIngredients : [],
      leftoverMode: showIngredientMode ? leftoverMode : false
    }
    analytics.trackSuggestionClick(buttonType, searchCriteria)
    
    setLoading(true)
    try {
      let suggestions = []

      // Only use Supabase - no fallback data
      if (supabase) {
        const query = supabase.from('meals').select('*')
        
        // Only apply meal type and cooking time filters if NOT in ingredient mode
        if (!showIngredientMode) {
          if (mealType) {
            query.eq('meal_type', mealType)
          }
          if (cookingTime) {
            query.eq('cooking_time', cookingTime)
          }
        }
        
        const { data, error } = await query

        if (error) {
          return
        } else if (data && data.length > 0) {
          console.log(`✅ Found ${data.length} meals from Supabase database`)
          
          if (showIngredientMode && selectedIngredients.length > 0) {
            // INGREDIENT SEARCH: Use ingredient search for ingredient mode
            console.log(`🔍 Starting ingredient search with: ${selectedIngredients.join(', ')}`)
            
            // First try with 50% threshold
            let searchResult = await performIngredientSearch(data, selectedIngredients, 50)
            suggestions = searchResult.suggestions
            
            // If no recipes found with 50%, try with 25% threshold
            if (suggestions.length === 0) {
              console.log(`⚠️ No recipes found with 50% threshold, trying 25% threshold...`)
              searchResult = await performIngredientSearch(data, selectedIngredients, 25)
              suggestions = searchResult.suggestions
              
              if (suggestions.length > 0) {
                console.log(`✅ Found ${suggestions.length} recipes with 25% threshold`)
              }
            }
            
            // Show search state to user
            const searchState = getSearchState(searchResult)
            console.log(`📊 Search State: ${searchState.message}`)
            
            // Log search results
            console.log(`📊 Found ${searchResult.suggestions.length} recipes with ${searchResult.titleThreshold}% threshold`)
            
            // Store search criteria with phase info
            localStorage.setItem('searchCriteria', JSON.stringify({
              ...searchCriteria,
              searchPhase: searchResult.searchPhase,
              titleThreshold: searchResult.titleThreshold
            }))
            
          } else if (!showIngredientMode) {
            // Quick filter mode - use all meals with meal type and cooking time filters
            suggestions = data
            console.log(`✅ Using ${suggestions.length} Supabase meals for quick filter mode`)
          }
        } else {
          console.log('⚠️ No meals found in Supabase for the selected criteria')
        }
      }

      // Handle no suggestions found
      if (!suggestions || suggestions.length === 0) {
        if (showIngredientMode) {
          alert('No recipes found with your ingredients. Please try different ingredients or check our trending recipes!')
        } else {
          alert('No meals found for your criteria. Please try different filters!')
        }
        setLoading(false)
        return
      }

      // Select a meal from suggestions
      let selectedMeal = null
      const shownMealsKey = `shownMeals_${JSON.stringify(searchCriteria)}`
      const shownMeals = JSON.parse(localStorage.getItem(shownMealsKey) || '[]')
      
      // Filter out already shown meals
      const availableMeals = suggestions.filter(meal => !shownMeals.includes(meal.id))
      
      if (availableMeals.length > 0) {
        // Select a random meal from available ones
        const randomIndex = Math.floor(Math.random() * availableMeals.length)
        selectedMeal = availableMeals[randomIndex]
        
        // Track this meal as shown
        const updatedShownMeals = [...shownMeals, selectedMeal.id]
        localStorage.setItem(shownMealsKey, JSON.stringify(updatedShownMeals))
        
      } else if (suggestions.length > 0) {
        // All meals for this filter have been shown - reset and start over
        localStorage.removeItem(shownMealsKey)
        
        // Randomly select from all suggestions
        const randomIndex = Math.floor(Math.random() * suggestions.length)
        selectedMeal = suggestions[randomIndex]
        
        // Start fresh tracking
        localStorage.setItem(shownMealsKey, JSON.stringify([selectedMeal.id]))
        
      } else {
        // No meals found even after fallback - this shouldn't happen due to our filtering logic
        alert('No meals found for your criteria. Please try different ingredients or filters.')
        return
      }
      
      // Safety check to ensure selectedMeal exists
      if (!selectedMeal) {
        alert('Something went wrong. Please try again!')
        return
      }
      
      // Store the meal and search criteria in localStorage
      localStorage.setItem('currentMeal', JSON.stringify(selectedMeal))
      
      // Get the existing search criteria that was stored earlier (with titleThreshold and searchPhase)
      const existingSearchCriteria = JSON.parse(localStorage.getItem('searchCriteria') || '{}')
      
      // Merge with current search criteria, preserving titleThreshold and searchPhase
      const finalSearchCriteria = {
        mealType,
        cookingTime,
        showIngredientMode,
        selectedIngredients: showIngredientMode ? selectedIngredients : [],
        leftoverMode: showIngredientMode ? leftoverMode : false,
        titleThreshold: existingSearchCriteria.titleThreshold,
        searchPhase: existingSearchCriteria.searchPhase
      }
      
      localStorage.setItem('searchCriteria', JSON.stringify(finalSearchCriteria))
      
      // Redirect to results page with meal data
      const mealParam = encodeURIComponent(JSON.stringify(selectedMeal))
      router.push(`/result?meal=${mealParam}`)

    } catch (error) {
      alert('Something went wrong. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    )
  }

  // Helper function to get ingredient icon
  const getIngredientIcon = (ingredient) => {
    const iconMap = {
      // Swallows & Starches
      'Garri': '🌾',
      'Semovita': '🌾',
      'Amala': '🍚',
      'Eba': '🍚',
      'Pounded yam': '🍠',
      'Tuwo': '🌾',
      'Fufu': '🍚',
      'Rice': '🍚',
      'Wheat': '🌾',
      'Starch': '🌾',
      'Spaghetti': '🍝',
      'Noodles': '🍜',
      'Couscous': '🌾',
      
      // Proteins & Meats
      'Chicken': '🍗',
      'Beef': '🥩',
      'Goat meat': '🥩',
      'Fish': '🐟',
      'Pork': '🥩',
      'Turkey': '🦃',
      'Egg': '🥚',
      'Shrimp': '🦐',
      'Crab': '🦀',
      'Snail': '🐌',
      'Liver': '🥩',
      'Kidney': '🥩',
      'Tripe': '🥩',
      'Stockfish': '🐟',
      'Dried fish': '🐟',
      'Smoked fish': '🐟',
      'Bush meat': '🥩',
      'Ponmo': '🥩',
      
      // Vegetables & Greens
      'Tomatoes': '🍅',
      'Onions': '🧅',
      'Spinach': '🥬',
      'Okra': '🥬',
      'Carrots': '🥕',
      'Green beans': '🫘',
      'Bell peppers': '🫑',
      'Scotch bonnet': '🌶️',
      'Habanero': '🌶️',
      'Cucumber': '🥒',
      'Lettuce': '🥬',
      'Cabbage': '🥬',
      'Cauliflower': '🥬',
      'Broccoli': '🥬',
      'Sweet potato': '🍠',
      'Irish potatoes': '🥔',
      'Yam': '🍠',
      'Plantain': '🍌',
      'Cassava': '🍠',
      'Pumpkin leaves': '🥬',
      'Bitter leaf': '🥬',
      'Water leaf': '🥬',
      'Scent leaf': '🌿',
      'Curry leaf': '🌿',
      'Basil': '🌿',
      
      // Fruits & Tropical
      'Banana': '🍌',
      'Orange': '🍊',
      'Apple': '🍎',
      'Mango': '🥭',
      'Pineapple': '🍍',
      'Watermelon': '🍉',
      'Pawpaw': '🥭',
      'Guava': '🍈',
      'Grape': '🍇',
      'Strawberry': '🍓',
      'Avocado': '🥑',
      'Lemon': '🍋',
      'Lime': '🍋',
      'Tangerine': '🍊',
      'Grapefruit': '🍊',
      'Pomegranate': '🍎',
      'Coconut': '🥥',
      'Tiger nut': '🥜',
      
      // Dairy & Alternatives
      'Milk': '🥛',
      'Cheese': '🧀',
      'Yogurt': '🥛',
      'Butter': '🧈',
      'Cream': '🥛',
      'Sour cream': '🥛',
      'Coconut milk': '🥛',
      'Almond milk': '🥛',
      'Soy milk': '🥛',
      'Coconut cream': '🥛',
      'Evaporated milk': '🥛',
      'Condensed milk': '🥛',
      
      // Spices & Seasonings
      'Garlic': '🧄',
      'Ginger': '🫘',
      'Pepper': '🌶️',
      'Curry powder': '🌶️',
      'Thyme': '🌿',
      'Bay leaves': '🌿',
      'Nutmeg': '🌰',
      'Cinnamon': '🌰',
      'Cumin': '🌶️',
      'Coriander': '🌿',
      'Seasoning cubes': '🧂',
      'Salt': '🧂',
      'Black pepper': '🌶️',
      'White pepper': '🌶️',
      'Cayenne pepper': '🌶️',
      'Paprika': '🌶️',
      'Turmeric': '🌶️',
      'Cloves': '🌰',
      'Cardamom': '🌰',
      
      // Oils & Fats
      'Palm oil': '🫒',
      'Vegetable oil': '🫒',
      'Olive oil': '🫒',
      'Coconut oil': '🫒',
      'Groundnut oil': '🫒',
      'Sesame oil': '🫒',
      'Margarine': '🧈',
      'Ghee': '🧈',
      'Red palm oil': '🫒',
      'Palm kernel oil': '🫒',
      
      // Legumes & Beans
      'Beans': '🫘',
      'Black-eyed peas': '🫘',
      'Lentils': '🫘',
      'Chickpeas': '🫘',
      'Cowpeas': '🫘',
      'Soybeans': '🫘',
      'Peanuts': '🥜',
      'Groundnuts': '🥜',
      'Almonds': '🥜',
      'Cashews': '🥜',
      'Bambara nuts': '🥜',
      'Melon seeds': '🌰',
      'Pumpkin seeds': '🌰',
      
      // Baked Goods & Snacks
      'Bread': '🍞',
      'Toast': '🍞',
      'Buns': '🍞',
      'Cake': '🍰',
      'Cookies': '🍪',
      'Biscuits': '🍪',
      'Puff puff': '🍩',
      'Rolls': '🍞',
      'Croissants': '🥐',
      'Agege bread': '🍞',
      'Plantain chips': '🍌',
      'Groundnut': '🥜',
      'Popcorn': '🍿',
      
      // Traditional Nigerian
      'Crayfish': '🦐',
      'Periwinkle': '🐌',
      'Ogbono': '🌰',
      'Egusi': '🌰',
      'Uziza': '🌿',
      'Utazi': '🌿',
      'Nchawu': '🌿',
      'Palm wine': '🍷',
      'Zobo': '🍷',
      'Kunu': '🥛',
      'Tiger nut milk': '🥛'
    }
    return iconMap[ingredient] || '🥘'
  }

  const handleMealTypeSelection = (type) => {
    setMealType(type)
  }

  const handleCookingTimeSelection = (time) => {
    setCookingTime(time)
  }

  const handleIngredientToggle = (ingredient) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    )
  }

  const handleGetSuggestion = () => {
    if (selectedIngredients.length === 0) {
      setValidationMessage('Please select at least one ingredient to find recipes you can make.')
      setShowValidationModal(true)
      return
    }

    // Validate selections for quick suggestion mode
    if (!showIngredientMode) {
      const missingSelections = []
      
      if (!mealType) {
        missingSelections.push('meal preference')
      }
      if (!cookingTime) {
        missingSelections.push('cooking time')
      }
      
      if (missingSelections.length > 0) {
        const message = `Please select your ${missingSelections.join(' and ')} to get personalized meal suggestions.`
        setValidationMessage(message)
        setShowValidationModal(true)
        return
      }
    }
    
    // Track suggestion button click
    const buttonType = showIngredientMode 
      ? (leftoverMode ? 'Transform Leftovers' : 'What Can I Make') 
      : 'Get Meal Suggestion'
    const searchCriteria = {
      mealType,
      cookingTime,
      selectedIngredients: showIngredientMode ? selectedIngredients : [],
      leftoverMode: showIngredientMode ? leftoverMode : false
    }
    analytics.trackSuggestionClick(buttonType, searchCriteria)
    
    setLoading(true)
    getSuggestion() // Reuse the existing getSuggestion function
  }

  // AI test function removed for cost saving

  // Show skeleton loader while page is loading
  if (pageLoading) {
    return <HomepageSkeleton />
  }

  return (
    <div className="min-h-screen bg-pattern relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-300/30 to-orange-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-200/20 to-yellow-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl pb-24">
        
        {/* Optimized Hero Section */}
        <div className="text-center mb-4 sm:mb-6 animate-slide-in-up">
          <div className="flex flex-col items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            {/* Compact Logo Icon */}
            <div className="relative group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-strong animate-pulse-glow group-hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />
                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-medium">
                    <Heart className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white animate-bounce-light" />
                  </div>
                </div>
              </div>
              {/* Subtle floating elements */}
              <div className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-300 rounded-full opacity-60 animate-float"></div>
              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-indigo-300 rounded-full opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* Compact Typography */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-fun bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 tracking-tight hover:scale-105 transition-transform duration-300 cursor-pointer">
                MomFudy
              </h1>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg font-medium">Your Smart Kitchen Assistant</p>
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-1">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Never wonder what to cook again</span>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Toggle - Mobile Optimized */}
        <div className="flex justify-center mb-4 sm:mb-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="toggle-container w-full max-w-sm sm:max-w-md">
            <button
              onClick={() => setShowIngredientMode(false)}
              className={`toggle-button px-4 sm:px-6 py-2.5 sm:py-3 w-1/2 ${
                !showIngredientMode ? 'active' : 'inactive'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline text-sm">Quick Suggestion</span>
              <span className="sm:hidden text-xs">Quick</span>
            </button>
            <button
              onClick={() => setShowIngredientMode(true)}
              className={`toggle-button px-4 sm:px-6 py-2.5 sm:py-3 w-1/2 ${
                showIngredientMode ? 'active' : 'inactive'
              }`}
            >
              <CircleCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline text-sm">Smart Ingredients</span>
              <span className="sm:hidden text-xs">Smart</span>
            </button>
          </div>
        </div>

        {/* Popular Smart Suggestions Section - Only show when ingredient mode is active */}
        {showIngredientMode && (
          <div className="mb-6 sm:mb-8 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CircleCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-green-800 font-bold text-base">🎯 Most Popular Feature</h3>
                  <p className="text-green-600 text-sm">72% of users prefer ingredient-based suggestions!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          {pageLoading ? (
            <HomepageSkeleton />
          ) : (
            <>
              {!showIngredientMode ? (
                <div className="card mb-8 sm:mb-12">
                  <div className="space-y-16">
                    {/* Meal Type - Enhanced Prominence */}
                    <div className="relative animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
                      {/* Attention-grabbing header */}
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '2s' }}>
                            What is your meal preference?
                          </h3>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium px-2">
                          Choose the perfect meal for your current mood and time of day!
                        </p>
                      </div>
                      
                      {/* Enhanced meal type options */}
                      <div className="flex justify-center">
                        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                          {mealTypes.map((type) => (
                            <button
                              key={type.value}
                              onClick={() => handleMealTypeSelection(type.value)}
                              className={`relative rounded-2xl p-4 transition-all duration-300 text-center ${
                                mealType === type.value 
                                  ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 shadow-lg transform scale-105' 
                                  : 'bg-white border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md hover:scale-102'
                              }`}
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <div className={`text-3xl ${mealType === type.value ? 'transform scale-110 animate-bounce' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                                  {type.emoji}
                                </div>
                                <span className={`text-sm font-semibold ${
                                  mealType === type.value ? 'text-indigo-800' : 'text-gray-700'
                                }`}>
                                  {type.label}
                                </span>
                              </div>
                              {mealType === type.value && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cooking Time - Enhanced Prominence */}
                    <div className="relative animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
                                            {/* Attention-grabbing header */}
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '2s' }}>
                            How much time do you have?
                          </h3>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium px-2">
                          This helps us find the perfect recipe for your schedule!
                        </p>
                      </div>
                      
                      {/* Enhanced cooking time options */}
                      <div className="flex justify-center">
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl">
                          {cookingTimes.map((time) => (
                            <button
                              key={time.value}
                              onClick={() => handleCookingTimeSelection(time.value)}
                              className={`relative rounded-xl sm:rounded-2xl p-3 sm:p-6 transition-all duration-300 text-center group ${
                                cookingTime === time.value 
                                  ? 'bg-gradient-to-br from-orange-100 to-red-100 border-2 sm:border-3 border-orange-400 shadow-lg sm:shadow-xl transform scale-105' 
                                  : 'bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-md sm:hover:shadow-lg hover:scale-102'
                              }`}
                            >
                              {/* Animated background for selected state */}
                              {cookingTime === time.value && (
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-xl sm:rounded-2xl animate-pulse"></div>
                              )}
                              
                              <div className="relative z-10 flex flex-col items-center space-y-2 sm:space-y-3">
                                <div className={`text-2xl sm:text-4xl ${cookingTime === time.value ? 'transform scale-110 animate-bounce' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                                  {time.emoji}
                                </div>
                                <div className="space-y-0.5 sm:space-y-1">
                                  <div className={`text-sm sm:text-lg font-bold ${
                                    cookingTime === time.value ? 'text-orange-800' : 'text-gray-800'
                                  }`}>
                                    {time.label}
                                  </div>

                                </div>
                              </div>
                              
                              {/* Selection indicator */}
                              {cookingTime === time.value && (
                                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                                  <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                                </div>
                              )}
                              
                              {/* Hover glow effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                          ))}
                        </div>
                      </div>
                      

                    </div>



                    {/* Get Meal Suggestion Button */}
                    <div className="flex flex-col items-center mt-12">
                      {/* Subtle selection status */}
                      {(mealType || cookingTime) && (
                        <div className="mb-4 text-center">
                          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                            <span>Ready with:</span>
                            {mealType && (
                              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-medium">
                                {mealTypes.find(t => t.value === mealType)?.label}
                              </span>
                            )}
                            {cookingTime && (
                              <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md font-medium">
                                {cookingTimes.find(t => t.value === cookingTime)?.label}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Main Action Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={getSuggestion}
                          disabled={leftoverMode || loading}
                          className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                            leftoverMode
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : loading
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white cursor-wait'
                              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                          }`}
                        >
                          {loading ? (
                            <>
                              <div className="loading-spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                              <span className="text-base whitespace-nowrap font-semibold text-white">
                                {leftoverMode ? 'Transforming Leftovers...' : 'Finding Perfect Meal...'}
                              </span>
                            </>
                          ) : (
                            <>
                              {leftoverMode ? (
                                <Recycle className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" />
                              ) : (
                                <Flame className="w-5 h-5 animate-pulse text-white" />
                              )}
                              <span className="text-base whitespace-nowrap font-semibold text-white">
                                {leftoverMode ? 'Coming Soon' : 'Get Meal Suggestion'}
                              </span>
                              {!leftoverMode && (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 text-white" />
                              )}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card mb-8 sm:mb-12">
                  {/* Main Header - Single, Clear Section */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                  </div>

                    {/* Mode Toggle - Integrated into header */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 inline-flex shadow-lg border border-gray-100">
                        <button
                          onClick={() => {
                            setLeftoverMode(false)
                            setSelectedIngredients([])
                          }}
                          className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2.5 ${
                            !leftoverMode 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md transform scale-105' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Utensils className={`w-4 h-4 ${!leftoverMode ? 'text-white' : 'text-gray-400'}`} />
                          <span className="hidden sm:inline text-sm">Fresh</span>
                          <span className="sm:hidden text-sm">Fresh</span>
                        </button>
                        
                        <button
                          disabled
                          className="px-6 py-2.5 rounded-xl font-medium text-gray-400 cursor-not-allowed flex items-center gap-2.5 relative"
                        >
                          <Recycle className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm">Leftovers</span>
                          <span className="sm:hidden text-sm">Leftovers</span>
                          
                          {/* Coming Soon Badge */}
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                            SOON
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ingredient Selection - Streamlined Design */}
                  <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="card p-6 sm:p-8">
                      {/* Redesigned Search Section Header */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg mb-4">
                            <Search className="w-5 h-5 text-white" />
                          </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Find Your Ingredients</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">Search and select ingredients you have available</p>
                      </div>

                      {/* Redesigned Search Bar */}
                      <div className="relative mb-8">
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200">
                            <Search className="w-5 h-5" />
                          </div>
                        <input
                          type="text"
                            placeholder="Search ingredients"
                          value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value)
                              setCurrentPage(1) // Reset to first page when searching
                            }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && searchTerm.trim()) {
                              const customIngredient = searchTerm.trim()
                              if (!selectedIngredients.includes(customIngredient) && !commonIngredients.includes(customIngredient)) {
                                setSelectedIngredients(prev => [...prev, customIngredient])
                                setSearchTerm('')
                              }
                            }
                          }}
                            className="w-full pl-12 pr-16 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-gray-700 placeholder-gray-400 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                        />
                        {searchTerm.trim() && !commonIngredients.includes(searchTerm.trim()) && !selectedIngredients.includes(searchTerm.trim()) && (
                          <button
                            onClick={() => {
                              const customIngredient = searchTerm.trim()
                              setSelectedIngredients(prev => [...prev, customIngredient])
                              setSearchTerm('')
                            }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 transition-colors duration-200 font-medium"
                          >
                            Add
                          </button>
                        )}
                      </div>

                        {/* Search suggestions for mobile */}
                        {searchTerm.trim() && filteredIngredients.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                            {filteredIngredients.slice(0, 6).map((ingredient, index) => (
                              <button
                                key={`${ingredient}-${index}`}
                                onClick={() => {
                                  handleIngredientToggle(ingredient)
                                  setSearchTerm('')
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                              >
                                <span className="text-lg">{getIngredientIcon(ingredient)}</span>
                                <span className="text-gray-700 font-medium">{ingredient}</span>
                                {selectedIngredients.includes(ingredient) && (
                                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Ingredients Display - Mobile Optimized */}
                      {selectedIngredients.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CircleCheck className="w-4 h-4 text-green-500" />
                              Selected ({selectedIngredients.length})
                          </h4>
                            <button
                              onClick={() => setSelectedIngredients([])}
                              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Clear All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedIngredients.map((ingredient, index) => (
                              <div
                                key={`${ingredient}-${index}`}
                                className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full px-3 py-2 flex items-center gap-2 shadow-sm"
                              >
                                <span className="text-sm">{getIngredientIcon(ingredient)}</span>
                                <span className="text-green-700 text-sm font-medium">{ingredient}</span>
                                <button
                                  onClick={() => setSelectedIngredients(prev => prev.filter((_, i) => i !== index))}
                                  className="text-green-600 hover:text-green-800 transition-colors p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Category Filter */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Filter by Category</h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedCategory('all')
                              setCurrentPage(1)
                            }}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              selectedCategory === 'all'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            All Categories
                          </button>
                          {ingredientCategories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => {
                                setSelectedCategory(category.id)
                                setCurrentPage(1)
                              }}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                                selectedCategory === category.id
                                  ? 'bg-blue-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <span>{category.emoji}</span>
                              <span className="hidden sm:inline">{category.name}</span>
                              <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ingredients Grid - Mobile Optimized */}
                      <div className="space-y-4">
                        {/* Available Ingredients Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-gray-700">
                              {selectedCategory === 'all' ? 'All Available Ingredients' : ingredientCategories.find(cat => cat.id === selectedCategory)?.name}
                            </h4>
                            <span className="text-xs text-gray-500">{filteredIngredients.length} ingredients</span>
                          </div>
                          
                          {/* Mobile-optimized grid with better spacing */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-4">
                            {currentIngredients.map((ingredient, index) => (
                              <button
                                key={`${ingredient}-${index}`}
                                onClick={() => handleIngredientToggle(ingredient)}
                                className={`group relative p-5 sm:p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md active:scale-95 ${
                                  selectedIngredients.includes(ingredient)
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-md transform scale-105'
                                    : 'bg-white border-gray-200 hover:border-green-200 hover:bg-green-50/50'
                                }`}
                              >
                                {/* Selection indicator */}
                                {selectedIngredients.includes(ingredient) && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                                )}
                                
                                <div className="flex flex-col items-center gap-2 sm:gap-1.5">
                                  <span className="text-2xl sm:text-xl">{getIngredientIcon(ingredient)}</span>
                                  <span className="text-xs sm:text-xs font-medium text-gray-700 text-center leading-tight line-clamp-2">{ingredient}</span>
                                </div>
                                
                                {/* Hover effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                              </button>
                            ))}
                          </div>
                          
                          {/* No results message */}
                          {filteredIngredients.length === 0 && searchTerm.trim() && (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                        </div>
                              <p className="text-gray-500 text-sm">No ingredients found for &quot;{searchTerm}&quot;</p>
                              <p className="text-gray-400 text-xs mt-1">Try a different search term or add it as a custom ingredient</p>
                      </div>
                          )}

                          {/* Pagination Controls - Mobile Optimized */}
                          {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-6">
                          <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-600 hover:bg-gray-200 min-w-[60px] sm:min-w-[80px]"
                              >
                                Previous
                              </button>
                              
                              <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  const pageNum = i + 1
                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => setCurrentPage(pageNum)}
                                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                                        currentPage === pageNum
                                          ? 'bg-blue-500 text-white'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  )
                                })}
                                {totalPages > 5 && (
                                  <span className="text-gray-500 text-xs sm:text-sm">...</span>
                                )}
                              </div>
                              
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-600 hover:bg-gray-200 min-w-[60px] sm:min-w-[80px]"
                              >
                                Next
                          </button>
                        </div>
                      )}

                          {/* Page Info */}
                          {totalPages > 1 && (
                            <div className="text-center mt-2">
                              <span className="text-xs text-gray-500">
                                Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredIngredients.length)} of {filteredIngredients.length} ingredients
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Quick Stats - Mobile Optimized */}
                  {!leftoverMode && selectedIngredients.length > 0 && (
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 shadow-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700 font-medium">
                          {selectedIngredients.length} ingredient{selectedIngredients.length !== 1 ? 's' : ''} selected
                        </span>
                        <span className="text-xs text-green-600">• Smart suggestions enabled</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}


        </div>

                {/* Floating Smart Recipes Button - Moved outside main container */}
        {selectedIngredients.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-slide-in-up" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
            <button
              onClick={getSuggestion}
              disabled={loading || leftoverMode}
              className={`relative px-6 py-3 flex items-center justify-center gap-2 group transition-all duration-300 transform hover:scale-105 active:scale-95 font-bold text-base rounded-xl shadow-xl border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none max-w-xs ${
                leftoverMode
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-300/20 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/25'
              }`}
            >
                      {/* Subtle background glow */}
                      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl ${
                        leftoverMode ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-green-400 to-emerald-400'
                      }`}></div>
                      
                                  {loading ? (
              <>
                <div className="loading-spinner w-4 h-4 border-2 border-white/30 border-t-white"></div>
                <span className="text-sm whitespace-nowrap font-semibold text-white">
                  {leftoverMode ? 'Transforming...' : 'Finding Recipes...'}
                </span>
              </>
            ) : (
              <>
                {leftoverMode ? (
                  <Recycle className="w-5 h-5 text-gray-300" />
                ) : (
                  <CircleCheck className="w-4 h-4 text-white" />
                )}
                <span className="text-sm whitespace-nowrap font-semibold text-white">
                  {leftoverMode ? 'Coming Soon' : `Suggest Recipe (${selectedIngredients.length})`}
                </span>
                {!leftoverMode && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 text-white" />
                )}
              </>
            )}
                    </button>
                    </div>
          )}

        {/* Saved Meals Section */}
        {savedMeals.length > 0 && (
          <div className="animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="card mb-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="heading-md text-gray-800">
                  Your Saved Meals ({savedMeals.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedMeals.slice(0, 6).map((meal, index) => (
                  <div 
                    key={meal.id} 
                    className="glass-dark rounded-2xl p-6 hover-lift cursor-pointer border border-orange-100 transition-all duration-300"
                    onClick={() => {
                      localStorage.setItem('currentMeal', JSON.stringify(meal))
                      const mealParam = encodeURIComponent(JSON.stringify(meal))
                      router.push(`/result?meal=${mealParam}`)
                    }}
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <h4 className="font-semibold text-gray-800 mb-3 text-lg">{meal.name}</h4>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{meal.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-xl text-xs font-medium">
                        {meal.meal_type}
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-xs font-medium">
                        {meal.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {savedMeals.length > 6 && (
                <p className="text-center text-gray-500 body-md mt-6">
                  And {savedMeals.length - 6} more saved meals...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 sm:mt-20 animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="glass rounded-3xl px-8 py-6 inline-flex items-center gap-4 border border-orange-200">
            <Heart className="w-5 h-5 text-red-500 animate-bounce-light" />
            <span className="text-gray-700 body-md font-medium">Made with love for Nigerian home cooks</span>
            <ChefHat className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-gray-500 text-sm mt-4">Beta version - Your feedback helps us improve!</p>
        </div>
      </div>

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-in-up overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Complete Your Selection</h3>
                  <p className="text-sm text-gray-600">Let&apos;s find the perfect meal for you</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-gray-700 text-base leading-relaxed">
                  {validationMessage}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowValidationModal(false)
                    // Scroll to top to show selection areas
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Go to Selections
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
