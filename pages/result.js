import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { fallbackMeals } from '../lib/data'
import { 
  ChefHat, 
  Heart, 
  Clock, 
  Users, 
  Star,
  ArrowLeft, 
  Share2,
  Bookmark,
  BookOpen,
  List,
  Play,
  ArrowRight,
  Zap,
  Flame
} from 'lucide-react'

export default function Result() {
  const router = useRouter()
  const [meal, setMeal] = useState(null)
  const [showIngredients, setShowIngredients] = useState(false)
  const [savedMeals, setSavedMeals] = useState([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedMeals') || '[]')
    setSavedMeals(saved)

    // Get meal data from URL params or localStorage
    let mealData = null
    if (router.query.meal) {
      try {
        mealData = JSON.parse(decodeURIComponent(router.query.meal))
      } catch (e) {
        console.error('Error parsing meal data:', e)
      }
    }
    
    if (!mealData) {
      const stored = localStorage.getItem('currentMeal')
      if (stored) {
        try {
          mealData = JSON.parse(stored)
        } catch (e) {
          console.error('Error parsing stored meal:', e)
        }
      }
    }

    if (mealData) {
      setMeal(mealData)
      console.log('Loaded meal:', mealData.name)
      console.log('Ingredients count:', mealData.ingredients?.length)
      console.log('Instructions count:', mealData.instructions?.length)
    } else {
      router.push('/')
    }
  }, [router.query.meal])

  const toggleSaveMeal = () => {
    if (!meal) return
    
    const updatedSavedMeals = savedMeals.find(m => m.id === meal.id)
      ? savedMeals.filter(m => m.id !== meal.id)
      : [...savedMeals, meal]
    
    setSavedMeals(updatedSavedMeals)
    localStorage.setItem('savedMeals', JSON.stringify(updatedSavedMeals))
  }

  const shareMeal = async () => {
    if (!meal) return
    
    const shareText = `Check out this delicious ${meal.name} recipe from MomFudy! 🍽️`
    const shareUrl = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: meal.name,
          text: shareText,
          url: shareUrl
        })
      } catch (e) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        alert('Recipe link copied to clipboard!')
      } catch (e) {
        console.error('Failed to copy:', e)
      }
    }
  }

  const getNewSuggestion = async () => {
    setGenerating(true)
    try {
      console.log('🔍 Getting new suggestion...')
      let suggestions = []

      // Try Supabase first
      if (supabase) {
        const { data, error } = await supabase.from('meals').select('*').limit(10)
        if (!error && data && data.length > 0) {
          console.log(`✅ Found ${data.length} meals from Supabase`)
          suggestions = data
        } else {
          console.log('⚠️ No meals found in Supabase, using fallback')
        }
      }

      // Fallback to local data
      if (suggestions.length === 0) {
        suggestions = fallbackMeals
      }

      if (suggestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * suggestions.length)
        const newMeal = suggestions[randomIndex]
        setMeal(newMeal)
        localStorage.setItem('currentMeal', JSON.stringify(newMeal))
        console.log(`🎯 New meal selected: ${newMeal.name}`)
      }
    } catch (error) {
      console.error('Error getting new suggestion:', error)
    } finally {
      setGenerating(false)
    }
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="glass rounded-3xl p-8 text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your perfect meal...</p>
        </div>
      </div>
    )
  }

  const isSaved = savedMeals.find(m => m.id === meal.id)

  return (
    <div className="min-h-screen bg-pattern relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-300/30 to-orange-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slide-in-up">
          <button
            onClick={() => router.push('/')}
            className="glass rounded-2xl p-3 hover-lift transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center shadow-strong">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="heading-lg text-gradient">MomFudy</h1>
              <p className="text-gray-600 text-sm">Your perfect meal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={shareMeal}
              className="glass rounded-2xl p-3 hover-lift transition-all duration-300"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={toggleSaveMeal}
              className={`rounded-2xl p-3 transition-all duration-300 ${
                isSaved 
                  ? 'bg-red-500/20 border border-red-400/30 hover:bg-red-500/30' 
                  : 'glass hover-lift'
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>

        {/* Meal Card */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="card mb-8">
            {/* Meal Header */}
            <div className="text-center mb-8">
              <h2 className="heading-lg text-gray-800 mb-4">{meal.name}</h2>
              <p className="body-lg text-gray-600 mb-8 max-w-2xl mx-auto">{meal.description}</p>
              
              {/* Meal Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-dark rounded-2xl p-4 text-center">
                  <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Prep Time</p>
                  <p className="text-gray-800 font-semibold">{meal.prep_time}</p>
                </div>
                <div className="glass-dark rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Difficulty</p>
                  <p className="text-gray-800 font-semibold capitalize">{meal.difficulty}</p>
                </div>
                <div className="glass-dark rounded-2xl p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Type</p>
                  <p className="text-gray-800 font-semibold capitalize">{meal.meal_type}</p>
                </div>
                <div className="glass-dark rounded-2xl p-4 text-center">
                  <ChefHat className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Diet</p>
                  <p className="text-gray-800 font-semibold capitalize">{meal.dietary_preference}</p>
                </div>
              </div>
            </div>

            {/* Toggle Buttons */}
            <div className="flex justify-center mb-8">
              <div className="toggle-container">
                <button
                  onClick={() => setShowIngredients(true)}
                  className={`toggle-button px-6 py-3 ${
                    showIngredients ? 'active' : 'inactive'
                  }`}
                >
                  <List className="w-4 h-4 inline mr-2" />
                  Ingredients
                </button>
                <button
                  onClick={() => setShowIngredients(false)}
                  className={`toggle-button px-6 py-3 ${
                    !showIngredients ? 'active' : 'inactive'
                  }`}
                >
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Instructions
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="animate-fade-in">
              {showIngredients ? (
                <div>
                  <h3 className="heading-md text-gray-800 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                      <List className="w-5 h-5 text-white" />
                    </div>
                    Ingredients You&apos;ll Need
                  </h3>
                  {meal.ingredients && meal.ingredients.length > 0 ? (
                    <div className="grid gap-4">
                      {meal.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="glass-dark rounded-2xl p-4 flex items-center gap-4 hover-lift transition-all duration-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-700 body-md">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-dark rounded-2xl p-8 text-center">
                      <p className="text-gray-600 body-md">No ingredients available for this recipe.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="heading-md text-gray-800 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    How to Make It
                  </h3>
                  {meal.instructions && meal.instructions.length > 0 ? (
                    <div className="space-y-4">
                      {meal.instructions.map((instruction, index) => (
                        <div 
                          key={index}
                          className="glass-dark rounded-2xl p-6 hover-lift transition-all duration-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <p className="text-gray-700 body-md leading-relaxed">{instruction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-dark rounded-2xl p-8 text-center">
                      <p className="text-gray-600 body-md">No instructions available for this recipe.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => router.push('/')}
            className="glass rounded-2xl px-6 py-4 text-gray-700 font-semibold hover-lift transition-all duration-300 flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>
          
          <button
            onClick={getNewSuggestion}
            disabled={generating}
            className="btn-primary px-6 py-4 flex items-center justify-center gap-3 group"
          >
            {generating ? (
              <>
                <div className="loading-spinner w-5 h-5"></div>
                <span>Finding Another Meal...</span>
              </>
            ) : (
              <>
                <Flame className="w-5 h-5" />
                <span>Get Another Suggestion</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="glass rounded-3xl px-8 py-6 inline-flex items-center gap-4 border border-orange-200">
            <Heart className="w-5 h-5 text-red-500 animate-bounce-light" />
            <span className="text-gray-700 body-md font-medium">Made with love for Nigerian home cooks by MomFudy</span>
            <ChefHat className="w-5 h-5 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  )
} 