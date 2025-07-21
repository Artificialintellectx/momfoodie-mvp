import { useState, useEffect } from 'react'
import { supabase, trackEvent } from '../lib/supabase'
import { fallbackMeals, mealTypes, cookingTimes, dietaryPreferences, commonIngredients } from '../lib/data'
import { 
  ChefHat, 
  Clock, 
  Utensils, 
  Sparkles, 
  RefreshCw, 
  Heart,
  Share2,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Timer,
  Users,
  Zap
} from 'lucide-react'

export default function Home() {
  const [mealType, setMealType] = useState('')
  const [cookingTime, setCookingTime] = useState('')
  const [dietaryPref, setDietaryPref] = useState('')
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [currentSuggestion, setCurrentSuggestion] = useState(null)
  const [savedMeals, setSavedMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [showIngredientMode, setShowIngredientMode] = useState(false)
  const [feedback, setFeedback] = useState({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('momfoodie-saved')
      if (saved) {
        setSavedMeals(JSON.parse(saved))
      }
    }
  }, [])

  const getSuggestion = async () => {
    if (!mealType && !showIngredientMode) {
      alert('Please select a meal type first!')
      return
    }

    if (showIngredientMode && selectedIngredients.length === 0) {
      alert('Please select at least one ingredient!')
      return
    }

    setLoading(true)
    trackEvent('suggestion_requested', { 
      meal_type: mealType, 
      cooking_time: cookingTime,
      ingredient_mode: showIngredientMode,
      ingredients_count: selectedIngredients.length
    })

    try {
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
            if (dietaryPref && dietaryPref !== 'any' && meal.dietary_preference !== dietaryPref && meal.dietary_preference !== 'any') matches = false
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
      setCurrentSuggestion(suggestion)
      trackEvent('suggestion_shown', { meal_id: suggestion.id, meal_name: suggestion.name })
      
    } catch (error) {
      console.error('Error getting suggestion:', error)
      const randomMeal = fallbackMeals[Math.floor(Math.random() * fallbackMeals.length)]
      setCurrentSuggestion(randomMeal)
    } finally {
      setLoading(false)
    }
  }

  const toggleSaveMeal = (meal) => {
    if (typeof window === 'undefined') return
    const isSaved = savedMeals.find(m => m.id === meal.id)
    let newSaved
    if (isSaved) {
      newSaved = savedMeals.filter(m => m.id !== meal.id)
      trackEvent('meal_unsaved', { meal_id: meal.id })
    } else {
      newSaved = [...savedMeals, meal]
      trackEvent('meal_saved', { meal_id: meal.id })
    }
    setSavedMeals(newSaved)
    localStorage.setItem('momfoodie-saved', JSON.stringify(newSaved))
  }

  const shareMeal = (meal) => {
    const shareText = `${meal.name} - ${meal.description}\\n\\nIngredients: ${meal.ingredients.join(', ')}\\n\\nGet more meal ideas at MomFoodie!`
    if (navigator.share) {
      navigator.share({
        title: `${meal.name} - MomFoodie Recipe`,
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Recipe copied to clipboard!')
    }
    trackEvent('meal_shared', { meal_id: meal.id })
  }

  const rateMeal = async (meal, rating) => {
    setFeedback({...feedback, [meal.id]: rating})
    trackEvent('meal_rated', { meal_id: meal.id, rating })
    if (supabase) {
      try {
        await supabase.from('user_feedback').insert({
          meal_id: meal.id,
          rating: rating === 'up' ? 5 : 1,
          created_at: new Date().toISOString()
        })
      } catch (error) {
        console.log('Could not save feedback to database')
      }
    }
  }

  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient))
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 bg-pattern">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="relative">
              <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
              <Heart className="w-2 h-2 sm:w-3 sm:h-3 text-red-500 absolute -top-1 -right-1 animate-bounce-light" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">
              MomFoodie
            </h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Stop wasting time deciding what to cook! Get instant Nigerian meal suggestions in under 30 seconds.
          </p>
        </div>

        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-white rounded-full p-1 shadow-lg border w-full max-w-md">
            <button
              onClick={() => setShowIngredientMode(false)}
              className={`px-3 sm:px-6 py-2 rounded-full font-medium transition-all text-sm sm:text-base w-1/2 ${
                !showIngredientMode 
                ? 'bg-primary-500 text-white shadow-md' 
                : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Quick Suggestion</span>
              <span className="sm:hidden">Quick</span>
            </button>
            <button
              onClick={() => setShowIngredientMode(true)}
              className={`px-3 sm:px-6 py-2 rounded-full font-medium transition-all text-sm sm:text-base w-1/2 ${
                showIngredientMode 
                ? 'bg-primary-500 text-white shadow-md' 
                : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">What Can I Make?</span>
              <span className="sm:hidden">Ingredients</span>
            </button>
          </div>
        </div>

        {!showIngredientMode ? (
          <div className="card mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
              What are you looking for?
            </h3>
            
            <div className="mb-3 sm:mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {mealTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setMealType(mealType === type.value ? '' : type.value)}
                    className={`filter-button text-center ${
                      mealType === type.value ? 'filter-button-active' : 'filter-button-inactive'
                    }`}
                  >
                    <span className="mr-1 sm:mr-2">{type.emoji}</span>
                    <span className="text-xs sm:text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">How much time do you have?</label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {cookingTimes.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setCookingTime(cookingTime === time.value ? '' : time.value)}
                    className={`filter-button text-center ${
                      cookingTime === time.value ? 'filter-button-active' : 'filter-button-inactive'
                    }`}
                  >
                    <span className="mr-1 sm:mr-2">{time.emoji}</span>
                    <span className="text-xs sm:text-sm">{time.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {dietaryPreferences.map((pref) => (
                  <button
                    key={pref.value}
                    onClick={() => setDietaryPref(dietaryPref === pref.value ? '' : pref.value)}
                    className={`filter-button text-center ${
                      dietaryPref === pref.value ? 'filter-button-active' : 'filter-button-inactive'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{pref.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
              What ingredients do you have?
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Select ingredients you have available:</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {commonIngredients.map((ingredient) => (
                <button
                  key={ingredient}
                  onClick={() => toggleIngredient(ingredient)}
                  className={`filter-button text-center text-xs sm:text-sm ${
                    selectedIngredients.includes(ingredient) ? 'filter-button-active' : 'filter-button-inactive'
                  }`}
                >
                  {ingredient}
                </button>
              ))}
            </div>
            
            {selectedIngredients.length > 0 && (
              <div className="mt-3 sm:mt-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-xs sm:text-sm text-primary-700">
                  Selected: {selectedIngredients.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mb-6 sm:mb-8">
          <button
            onClick={getSuggestion}
            disabled={loading}
            className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 mx-auto w-full max-w-sm"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
            <span className="text-sm sm:text-base">
              {loading ? 'Finding Perfect Meal...' : showIngredientMode ? 'What Can I Make?' : 'Get Meal Suggestion'}
            </span>
          </button>
        </div>

        {currentSuggestion && (
          <div className="card mb-4 sm:mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Perfect Match!</h2>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => toggleSaveMeal(currentSuggestion)}
                  className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                    savedMeals.find(m => m.id === currentSuggestion.id)
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    savedMeals.find(m => m.id === currentSuggestion.id) ? 'fill-current' : ''
                  }`} />
                </button>
                <button
                  onClick={() => shareMeal(currentSuggestion)}
                  className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-primary-600 mb-2">
                {currentSuggestion.name}
              </h3>
              <p className="text-gray-700 text-base sm:text-lg mb-3 sm:mb-4">
                {currentSuggestion.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1 bg-orange-100 px-2 sm:px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                  <span className="text-orange-700 font-medium">{currentSuggestion.prep_time}</span>
                </div>
                <div className="flex items-center gap-1 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
                  <Timer className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-green-700 font-medium capitalize">{currentSuggestion.difficulty}</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-100 px-2 sm:px-3 py-1 rounded-full">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="text-blue-700 font-medium capitalize">{currentSuggestion.meal_type}</span>
                </div>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                Ingredients You&apos;ll Need:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentSuggestion.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm sm:text-base">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Utensils className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                How to Make It:
              </h4>
              <ol className="space-y-2">
                {currentSuggestion.instructions.map((step, index) => (
                  <li key={index} className="flex gap-2 sm:gap-3">
                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 text-white text-xs sm:text-sm rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-sm sm:text-base">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t pt-3 sm:pt-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm text-gray-600">Was this helpful?</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => rateMeal(currentSuggestion, 'up')}
                    className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                      feedback[currentSuggestion.id] === 'up'
                      ? 'text-green-500 bg-green-50' 
                      : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => rateMeal(currentSuggestion, 'down')}
                    className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                      feedback[currentSuggestion.id] === 'down'
                      ? 'text-red-500 bg-red-50' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={getSuggestion}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  Try Another
                </button>
                <button
                  onClick={() => toggleSaveMeal(currentSuggestion)}
                  className="btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3"
                >
                  <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    savedMeals.find(m => m.id === currentSuggestion.id) ? 'fill-current text-red-500' : ''
                  }`} />
                  {savedMeals.find(m => m.id === currentSuggestion.id) ? 'Saved!' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {savedMeals.length > 0 && (
          <div className="card">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Your Saved Recipes ({savedMeals.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {savedMeals.slice(0, 4).map((meal) => (
                <div 
                  key={meal.id} 
                  className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
                  onClick={() => setCurrentSuggestion(meal)}
                >
                  <h4 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">{meal.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{meal.prep_time}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{meal.description}</p>
                </div>
              ))}
            </div>
            {savedMeals.length > 4 && (
              <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-center">
                And {savedMeals.length - 4} more saved recipes...
              </p>
            )}
          </div>
        )}

        <div className="text-center mt-8 sm:mt-12 py-4 sm:py-6">
          <div className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 shadow-sm">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 animate-bounce-light" />
            <span className="text-gray-600 text-xs sm:text-sm font-medium">Made with love for Nigerian home cooks</span>
            <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Beta version - Your feedback helps us improve!</p>
        </div>
      </div>
    </div>
  )
}
