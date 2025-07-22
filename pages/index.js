import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { fallbackMeals, mealTypes, cookingTimes, dietaryPreferences, commonIngredients } from '../lib/data'
import { 
  ChefHat, 
  Heart, 
  Sparkles, 
  CircleCheck, 
  Utensils, 
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

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showIngredientMode, setShowIngredientMode] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [mealType, setMealType] = useState('')
  const [cookingTime, setCookingTime] = useState('')
  const [dietaryPref, setDietaryPref] = useState('any')
  const [savedMeals, setSavedMeals] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedMeals') || '[]')
    setSavedMeals(saved)
  }, [])

  const getSuggestion = async () => {
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
        if (dietaryPref) query.eq('dietary_preference', dietaryPref)
        const { data, error } = await query.limit(10)

        if (error) {
          console.log('❌ Supabase error:', error.message)
        } else if (data && data.length > 0) {
          console.log(`✅ Found ${data.length} meals from Supabase`)
          suggestions = data
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
            if (dietaryPref && dietaryPref !== 'any') {
              // Enhanced dietary preference filtering
              const mealPref = meal.dietary_preference
              const userPref = dietaryPref
              
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
        alert('No meals found with your criteria. Try different filters!')
        setLoading(false)
        return
      }

      const randomIndex = Math.floor(Math.random() * suggestions.length)
      const suggestion = suggestions[randomIndex]
      console.log(`🎯 Selected meal: ${suggestion.name} (ID: ${suggestion.id})`)
      console.log(`📝 Description: ${suggestion.description}`)
      
      // Store the meal in localStorage and redirect to results page
      localStorage.setItem('currentMeal', JSON.stringify(suggestion))
      
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

  return (
    <div className="min-h-screen bg-pattern relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-300/30 to-orange-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-200/20 to-yellow-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 animate-slide-in-up">
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center shadow-strong animate-pulse-glow">
                <ChefHat className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-medium">
                <Heart className="w-4 h-4 text-white animate-bounce-light" />
              </div>
            </div>
            <div>
              <h1 className="heading-xl text-gradient">
                MomFudy
              </h1>
              <p className="text-gray-700 text-lg sm:text-xl font-medium">Your Smart Kitchen Assistant</p>
            </div>
          </div>
          <p className="body-lg text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed">
            Stop wasting time deciding what to cook! Get instant Nigerian meal suggestions tailored to your ingredients and preferences in under 30 seconds.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8 sm:mb-12 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
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
          {!showIngredientMode ? (
            <div className="card mb-8 sm:mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <h3 className="heading-md text-gray-800">
                  What are you looking for?
                </h3>
              </div>

              <div className="space-y-8">
                {/* Meal Type */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-6">What type of meal are you looking for?</label>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                      {mealTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setMealType(mealType === type.value ? '' : type.value)}
                          className={`relative rounded-2xl p-4 transition-all duration-300 text-center ${
                            mealType === type.value 
                              ? 'bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 shadow-lg transform scale-105' 
                              : 'bg-white border-2 border-gray-100 hover:border-orange-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`text-3xl ${mealType === type.value ? 'transform scale-110' : ''}`}>
                              {type.emoji}
                            </div>
                            <span className={`text-sm font-semibold ${
                              mealType === type.value ? 'text-orange-800' : 'text-gray-700'
                            }`}>
                              {type.label}
                            </span>
                          </div>
                          {mealType === type.value && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cooking Time */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-6">How much time do you have?</label>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                      {cookingTimes.map((time) => (
                        <button
                          key={time.value}
                          onClick={() => setCookingTime(cookingTime === time.value ? '' : time.value)}
                          className={`relative rounded-2xl p-4 transition-all duration-300 text-center ${
                            cookingTime === time.value 
                              ? 'bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 shadow-lg transform scale-105' 
                              : 'bg-white border-2 border-gray-100 hover:border-orange-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`text-3xl ${cookingTime === time.value ? 'transform scale-110' : ''}`}>
                              {time.emoji}
                            </div>
                            <span className={`text-sm font-semibold ${
                              cookingTime === time.value ? 'text-orange-800' : 'text-gray-700'
                            }`}>
                              {time.label}
                            </span>
                          </div>
                          {cookingTime === time.value && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-6">Any dietary preferences?</label>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full max-w-4xl">
                      {dietaryPreferences.map((pref) => (
                        <button
                          key={pref.value}
                          onClick={() => setDietaryPref(dietaryPref === pref.value ? '' : pref.value)}
                          className={`relative rounded-2xl p-3 transition-all duration-300 text-center ${
                            dietaryPref === pref.value 
                              ? 'bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 shadow-lg transform scale-105' 
                              : 'bg-white border-2 border-gray-100 hover:border-orange-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <div className={`text-2xl ${dietaryPref === pref.value ? 'transform scale-110' : ''}`}>
                              {pref.emoji}
                            </div>
                            <span className={`text-xs font-semibold ${
                              dietaryPref === pref.value ? 'text-orange-800' : 'text-gray-700'
                            }`}>
                              {pref.label}
                            </span>
                          </div>
                          {dietaryPref === pref.value && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card mb-8 sm:mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <CircleCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="heading-md text-gray-800">
                  What ingredients do you have?
                </h3>
              </div>
              <p className="text-gray-600 mb-8 body-lg">Select ingredients you have available:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {commonIngredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    onClick={() => toggleIngredient(ingredient)}
                    className={`filter-button text-center ${
                      selectedIngredients.includes(ingredient) ? 'filter-button-active' : 'filter-button-inactive'
                    }`}
                  >
                    <span className="text-sm font-medium">{ingredient}</span>
                  </button>
                ))}
              </div>
              
              {selectedIngredients.length > 0 && (
                <div className="mt-8 p-6 glass-dark rounded-2xl border border-orange-200">
                  <p className="text-gray-700 body-md">
                    <span className="font-semibold text-orange-600">Selected:</span> {selectedIngredients.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="text-center mb-12 sm:mb-16">
            <button
              onClick={getSuggestion}
              disabled={loading}
              className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-5 sm:py-6 flex items-center gap-4 mx-auto w-full max-w-md group"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-6 h-6"></div>
                  <span>Finding Perfect Meal...</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <span>Get Meal Suggestion</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
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
