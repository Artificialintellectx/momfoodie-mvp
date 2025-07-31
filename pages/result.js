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
  Utensils,
  Search,
  RefreshCw,
  Refrigerator,
  Recycle
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
  const [searchCriteria, setSearchCriteria] = useState({})

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
        
        // IMPORTANT: Add the first meal to shownMeals tracking to prevent repetition
        // Get the search criteria to create the filter key
        const searchCriteriaData = JSON.parse(localStorage.getItem('searchCriteria') || '{}')
        setSearchCriteria(searchCriteriaData)
        const currentFilterKey = JSON.stringify({
          mealType: searchCriteriaData.mealType || 'any',
          cookingTime: searchCriteriaData.cookingTime || 'any',
          showIngredientMode: searchCriteriaData.showIngredientMode || false,
          selectedIngredients: searchCriteriaData.selectedIngredients || [],
          leftoverMode: searchCriteriaData.leftoverMode || false
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
                  // console.log(`🎯 Added first meal to shownMeals tracking: ${mealData.name} (ID: ${mealData.id})`)
        // console.log(`📊 Updated shownMeals for filter:`, updatedShownMeals)
        } else {
          // console.log(`🎯 First meal already in shownMeals tracking: ${mealData.name} (ID: ${mealData.id})`)
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
    // Remove debug logging for production
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
        
        // Only apply meal type and cooking time filters if NOT in ingredient mode
        if (!searchCriteria.showIngredientMode) {
          if (searchCriteria.mealType) {
            console.log(`🍽️ Filtering by meal type: ${searchCriteria.mealType}`)
            query.eq('meal_type', searchCriteria.mealType)
          }
          if (searchCriteria.cookingTime) {
            console.log(`⏰ Filtering by cooking time: ${searchCriteria.cookingTime}`)
            query.eq('cooking_time', searchCriteria.cookingTime)
          }
          console.log(`🔍 Complete query filters: meal_type=${searchCriteria.mealType}, cooking_time=${searchCriteria.cookingTime}`)
        } else {
          console.log('🔍 Ingredient mode: No meal type or cooking time filters applied')
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
            // Smart ingredient filtering with scoring
            const scoredMeals = data.map(meal => {
              let score = 0
              let matchedIngredients = []
              let excludedByOptional = false
              
              // Check each selected ingredient against the meal
              searchCriteria.selectedIngredients.forEach(ingredient => {
                const ingredientLower = ingredient.toLowerCase()
                
                // Check if ingredient appears in meal name (higher score)
                if (meal.name.toLowerCase().includes(ingredientLower)) {
                  score += 3
                  matchedIngredients.push(ingredient)
                }
                
                // Check if ingredient appears in ingredients list (highest score)
                // But first check if it's marked as optional
                const optionalIndicators = ['(optional)', '(opt)', 'optional', 'opt']
                const isOptional = meal.ingredients.some(mealIngredient => {
                  const mealIngredientLower = mealIngredient.toLowerCase()
                  return mealIngredientLower.includes(ingredientLower) && 
                         optionalIndicators.some(indicator => mealIngredientLower.includes(indicator))
                })
                
                if (isOptional) {
                  // If any selected ingredient is optional, exclude this recipe entirely
                  excludedByOptional = true
                  console.log(`❌ Excluding "${meal.name}" - "${ingredient}" is marked as optional`)
                  return
                }
                
                const ingredientInList = meal.ingredients.some(mealIngredient =>
                  mealIngredient.toLowerCase().includes(ingredientLower)
                )
                if (ingredientInList) {
                  score += 5
                  if (!matchedIngredients.includes(ingredient)) {
                    matchedIngredients.push(ingredient)
                  }
                }
              })
              
              // If any ingredient was optional, exclude this recipe
              if (excludedByOptional) {
                return {
                  ...meal,
                  ingredientScore: 0,
                  matchedIngredients: [],
                  matchPercentage: 0,
                  excluded: true
                }
              }
              
              // Bonus for recipes that contain multiple selected ingredients
              if (matchedIngredients.length > 1) {
                score += matchedIngredients.length * 2
              }
              
              // Bonus for recipes that contain ALL selected ingredients
              if (matchedIngredients.length === searchCriteria.selectedIngredients.length) {
                score += 10
              }
              
              return {
                ...meal,
                ingredientScore: score,
                matchedIngredients: matchedIngredients,
                matchPercentage: (matchedIngredients.length / searchCriteria.selectedIngredients.length) * 100
              }
            })
            
            // Filter out meals with no matches and sort by score (highest first)
            // Adaptive threshold system based on number of selected ingredients
            const getThresholdForIngredients = (ingredientCount) => {
              if (ingredientCount === 1) {
                return { primary: 0, fallback: 1, final: 1 } // Show any meal with the ingredient
              } else if (ingredientCount === 2) {
                return { primary: 100, fallback: 1, final: 1 } // 100% or at least 1 ingredient
              } else if (ingredientCount === 3) {
                return { primary: 70, fallback: 2, final: 1 } // 70% or at least 2, else at least 1
              } else if (ingredientCount === 4) {
                return { primary: 70, fallback: 2, final: 1 } // 70% or at least 2, else at least 1
              } else if (ingredientCount >= 5 && ingredientCount <= 6) {
                return { primary: 70, fallback: 3, final: 2 } // 70% or at least 3, else at least 2
              } else if (ingredientCount > 6 && ingredientCount <= 10) {
                return { primary: 70, fallback: 4, final: 2 } // 70% or at least 4, else at least 2
              } else if (ingredientCount > 10 && ingredientCount <= 15) {
                return { primary: 70, fallback: 5, final: 2 } // 70% or at least 5, else at least 2
              } else {
                return { primary: 70, fallback: 6, final: 2 } // 70% or at least 6, else at least 2
              }
            }

            const thresholds = getThresholdForIngredients(searchCriteria.selectedIngredients.length)
            console.log(`🎯 Adaptive thresholds for ${searchCriteria.selectedIngredients.length} ingredients: Primary ${thresholds.primary}%, Fallback ${thresholds.fallback}, Final ${thresholds.final} ingredients`)

            // First try with primary threshold
            suggestions = scoredMeals
              .filter(meal => meal.ingredientScore > 0 && !meal.excluded && meal.matchPercentage >= thresholds.primary)
              .sort((a, b) => {
                if (b.ingredientScore !== a.ingredientScore) {
                  return b.ingredientScore - a.ingredientScore
                }
                return b.matchPercentage - a.matchPercentage
              })

            console.log(`🔍 After primary filtering (${thresholds.primary}% threshold): ${suggestions.length} meals`)

            // If no results with primary threshold, try fallback threshold
            if (suggestions.length === 0) {
              console.log(`🔄 No results with ${thresholds.primary}% threshold, trying fallback: at least ${thresholds.fallback} ingredients`)
              
              suggestions = scoredMeals
                .filter(meal => meal.ingredientScore > 0 && !meal.excluded && meal.matchedIngredients.length >= thresholds.fallback)
                .sort((a, b) => {
                  if (b.ingredientScore !== a.ingredientScore) {
                    return b.ingredientScore - a.ingredientScore
                  }
                  return b.matchPercentage - a.matchPercentage
                })

              console.log(`🔍 After fallback filtering (at least ${thresholds.fallback} ingredients): ${suggestions.length} meals`)
            }

            // If still no results, try final threshold
            if (suggestions.length === 0) {
              console.log(`🔄 No results with fallback threshold, trying final: at least ${thresholds.final} ingredients`)
              
              suggestions = scoredMeals
                .filter(meal => meal.ingredientScore > 0 && !meal.excluded && meal.matchedIngredients.length >= thresholds.final)
                .sort((a, b) => {
                  if (b.ingredientScore !== a.ingredientScore) {
                    return b.ingredientScore - a.ingredientScore
                  }
                  return b.matchPercentage - a.matchPercentage
                })

              console.log(`🔍 After final filtering (at least ${thresholds.final} ingredients): ${suggestions.length} meals`)
            }

            console.log(`📊 Final suggestions:`, suggestions.slice(0, 3).map(m => 
              `${m.name} (Score: ${m.ingredientScore}, Matches: ${m.matchedIngredients.join(', ')}, Match %: ${m.matchPercentage}%)`
            ))
            
            // Check if no meals match the ingredient criteria
            if (suggestions.length === 0) {
              const thresholdInfo = searchCriteria.selectedIngredients.length === 1 
                ? `the ingredient "${searchCriteria.selectedIngredients[0]}"`
                : `at least ${thresholds.primary}%, ${thresholds.fallback}, or ${thresholds.final} ingredients`
              
              console.log(`❌ No meals found with ${thresholdInfo}`)
              setMessage({ type: 'info', text: `No meals found containing ${thresholdInfo} of "${searchCriteria.selectedIngredients.join(', ')}". Try selecting different ingredients.` })
              return
            }
          } else if (!searchCriteria.showIngredientMode) {
            // Only use all Supabase meals if we're NOT in ingredient mode
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
        selectedIngredients: searchCriteria.selectedIngredients || [],
        leftoverMode: searchCriteria.leftoverMode || false
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
        
        // Check if we have any suggestions to work with
        if (suggestions.length > 0) {
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
        } else {
          // No meals found even after fallback - this shouldn't happen due to our filtering logic
          console.error('❌ No meals available for selection - this indicates a logic error')
          setMessage({ type: 'error', text: 'No meals found for your criteria. Please try different ingredients or filters.' })
          return
        }
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
    const combinations = {
      "Jollof Rice": {
        with: "Fried chicken, beef, fish, coleslaw",
        drinks: "Soft drinks, fresh juice, wine",
        sides: "Fried plantain, salad, moi moi"
      },
      "Boiled Yam with Palm Oil": {
        with: "Fried fish, pepper sauce, vegetables, boiled eggs",
        drinks: "Tea, coffee, fresh juice, zobo",
        sides: "Cucumber salad, tomatoes, onions, pepper"
      },
      "Boiled Yam and Stew": {
        with: "Fried fish, chicken, beef, boiled eggs",
        drinks: "Soft drinks, fresh juice, tea",
        sides: "Fried plantain, salad, coleslaw"
      },
      "Fried Yam and Tomato Sauce": {
        with: "Fried fish, scrambled eggs, sausages",
        drinks: "Tea, coffee, soft drinks, fresh juice",
        sides: "Coleslaw, cucumber salad, pepper sauce"
      },
      "Fried Plantain and Egg": {
        with: "Bread, tea, coffee, sausages",
        drinks: "Tea, coffee, fresh juice, soft drinks",
        sides: "Baked beans, toast, avocado"
      },
      "Fried Plantain and Fish": {
        with: "Bread, rice, pepper sauce, vegetables",
        drinks: "Soft drinks, fresh juice, zobo",
        sides: "Coleslaw, salad, boiled yam"
      },
      "Boiled Plantain and Oil": {
        with: "Fried fish, pepper sauce, salt, onions",
        drinks: "Tea, fresh juice, zobo",
        sides: "Boiled eggs, vegetables, pepper"
      },
      "Fried Plantain and Pepper Sauce": {
        with: "Bread, rice, boiled eggs, fish",
        drinks: "Soft drinks, fresh juice, tea",
        sides: "Coleslaw, cucumber salad"
      },
      "Boiled Plantain and Pepper Soup": {
        with: "Rice, bread, extra fish/meat in soup",
        drinks: "Fresh juice, soft drinks, palm wine",
        sides: "Vegetables, boiled eggs"
      },
      "Bread and Egg": {
        with: "Tea, coffee, butter, jam, sausages",
        drinks: "Tea, coffee, fresh juice, milk",
        sides: "Fruits, bacon, baked beans"
      },
      "Bread and Egg Sandwich": {
        with: "Tea, coffee, mayonnaise, lettuce, tomatoes",
        drinks: "Tea, coffee, soft drinks, fresh juice",
        sides: "Fruits, crisps, coleslaw"
      },
      "Boiled Egg and Bread": {
        with: "Butter, jam, tea, coffee, salt, pepper",
        drinks: "Tea, coffee, milk, fresh juice",
        sides: "Fruits, vegetables, mayonnaise"
      },
      "Toast Bread with Jam": {
        with: "Butter, tea, coffee, milk, fruits",
        drinks: "Tea, coffee, milk, hot chocolate",
        sides: "Boiled eggs, cereals, yogurt"
      },
      "Bread and Butter with Tea": {
        with: "Jam, honey, sugar, milk",
        drinks: "Tea, coffee, milk",
        sides: "Biscuits, fruits"
      },
      "Bread and Mayonnaise": {
        with: "Boiled eggs, vegetables, lettuce, tomatoes",
        drinks: "Soft drinks, fresh juice, tea",
        sides: "Cucumber, carrots, crisps"
      },
      "Bread and Sardine": {
        with: "Tomatoes, onions, pepper, mayonnaise",
        drinks: "Soft drinks, fresh juice, tea",
        sides: "Cucumber salad, boiled eggs"
      },
      "Bread and Corned Beef": {
        with: "Tomatoes, onions, mayonnaise, lettuce",
        drinks: "Tea, coffee, soft drinks",
        sides: "Boiled eggs, vegetables, crisps"
      },
      "Boiled Sweet Potato and Tomato Sauce": {
        with: "Fried fish, boiled eggs, vegetables",
        drinks: "Tea, fresh juice, soft drinks",
        sides: "Coleslaw, cucumber salad, pepper sauce"
      },
      "Fried Irish Potato and Egg": {
        with: "Bread, sausages, baked beans, ketchup",
        drinks: "Tea, coffee, fresh juice",
        sides: "Toast, coleslaw, tomatoes"
      },
      "Boiled Potato and Palm Oil": {
        with: "Fried fish, pepper sauce, salt, onions",
        drinks: "Tea, fresh juice, soft drinks",
        sides: "Vegetables, boiled eggs, pepper"
      },
      "Cereals with Milk": {
        with: "Milk, sugar, honey, fruits",
        drinks: "Milk, fresh juice, tea",
        sides: "Toast, biscuits, yogurt"
      },
      "Custard and Milk": {
        with: "Sugar, honey, fruits, nuts, biscuits",
        drinks: "Tea, coffee, fresh juice",
        sides: "Bread, crackers, fruits"
      },
      "Pap and Biscuit": {
        with: "Milk, sugar, honey, akara, moi moi",
        drinks: "Tea, coffee, fresh juice",
        sides: "Bread, fruits, groundnuts"
      },
      // New 45-60 minute breakfast recipes combinations
      "Fried Yam with Pepper Sauce": {
        with: "Fried fish, grilled chicken, boiled eggs, vegetables",
        drinks: "Soft drinks, fresh juice, zobo, palm wine",
        sides: "Coleslaw, cucumber salad, fried plantain, bread"
      },
      "Pancakes (Nigerian Style)": {
        with: "Honey, syrup, butter, fruits, eggs, sausages",
        drinks: "Tea, coffee, fresh juice, milk, hot chocolate",
        sides: "Bacon, scrambled eggs, fruits, yogurt"
      },
      "Fried Rice with Vegetables": {
        with: "Grilled chicken, beef, fish, coleslaw, salad",
        drinks: "Soft drinks, fresh juice, wine, zobo",
        sides: "Fried plantain, spring rolls, chin chin, moi moi"
      },
      "Ofada Rice with Ayamase": {
        with: "Assorted meat, ponmo, stockfish, fried plantain",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Traditional combination - complete meal"
      },
      "Boiled Yam with Vegetable Sauce": {
        with: "Fried fish, grilled chicken, boiled eggs",
        drinks: "Fresh juice, soft drinks, zobo, tea",
        sides: "Fried plantain, salad, coleslaw, bread"
      },
      "Chicken Pepper Soup with Yam": {
        with: "Extra chicken pieces, vegetables, bread",
        drinks: "Palm wine, beer, fresh juice, soft drinks",
        sides: "Traditional combination - complete meal"
      },
      "Palm Nut Soup with Rice (Ofe Akwu)": {
        with: "Stockfish, dried fish, assorted meat, vegetables",
        drinks: "Palm wine, fresh juice, zobo",
        sides: "Traditional combination - complete meal"
      },
      "Dried Fish Stew with Yam": {
        with: "Fresh vegetables, fried plantain, rice",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Garden egg, cucumber salad, bread"
      },
      "Snail Pepper Soup": {
        with: "Rice, yam, plantain, bread, eba",
        drinks: "Palm wine, beer, fresh juice, zobo",
        sides: "Extra snails, vegetables, fried plantain"
      },
      "Bush Meat Pepper Soup": {
        with: "Rice, yam, plantain, bread, pounded yam",
        drinks: "Palm wine, beer, fresh juice",
        sides: "Extra bush meat, vegetables, roasted plantain"
      },
      "Spinach Stew with Rice": {
        with: "Grilled chicken, fish, beef, fried plantain",
        drinks: "Soft drinks, fresh juice, zobo",
        sides: "Coleslaw, salad, boiled eggs, bread"
      },
      "Cucumber Soup": {
        with: "Rice, yam, eba, fufu, bread",
        drinks: "Fresh juice, soft drinks, zobo",
        sides: "Fish, meat, vegetables, fried plantain"
      },
      "Mixed Meat Stew with Rice": {
        with: "Complete meal - well-balanced",
        drinks: "Soft drinks, fresh juice, wine, beer",
        sides: "Fried plantain, coleslaw, salad, bread"
      },
      "Dried Meat Stew (Suya Stew)": {
        with: "Rice, yam, bread, fried plantain",
        drinks: "Soft drinks, beer, palm wine, zobo",
        sides: "Salad, coleslaw, vegetables, extra suya"
      },
      "Fresh Fish Stew with Plantain": {
        with: "Rice, bread, yam, extra vegetables",
        drinks: "Soft drinks, fresh juice, zobo, palm wine",
        sides: "Complete combination - traditional pairing"
      },
      "Native Rice (Igbo Style)": {
        with: "Stockfish, dried fish, assorted meat, vegetables",
        drinks: "Palm wine, fresh juice, zobo",
        sides: "Fried plantain, ugba, garden egg"
      },
      "Yam and Plantain Porridge": {
        with: "Fried fish, dried fish, vegetables, palm oil",
        drinks: "Zobo, fresh juice, palm wine",
        sides: "Stockfish, pepper sauce, garden egg"
      },
      "Cocoyam Porridge": {
        with: "Dried fish, stockfish, vegetables, palm oil",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Pepper sauce, garden egg, ugba"
      },
      "Plantain and Beans Porridge": {
        with: "Dried fish, palm oil, vegetables",
        drinks: "Zobo, fresh juice, soft drinks",
        sides: "Complete meal - balanced nutrition"
      },
      "Irish Potato Porridge": {
        with: "Fish, meat, vegetables, tomato sauce",
        drinks: "Soft drinks, fresh juice, tea",
        sides: "Bread, salad, coleslaw, boiled eggs"
      },
      "Carrot and Fish Stew": {
        with: "Rice, yam, bread, fried plantain",
        drinks: "Fresh juice, soft drinks, zobo",
        sides: "Salad, coleslaw, boiled eggs"
      },
      "Cabbage and Meat Stew": {
        with: "Rice, yam, bread, fried plantain",
        drinks: "Soft drinks, fresh juice, beer",
        sides: "Salad, coleslaw, extra vegetables"
      },
      "Green Beans and Fish Stew": {
        with: "Rice, yam, bread, boiled plantain",
        drinks: "Fresh juice, soft drinks, zobo",
        sides: "Salad, coleslaw, extra vegetables"
      },
      // New 60+ minute elaborate breakfast recipes combinations
      "Yam Flour Porridge (Elubo)": {
        with: "Dried fish, stockfish, palm oil, vegetables, pepper",
        drinks: "Palm wine, zobo, fresh juice, kunu",
        sides: "Garden egg, ugba, scent leaves, pepper sauce"
      },
      "Ukwa (African Breadfruit)": {
        with: "Dried fish, stockfish, palm oil, onions, pepper",
        drinks: "Palm wine, zobo, fresh juice, kunu",
        sides: "Garden egg, ugba, bitter leaf, pepper sauce"
      },
      "Water Yam Porridge": {
        with: "Dried fish, stockfish, palm oil, vegetables, crayfish",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Garden egg, scent leaves, pepper sauce, ugba"
      },
      "Coconut Rice with Assorted Meat": {
        with: "Complete festive meal - special occasion dish",
        drinks: "Wine, soft drinks, fresh juice, zobo",
        sides: "Coleslaw, salad, fried plantain, spring rolls"
      },
      "Fisherman's Rice": {
        with: "Complete seafood meal - coastal specialty",
        drinks: "Wine, beer, fresh juice, soft drinks",
        sides: "Coleslaw, salad, fried plantain, pepper sauce"
      },
      "Moi Moi with Rice and Stew": {
        with: "Complete traditional meal - triple combination",
        drinks: "Soft drinks, fresh juice, zobo",
        sides: "Additional protein, fried plantain, salad"
      },
      "Plantain Porridge with Dried Fish": {
        with: "Complete traditional meal - well-balanced",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Extra dried fish, vegetables, palm oil, pepper"
      },
      "Sweet Potato Porridge with Smoked Fish": {
        with: "Complete nutritious meal",
        drinks: "Fresh juice, zobo, soft drinks, tea",
        sides: "Extra smoked fish, vegetables, pepper sauce"
      },
      "Breadfruit Porridge with Assorted Meat": {
        with: "Complete hearty meal - protein-rich",
        drinks: "Palm wine, beer, fresh juice, zobo",
        sides: "Extra meat portions, vegetables, pepper sauce"
      },
      "Cocoyam Porridge with Stockfish": {
        with: "Traditional combination - authentic taste",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Extra stockfish, dried fish, vegetables, palm oil"
      },
      "Corn and Bean Porridge": {
        with: "Complete balanced meal - high protein",
        drinks: "Zobo, fresh juice, soft drinks, kunu",
        sides: "Dried fish, palm oil, vegetables, pepper sauce"
      },
      "Ram Meat Stew with Rice": {
        with: "Complete special occasion meal - festive dish",
        drinks: "Wine, beer, soft drinks, fresh juice",
        sides: "Fried plantain, coleslaw, salad, bread"
      },
      "Smoked Turkey Stew with Yam": {
        with: "Complete premium meal - holiday special",
        drinks: "Wine, champagne, fresh juice, soft drinks",
        sides: "Vegetables, salad, fried plantain, bread"
      },
      "Crab and Fish Stew": {
        with: "Rice, yam, bread, fried plantain",
        drinks: "Wine, beer, fresh juice, soft drinks",
        sides: "Coleslaw, salad, extra seafood, vegetables"
      },
      "Prawns and Vegetable Stew": {
        with: "Rice, yam, bread, pasta",
        drinks: "Wine, fresh juice, soft drinks",
        sides: "Salad, coleslaw, fried plantain, extra vegetables"
      },
      "Traditional Locust Bean Stew": {
        with: "Rice, yam, eba, fufu, amala",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Vegetables, stockfish, dried fish, garden egg"
      },
      "Coconut Milk Rice with Seafood": {
        with: "Complete luxury meal - restaurant quality",
        drinks: "Wine, champagne, fresh juice, soft drinks",
        sides: "Salad, coleslaw, grilled vegetables, bread"
      },
      "Egusi Soup with Rice": {
        with: "Complete traditional meal - alternative to swallow",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Assorted meat, stockfish, fried plantain"
      },
      // New under 30 minute lunch recipes combinations
      "Indomie Noodles Special": {
        with: "Fried eggs, sausages, corned beef, vegetables, sardines",
        drinks: "Soft drinks, fresh juice, tea, coffee",
        sides: "Bread, fried plantain, coleslaw, cucumber salad"
      },
      "Pasta Jollof": {
        with: "Grilled chicken, fried fish, beef, coleslaw, salad",
        drinks: "Soft drinks, fresh juice, wine, zobo",
        sides: "Fried plantain, garlic bread, mixed vegetables, spring rolls"
      },
      "Macaroni Jollof": {
        with: "Chicken, fish, beef, vegetables, coleslaw",
        drinks: "Soft drinks, fresh juice, wine, beer",
        sides: "Fried plantain, salad, garlic bread, boiled eggs"
      },
      "Noodles Stir-fry": {
        with: "Vegetables, chicken, beef, shrimp, eggs",
        drinks: "Soft drinks, fresh juice, tea, Asian-style beverages",
        sides: "Spring rolls, fried plantain, cucumber salad, bread"
      },
      "Quick Noodle Salad": {
        with: "Vegetables, mayonnaise, boiled eggs, chicken, tuna",
        drinks: "Fresh juice, soft drinks, iced tea, water",
        sides: "Crackers, bread, fruits, nuts, cheese"
      },
      "Boiled Corn and Pear": {
        with: "Natural combination - classic Nigerian snack",
        drinks: "Fresh coconut water, zobo, soft drinks, water",
        sides: "Roasted groundnuts, coconut, palm wine (for adults)"
      },
      "Fried Yam and Ketchup": {
        with: "Fried eggs, sausages, baked beans, vegetables",
        drinks: "Tea, coffee, soft drinks, fresh juice",
        sides: "Bread, coleslaw, cucumber salad, mayonnaise"
      },
      "Boiled Potato and Oil": {
        with: "Fried fish, pepper sauce, salt, onions, vegetables",
        drinks: "Tea, fresh juice, soft drinks, zobo",
        sides: "Bread, boiled eggs, cucumber salad, tomatoes"
      },
      "Quick Yam and Tomato Sauce": {
        with: "Fried fish, scrambled eggs, sausages, vegetables",
        drinks: "Tea, coffee, soft drinks, fresh juice",
        sides: "Bread, fried plantain, coleslaw, salad"
      },
      // New 45-60 minute lunch recipes combinations (regular category)
      "Fish Stew with Rice": {
        with: "Fried plantain, coleslaw, mixed vegetables, boiled eggs",
        drinks: "Soft drinks, fresh juice, zobo, wine",
        sides: "Salad, cucumber slices, bread, chin chin"
      },
      "Beef Stew with Rice": {
        with: "Fried plantain, coleslaw, vegetables, moi moi",
        drinks: "Soft drinks, beer, wine, fresh juice",
        sides: "Salad, bread, boiled eggs, spring rolls"
      },
      "Dried Fish Stew with Rice": {
        with: "Fried plantain, vegetables, garden egg, pepper sauce",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Ugba, bitter leaf salad, roasted groundnuts"
      },
      "Yam Porridge with Smoked Fish": {
        with: "Complete traditional meal - authentic combination",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Extra smoked fish, vegetables, pepper sauce, palm oil"
      },
      "Yam Porridge with Diced Goat Meat": {
        with: "Complete hearty meal - protein-rich",
        drinks: "Palm wine, beer, zobo, fresh juice",
        sides: "Extra goat meat, vegetables, pepper sauce"
      },
      "Snail Stew with White Rice": {
        with: "Fried plantain, vegetables, pepper sauce, extra snails",
        drinks: "Palm wine, beer, zobo, fresh juice",
        sides: "Garden egg, ugba, roasted plantain, bread"
      },
      "Turkey Jollof": {
        with: "Complete festive meal - special occasion dish",
        drinks: "Wine, champagne, soft drinks, fresh juice",
        sides: "Coleslaw, salad, fried plantain, moi moi, chin chin"
      },
      "Afang Soup with Semolina": {
        with: "Traditional combination - complete meal",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Stockfish, dried fish, assorted meat, periwinkles"
      },
      "Edikaikong Soup with Garri": {
        with: "Traditional combination - Cross River specialty",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, beef, goat meat, periwinkles"
      },
      "Onugbu Soup with Semolina": {
        with: "Traditional Igbo combination - bitter leaf soup",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, assorted meat, cocoyam paste"
      },
      "Ogbono Soup with Semolina": {
        with: "Popular combination - smooth, thick soup",
        drinks: "Palm wine, zobo, soft drinks, fresh juice",
        sides: "Assorted meat, stockfish, dried fish, vegetables"
      },
      "Okazi Soup with Semolina": {
        with: "Traditional combination - Afang leaf soup",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, beef, goat meat, periwinkles"
      },
      "Uziza Soup with Yam": {
        with: "Traditional combination - authentic pairing",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, assorted meat, vegetables"
      },
      "Nchuanwu Soup with Semolina": {
        with: "Traditional combination - scent leaf soup",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, assorted meat, vegetables"
      },
      "Garden Egg Leaf Soup": {
        with: "Pounded yam, eba, fufu, semolina, rice",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, meat, garden egg"
      },
      "Locust Bean Soup (Iru)": {
        with: "Pounded yam, eba, amala, rice",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Assorted meat, stockfish, dried fish, vegetables"
      },
      "Cow Foot Stew": {
        with: "Rice, yam, bread, fried plantain",
        drinks: "Beer, palm wine, soft drinks, fresh juice",
        sides: "Vegetables, coleslaw, extra cow foot pieces"
      },
      "Jollof Rice with Prawns": {
        with: "Complete seafood meal - premium dish",
        drinks: "Wine, beer, fresh juice, soft drinks",
        sides: "Coleslaw, salad, fried plantain, spring rolls, bread"
      },
      "Mixed Seafood Stew": {
        with: "Rice, yam, bread, fried plantain",
        drinks: "Wine, beer, fresh juice, soft drinks",
        sides: "Coleslaw, salad, garlic bread, vegetables"
      },
      "Abacha (African Salad)": {
        with: "Complete traditional meal - authentic specialty",
        drinks: "Palm wine, beer, zobo, fresh juice",
        sides: "Stockfish, dried fish, ugba, garden egg, kpomo"
      },
      "Efo Riro with Rice": {
        with: "Complete balanced meal - vegetables and carbs",
        drinks: "Soft drinks, fresh juice, zobo, palm wine",
        sides: "Fried plantain, bread, boiled eggs, salad"
      },
      "Spinach and Yam": {
        with: "Fish, meat, palm oil, pepper sauce",
        drinks: "Fresh juice, soft drinks, zobo, tea",
        sides: "Bread, boiled eggs, roasted groundnuts"
      },
      // New over 1 hour lunch recipes combinations (elaborate category)
      "Pounded Yam with Egusi Soup": {
        with: "Traditional complete meal - Nigeria's most iconic combination",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Assorted meat, stockfish, dried fish, fried plantain, garden egg, bitter leaf salad, pepper sauce"
      },
      "Amala with Ewedu and Gbegiri": {
        with: "Traditional Yoruba combination - triple soup serving",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Assorted meat, fish, locust beans, palm oil, fried plantain, pepper sauce, garden egg"
      },
      "Fufu with Bitterleaf Soup": {
        with: "Traditional combination - classic pairing",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, assorted meat, cocoyam paste, garden egg, ugba, pepper sauce"
      },
      "Oha Soup with Pounded Yam": {
        with: "Traditional Igbo combination - premium soup",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, assorted meat, cocoyam paste, garden egg, ugba, bitter leaf salad"
      },
      "Nsala Soup (White Soup) with Fufu": {
        with: "Traditional Igbo combination - medicinal soup",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Catfish, stockfish, uziza seeds, utazi leaves, garden egg, pepper sauce"
      },
      "Afang Soup with Pounded Yam": {
        with: "Traditional Cross River combination",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, periwinkles, assorted meat, garden egg, ugba, pepper sauce"
      },
      "Edikaikong Soup with Fufu": {
        with: "Traditional Cross River combination - vegetable soup",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, beef, goat meat, periwinkles, garden egg, pepper sauce"
      },
      "Ogbono Soup with Semovita": {
        with: "Popular combination - smooth, thick soup",
        drinks: "Palm wine, zobo, soft drinks, fresh juice",
        sides: "Assorted meat, stockfish, dried fish, vegetables, fried plantain, pepper sauce"
      },
      "Okro Soup with Fufu": {
        with: "Traditional combination - classic pairing",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Fish, meat, stockfish, locust beans, garden egg, pepper sauce"
      },
      "Groundnut Soup with Tuwo": {
        with: "Northern Nigerian combination",
        drinks: "Kunu, zobo, fresh juice, fura da nono",
        sides: "Beef, chicken, ram meat, vegetables, dan wake, kilishi, groundnuts"
      },
      "Stockfish Soup with Semolina": {
        with: "Traditional combination - protein-rich",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Extra stockfish, dried fish, vegetables, garden egg, ugba, pepper sauce"
      },
      "Ewa Riro (Stewed Beans) with Plantain": {
        with: "Traditional combination - complete balanced meal",
        drinks: "Soft drinks, fresh juice, zobo",
        sides: "Fish, meat, palm oil, pepper sauce, bread, rice, fried plantain"
      },
      "Irish Potato Porridge with Goat Meat": {
        with: "Complete hearty meal - filling and nutritious",
        drinks: "Beer, soft drinks, fresh juice, zobo",
        sides: "Extra goat meat, vegetables, pepper sauce, bread, fried plantain, salad"
      },
      "Ukazi Soup": {
        with: "Pounded yam, eba, fufu, semolina",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, assorted meat, periwinkles, garden egg, ugba, pepper sauce"
      },
      "Uziza Soup": {
        with: "Pounded yam, eba, fufu, rice",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Stockfish, dried fish, assorted meat, garden egg, vegetables, pepper sauce"
      },
      "Ugu Soup (Fluted Pumpkin)": {
        with: "Pounded yam, eba, fufu, semolina, rice",
        drinks: "Soft drinks, fresh juice, zobo, palm wine",
        sides: "Fish, meat, stockfish, crayfish, fried plantain, garden egg, salad"
      },
      "Carrot Soup": {
        with: "Rice, pounded yam, eba, fufu",
        drinks: "Fresh juice, soft drinks, zobo",
        sides: "Fish, chicken, beef, vegetables, bread, fried plantain, salad"
      },
      "Cabbage Stew": {
        with: "Rice, yam, bread, fried plantain",
        drinks: "Soft drinks, fresh juice, tea",
        sides: "Fish, chicken, beef, vegetables, salad, coleslaw, boiled eggs"
      },
      "Abak Atama Soup (Cross River)": {
        with: "Pounded yam, eba, fufu, semolina",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Dried fish, stockfish, periwinkles, palm fruit, garden egg, pepper sauce"
      },
      "Banga Soup": {
        with: "Rice, pounded yam, eba, starch",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Fresh fish, dried fish, stockfish, scent leaves, garden egg, pepper sauce"
      },
      "Owho Soup (Delta)": {
        with: "Starch, pounded yam, eba, rice",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Fresh fish, stockfish, scent leaves, garden egg, pepper sauce"
      },
      "Tuwon Masara Soup (Northern)": {
        with: "Tuwo masara, rice, yam",
        drinks: "Kunu, zobo, fura da nono, fresh juice",
        sides: "Beef, ram meat, vegetables, dan wake, kilishi, groundnuts"
      },
      "Miyar Karkashi (Northern)": {
        with: "Tuwo, rice, yam",
        drinks: "Kunu, zobo, fresh juice",
        sides: "Beef, chicken, dried vegetables, groundnuts, dan wake"
      },
      "Obe Ilasa (Yoruba)": {
        with: "Rice, amala, eba, pounded yam",
        drinks: "Palm wine, zobo, soft drinks",
        sides: "Fish, meat, locust beans, fried plantain, pepper sauce"
      },
      "Oguro Soup (Edo)": {
        with: "Pounded yam, eba, starch",
        drinks: "Palm wine, zobo, fresh juice",
        sides: "Fish, meat, stockfish, garden egg, pepper sauce"
      },
      "Pineapple Fried Rice": {
        with: "Complete exotic meal - special occasion dish",
        drinks: "Wine, champagne, fresh juice, soft drinks",
        sides: "Grilled chicken, shrimp, coleslaw, salad, spring rolls"
      },
      "Pepper Soup and Agidi": {
        with: "Traditional combination - authentic pairing",
        drinks: "Palm wine, beer, fresh juice, zobo",
        sides: "Extra fish/meat in soup, vegetables, bread, fried plantain, pepper sauce"
      },
      "Isi Ewu": {
        with: "Complete specialty meal - traditional delicacy",
        drinks: "Palm wine, beer, soft drinks, fresh juice",
        sides: "Extra goat head pieces, utazi leaves, ehuru, agidi, rice, bread, fried plantain"
      },
      "Gbegiri and Amala": {
        with: "Traditional Yoruba combination - bean soup with yam flour",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Ewedu, assorted meat, fish, locust beans, fried plantain, pepper sauce"
      },
      "Beef Stew and Yam": {
        with: "Traditional combination - classic pairing",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Extra beef, vegetables, pepper sauce, bread, fried plantain"
      },
      "Turkey Stew and Rice": {
        with: "Traditional combination - festive meal",
        drinks: "Beer, wine, soft drinks, fresh juice",
        sides: "Extra turkey, vegetables, coleslaw, salad, fried plantain"
      },
      "Snail Stew and Rice": {
        with: "Traditional combination - delicacy meal",
        drinks: "Palm wine, beer, fresh juice, soft drinks",
        sides: "Extra snails, vegetables, pepper sauce, garden egg, fried plantain"
      },
      "Cocoyam and Fish Sauce": {
        with: "Traditional combination - simple and nutritious",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Extra fish, vegetables, pepper sauce, garden egg, ugba, fried plantain"
      },
      "Rice and Pepper Soup": {
        with: "Complete comfort meal - warming combination",
        drinks: "Fresh juice, soft drinks, palm wine, beer",
        sides: "Extra fish/meat in soup, vegetables, bread, fried plantain"
      },
      // Nigerian Quick & Convenient Dinner Combos
      "Toasted Bread and Sardine": {
        with: "Tomatoes, onions, mayonnaise, lettuce, cucumber",
        drinks: "Tea, coffee, soft drinks, fresh juice, milk",
        sides: "Boiled eggs, fruits, crisps, coleslaw"
      },
      "Fried Egg and Bread": {
        with: "Butter, jam, sausages, baked beans, tomatoes",
        drinks: "Tea, coffee, milk, fresh juice, hot chocolate",
        sides: "Bacon, fruits, avocado, hash browns"
      },
      "Bread and Mayonnaise mixed with Sardine": {
        with: "Lettuce, tomatoes, onions, cucumber, pepper",
        drinks: "Soft drinks, fresh juice, tea, coffee",
        sides: "Crisps, boiled eggs, fruits, coleslaw"
      },
      "Bread and Chicken Spread": {
        with: "Lettuce, tomatoes, mayonnaise, cucumber, cheese",
        drinks: "Soft drinks, fresh juice, tea, coffee",
        sides: "Crisps, fruits, coleslaw, boiled eggs"
      },
      "Custard and Bread": {
        with: "Sugar, honey, fruits, nuts, milk",
        drinks: "Tea, coffee, milk, fresh juice",
        sides: "Biscuits, more fruits, yogurt"
      },
      "Quick Egg Sandwich": {
        with: "Mayonnaise, lettuce, tomatoes, cheese, ham",
        drinks: "Tea, coffee, milk, fresh juice, soft drinks",
        sides: "Crisps, fruits, pickles, coleslaw"
      },
      "Bread and Milkshake": {
        with: "Fruits, nuts, cookies, ice cream",
        drinks: "Milkshake (any flavor), fresh juice, tea, coffee",
        sides: "Biscuits, more fruits, yogurt"
      },
      "Boiled Yam with Stew": {
        with: "Fried fish, chicken, beef, fried plantain",
        drinks: "Soft drinks, fresh juice, zobo, tea",
        sides: "Coleslaw, salad, bread, boiled eggs"
      },
      "Boiled Plantain and Oil Sauce": {
        with: "Fried fish, pepper sauce, salt, onions",
        drinks: "Tea, fresh juice, soft drinks, zobo",
        sides: "Boiled eggs, bread, vegetables, pepper"
      },
      "Plantain and Pepper Egg Sauce": {
        with: "Extra eggs, bread, vegetables, fish",
        drinks: "Tea, coffee, fresh juice, soft drinks",
        sides: "Toast, salad, fruits, sausages"
      },
      "Boiled Plantain and Pepper Sauce": {
        with: "Fried fish, boiled eggs, vegetables, bread",
        drinks: "Soft drinks, fresh juice, zobo, tea",
        sides: "Rice, salad, coleslaw, extra protein"
      },
      "Fried Yam and Ketchup": {
        with: "Fried eggs, sausages, baked beans, mayonnaise",
        drinks: "Tea, coffee, soft drinks, fresh juice",
        sides: "Bread, coleslaw, salad, fruits"
      },
      "Boiled Corn and Pear or Coconut": {
        with: "Traditional combination - natural pairing",
        drinks: "Fresh coconut water, zobo, soft drinks, water",
        sides: "Roasted groundnuts, palm wine (adults), tiger nuts"
      },
      "Cornflakes and Milk": {
        with: "Sugar, honey, fruits (banana, strawberry), nuts",
        drinks: "Additional milk, fresh juice, tea, coffee",
        sides: "Toast, biscuits, yogurt, dried fruits"
      },
      "Rice and Egg Sauce": {
        with: "Fried plantain, salad, vegetables, bread",
        drinks: "Soft drinks, fresh juice, tea, coffee",
        sides: "Coleslaw, sausages, chicken, fish"
      },
      "Noodles Soup": {
        with: "Vegetables, eggs, chicken, fish, sausages",
        drinks: "Soft drinks, fresh juice, tea, water",
        sides: "Bread, crackers, spring rolls, fruits"
      },
      "Pasta Salad": {
        with: "Vegetables, mayonnaise, chicken, tuna, boiled eggs",
        drinks: "Fresh juice, soft drinks, iced tea, water",
        sides: "Crackers, bread, fruits, nuts, cheese"
      },
      "Instant Noodles with Sardine": {
        with: "Vegetables, eggs, bread, pepper sauce",
        drinks: "Soft drinks, fresh juice, tea, coffee",
        sides: "Crackers, fruits, crisps, coleslaw"
      },
      "Spaghetti Stir-fry": {
        with: "Vegetables, chicken, beef, shrimp, eggs",
        drinks: "Soft drinks, fresh juice, wine, tea",
        sides: "Garlic bread, salad, spring rolls, coleslaw"
      },
      "Spaghetti with Fish Sauce": {
        with: "Garlic bread, salad, vegetables, parmesan",
        drinks: "Soft drinks, wine, fresh juice, tea",
        sides: "Coleslaw, extra fish, bread rolls"
      },
      "Spaghetti with Egg Sauce": {
        with: "Garlic bread, salad, vegetables, cheese",
        drinks: "Soft drinks, fresh juice, milk, tea",
        sides: "Coleslaw, fruits, bread, extra eggs"
      },
      "Spaghetti with Corned Beef": {
        with: "Garlic bread, salad, vegetables, cheese",
        drinks: "Soft drinks, fresh juice, wine, tea",
        sides: "Coleslaw, bread rolls, extra vegetables"
      },
      "Quick Pancake and Sardine": {
        with: "Honey, syrup, butter, vegetables",
        drinks: "Tea, coffee, milk, fresh juice",
        sides: "Fruits, eggs, bacon, salad"
      },
      // Nigerian Specialty Pasta & Rice Dinner Combos (Regular Category)
      "Spaghetti with Chicken Sauce": {
        with: "Garlic bread, coleslaw, mixed salad, parmesan cheese",
        drinks: "Soft drinks, wine, fresh juice, beer",
        sides: "Caesar salad, fried plantain, spring rolls, breadsticks"
      },
      "Spaghetti with Turkey Sauce": {
        with: "Complete festive meal - premium holiday option",
        drinks: "Wine, champagne, beer, fresh juice, soft drinks",
        sides: "Garlic bread, coleslaw, mixed vegetables, salad, dinner rolls"
      },
      "Spaghetti with Goat Meat": {
        with: "Unique Nigerian fusion - traditional meat, modern presentation",
        drinks: "Beer, wine, palm wine, soft drinks, fresh juice",
        sides: "Garlic bread, pepper sauce, coleslaw, mixed vegetables"
      },
      "Spaghetti with Prawns": {
        with: "Complete seafood luxury meal - restaurant-quality dish",
        drinks: "White wine, champagne, beer, fresh juice, soft drinks",
        sides: "Garlic bread, Caesar salad, grilled vegetables, lemon wedges"
      },
      "Spaghetti with Snail": {
        with: "Exotic Nigerian fusion - adventurous combination",
        drinks: "Wine, beer, palm wine, fresh juice, soft drinks",
        sides: "Garlic bread, pepper sauce, coleslaw, extra snails"
      },
      "Spaghetti with Corned Beef": {
        with: "Budget-friendly comfort meal - convenient option",
        drinks: "Soft drinks, fresh juice, tea, coffee, beer",
        sides: "Bread, coleslaw, vegetables, salad, fried plantain"
      },
      "Spaghetti with Sardine": {
        with: "Quick seafood option - economical choice",
        drinks: "Soft drinks, fresh juice, tea, coffee, wine",
        sides: "Garlic bread, salad, vegetables, coleslaw, crackers"
      },
      "Groundnut Soup with Rice": {
        with: "Traditional Northern fusion - authentic groundnut flavors",
        drinks: "Kunu, zobo, fresh juice, soft drinks, palm wine",
        sides: "Extra groundnuts, vegetables, meat, pepper sauce"
      },
      "Prawn Stew with Rice": {
        with: "Complete seafood meal - coastal specialty",
        drinks: "Wine, beer, fresh juice, soft drinks, cocktails",
        sides: "Coleslaw, salad, fried plantain, garlic bread, extra prawns"
      },
      "Dried Fish Stew with Rice": {
        with: "Traditional comfort meal - authentic Nigerian flavors",
        drinks: "Palm wine, zobo, fresh juice, soft drinks, beer",
        sides: "Garden egg, ugba, fried plantain, pepper sauce, vegetables"
      },
      "Plantain and Fish Stew": {
        with: "Complete balanced meal - carbs, protein, and flavor",
        drinks: "Soft drinks, fresh juice, zobo, palm wine, beer",
        sides: "Rice, bread, extra fish, vegetables, pepper sauce"
      },
      "Rice and Beans with Plantain": {
        with: "Complete nutritious meal - balanced amino acids and carbs",
        drinks: "Zobo, fresh juice, soft drinks, kunu, palm wine",
        sides: "Fried fish, pepper sauce, coleslaw, vegetables"
      },
      "Vegetable Jollof": {
        with: "Complete healthy meal - nutrient-rich and satisfying",
        drinks: "Fresh juice, zobo, soft drinks, herbal teas, water",
        sides: "Grilled proteins, salad, coleslaw, nuts, fruits"
      },
      "Chinese Fried Rice (Naija Style)": {
        with: "Complete fusion meal - Asian technique, Nigerian flavors",
        drinks: "Soft drinks, fresh juice, Asian teas, wine, beer",
        sides: "Spring rolls, chicken, prawn crackers, coleslaw, salad"
      },
      // New quick lunch recipes combinations (Fusion & Vegetarian)
      "Stir-fry Noodles with Suya Chunks": {
        with: "Unique Nigerian-Asian fusion - traditional suya flavors with Asian technique",
        drinks: "Beer, soft drinks, Asian teas, fresh juice, wine",
        sides: "Spring rolls, pepper sauce, cucumber salad, prawn crackers, coleslaw"
      },
      "Stir Fried Suya Pasta": {
        with: "Creative Nigerian-Italian fusion - suya spices with Italian pasta",
        drinks: "Beer, wine, soft drinks, fresh juice, cocktails",
        sides: "Garlic bread, suya seasoning, pepper sauce, mixed salad, extra suya"
      },
      "Spaghetti and Gizzard Sauce": {
        with: "Nigerian comfort fusion - local protein with Italian preparation",
        drinks: "Beer, wine, soft drinks, fresh juice, palm wine",
        sides: "Garlic bread, coleslaw, pepper sauce, extra gizzards, plantain chips"
      },
      "Stir Fry Spaghetti": {
        with: "Modern Nigerian pasta - Asian stir-fry technique with spaghetti",
        drinks: "Soft drinks, wine, beer, fresh juice, Asian-style beverages",
        sides: "Vegetables, spring rolls, garlic bread, salad, protein additions"
      },
      "Veggie Potato Pottage": {
        with: "Complete healthy meal - nutritious plant-based comfort food",
        drinks: "Fresh juice, herbal teas, soft drinks, smoothies, water",
        sides: "Whole grain bread, mixed nuts, avocado, fresh fruits, salad"
      },
      "Veggie Beans Pottage": {
        with: "Complete protein-rich meal - satisfying vegetarian option",
        drinks: "Fresh juice, zobo, herbal teas, soft drinks, plant milk",
        sides: "Fried plantain, whole grain bread, nuts, vegetables, fruits"
      },
      // New elaborate dinner recipes combinations (Premium Fusion)
      "Assorted Meat Jollof": {
        with: "Complete festive meal - multiple proteins in one dish",
        drinks: "Wine, beer, champagne, soft drinks, fresh juice",
        sides: "Coleslaw, mixed salad, fried plantain, moi moi, chin chin"
      },
      "Goat Meat Jollof": {
        with: "Complete celebration meal - special occasion rice",
        drinks: "Beer, wine, palm wine, soft drinks, fresh juice",
        sides: "Pepper sauce, coleslaw, fried plantain, extra goat meat, salad"
      },
      "Snail Pepper Soup": {
        with: "Complete traditional delicacy - warming, medicinal soup",
        drinks: "Palm wine, beer, fresh juice, zobo, soft drinks",
        sides: "Rice, yam, plantain, bread, extra snails, pepper sauce"
      },
      "Coconut Moi-Moi": {
        with: "Enhanced traditional dish - coconut adds richness and flavor",
        drinks: "Fresh coconut water, soft drinks, fresh juice, zobo",
        sides: "Rice, bread, fried plantain, pepper sauce, salad"
      },
      "Alfredo Shrimp Pasta": {
        with: "Complete luxury meal - Italian-Nigerian fusion",
        drinks: "White wine, champagne, soft drinks, fresh juice",
        sides: "Garlic bread, Caesar salad, grilled vegetables, lemon wedges"
      },
      "Dafaduka": {
        with: "Traditional Northern specialty - authentic regional dish",
        drinks: "Kunu, zobo, fresh juice, soft drinks, fura da nono",
        sides: "Traditional Northern vegetables, groundnuts, pepper sauce"
      },
      "Stir Fried Suya Pasta": {
        with: "Unique Nigerian fusion - traditional suya flavors with pasta",
        drinks: "Beer, wine, soft drinks, fresh juice, cocktails",
        sides: "Suya spice seasoning, pepper sauce, salad, garlic bread"
      },
      "Prawn, Citrus and Avocado Salad": {
        with: "Complete light luxury meal - fresh, healthy, and elegant",
        drinks: "White wine, champagne, fresh juice, sparkling water, cocktails",
        sides: "Crusty bread, additional citrus, nuts, light appetizers"
      },
      "Jollof Rice with Soya Chunks": {
        with: "Complete vegetarian meal - protein-rich plant-based option",
        drinks: "Fresh juice, soft drinks, zobo, herbal teas, water",
        sides: "Vegetable salad, coleslaw, fried plantain, nuts, fruits"
      },
      "Fish in Spinach Sauce with Boiled Yam": {
        with: "Complete balanced meal - protein, vegetables, and carbs",
        drinks: "Fresh juice, soft drinks, zobo, wine",
        sides: "Extra fish, bread, pepper sauce, salad"
      },
      "Beans and Sweet Potato Pottage": {
        with: "Complete nutritious meal - balanced carbs and protein",
        drinks: "Fresh juice, zobo, soft drinks, herbal teas",
        sides: "Fried fish, plantain, pepper sauce, vegetables"
      },
      "Ikokore": {
        with: "Traditional Yoruba specialty - water yam and fish porridge",
        drinks: "Palm wine, zobo, fresh juice, soft drinks",
        sides: "Extra fish, pepper sauce, vegetables, fried plantain"
      },
      "Vegetable Jollof with Soya Chunks": {
        with: "Complete healthy meal - nutrient-dense vegetarian option",
        drinks: "Fresh juice, zobo, herbal teas, soft drinks, smoothies",
        sides: "Mixed nuts, avocado salad, grilled vegetables, fruits"
      },
      "Loaded Singapore Noodle": {
        with: "Asian-Nigerian fusion - international technique with local flavors",
        drinks: "Asian teas, soft drinks, wine, fresh juice, cocktails",
        sides: "Spring rolls, prawn crackers, vegetables, Asian-style salad"
      },
      "Seafood Okro with Eba": {
        with: "Traditional combination - coastal specialty",
        drinks: "Palm wine, beer, fresh juice, soft drinks",
        sides: "Mixed seafood, periwinkles, stockfish, pepper sauce"
      },
      "Chicken Curry Sauce with Basmati Rice": {
        with: "Indo-Nigerian fusion - curry spices with Nigerian preparation",
        drinks: "Lassi, wine, soft drinks, fresh juice, chai tea",
        sides: "Naan bread, raita, pickles, salad, papadums"
      },
      "Spaghetti and Gizzard Sauce": {
        with: "Nigerian comfort fusion - local protein with Italian preparation",
        drinks: "Beer, wine, soft drinks, fresh juice",
        sides: "Garlic bread, coleslaw, pepper sauce, extra gizzards"
      },
      "Gizdodo": {
        with: "Popular Nigerian specialty - gizzard and plantain combination",
        drinks: "Beer, soft drinks, wine, fresh juice, palm wine",
        sides: "Rice, bread, pepper sauce, coleslaw, extra protein"
      },
      "Chicken Okro Soup": {
        with: "Complete comfort meal - hearty traditional soup",
        drinks: "Palm wine, soft drinks, fresh juice, zobo",
        sides: "Pounded yam, eba, fufu, rice, fried plantain"
      },
      "Pasta Peppersoup": {
        with: "Unique Nigerian creation - traditional soup flavors with pasta",
        drinks: "Beer, palm wine, soft drinks, fresh juice, zobo",
        sides: "Bread, pepper sauce, extra protein, vegetables"
      },
      "Vegetable Pasta": {
        with: "Complete healthy meal - nutrient-rich Italian-style dish",
        drinks: "Wine, fresh juice, herbal teas, soft drinks, water",
        sides: "Garlic bread, mixed salad, grilled vegetables, nuts"
      },
      "Pasta Alfredo": {
        with: "Complete creamy comfort meal - classic Italian preparation",
        drinks: "White wine, soft drinks, fresh juice, sparkling water",
        sides: "Garlic bread, Caesar salad, grilled chicken, vegetables"
      }
    }
    return combinations[mealName] || null
  }

  // Helper function to get ingredient icon
  const getIngredientIcon = (ingredient) => {
    return ingredient === 'Rice' ? '🍚' :
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
           ingredient === 'Bread' ? '🍞' :
           ingredient === 'Egg' ? '🥚' :
           ingredient === 'Irish potatoes' ? '🥔' :
           ingredient === 'Garri' ? '🫓' :
           ingredient === 'Semovita' ? '🫓' :
           ingredient === 'Wheat' ? '🌾' :
           ingredient === 'Starch' ? '🫓' :
           ingredient === 'Spaghetti' ? '🍝' :
           ingredient === 'Noodles' ? '🍜' : '🥬'
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

        {/* Selected Ingredients Reminder - Only for Ingredient Mode */}
        {searchCriteria?.showIngredientMode && searchCriteria?.selectedIngredients?.length > 0 && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-blue-800 font-semibold text-sm">
                    {searchCriteria?.leftoverMode ? 'Transforming your leftovers:' : 'Searching with your ingredients:'}
                  </h3>
                  <p className="text-blue-600 text-xs">
                    {searchCriteria?.leftoverMode 
                      ? 'We found recipes that transform your leftovers into delicious new meals'
                      : 'We found recipes that best match your selection'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {searchCriteria.selectedIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm"
                  >
                    <span className="text-lg">{getIngredientIcon(ingredient)}</span>
                    <span className="text-blue-700 text-sm font-medium">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leftover Transformation Tips - Only for Leftover Mode */}
        {searchCriteria?.showIngredientMode && searchCriteria?.leftoverMode && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Recycle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-green-800 font-bold text-base">Smart Leftover Transformation</h3>
                  <p className="text-green-600 text-sm">Creative ways to use your leftovers</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/90 backdrop-blur-sm border border-green-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm">🍚</span>
                    </div>
                    <span className="text-green-700 font-semibold text-sm">Leftover Rice</span>
                  </div>
                  <p className="text-green-600 text-xs leading-relaxed">Perfect for fried rice, rice porridge, or rice and beans. Add fresh vegetables for extra nutrition!</p>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm border border-green-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm">🍲</span>
                    </div>
                    <span className="text-green-700 font-semibold text-sm">Leftover Stew</span>
                  </div>
                  <p className="text-green-600 text-xs leading-relaxed">Great with new rice, yam, or plantain. Reheat gently to preserve flavors!</p>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm border border-green-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm">🥩</span>
                    </div>
                    <span className="text-green-700 font-semibold text-sm">Leftover Meat</span>
                  </div>
                  <p className="text-green-600 text-xs leading-relaxed">Use in stir-fries, soups, or sandwiches. Shred for easier incorporation!</p>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm border border-green-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm">🥬</span>
                    </div>
                    <span className="text-green-700 font-semibold text-sm">Leftover Vegetables</span>
                  </div>
                  <p className="text-green-600 text-xs leading-relaxed">Perfect for soups, stews, or stir-fries. Add fresh herbs for brightness!</p>
                </div>
              </div>
              
              {/* Food Safety Tip */}
              <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">⚠️</span>
                  </div>
                  <p className="text-yellow-800 text-xs font-medium">Food Safety Tip: Use leftovers within 3-4 days and reheat thoroughly before serving.</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
          {previousMeals.length >= 2 && (
            <button
              onClick={goToPreviousRecipe}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Previous Recipe</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm font-bold">
                {previousMeals.length}
              </span>
            </button>
          )}
          
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
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-slide-in-up overflow-hidden">
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
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    Choose your next action:
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-indigo-200/50">
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium text-sm">Reset & Continue</p>
                        <p className="text-gray-600 text-xs">See the same recipes again with your current filters</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-purple-200/50">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium text-sm">Go to Homepage</p>
                        <p className="text-gray-600 text-xs">Choose different meal types, cooking times, or ingredients</p>
                      </div>
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
                    Reset & Continue
                  </button>
                  <button
                    onClick={goToHomepage}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-5 h-5" />
                    Go to Homepage
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leftover Transformation Tips - Coming Soon */}
        {searchCriteria?.showIngredientMode && searchCriteria?.leftoverMode && (
          <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="card mb-8">
              <div className="relative">
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Recycle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Leftover Transformations</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Transform your leftovers into delicious new meals! This feature is coming soon and will help you reduce food waste with creative recipes.
                    </p>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-full inline-block">
                      COMING SOON
                    </div>
                  </div>
                </div>
                
                {/* Disabled content */}
                <div className="opacity-30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Recycle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Leftover Transformation Tips</h3>
                      <p className="text-gray-600">Smart suggestions for your leftover ingredients</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-2xl">🍽️</span>
                        Served With
                      </h4>
                      <p className="text-gray-600 text-sm">Perfect accompaniments for your transformed meal</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-2xl">🥤</span>
                        Drinks
                      </h4>
                      <p className="text-gray-600 text-sm">Refreshing beverages to complement your meal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
} 