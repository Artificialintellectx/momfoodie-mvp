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
                  <p className="text-gray-800 font-bold text-xs capitalize">{meal.dietary_preference}</p>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => router.push('/')}
            className="group inline-flex items-center gap-3 px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 hover:bg-white hover:border-orange-300 hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-orange-600 font-semibold"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:from-orange-100 group-hover:to-orange-200 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
            </div>
            <span>Back to Search</span>
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

        {/* Modern Instructions Modal */}
        {showInstructionsModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-in-up border border-white/20">
              {/* Modern Header */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
                <div className="relative p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold mb-2 tracking-tight">{meal.name}</h3>
                        <p className="text-white/90 text-lg font-medium">Cooking Instructions</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInstructionsModal(false)}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30 group"
                    >
                      <span className="text-white text-2xl font-light group-hover:scale-110 transition-transform duration-300">×</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modern Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
                {meal.instructions && meal.instructions.length > 0 ? (
                  <div className="space-y-4">
                    {meal.instructions.map((instruction, index) => (
                      <div 
                        key={index}
                        className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 border border-gray-100/50 hover:border-orange-200/50 hover:shadow-lg"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start gap-5">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-gray-800 text-lg leading-relaxed font-medium">{instruction}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center border-2 border-dashed border-gray-300/50">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-xl font-medium">No instructions available for this recipe.</p>
                  </div>
                )}
              </div>

              {/* Modern Footer */}
              <div className="p-6 bg-gradient-to-r from-gray-50/80 to-orange-50/80 backdrop-blur-sm border-t border-gray-200/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-sm">{meal.prep_time}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm capitalize">{meal.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-sm capitalize">{meal.meal_type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInstructionsModal(false)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Let&apos;s Start Cooking!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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