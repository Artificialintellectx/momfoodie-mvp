import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { fallbackMeals } from '../lib/data'
import { analytics } from '../lib/analytics'
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
  Flame,
  Sparkles,
  CheckCircle2
} from 'lucide-react'

export default function Result() {
  const router = useRouter()
  const [meal, setMeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [savedMeals, setSavedMeals] = useState([])
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  useEffect(() => {
    // Track page visit
    analytics.trackPageVisit('result', navigator.userAgent)
    
    const loadData = async () => {
      setLoading(true)
      
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
        

      }
      
      // Simulate loading time for better UX
      setTimeout(() => {
        setLoading(false)
      }, 800)
    }

    loadData()
  }, [router.query.meal, router])

  const toggleSaveMeal = () => {
    if (!meal) return
    
    const updatedSavedMeals = savedMeals.find(m => m.id === meal.id)
      ? savedMeals.filter(m => m.id !== meal.id)
      : [...savedMeals, meal]
    
    setSavedMeals(updatedSavedMeals)
    localStorage.setItem('savedMeals', JSON.stringify(updatedSavedMeals))
  }

  const goToHomepage = () => {
    // Clear stored data and go to homepage
    localStorage.removeItem('searchCriteria')
    localStorage.removeItem('currentMeal')
    // Clear all filter-specific shown meals keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('shownMeals_')) {
        localStorage.removeItem(key)
      }
    })
    router.push('/')
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
    setLoading(true) // Show loading schema while getting new meal
    try {
      console.log('🔍 Getting new suggestion...')
      
      // Get stored search criteria
      const searchCriteria = JSON.parse(localStorage.getItem('searchCriteria') || '{}')
      
      console.log('📋 Search criteria:', searchCriteria)
      
      let suggestions = []

      // Try Supabase first
      if (supabase) {
        const query = supabase.from('meals').select('*')
        
        // Apply the same filters as the original search
        if (searchCriteria.mealType) query.eq('meal_type', searchCriteria.mealType)
        if (searchCriteria.cookingTime) query.eq('cooking_time', searchCriteria.cookingTime)
        if (searchCriteria.dietaryPreference && searchCriteria.dietaryPreference !== 'any') {
          query.eq('dietary_preference', searchCriteria.dietaryPreference)
        }
        
        const { data, error } = await query.limit(50) // Get more meals to filter from
        if (!error && data && data.length > 0) {
          console.log(`✅ Found ${data.length} meals from Supabase`)
          
          // Apply ingredient filtering for Supabase results if in ingredient mode
          if (searchCriteria.showIngredientMode && searchCriteria.selectedIngredients?.length > 0) {
            suggestions = data.filter(meal => 
              searchCriteria.selectedIngredients.some(ingredient =>
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

      // Fallback to local data with the same filtering logic
      if (suggestions.length === 0) {
        console.log('🔄 Using fallback meals data')
        suggestions = fallbackMeals.filter(meal => {
          if (searchCriteria.showIngredientMode && searchCriteria.selectedIngredients?.length > 0) {
            return searchCriteria.selectedIngredients.some(ingredient =>
              meal.ingredients.some(mealIngredient =>
                mealIngredient.toLowerCase().includes(ingredient.toLowerCase())
              )
            )
          } else {
            let matches = true
            if (searchCriteria.mealType && meal.meal_type !== searchCriteria.mealType) matches = false
            if (searchCriteria.cookingTime && meal.cooking_time !== searchCriteria.cookingTime) matches = false
            if (searchCriteria.dietaryPreference && searchCriteria.dietaryPreference !== 'any') {
              // Apply the same dietary preference filtering logic
              const mealPref = meal.dietary_preference
              const userPref = searchCriteria.dietaryPreference
              
              if (userPref === 'halal') {
                const hasPork = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('pork') || 
                  ingredient.toLowerCase().includes('bacon') ||
                  ingredient.toLowerCase().includes('ham')
                )
                if (hasPork) matches = false
              } else if (userPref === 'pescatarian') {
                const hasMeat = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('chicken') || 
                  ingredient.toLowerCase().includes('beef') ||
                  ingredient.toLowerCase().includes('pork') ||
                  ingredient.toLowerCase().includes('lamb')
                )
                if (hasMeat) matches = false
              } else if (userPref === 'lacto_vegetarian') {
                const hasMeatOrFish = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('chicken') || 
                  ingredient.toLowerCase().includes('beef') ||
                  ingredient.toLowerCase().includes('fish') ||
                  ingredient.toLowerCase().includes('pork')
                )
                if (hasMeatOrFish) matches = false
              } else if (userPref === 'gluten_free') {
                const hasGluten = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('wheat') || 
                  ingredient.toLowerCase().includes('barley') ||
                  ingredient.toLowerCase().includes('rye') ||
                  ingredient.toLowerCase().includes('bread') ||
                  ingredient.toLowerCase().includes('flour')
                )
                if (hasGluten) matches = false
              } else if (userPref === 'low_sodium') {
                const hasHighSodium = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('seasoning cube') || 
                  ingredient.toLowerCase().includes('stock cube') ||
                  ingredient.toLowerCase().includes('bouillon')
                )
                if (hasHighSodium) matches = false
              } else if (userPref === 'low_fat') {
                const hasHighFat = meal.ingredients.some(ingredient => 
                  ingredient.toLowerCase().includes('palm oil') || 
                  ingredient.toLowerCase().includes('coconut oil') ||
                  ingredient.toLowerCase().includes('butter')
                )
                if (hasHighFat) matches = false
              } else if (userPref === 'high_protein') {
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
                const isTraditional = meal.name.toLowerCase().includes('jollof') ||
                  meal.name.toLowerCase().includes('egusi') ||
                  meal.name.toLowerCase().includes('amala') ||
                  meal.name.toLowerCase().includes('eba') ||
                  meal.name.toLowerCase().includes('akara') ||
                  meal.name.toLowerCase().includes('moi moi') ||
                  meal.name.toLowerCase().includes('pepper soup')
                if (!isTraditional) matches = false
              } else if (userPref === 'rice_based') {
                const isRiceBased = meal.name.toLowerCase().includes('rice') ||
                  meal.name.toLowerCase().includes('jollof') ||
                  meal.name.toLowerCase().includes('fried rice') ||
                  meal.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes('rice') ||
                    ingredient.toLowerCase().includes('basmati')
                  )
                if (!isRiceBased) matches = false
              } else if (userPref === 'swallow_based') {
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
                if (mealPref !== userPref && mealPref !== 'any') matches = false
              }
            }
            return matches
          }
        })
      }

      // Get current filter key to track shown meals per filter combination
      const currentFilterKey = JSON.stringify({
        mealType: searchCriteria.mealType,
        cookingTime: searchCriteria.cookingTime,
        dietaryPreference: searchCriteria.dietaryPreference,
        showIngredientMode: searchCriteria.showIngredientMode,
        selectedIngredients: searchCriteria.selectedIngredients || []
      })

      // Get shown meals for this specific filter combination
      const shownMealsKey = `shownMeals_${btoa(currentFilterKey).slice(0, 20)}`
      const shownMeals = JSON.parse(localStorage.getItem(shownMealsKey) || '[]')
      
      console.log(`🎯 Current filter key: ${currentFilterKey}`)
      console.log(`👀 Already shown meals for this filter: ${shownMeals.length}`)

      // Filter out already shown meals for this filter combination
      const availableMeals = suggestions.filter(meal => !shownMeals.includes(meal.id))
      console.log(`🎯 Available meals (excluding ${shownMeals.length} shown): ${availableMeals.length}`)

      if (availableMeals.length > 0) {
        // Randomly select from available meals
        const randomIndex = Math.floor(Math.random() * availableMeals.length)
        const newMeal = availableMeals[randomIndex]
        setMeal(newMeal)
        localStorage.setItem('currentMeal', JSON.stringify(newMeal))
        
        // Add to shown meals for this filter
        const updatedShownMeals = [...shownMeals, newMeal.id]
        localStorage.setItem(shownMealsKey, JSON.stringify(updatedShownMeals))
        
        // Track "Try Another" button click
        analytics.trackSuggestionClick('Try Another', searchCriteria)
        
        console.log(`🎯 New meal selected: ${newMeal.name}`)
        console.log(`📊 Total shown meals for this filter: ${updatedShownMeals.length}`)
      } else {
        // All meals for this filter have been shown - reset and start over
        console.log('🔄 All meals shown for this filter, resetting...')
        localStorage.removeItem(shownMealsKey)
        
        // Randomly select from all suggestions
        const randomIndex = Math.floor(Math.random() * suggestions.length)
        const newMeal = suggestions[randomIndex]
        setMeal(newMeal)
        localStorage.setItem('currentMeal', JSON.stringify(newMeal))
        
        // Start fresh tracking
        localStorage.setItem(shownMealsKey, JSON.stringify([newMeal.id]))
        
        // Track "Try Another" button click
        analytics.trackSuggestionClick('Try Another', searchCriteria)
        
        console.log(`🎯 Reset and selected: ${newMeal.name}`)
        
        // Show exhaustion notification instead of modal
        alert('🎉 You\'ve seen all recipes for your current preferences! We\'re starting fresh and will be adding more recipes soon. Keep exploring!')
      }
    } catch (error) {
      console.error('Error getting new suggestion:', error)
    } finally {
      setGenerating(false)
      // Simulate loading time for better UX
      setTimeout(() => {
        setLoading(false)
      }, 600)
    }
  }

  // Feedback functions
  const handleRating = (selectedRating) => {
    setRating(selectedRating)
  }

  const submitFeedback = async () => {
    if (!meal || rating === 0) return

    try {
      // Save feedback to Supabase
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          meal_id: meal.id,
          meal_name: meal.name,
          rating: rating,
          feedback_type: 'recipe_rating',
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving feedback:', error)
      } else {
        console.log('✅ Feedback submitted successfully')
        setFeedbackSubmitted(true)
        
        // Track feedback submission
        analytics.trackSuggestionClick('Feedback Submitted', { rating, mealName: meal.name })
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }

    // Close modal after a short delay
    setTimeout(() => {
      setShowFeedbackModal(false)
      setRating(0)
      setFeedbackSubmitted(false)
    }, 1500)
  }

  const openFeedbackModal = () => {
    setShowFeedbackModal(true)
    setRating(0)
    setFeedbackSubmitted(false)
  }

  // Show loading schema while loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton with shimmer */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            <div className="flex gap-2">
              <div className="relative h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden" style={{ animationDelay: '0.1s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="relative h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>
          </div>
          
          {/* Hero section skeleton */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="text-center mb-6">
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mx-auto mb-3 overflow-hidden" style={{ animationDelay: '0.3s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mx-auto overflow-hidden" style={{ animationDelay: '0.5s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg overflow-hidden" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Ingredients skeleton */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 overflow-hidden" style={{ animationDelay: '1.1s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded overflow-hidden" style={{ animationDelay: '1.2s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="relative h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg overflow-hidden" style={{ animationDelay: `${1.4 + i * 0.1}s` }}>
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Video tutorial skeleton */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-28 overflow-hidden" style={{ animationDelay: '2.0s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden" style={{ animationDelay: '2.1s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>
            
            <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl overflow-hidden" style={{ animationDelay: '2.3s' }}>
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
          
          {/* Floating button skeleton */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="relative h-14 w-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl overflow-hidden" style={{ animationDelay: '2.5s' }}>
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show empty schema if no meal data
  if (!meal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            <div className="flex gap-2">
              <div className="relative h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden" style={{ animationDelay: '0.1s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="relative h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>
          </div>
          
          {/* Hero section skeleton */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="text-center mb-6">
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mx-auto mb-3 overflow-hidden" style={{ animationDelay: '0.3s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mx-auto overflow-hidden" style={{ animationDelay: '0.5s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg overflow-hidden" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Ingredients skeleton */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 overflow-hidden" style={{ animationDelay: '1.1s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded overflow-hidden" style={{ animationDelay: '1.2s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="relative h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg overflow-hidden" style={{ animationDelay: `${1.4 + i * 0.1}s` }}>
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Video tutorial skeleton */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-28 overflow-hidden" style={{ animationDelay: '2.0s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden" style={{ animationDelay: '2.1s' }}>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>
            
            <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl overflow-hidden" style={{ animationDelay: '2.3s' }}>
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
          
          {/* Floating button skeleton */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="relative h-14 w-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl overflow-hidden" style={{ animationDelay: '2.5s' }}>
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isSaved = savedMeals.find(m => m.id === meal.id)

  // Safety check for meal data
  if (!meal || !meal.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recipe Not Found</h2>
            <p className="text-gray-600 mb-6">The recipe you&apos;re looking for couldn&apos;t be loaded.</p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pattern relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-300/30 to-orange-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 max-w-4xl">
        
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
        <div>
          <div className="relative overflow-hidden rounded-2xl mb-4">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 opacity-10"></div>
            
            {/* Content */}
            <div className="relative p-4">
              <div className="text-center mb-4">
                <h1 className="heading-md text-gradient mb-2">{meal.name}</h1>
                <p className="text-sm text-gray-600 max-w-xl mx-auto">{meal.description}</p>
              </div>

              {/* Ultra Compact Meal Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="glass-dark rounded-lg p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-gray-600 text-xs mb-0.5">Time</p>
                  <p className="text-gray-800 font-bold text-xs">{meal.prep_time}</p>
                </div>
                
                <div className="glass-dark rounded-lg p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-gray-600 text-xs mb-0.5">Level</p>
                  <p className="text-gray-800 font-bold text-xs capitalize">{meal.difficulty}</p>
                </div>
                
                <div className="glass-dark rounded-lg p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-gray-600 text-xs mb-0.5">Type</p>
                  <p className="text-gray-800 font-bold text-xs capitalize">{meal.meal_type}</p>
                </div>
                
                <div className="glass-dark rounded-lg p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-1">
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
        <div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-sm text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                  <List className="w-4 h-4 text-white" />
                </div>
                Ingredients
              </h2>
              
              <button
                onClick={() => setShowInstructionsModal(true)}
                className="btn-primary px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <BookOpen className="w-3 h-3" />
                Instructions
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
            
            {meal.ingredients && Array.isArray(meal.ingredients) && meal.ingredients.length > 0 ? (
              <div className="grid gap-2">
                {meal.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="glass-dark rounded-lg p-3 flex items-center gap-2 hover-lift transition-all duration-300 border border-indigo-100"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex-shrink-0 shadow-sm"></div>
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

        {/* Feedback Section */}
        <div className="mt-6">
          <div className="card">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Was this recipe helpful?</h3>
              <p className="text-sm text-gray-600 mb-4">Rate this recipe to help us improve our suggestions</p>
              
              {/* Star Rating */}
              <div className="flex justify-center items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      star <= rating
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg scale-110'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
              
              {/* Rating Labels */}
              {rating > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent!'}
                  </p>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                onClick={submitFeedback}
                disabled={rating === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  rating === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {feedbackSubmitted ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Thank you!
                  </span>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Get Another Recipe Button */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={getNewSuggestion}
            disabled={generating}
            className="relative px-8 py-3 flex items-center justify-center gap-3 group transition-all duration-300 hover:scale-105 min-w-[200px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/25 border-2 border-indigo-400/20"
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-purple-300/30 animate-pulse"></div>
            
            {generating ? (
              <>
                <div className="loading-spinner w-4 h-4 border-2 border-white/30 border-t-white"></div>
                <span className="text-sm whitespace-nowrap">Finding Another Meal...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 animate-pulse" />
                <span className="text-sm whitespace-nowrap">Get Another Recipe</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
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
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
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
                {meal.instructions && Array.isArray(meal.instructions) && meal.instructions.length > 0 ? (
                  <div className="space-y-4">
                    {meal.instructions.map((instruction, index) => (
                      <div 
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all duration-200"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
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
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-sm">{meal.prep_time}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-sm capitalize">{meal.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <Star className="w-4 h-4 text-pink-500" />
                      <span className="font-medium text-sm capitalize">{meal.meal_type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInstructionsModal(false)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
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