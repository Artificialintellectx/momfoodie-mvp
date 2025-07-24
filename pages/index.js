import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { fallbackMeals, mealTypes, cookingTimes, dietaryPreferences, commonIngredients } from '../lib/data'
import { 
  ChefHat, 
  Heart, 
  Sparkles, 
  CircleCheck, 
  Zap,
  Clock,
  Users,
  Search,
  Star,
  ArrowRight,
  Play,
  Flame,
  Coffee
} from 'lucide-react'
import { HomepageSkeleton } from '../components/SkeletonLoader'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [showIngredientMode, setShowIngredientMode] = useState(false)
  const [mealType, setMealType] = useState('')
  const [cookingTime, setCookingTime] = useState('quick')
  const [dietaryPreference, setDietaryPreference] = useState('any')
  const [savedMeals, setSavedMeals] = useState([])
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [availableIngredients] = useState([
    'Rice', 'Beans', 'Tomatoes', 'Onions', 'Garlic', 'Ginger', 
    'Pepper', 'Oil', 'Salt', 'Chicken', 'Fish', 'Beef', 
    'Spinach', 'Carrots', 'Potatoes', 'Yam', 'Plantain'
  ])

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
    
    // Simulate page loading
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedMeals') || '[]')
    setSavedMeals(saved)
  }, [])

  const getSuggestion = async () => {
    if (showIngredientMode && selectedIngredients.length === 0) {
      alert('Please select at least one ingredient')
      return
    }
    
    setLoading(true)
    try {
      console.log('🔍 Querying Supabase for meals...')
      let suggestions = []

      // Always try Supabase first if available
      if (supabase) {
        console.log('🔍 Querying Supabase for meals...')
        const query = supabase.from('meals').select('*')
        if (mealType) query.eq('meal_type', mealType)
        if (cookingTime) query.eq('cooking_time', cookingTime)
        if (dietaryPreference) query.eq('dietary_preference', dietaryPreference)
        const { data, error } = await query.limit(50) // Get more meals to filter from

        if (error) {
          console.log('❌ Supabase error:', error.message)
        } else if (data && data.length > 0) {
          console.log(`✅ Found ${data.length} meals from Supabase`)
          
          // Apply ingredient filtering for Supabase results if in ingredient mode
          if (showIngredientMode && selectedIngredients.length > 0) {
            suggestions = data.filter(meal => 
              selectedIngredients.some(ingredient =>
                meal.ingredients.some(mealIngredient =>
                  mealIngredient.toLowerCase().includes(ingredient.toLowerCase())
                )
              )
            )
            console.log(`🔍 After ingredient filtering: ${suggestions.length} meals`)
          } else {
            suggestions = data
          }
        } else {
          console.log('⚠️ No meals found in Supabase, using fallback')
        }
      }

      // Fallback to local data if no Supabase or no results
      if (suggestions.length === 0) {
        console.log('🔄 Using fallback meals data')
        suggestions = fallbackMeals.filter(meal => {
          if (showIngredientMode) {
            return selectedIngredients.some(ingredient =>
              meal.ingredients.some(mealIngredient =>
                mealIngredient.toLowerCase().includes(ingredient.toLowerCase())
              )
            )
          } else {
            let matches = true
            if (mealType && meal.meal_type !== mealType) matches = false
            if (cookingTime && meal.cooking_time !== cookingTime) matches = false
            if (dietaryPreference && dietaryPreference !== 'any') {
              // Enhanced dietary preference filtering
              const mealPref = meal.dietary_preference
              const userPref = dietaryPreference
              
              // Handle special dietary preference logic
              if (userPref === 'halal') {
                // Halal meals should not contain pork or alcohol
                const hasPork = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('pork') || 
                  ingredient.toLowerCase().includes('bacon') ||
                  ingredient.toLowerCase().includes('ham')
                )
                if (hasPork) matches = false
              } else if (userPref === 'pescatarian') {
                // Pescatarian can have fish but not other meat
                const hasMeat = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('chicken') || 
                  ingredient.toLowerCase().includes('beef') ||
                  ingredient.toLowerCase().includes('pork') ||
                  ingredient.toLowerCase().includes('lamb')
                )
                if (hasMeat) matches = false
              } else if (userPref === 'lacto_vegetarian') {
                // Lacto-vegetarian can have dairy but not meat/fish
                const hasMeatOrFish = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('chicken') || 
                  ingredient.toLowerCase().includes('beef') ||
                  ingredient.toLowerCase().includes('fish') ||
                  ingredient.toLowerCase().includes('pork')
                )
                if (hasMeatOrFish) matches = false
              } else if (userPref === 'gluten_free') {
                // Gluten-free should not contain wheat, barley, rye
                const hasGluten = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('wheat') || 
                  ingredient.toLowerCase().includes('barley') ||
                  ingredient.toLowerCase().includes('rye') ||
                  ingredient.toLowerCase().includes('bread') ||
                  ingredient.toLowerCase().includes('flour')
                )
                if (hasGluten) matches = false
              } else if (userPref === 'low_sodium') {
                // Low-sodium meals should avoid high-salt ingredients
                const hasHighSodium = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('seasoning cube') || 
                  ingredient.toLowerCase().includes('stock cube') ||
                  ingredient.toLowerCase().includes('bouillon')
                )
                if (hasHighSodium) matches = false
              } else if (userPref === 'low_fat') {
                // Low-fat meals should avoid high-fat ingredients
                const hasHighFat = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('palm oil') || 
                  ingredient.toLowerCase().includes('coconut oil') ||
                  ingredient.toLowerCase().includes('butter')
                )
                if (hasHighFat) matches = false
              } else if (userPref === 'high_protein') {
                // High-protein meals should contain protein-rich ingredients
                const hasProtein = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('chicken') || 
                  ingredient.toLowerCase().includes('beef') ||
                  ingredient.toLowerCase().includes('fish') ||
                  ingredient.toLowerCase().includes('eggs') ||
                  ingredient.toLowerCase().includes('beans') ||
                  ingredient.toLowerCase().includes('lentils') ||
                  ingredient.toLowerCase().includes('tofu') ||
                  ingredient.toLowerCase().includes('milk') ||
                  ingredient.toLowerCase().includes('yogurt')
                )
                if (!hasProtein) matches = false
              } else if (userPref === 'soft_foods') {
                // Soft foods are easy to chew and digest
                const isSoftFood = meal.name.toLowerCase().includes('porridge') ||
                  meal.name.toLowerCase().includes('soup') ||
                  meal.name.toLowerCase().includes('moi moi') ||
                  meal.name.toLowerCase().includes('yam') ||
                  meal.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes('porridge') ||
                    ingredient.toLowerCase().includes('soup')
                  )
                if (!isSoftFood) matches = false
              } else if (userPref === 'high_fiber') {
                // High-fiber meals contain fiber-rich ingredients
                const hasFiber = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('beans') ||
                  ingredient.toLowerCase().includes('vegetables') ||
                  ingredient.toLowerCase().includes('spinach') ||
                  ingredient.toLowerCase().includes('okra') ||
                  ingredient.toLowerCase().includes('plantain') ||
                  ingredient.toLowerCase().includes('yam')
                )
                if (!hasFiber) matches = false
              } else if (userPref === 'traditional') {
                // Traditional Nigerian dishes
                const isTraditional = meal.name.toLowerCase().includes('jollof') ||
                  meal.name.toLowerCase().includes('egusi') ||
                  meal.name.toLowerCase().includes('amala') ||
                  meal.name.toLowerCase().includes('eba') ||
                  meal.name.toLowerCase().includes('akara') ||
                  meal.name.toLowerCase().includes('moi moi') ||
                  meal.name.toLowerCase().includes('pepper soup')
                if (!isTraditional) matches = false
              } else if (userPref === 'rice_based') {
                // Rice-based meals
                const isRiceBased = meal.name.toLowerCase().includes('rice') ||
                  meal.name.toLowerCase().includes('jollof') ||
                  meal.name.toLowerCase().includes('fried rice') ||
                  meal.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes('rice') ||
                    ingredient.toLowerCase().includes('basmati')
                  )
                if (!isRiceBased) matches = false
              } else if (userPref === 'swallow_based') {
                // Swallow-based meals (starchy accompaniments)
                const isSwallowBased = meal.name.toLowerCase().includes('amala') ||
                  meal.name.toLowerCase().includes('eba') ||
                  meal.name.toLowerCase().includes('pounded yam') ||
                  meal.name.toLowerCase().includes('fufu') ||
                  meal.name.toLowerCase().includes('garri') ||
                  meal.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes('yam flour') ||
                    ingredient.toLowerCase().includes('cassava') ||
                    ingredient.toLowerCase().includes('garri') ||
                    ingredient.toLowerCase().includes('pounded yam')
                  )
                if (!isSwallowBased) matches = false
              } else {
                // Standard dietary preference matching
                if (mealPref !== userPref && mealPref !== 'any') matches = false
              }
            }
            return matches
          }
        })
      }

      if (suggestions.length === 0) {
        // Redirect to no-results page with the selected criteria
        const params = new URLSearchParams()
        if (dietaryPreference && dietaryPreference !== 'any') params.append('dietaryPreference', dietaryPreference)
        if (mealType) params.append('mealType', mealType)
        if (cookingTime) params.append('cookingTime', cookingTime)
        if (showIngredientMode && selectedIngredients.length > 0) {
          params.append('ingredients', selectedIngredients.join(','))
        }
        
        const queryString = params.toString()
        const redirectUrl = queryString ? `/no-results?${queryString}` : '/no-results'
        
        router.push(redirectUrl)
        setLoading(false)
        return
      }

      const randomIndex = Math.floor(Math.random() * suggestions.length)
      const suggestion = suggestions[randomIndex]
      console.log(`🎯 Selected meal: ${suggestion.name} (ID: ${suggestion.id})`)
      console.log(`📝 Description: ${suggestion.description}`)
      
      // Store the meal and search criteria in localStorage
      localStorage.setItem('currentMeal', JSON.stringify(suggestion))
      localStorage.setItem('searchCriteria', JSON.stringify({
        dietaryPreference,
        mealType,
        cookingTime,
        showIngredientMode,
        selectedIngredients: showIngredientMode ? selectedIngredients : []
      }))
      localStorage.setItem('shownMeals', JSON.stringify([suggestion.id])) // Track shown meals
      
      // Redirect to results page with meal data
      const mealParam = encodeURIComponent(JSON.stringify(suggestion))
      router.push(`/result?meal=${mealParam}`)

    } catch (error) {
      console.error('Error getting suggestion:', error)
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        
        {/* Optimized Hero Section */}
        <div className="text-center mb-6 sm:mb-8 animate-slide-in-up">
          <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Compact Logo Icon */}
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-strong animate-pulse-glow group-hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-medium">
                    <Heart className="w-2 h-2 text-white animate-bounce-light" />
                  </div>
                </div>
              </div>
              {/* Subtle floating elements */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-300 rounded-full opacity-60 animate-float"></div>
              <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-300 rounded-full opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* Compact Typography */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-fun bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 tracking-tight hover:scale-105 transition-transform duration-300 cursor-pointer">
                MomFudy
              </h1>
              <p className="text-gray-600 text-base sm:text-lg font-medium">Your Smart Kitchen Assistant</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Never wonder what to cook again</span>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6 sm:mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="toggle-container w-full max-w-md">
            <button
              onClick={() => setShowIngredientMode(false)}
              className={`toggle-button px-6 py-3 w-1/2 ${
                !showIngredientMode ? 'active' : 'inactive'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              <span className="hidden sm:inline">Quick Suggestion</span>
              <span className="sm:hidden">Quick</span>
            </button>
            <button
              onClick={() => setShowIngredientMode(true)}
              className={`toggle-button px-6 py-3 w-1/2 ${
                showIngredientMode ? 'active' : 'inactive'
              }`}
            >
              <CircleCheck className="w-4 h-4 inline mr-2" />
              <span className="hidden sm:inline">What Can I Make?</span>
              <span className="sm:hidden">Ingredients</span>
            </button>
          </div>
        </div>

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
                              onClick={() => setMealType(mealType === type.value ? '' : type.value)}
                              className={`relative rounded-2xl p-4 transition-all duration-300 text-center ${
                                mealType === type.value 
                                  ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 shadow-lg transform scale-105' 
                                  : 'bg-white border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md'
                              }`}
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <div className={`text-3xl ${mealType === type.value ? 'transform scale-110 animate-bounce' : ''}`}>
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
                              onClick={() => setCookingTime(cookingTime === time.value ? '' : time.value)}
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
                                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
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

                    {/* Dietary Preferences - Enhanced Prominence */}
                    <div className="relative animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
                      {/* Attention-grabbing header */}
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '2s' }}>
                            Any dietary preferences?
                          </h3>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium px-2">
                          We&apos;ll find meals that match your dietary needs and preferences!
                        </p>
                      </div>
                      
                      {/* Enhanced dietary preferences options */}
                      <div className="flex justify-center">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-4xl">
                          {dietaryPreferences.map((preference) => (
                            <button
                              key={preference.value}
                              onClick={() => setDietaryPreference(dietaryPreference === preference.value ? '' : preference.value)}
                              className={`relative rounded-xl p-3 transition-all duration-300 text-center ${
                                dietaryPreference === preference.value 
                                  ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 shadow-lg transform scale-105' 
                                  : 'bg-white border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md'
                              }`}
                            >
                              <div className="flex flex-col items-center space-y-1">
                                <div className={`text-2xl ${dietaryPreference === preference.value ? 'transform scale-110' : ''}`}>
                                  {preference.emoji}
                                </div>
                                <span className={`text-xs font-semibold ${
                                  dietaryPreference === preference.value ? 'text-indigo-800' : 'text-gray-700'
                                }`}>
                                  {preference.label}
                                </span>
                              </div>
                              {dietaryPreference === preference.value && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              )}
                              {/* Trending indicator for traditional option */}
                              {preference.value === 'traditional' && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                                  🔥 HOT
                                </div>
                              )}
                              {/* Popular indicator for rice-based option */}
                              {preference.value === 'rice_based' && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                                  ⭐ POPULAR
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Get Meal Suggestion Button */}
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={getSuggestion}
                        disabled={loading}
                        className="relative px-10 py-4 flex items-center justify-center gap-3 group transition-all duration-300 transform hover:scale-105 min-w-[280px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/25 border-2 border-indigo-400/20"
                      >
                        {/* Animated background glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                        
                        {/* Pulsing ring effect */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-purple-300/30 animate-pulse"></div>
                        
                        {loading ? (
                          <>
                            <div className="loading-spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                            <span className="text-base whitespace-nowrap font-semibold">Finding Perfect Meal...</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-5 h-5 animate-pulse" />
                            <span className="text-base whitespace-nowrap font-semibold">Get Meal Suggestion</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card mb-8 sm:mb-12">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <CircleCheck className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="heading-md text-gray-800">
                      What ingredients do you have?
                    </h3>
                  </div>

                  <div className="space-y-16">
                    {/* Available Ingredients */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-6">Select the ingredients you have:</label>
                      <div className="flex justify-center">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-4xl">
                          {availableIngredients.map((ingredient) => (
                            <button
                              key={ingredient}
                              onClick={() => toggleIngredient(ingredient)}
                              className={`relative rounded-xl p-3 transition-all duration-300 text-center ${
                                selectedIngredients.includes(ingredient)
                                  ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 shadow-lg transform scale-105'
                                  : 'bg-white border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md'
                              }`}
                            >
                              <div className="flex flex-col items-center space-y-1">
                                <div className={`text-2xl ${selectedIngredients.includes(ingredient) ? 'transform scale-110' : ''}`}>
                                  {ingredient === 'Rice' ? '🍚' :
                                   ingredient === 'Plantain' ? '🍌' :
                                   ingredient === 'Yam' ? '🍠' :
                                   ingredient === 'Tomatoes' ? '🍅' :
                                   ingredient === 'Onions' ? '🧅' :
                                   ingredient === 'Pepper' ? '🌶️' :
                                   ingredient === 'Beans' ? '🫘' :
                                   ingredient === 'Chicken' ? '🍗' :
                                   ingredient === 'Beef' ? '🥩' :
                                   ingredient === 'Fish' ? '🐟' :
                                   ingredient === 'Eggs' ? '🥚' :
                                   ingredient === 'Spinach' ? '🥬' :
                                   ingredient === 'Palm oil' ? '🫒' :
                                   ingredient === 'Vegetable oil' ? '🫗' :
                                   ingredient === 'Garlic' ? '🧄' :
                                   ingredient === 'Ginger' ? '🫚' :
                                   ingredient === 'Okra' ? '🥗' :
                                   ingredient === 'Sweet potato' ? '🍠' :
                                   ingredient === 'Carrots' ? '🥕' :
                                   ingredient === 'Green beans' ? '🫛' :
                                   ingredient === 'Bread' ? '🍞' : '🥬'}
                                </div>
                                <span className={`text-xs font-semibold ${
                                  selectedIngredients.includes(ingredient) ? 'text-indigo-800' : 'text-gray-700'
                                }`}>
                                  {ingredient}
                                </span>
                              </div>
                              {selectedIngredients.includes(ingredient) && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Get Meal Suggestion Button */}
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={getSuggestion}
                        disabled={loading || selectedIngredients.length === 0}
                        className="relative px-10 py-4 flex items-center justify-center gap-3 group transition-all duration-300 transform hover:scale-105 min-w-[280px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/25 border-2 border-indigo-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {/* Animated background glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                        
                        {/* Pulsing ring effect */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-purple-300/30 animate-pulse"></div>
                        
                        {loading ? (
                          <>
                            <div className="loading-spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                            <span className="text-base whitespace-nowrap font-semibold">Finding Perfect Meal...</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-5 h-5 animate-pulse" />
                            <span className="text-base whitespace-nowrap font-semibold">Get Meal Suggestion</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}


        </div>

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
    </div>
  )
}
