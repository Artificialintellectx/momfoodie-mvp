import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { fallbackMeals, mealTypes, cookingTimes, dietaryPreferences } from '../lib/data'
import { 
  ChefHat, 
  Heart, 
  Sparkles, 
  CircleCheck, 
  Utensils, 
  Zap,
  Clock,
  Users
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 bg-pattern">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="relative">
              <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
              <Heart className="w-2 h-2 sm:w-3 sm:h-3 text-red-500 absolute -top-1 -right-1 animate-bounce-light" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">
              MomFudy
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
              <CircleCheck className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
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
              <CircleCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
              What ingredients do you have?
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Select ingredients you have available:</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {/* commonIngredients.map((ingredient) => ( // This line was removed as per the new_code */}
              {/*   <button // This line was removed as per the new_code */}
              {/*     key={ingredient} // This line was removed as per the new_code */}
              {/*     onClick={() => toggleIngredient(ingredient)} // This line was removed as per the new_code */}
              {/*     className={`filter-button text-center text-xs sm:text-sm ${ // This line was removed as per the new_code */}
              {/*       selectedIngredients.includes(ingredient) ? 'filter-button-active' : 'filter-button-inactive' // This line was removed as per the new_code */}
              {/*     }`} // This line was removed as per the new_code */}
              {/*   > // This line was removed as per the new_code */}
              {/*     {ingredient} // This line was removed as per the new_code */}
              {/*   </button> // This line was removed as per the new_code */}
              {/* ))} // This line was removed as per the new_code */}
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
              <>
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                <span className="text-sm sm:text-base">Finding Perfect Meal...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base">Get Meal Suggestion</span>
              </>
            )}
          </button>
        </div>

        {/* Saved Meals Section */}
        {savedMeals.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Your Saved Meals ({savedMeals.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedMeals.slice(0, 6).map((meal) => (
                <div 
                  key={meal.id} 
                  className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
                  onClick={() => {
                    localStorage.setItem('currentMeal', JSON.stringify(meal))
                    const mealParam = encodeURIComponent(JSON.stringify(meal))
                    router.push(`/result?meal=${mealParam}`)
                  }}
                >
                  <h4 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">{meal.name}</h4>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{meal.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {meal.meal_type}
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      {meal.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {savedMeals.length > 6 && (
              <p className="text-center text-sm text-gray-500 mt-3">
                And {savedMeals.length - 6} more saved meals...
              </p>
            )}
          </div>
        )}

        {/* Footer */}
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
