import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { fallbackMeals } from '../lib/data'
import { 
  ChefHat, 
  Clock, 
  Utensils, 
  Users, 
  Zap, 
  Heart,
  ArrowLeft,
  Share2,
  Bookmark,
  Star,
  Timer,
  Target
} from 'lucide-react'

export default function Result() {
  const router = useRouter()
  const [meal, setMeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savedMeals, setSavedMeals] = useState([])
  const [showIngredients, setShowIngredients] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    // Get meal data from URL parameters or localStorage
    const mealData = router.query.meal ? JSON.parse(decodeURIComponent(router.query.meal)) : null
    
    if (mealData) {
      setMeal(mealData)
    } else {
      // Fallback: get from localStorage
      const storedMeal = localStorage.getItem('currentMeal')
      if (storedMeal) {
        setMeal(JSON.parse(storedMeal))
      }
    }
    
    // Load saved meals
    const saved = JSON.parse(localStorage.getItem('savedMeals') || '[]')
    setSavedMeals(saved)
    setLoading(false)
  }, [router.query])

  const getNewSuggestion = async () => {
    setGenerating(true)
    
    try {
      let suggestions = []
      
      // Try to get suggestions from Supabase first
      if (supabase) {
        console.log('🔍 Querying Supabase for meals...')
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .limit(10)
        
        if (error) {
          console.log('❌ Supabase error:', error.message)
        } else if (data && data.length > 0) {
          console.log(`✅ Found ${data.length} meals from Supabase`)
          suggestions = data
        } else {
          console.log('⚠️ No meals found in Supabase, using fallback')
        }
      }
      
      // Use fallback meals if no Supabase data
      if (suggestions.length === 0) {
        console.log('🔄 Using fallback meals data')
        suggestions = fallbackMeals
      }
      
      // Select a random meal
      const randomIndex = Math.floor(Math.random() * suggestions.length)
      const newMeal = suggestions[randomIndex]
      
      console.log(`🎯 Selected new meal: ${newMeal.name} (ID: ${newMeal.id})`)
      
      // Update the meal state
      setMeal(newMeal)
      
      // Store in localStorage
      localStorage.setItem('currentMeal', JSON.stringify(newMeal))
      
      // Reset to instructions view
      setShowIngredients(false)
      
    } catch (error) {
      console.error('Error getting new suggestion:', error)
      // Fallback to a random fallback meal
      const randomIndex = Math.floor(Math.random() * fallbackMeals.length)
      const fallbackMeal = fallbackMeals[randomIndex]
      setMeal(fallbackMeal)
      localStorage.setItem('currentMeal', JSON.stringify(fallbackMeal))
    } finally {
      setGenerating(false)
    }
  }

  const saveMeal = () => {
    if (!meal) return
    
    const updatedSaved = [...savedMeals, meal]
    setSavedMeals(updatedSaved)
    localStorage.setItem('savedMeals', JSON.stringify(updatedSaved))
  }

  const removeSavedMeal = () => {
    const updatedSaved = savedMeals.filter(m => m.id !== meal.id)
    setSavedMeals(updatedSaved)
    localStorage.setItem('savedMeals', JSON.stringify(updatedSaved))
  }

  const isSaved = savedMeals.some(m => m.id === meal?.id)

  const shareMeal = () => {
    if (navigator.share) {
      navigator.share({
        title: `Try this: ${meal.name}`,
        text: `I found this amazing recipe: ${meal.name} - ${meal.description}`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${meal.name}: ${meal.description}`)
      alert('Recipe copied to clipboard!')
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMealTypeEmoji = (type) => {
    switch (type) {
      case 'breakfast': return '🌅'
      case 'lunch': return '☀️'
      case 'dinner': return '🌙'
      default: return '🍽️'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-12 h-12 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600">Loading your perfect meal...</p>
        </div>
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No meal found</h2>
          <p className="text-gray-600 mb-4">Let&apos;s find you something delicious!</p>
          <button 
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Get New Suggestion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Search</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={shareMeal}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                title="Share recipe"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={isSaved ? removeSavedMeal : saveMeal}
                className={`p-2 rounded-full transition-colors ${
                  isSaved 
                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save recipe'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Meal Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl">{getMealTypeEmoji(meal.meal_type)}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient">{meal.name}</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{meal.description}</p>
        </div>

        {/* Meal Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-gray-600">Prep Time</p>
            <p className="font-semibold">{meal.prep_time}</p>
          </div>
          
          <div className="card text-center">
            <Timer className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-sm text-gray-600">Cooking Time</p>
            <p className="font-semibold capitalize">{meal.cooking_time}</p>
          </div>
          
          <div className="card text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-sm text-gray-600">Difficulty</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(meal.difficulty)}`}>
              {meal.difficulty}
            </span>
          </div>
          
          <div className="card text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <p className="text-sm text-gray-600">Dietary</p>
            <p className="font-semibold capitalize">{meal.dietary_preference}</p>
          </div>
        </div>

        {/* Ingredients and Instructions Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-full p-1 shadow-lg border">
            <button
              onClick={() => setShowIngredients(false)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                !showIngredients 
                  ? 'bg-primary-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <Utensils className="w-4 h-4 inline mr-2" />
              Instructions
            </button>
            <button
              onClick={() => setShowIngredients(true)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                showIngredients 
                  ? 'bg-primary-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <ChefHat className="w-4 h-4 inline mr-2" />
              Ingredients
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="card">
          {showIngredients ? (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-primary-500" />
                Ingredients You&apos;ll Need
              </h2>
              <div className="grid gap-3">
                {meal.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-800">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Utensils className="w-6 h-6 text-primary-500" />
                How to Make It
              </h2>
              <div className="space-y-4">
                {meal.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white text-sm rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">{instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8">
          <button
            onClick={getNewSuggestion}
            className="btn-primary flex items-center justify-center gap-2 px-8 py-3"
            disabled={generating}
          >
            {generating ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Zap className="w-5 h-5" />
            )}
            {generating ? 'Generating...' : 'Get Another Suggestion'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 shadow-sm">
            <Heart className="w-4 h-4 text-red-500 animate-bounce-light" />
            <span className="text-gray-600 text-sm font-medium">Made with love for Nigerian home cooks by MomFudy</span>
            <ChefHat className="w-4 h-4 text-primary-500" />
          </div>
        </div>
      </div>
    </div>
  )
} 