import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
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
  CheckCircle2,
  Info,
  History,
  Utensils
} from 'lucide-react'

export default function Result() {
  const router = useRouter()
  const [meal, setMeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [savedMeals, setSavedMeals] = useState([])
  const [showExhaustionModal, setShowExhaustionModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [previousMeals, setPreviousMeals] = useState([])
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    // Track page visit
    analytics.trackPageVisit('result', navigator.userAgent)
    
    const loadData = async () => {
      setLoading(true)
      
      const saved = JSON.parse(localStorage.getItem('savedMeals') || '[]')
      setSavedMeals(saved)

      // Load previous meals from localStorage
      const storedPreviousMeals = JSON.parse(localStorage.getItem('previousMeals') || '[]')
      setPreviousMeals(storedPreviousMeals)
      console.log('📊 Loaded previousMeals from localStorage:', storedPreviousMeals)
      console.log('📊 previousMeals.length after loading:', storedPreviousMeals.length)
      console.log('📊 previousMeals state will be set to:', storedPreviousMeals)

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
        
        // IMPORTANT: Add the first meal to shownMeals tracking to prevent repetition
        // Get the search criteria to create the filter key
        const searchCriteria = JSON.parse(localStorage.getItem('searchCriteria') || '{}')
        const currentFilterKey = JSON.stringify({
          mealType: searchCriteria.mealType || 'any',
          cookingTime: searchCriteria.cookingTime || 'any',
          showIngredientMode: searchCriteria.showIngredientMode || false,
          selectedIngredients: searchCriteria.selectedIngredients || []
        })
        
        // Create hash for the filter key
        const simpleHash = (str) => {
          let hash = 0
          for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
          }
          return Math.abs(hash).toString(36)
        }
        
        const filterKeyHash = simpleHash(currentFilterKey)
        const shownMealsKey = `shownMeals_${filterKeyHash}`
        const shownMeals = JSON.parse(localStorage.getItem(shownMealsKey) || '[]')
        
        // Only add if not already in the list (to avoid duplicates)
        if (!shownMeals.includes(mealData.id)) {
          const updatedShownMeals = [...shownMeals, mealData.id]
          localStorage.setItem(shownMealsKey, JSON.stringify(updatedShownMeals))
          console.log(`🎯 Added first meal to shownMeals tracking: ${mealData.name} (ID: ${mealData.id})`)
          console.log(`📊 Updated shownMeals for filter:`, updatedShownMeals)
        } else {
          console.log(`🎯 First meal already in shownMeals tracking: ${mealData.name} (ID: ${mealData.id})`)
        }
        
        // Load existing previousMeals (don't add current meal here - it will be added when user clicks "Get New Recipe")
        const currentPreviousMeals = JSON.parse(localStorage.getItem('previousMeals') || '[]')
        
        // IMPORTANT: If this is the first meal (no previous meals in localStorage), add it to history
        // This ensures the first meal is counted in the history
        if (currentPreviousMeals.length === 0) {
          const updatedPreviousMeals = [mealData]
          setPreviousMeals(updatedPreviousMeals)
          localStorage.setItem('previousMeals', JSON.stringify(updatedPreviousMeals))
          console.log(`📊 First meal added to previousMeals: ${mealData.name}`)
          console.log(`📊 Updated previousMeals count: ${updatedPreviousMeals.length}`)
        } else {
          setPreviousMeals(currentPreviousMeals)
          console.log(`📊 Loaded previousMeals count: ${currentPreviousMeals.length}`)
          console.log(`📊 Current meal is NOT added to previousMeals yet: ${mealData.name}`)
        }
      }
      
      // Simulate loading time for better UX
      setTimeout(() => {
        setLoading(false)
      }, 800)
    }

    loadData()
  }, [router.query.meal, router])

  // Debug useEffect to track previousMeals state changes
  useEffect(() => {
    console.log('🔄 previousMeals state changed:', previousMeals)
    console.log('🔄 previousMeals.length:', previousMeals.length)
    console.log('🔄 previousMeals names:', previousMeals.map(m => m.name))
  }, [previousMeals])

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
    localStorage.removeItem('previousMeals')
    // Clear all filter-specific shown meals keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('shownMeals_')) {
        localStorage.removeItem(key)
      }
    })
    router.push('/')
  }

  const goToPreviousRecipe = () => {
    console.log('🔍 goToPreviousRecipe called')
    console.log('📊 Current previousMeals:', previousMeals)
    console.log('📊 previousMeals.length:', previousMeals.length)
    
    if (previousMeals.length > 0) {
      const previousMeal = previousMeals[previousMeals.length - 1]
      const updatedPreviousMeals = previousMeals.slice(0, -1)
      
      console.log('🔄 Going back to:', previousMeal.name)
      console.log('📊 Updated previousMeals will be:', updatedPreviousMeals)
      
      // Update state first
      setPreviousMeals(updatedPreviousMeals)
      setMeal(previousMeal)
      
      console.log('🔄 State updated - new previousMeals.length will be:', updatedPreviousMeals.length)
      console.log('🔄 State updated - new previousMeals will be:', updatedPreviousMeals.map(m => m.name))
      
      // Update localStorage
      localStorage.setItem('currentMeal', JSON.stringify(previousMeal))
      localStorage.setItem('previousMeals', JSON.stringify(updatedPreviousMeals))
      
      // Update URL with previous meal data
      const mealParam = encodeURIComponent(JSON.stringify(previousMeal))
      router.replace(`/result?meal=${mealParam}`, undefined, { shallow: true })
      
      console.log('✅ Successfully went back to previous recipe:', previousMeal.name)
    } else {
      console.log('❌ No previous meals available')
    }
  }

  const showExhaustionMessage = () => {
    setShowExhaustionModal(true)
  }

  const resetShownMeals = () => {
    // Clear all filter-specific shown meals keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('shownMeals_')) {
        localStorage.removeItem(key)
      }
    })
    setShowExhaustionModal(false)
    getNewSuggestion()
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
      
      // Save current meal to previous meals if it exists
      if (meal) {
        const updatedPreviousMeals = [...previousMeals, meal]
        setPreviousMeals(updatedPreviousMeals)
        localStorage.setItem('previousMeals', JSON.stringify(updatedPreviousMeals))
        console.log('💾 Saved current meal to previous meals:', meal.name)
        console.log('📊 Updated previousMeals array:', updatedPreviousMeals)
        console.log('📊 New previousMeals.length:', updatedPreviousMeals.length)
      } else {
        console.log('⚠️ No current meal to save to previous meals')
      }
      
      // Get stored search criteria
      const searchCriteria = JSON.parse(localStorage.getItem('searchCriteria') || '{}')
      
      console.log('📋 Search criteria:', searchCriteria)
      
      let suggestions = []

      // Only use Supabase - no fallback data
      if (supabase) {
        const query = supabase.from('meals').select('*')
        
        // Apply the same filters as the original search (only meal type and cooking time)
        if (searchCriteria.mealType) {
          console.log(`🍽️ Filtering by meal type: ${searchCriteria.mealType}`)
          query.eq('meal_type', searchCriteria.mealType)
        }
        if (searchCriteria.cookingTime) {
          console.log(`⏰ Filtering by cooking time: ${searchCriteria.cookingTime}`)
          query.eq('cooking_time', searchCriteria.cookingTime)
        }
        
        const { data, error } = await query.limit(50)
        
        if (error) {
          console.log('❌ Supabase error:', error.message)
          setMessage({ type: 'error', text: 'Failed to load meals from database' })
          return
        } else if (data && data.length > 0) {
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
          console.log('⚠️ No meals found in Supabase for the selected criteria')
          setMessage({ type: 'info', text: 'No meals found for the selected criteria. Try different filters.' })
          return
        }
      } else {
        console.log('❌ Supabase not configured')
        setMessage({ type: 'error', text: 'Database not configured. Please contact support.' })
        return
      }

      // Get current filter key to track shown meals per filter combination (only meal type and cooking time)
      const currentFilterKey = JSON.stringify({
        mealType: searchCriteria.mealType || 'any',
        cookingTime: searchCriteria.cookingTime || 'any',
        showIngredientMode: searchCriteria.showIngredientMode || false,
        selectedIngredients: searchCriteria.selectedIngredients || []
      })

      // Create a more reliable key for localStorage using a simple hash
      const simpleHash = (str) => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36)
      }
      
      const filterKeyHash = simpleHash(currentFilterKey)
      const shownMealsKey = `shownMeals_${filterKeyHash}`
      const shownMeals = JSON.parse(localStorage.getItem(shownMealsKey) || '[]')
      
      console.log(`🎯 Current filter key: ${currentFilterKey}`)
      console.log(`🔑 Filter key hash: ${filterKeyHash}`)
      console.log(`👀 Already shown meals for this filter: ${shownMeals.length}`)
      console.log(`👀 Shown meal IDs:`, shownMeals)

      // Filter out already shown meals for this filter combination
      const availableMeals = suggestions.filter(meal => !shownMeals.includes(meal.id))
      console.log(`🎯 Available meals (excluding ${shownMeals.length} shown): ${availableMeals.length}`)
      console.log(`🎯 Available meal IDs:`, availableMeals.map(m => m.id))
      console.log(`🎯 Available meal names:`, availableMeals.map(m => m.name))

      // Also exclude the current meal if it exists to prevent immediate repetition
      const finalAvailableMeals = meal ? availableMeals.filter(m => m.id !== meal.id) : availableMeals
      console.log(`🎯 Final available meals (excluding current meal): ${finalAvailableMeals.length}`)
      console.log(`🎯 Final available meal IDs:`, finalAvailableMeals.map(m => m.id))
      console.log(`🎯 Final available meal names:`, finalAvailableMeals.map(m => m.name))
      console.log(`🎯 Current meal being excluded:`, meal ? `${meal.name} (ID: ${meal.id})` : 'None')

      if (finalAvailableMeals.length > 0) {
        // Randomly select from available meals
        const randomIndex = Math.floor(Math.random() * finalAvailableMeals.length)
        const newMeal = finalAvailableMeals[randomIndex]
        console.log(`🎯 Randomly selected meal: ${newMeal.name} (ID: ${newMeal.id}) from index ${randomIndex}`)
        
        setMeal(newMeal)
        localStorage.setItem('currentMeal', JSON.stringify(newMeal))
        
        // Add to shown meals for this filter
        const updatedShownMeals = [...shownMeals, newMeal.id]
        localStorage.setItem(shownMealsKey, JSON.stringify(updatedShownMeals))
        
        // Track "Try Another" button click
        analytics.trackSuggestionClick('Try Another', searchCriteria)
        
        console.log(`🎯 New meal selected: ${newMeal.name}`)
        console.log(`📊 Total shown meals for this filter: ${updatedShownMeals.length}`)
        console.log(`📊 Updated shown meal IDs:`, updatedShownMeals)
        console.log(`📊 Updated shown meal names:`, updatedShownMeals.map(id => {
          const meal = suggestions.find(m => m.id === id)
          return meal ? meal.name : `Unknown (ID: ${id})`
        }))
      } else if (availableMeals.length > 0) {
        // If no meals available after excluding current, but we have meals in the original pool,
        // it means only the current meal is available. Reset the shown meals and start fresh.
        console.log('🔄 Only current meal available, resetting shown meals...')
        localStorage.removeItem(shownMealsKey)
        
        // Randomly select from all suggestions (excluding current meal)
        const resetAvailableMeals = suggestions.filter(m => m.id !== meal.id)
        if (resetAvailableMeals.length > 0) {
          const randomIndex = Math.floor(Math.random() * resetAvailableMeals.length)
          const newMeal = resetAvailableMeals[randomIndex]
          setMeal(newMeal)
          localStorage.setItem('currentMeal', JSON.stringify(newMeal))
          
          // Start fresh tracking
          localStorage.setItem(shownMealsKey, JSON.stringify([newMeal.id]))
          
          // Track "Try Another" button click
          analytics.trackSuggestionClick('Try Another', searchCriteria)
          
          console.log(`🔄 Reset and selected: ${newMeal.name}`)
        } else {
          // Only one meal available total, show exhaustion
          setShowExhaustionModal(true)
          console.log('⚠️ Only one meal available total, showing exhaustion modal')
        }
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
        
        console.log(`🔄 Reset and selected: ${newMeal.name}`)
        
        // Show exhaustion notification instead of modal
        setShowExhaustionModal(true)
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

  // Combo mapping function to match meal names with their combinations
  const getMealCombo = (mealName) => {
    const comboMap = {
      "Fisherman Soup": {
        with: "Pounded yam, fufu, eba, garri, rice, or boiled yam",
        drinks: "Palm wine, zobo, fresh juice, or cold water",
        sides: "Fried plantain, roasted fish"
      },
      "Okra Soup": {
        with: "Pounded yam, amala, eba, fufu, rice, or boiled plantain",
        drinks: "Palm wine, kunu, zobo",
        sides: "Fried meat, roasted fish"
      },
      "Vegetable Soup": {
        with: "Pounded yam, eba, fufu, amala, rice",
        drinks: "Palm wine, fresh juice, zobo",
        sides: "Assorted meat, stockfish"
      },
      "Ogbono Soup": {
        with: "Pounded yam, eba, fufu, amala, rice",
        drinks: "Palm wine, zobo, kunu",
        sides: "Assorted meat, dried fish"
      },
      "Ofe Ugba (Oil Bean Soup)": {
        with: "Pounded yam, eba, rice",
        drinks: "Palm wine, fresh juice",
        sides: "Stockfish, dried fish, kpomo"
      },
      "Owo Soup and Eba": {
        with: "Complete meal - traditionally served together",
        drinks: "Palm wine, zobo, water",
        sides: "Assorted meat, fish"
      },
      "Egusi Soup with Pounded Yam": {
        with: "Complete meal - traditionally served together",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Assorted meat, stockfish, dried fish"
      },
      "Roasted Ripe Plantain with Ugba Sauce": {
        with: "Groundnuts, coconut, palm wine",
        drinks: "Palm wine, zobo, fresh coconut water",
        sides: "Roasted fish, peppered snail"
      },
      "Roasted Plantain (Boli)": {
        with: "Groundnuts, pepper sauce, palm oil sauce",
        drinks: "Zobo, coconut water, soft drinks",
        sides: "Roasted fish, suya"
      },
      "Plantain Porridge": {
        with: "Fried fish, boiled eggs",
        drinks: "Zobo, fresh juice, tea",
        sides: "Peppered meat, roasted fish"
      },
      "Boiled Plantain and Pepper Sauce": {
        with: "Fried eggs, corned beef, sardines",
        drinks: "Tea, coffee, fresh juice",
        sides: "Fried fish, scrambled eggs"
      },
      "Yellow Plantain Porridge": {
        with: "Fried fish, boiled eggs, meat",
        drinks: "Zobo, fresh juice",
        sides: "Peppered meat"
      },
      "Plantain, Beans and Dried Fish": {
        with: "Complete meal - well-balanced",
        drinks: "Zobo, palm wine, fresh juice",
        sides: "Additional protein if desired"
      },
      "Ewa Dodo": {
        with: "Complete meal - beans and plantain",
        drinks: "Zobo, fresh juice, soft drinks",
        sides: "Bread, rice, fried fish"
      },
      "Ewa Agoyin": {
        with: "Agege bread, rice, fried plantain",
        drinks: "Soft drinks, zobo, fresh juice",
        sides: "Fried fish, boiled eggs"
      },
      "Vegan Beans Porridge": {
        with: "Bread, fried plantain",
        drinks: "Zobo, fresh juice, coconut water",
        sides: "Roasted groundnuts"
      },
      "Light Coconut Rice": {
        with: "Grilled chicken, fried fish, salad",
        drinks: "Fresh juice, soft drinks, water",
        sides: "Coleslaw, cucumber salad"
      },
      "Vegan Jollof Rice": {
        with: "Fried plantain, salad, coleslaw",
        drinks: "Zobo, fresh juice, soft drinks",
        sides: "Roasted groundnuts, chin chin"
      },
      "White Rice and Fresh Fish Pepper Soup": {
        with: "Complete meal - rice with soup",
        drinks: "Fresh juice, soft drinks",
        sides: "Fried plantain"
      },
      "Congee (Chinese Rice Porridge)": {
        with: "Pickled vegetables, fried fish, boiled eggs",
        drinks: "Tea, fresh juice",
        sides: "Crackers, bread"
      },
      "Spaghetti Jollof": {
        with: "Fried chicken, coleslaw, salad",
        drinks: "Soft drinks, fresh juice",
        sides: "Fried plantain, boiled eggs"
      },
      "Rice and Beans": {
        with: "Fried plantain, stew, pepper sauce",
        drinks: "Zobo, fresh juice",
        sides: "Fried fish, meat"
      },
      "White Rice and Vegetable Sauce": {
        with: "Fried plantain, salad",
        drinks: "Fresh juice, soft drinks",
        sides: "Grilled chicken, fish"
      },
      "Mixed Seafood Coconut Fried Rice": {
        with: "Salad, coleslaw",
        drinks: "Fresh juice, soft drinks, wine",
        sides: "Spring rolls, plantain chips"
      },
      "Fried Rice and Chicken": {
        with: "Complete meal - rice with protein",
        drinks: "Soft drinks, fresh juice, wine",
        sides: "Coleslaw, salad"
      },
      "Vegetable Jollof Rice": {
        with: "Fried plantain, salad, grilled protein",
        drinks: "Zobo, fresh juice",
        sides: "Coleslaw, boiled eggs"
      },
      "Coconut Rice": {
        with: "Curry chicken, grilled fish, vegetables",
        drinks: "Fresh juice, soft drinks",
        sides: "Salad, fried plantain"
      },
      "Ofada Sauce, Fish and Rice": {
        with: "Complete meal - traditional combination",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Fried plantain"
      },
      "Jollof Rice": {
        with: "Fried chicken, beef, fish, coleslaw",
        drinks: "Soft drinks, fresh juice, wine",
        sides: "Fried plantain, salad, moi moi"
      },
      "Rice and Stew": {
        with: "Fried plantain, salad, protein of choice",
        drinks: "Soft drinks, fresh juice",
        sides: "Coleslaw, boiled eggs"
      },
      "Rice and Palm Oil Sauce": {
        with: "Fried fish, boiled eggs, vegetables",
        drinks: "Fresh juice, soft drinks",
        sides: "Fried plantain"
      },
      "Rice and Egg Sauce": {
        with: "Fried plantain, salad, bread",
        drinks: "Tea, coffee, fresh juice",
        sides: "Sausages, corned beef"
      },
      "Corned Beef and Rice": {
        with: "Fried plantain, vegetables, bread",
        drinks: "Tea, coffee, soft drinks",
        sides: "Boiled eggs, salad"
      },
      "Fish and Yam Chips": {
        with: "Pepper sauce, salad, coleslaw",
        drinks: "Soft drinks, fresh juice",
        sides: "Bread, plantain chips"
      },
      "Boiled Yam with Oil-Free Pepper Sauce": {
        with: "Fried fish, boiled eggs, vegetables",
        drinks: "Tea, fresh juice",
        sides: "Avocado, cucumber salad"
      },
      "Yam and Egg Sauce": {
        with: "Bread, fried plantain, salad",
        drinks: "Tea, coffee, fresh juice",
        sides: "Sausages, bacon"
      },
      "Boil Yam & Fish Sauce": {
        with: "Vegetables, bread, fried plantain",
        drinks: "Fresh juice, soft drinks",
        sides: "Salad, boiled eggs"
      },
      "Yam Pepper Soup": {
        with: "Bread, rice, fried plantain",
        drinks: "Palm wine, fresh juice",
        sides: "Roasted fish, assorted meat"
      },
      "Garden Egg Sauce and Boiled Yam": {
        with: "Fried fish, meat, vegetables",
        drinks: "Palm wine, fresh juice",
        sides: "Stockfish, dried fish"
      },
      "Corn Porridge": {
        with: "Fried fish, coconut, milk",
        drinks: "Tea, coffee, fresh juice",
        sides: "Bread, biscuits"
      },
      "Potato Porridge": {
        with: "Fried fish, vegetables, bread",
        drinks: "Tea, fresh juice",
        sides: "Boiled eggs, salad"
      },
      "Cornmeal Porridge": {
        with: "Milk, fruits, nuts, honey",
        drinks: "Tea, coffee, fresh juice",
        sides: "Bread, biscuits"
      },
      "Okpa": {
        with: "Pap, tea, bread, soft drinks",
        drinks: "Kunu, zobo, soft drinks",
        sides: "Groundnuts, fruits"
      },
      "Akara and Akamu (Pap)": {
        with: "Traditional combination - complete breakfast",
        drinks: "Tea, coffee (additional)",
        sides: "Bread, milk"
      },
      "Pap (Ogi/Akamu)": {
        with: "Akara, moi moi, bread, milk",
        drinks: "Tea, coffee (additional)",
        sides: "Sugar, honey, fruits"
      },
      "Akara and Bread": {
        with: "Tea, coffee, pap, pepper sauce",
        drinks: "Tea, coffee, soft drinks",
        sides: "Butter, jam"
      },
      "Air-Fried/Baked Akara": {
        with: "Pap, bread, tea, pepper sauce",
        drinks: "Tea, coffee, fresh juice",
        sides: "Honey, jam"
      },
      "Steamed Moi Moi (Oil-Free)": {
        with: "Pap, bread, rice, tea",
        drinks: "Tea, coffee, fresh juice",
        sides: "Pepper sauce, honey"
      },
      "Moi Moi": {
        with: "Pap, bread, rice, ogi",
        drinks: "Soft drinks, fresh juice",
        sides: "Pepper sauce"
      },
      "Agidi with Akara": {
        with: "Traditional combination",
        drinks: "Palm wine, kunu, zobo",
        sides: "Pepper sauce, palm oil sauce"
      },
      "African Salad (Abacha and Ugba)": {
        with: "Complete meal - traditional combination",
        drinks: "Palm wine, fresh juice, soft drinks",
        sides: "Stockfish, kpomo"
      },
      "Pap with Fresh Fruits": {
        with: "Complete healthy meal",
        drinks: "Fresh juice, water",
        sides: "Nuts, honey, milk"
      },
      "Egg White Scramble": {
        with: "Bread, toast, vegetables, salad",
        drinks: "Tea, coffee, fresh juice",
        sides: "Avocado, tomatoes"
      },
      "Bread and Tea": {
        with: "Butter, jam, honey, eggs",
        drinks: "Tea, coffee (main combination)",
        sides: "Fruits, biscuits"
      },
      "Indomie and Egg": {
        with: "Vegetables, sausages, corned beef",
        drinks: "Soft drinks, fresh juice",
        sides: "Bread, plantain chips"
      },
      "Boiled Eggs with Vegetables": {
        with: "Bread, toast, salad, rice",
        drinks: "Tea, coffee, fresh juice",
        sides: "Avocado, fruits"
      },
      "Catfish Pepper Soup": {
        with: "Rice, yam, plantain, bread",
        drinks: "Palm wine, fresh juice",
        sides: "Extra fish, vegetables"
      },
      "Goat Meat Pepper Soup": {
        with: "Rice, yam, plantain, bread",
        drinks: "Palm wine, beer, fresh juice",
        sides: "Extra meat portions"
      },
      "Tomatoes Stew with Ram Meat": {
        with: "Rice, yam, bread, fried plantain",
        drinks: "Soft drinks, fresh juice",
        sides: "Salad, coleslaw"
      },
      "Groundnut Stew with Rice and Spinach": {
        with: "Complete meal - well-balanced",
        drinks: "Fresh juice, soft drinks",
        sides: "Additional vegetables"
      }
    }
    
    return comboMap[mealName] || null
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

              {/* Combo Section - Integrated */}
              {(() => {
                const mealCombo = getMealCombo(meal.name)
                return mealCombo && (
                  <div className="mt-4 pt-4 border-t border-gradient-to-r from-transparent via-gray-200/30 to-transparent">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <Utensils className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 text-sm font-semibold">Perfect Pairings</span>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
                      <div className="space-y-3">
                        {/* Served With */}
                        <div className="flex items-start gap-3 group">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out">
                            <span className="text-white text-lg" style={{ animation: 'bounce 2.5s ease-in-out infinite' }}>🍽️</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-green-700 text-xs font-bold uppercase tracking-wider mb-1">Served With</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{mealCombo.with}</p>
                          </div>
                        </div>
                        
                        {/* Drinks */}
                        <div className="flex items-start gap-3 group">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 ease-out">
                            <span className="text-white text-lg" style={{ animation: 'pulse 3s ease-in-out infinite' }}>🥤</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">Drinks</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{mealCombo.drinks}</p>
                          </div>
                        </div>
                        
                        {/* Sides */}
                        <div className="flex items-start gap-3 group">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out">
                            <span className="text-white text-lg" style={{ animation: 'spin 4s linear infinite' }}>🥗</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-orange-700 text-xs font-bold uppercase tracking-wider mb-1">Sides</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{mealCombo.sides}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Ultra Compact Ingredients Section */}
        <div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                  <List className="w-4 h-4 text-white" />
                </div>
                Ingredients
              </h2>
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

        {/* How to Cook Section */}
        <div className="mt-6">
          <div className="card">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">How to Cook</h2>
              <p className="text-gray-600">Follow these steps to make this delicious recipe</p>
            </div>
            
            <button
              onClick={() => setShowInstructionsModal(true)}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-lg">View Cooking Steps</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-3 px-2 sm:px-0">
          {/* Previous Recipe Button */}
          {(() => {
            console.log('🎨 Rendering Previous Recipe button with count:', previousMeals.length)
            console.log('🎨 previousMeals in render:', previousMeals.map(m => m.name))
            // Only show Previous Recipe button if there are 2 or more meals in history (i.e., from 2nd suggestion onwards)
            return previousMeals.length >= 2 && (
              <div className="relative group flex-1 min-w-0">
                <button
                  onClick={() => {
                    console.log('🔘 Button clicked!')
                    console.log('🔘 Current previousMeals.length:', previousMeals.length)
                    console.log('🔘 Current previousMeals:', previousMeals.map(m => m.name))
                    goToPreviousRecipe()
                  }}
                  className="relative min-w-[120px] w-full px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-blue-500/25 border-2 border-blue-400/20"
                >
                  <History className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                  <span className="text-sm whitespace-nowrap">Previous Recipe</span>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-blue-500">
                    <span className="text-xs font-bold text-blue-600">{previousMeals.length}</span>
                  </div>
                </button>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  <div className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Go back to previous recipe</span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )
          })()}
          
          {/* Get Another Recipe Button */}
          <div className="flex-1 min-w-0">
            <button
              onClick={getNewSuggestion}
              disabled={generating}
              className="relative w-full px-4 sm:px-8 py-3 flex items-center justify-between gap-3 group transition-all duration-300 hover:scale-105 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/25 border-2 border-indigo-400/20"
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-purple-300/30 animate-pulse"></div>
              {generating ? (
                <>
                  <div className="loading-spinner w-4 h-4 border-2 border-white/30 border-t-white"></div>
                  <span className="text-sm whitespace-nowrap min-w-0 truncate">Finding Another Meal...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 animate-pulse flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap min-w-0 truncate">Get Another Recipe</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                </>
              )}
            </button>
          </div>
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
                      <p className="text-gray-600">How to Cook</p>
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

                {/* Rating Section - moved here for mobile visibility */}
                <div className="mt-8 text-center">
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

        {/* Exhaustion Modal */}
        {showExhaustionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-slide-in-up">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">All Recipes Shown! 🎉</h3>
                      <p className="text-gray-600">You&apos;ve seen all available recipes for your preference</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExhaustionModal(false)}
                    className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
                  >
                    <span className="text-gray-600 text-xl font-light">×</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-green-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Congratulations! 🎊
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    You&apos;ve explored all the recipes that match your current preferences. 
                    We&apos;re constantly adding new recipes to our platform!
                  </p>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
                  <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    What would you like to do next?
                  </h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      <span>Start over with the same preferences</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Try different dietary preferences</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <span>Explore other meal types</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={resetShownMeals}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Start Over
                  </button>
                  <button
                    onClick={goToHomepage}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-5 h-5" />
                    Try Different Filters
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