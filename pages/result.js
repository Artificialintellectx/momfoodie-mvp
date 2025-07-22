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
  const [savedMeals, setSavedMeals] = useState([])
  const [generating, setGenerating] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)

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
  }, [router.query.meal, router])

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
        
        {/* Clean Transparent Header */}
        <div className="flex items-center justify-between mb-6 animate-slide-in-up">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-200 border border-gray-200/50"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={shareMeal}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-200 border border-gray-200/50"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={toggleSaveMeal}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                isSaved 
                  ? 'bg-red-500/20 border-red-400/30 hover:bg-red-500/30' 
                  : 'bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white hover:shadow-lg'
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>

        {/* Ultra Compact Hero Section */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative overflow-hidden rounded-2xl mb-4">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-400 to-red-400 opacity-10"></div>
            
            {/* Content */}
            <div className="relative p-4">
              <div className="text-center mb-4">
                <h1 className="heading-md text-gradient mb-2">{meal.name}</h1>
                <p className="text-sm text-gray-600 max-w-xl mx-auto">{meal.description}</p>
              </div>

              {/* Ultra Compact Meal Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="glass-dark rounded-lg p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-gray-600 text-xs mb-0.5">Time</p>
                  <p className="text-gray-800 font-bold text-xs">{meal.prep_time}</p>
                </div>
                
                <div className="glass-dark rounded-lg p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-gray-600 text-xs mb-0.5">Level</p>
                  <p className="text-gray-800 font-bold text-xs capitalize">{meal.difficulty}</p>
                </div>
                
                <div className="glass-dark rounded-lg p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-gray-600 text-xs mb-0.5">Type</p>
                  <p className="text-gray-800 font-bold text-xs capitalize">{meal.meal_type}</p>
                </div>
                
                <div className="glass-dark rounded-lg p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <ChefHat className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-gray-600 text-xs mb-0.5">Diet</p>
                  <p className="text-gray-800 font-bold text-xs capitalize truncate" title={meal.dietary_preference}>{meal.dietary_preference}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ultra Compact Ingredients Section */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-sm text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <List className="w-4 h-4 text-white" />
                </div>
                Ingredients
              </h2>
              
              <button
                onClick={() => setShowInstructionsModal(true)}
                className="btn-primary px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-3 h-3" />
                Instructions
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
            
            {meal.ingredients && meal.ingredients.length > 0 ? (
              <div className="grid gap-2">
                {meal.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="glass-dark rounded-lg p-3 flex items-center gap-2 hover-lift transition-all duration-300 border border-orange-100"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex-shrink-0 shadow-sm"></div>
                    <span className="text-gray-700 text-sm font-medium">{ingredient}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-dark rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
                <List className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No ingredients available for this recipe.</p>
              </div>
            )}
          </div>
        </div>



        {/* Floating Get Another Recipe Button */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={getNewSuggestion}
            disabled={generating}
            className="btn-primary px-8 py-3 flex items-center justify-center gap-3 group shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px]"
          >
            {generating ? (
              <>
                <div className="loading-spinner w-4 h-4"></div>
                <span className="text-sm whitespace-nowrap">Finding Another Meal...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span className="text-sm whitespace-nowrap">Get Another Recipe</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>



        {/* Clean Instructions Modal */}
        {showInstructionsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-slide-in-up">
              {/* Clean Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{meal.name}</h3>
                      <p className="text-gray-600">Cooking Instructions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInstructionsModal(false)}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                  >
                    <span className="text-gray-600 text-xl font-light">×</span>
                  </button>
                </div>
              </div>

              {/* Clean Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                {meal.instructions && meal.instructions.length > 0 ? (
                  <div className="space-y-4">
                    {meal.instructions.map((instruction, index) => (
                      <div 
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-200 hover:shadow-sm transition-all duration-200"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-gray-800 text-base leading-relaxed">{instruction}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-lg">No instructions available for this recipe.</p>
                  </div>
                )}
              </div>

              {/* Clean Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-sm">{meal.prep_time}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm capitalize">{meal.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-sm capitalize">{meal.meal_type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInstructionsModal(false)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}




      </div>
    </div>
  )
} 