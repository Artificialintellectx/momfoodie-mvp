import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { mealTypes, cookingTimes, commonIngredients, leftoverIngredients, leftoverCombinations } from '../lib/data'
import { analytics } from '../lib/analytics'
import { 
  ChefHat, 
  Heart, 
  Sparkles, 
  CircleCheck, 
  Clock,
  ArrowRight,
  Flame,
  Search,
  Utensils,
  Refrigerator,
  Recycle,
  CheckCircle,
  X
} from 'lucide-react'
import { HomepageSkeleton } from '../components/SkeletonLoader'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [showIngredientMode, setShowIngredientMode] = useState(true) // Changed to true to make ingredient mode default
  const [leftoverMode, setLeftoverMode] = useState(false)
  const [mealType, setMealType] = useState('')
  const [cookingTime, setCookingTime] = useState('quick')
  const [savedMeals, setSavedMeals] = useState([])
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [availableIngredients] = useState(commonIngredients)
  const [availableLeftoverIngredients] = useState(leftoverIngredients)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter ingredients based on search term
  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Function to get meal type based on Lagos time
  const getMealTypeByTime = () => {
    const lagosTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos"
    })
    const lagosDate = new Date(lagosTime)
    const hour = lagosDate.getHours()
    
    if (hour >= 5 && hour < 11) {
      return 'breakfast'
    } else if (hour >= 11 && hour < 17) {
      return 'lunch'
    } else {
      return 'dinner'
    }
  }

  useEffect(() => {
    // Set meal type based on Lagos time
    const currentMealType = getMealTypeByTime()
    setMealType(currentMealType)
    
    // Track page visit and session start
    analytics.trackPageVisit('home', navigator.userAgent)
    analytics.trackSessionStart()
    
    // Simulate page loading
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  // Track session end when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      analytics.trackSessionEnd()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      analytics.trackSessionEnd()
    }
  }, [])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedMeals') || '[]')
    setSavedMeals(saved)
  }, [])

  const getSuggestion = async () => {
    if (showIngredientMode && selectedIngredients.length === 0) {
      setValidationMessage('Please select at least one ingredient to find recipes you can make.')
      setShowValidationModal(true)
      return
    }

    // Validate selections for quick suggestion mode
    if (!showIngredientMode) {
      const missingSelections = []
      
      if (!mealType) {
        missingSelections.push('meal preference')
      }
      if (!cookingTime) {
        missingSelections.push('cooking time')
      }
      
      if (missingSelections.length > 0) {
        const message = `Please select your ${missingSelections.join(' and ')} to get personalized meal suggestions.`
        setValidationMessage(message)
        setShowValidationModal(true)
        return
      }
    }
    
    // Track suggestion button click
    const buttonType = showIngredientMode 
      ? (leftoverMode ? 'Transform Leftovers' : 'What Can I Make') 
      : 'Get Meal Suggestion'
    const searchCriteria = {
      mealType,
      cookingTime,
      selectedIngredients: showIngredientMode ? selectedIngredients : [],
      leftoverMode: showIngredientMode ? leftoverMode : false
    }
    analytics.trackSuggestionClick(buttonType, searchCriteria)
    
    setLoading(true)
    try {
      // console.log('🔍 Querying Supabase for meals...')
      // console.log('📋 Search criteria:', { mealType, cookingTime })
      let suggestions = []

      // Only use Supabase - no fallback data
      if (supabase) {
        // console.log('🔍 Querying Supabase for meals...')
        const query = supabase.from('meals').select('*')
        
        // Only apply meal type and cooking time filters if NOT in ingredient mode
        if (!showIngredientMode) {
          if (mealType) {
            // console.log(`🍽️ Filtering by meal type: ${mealType}`)
            query.eq('meal_type', mealType)
          }
          if (cookingTime) {
            // console.log(`⏰ Filtering by cooking time: ${cookingTime}`)
            query.eq('cooking_time', cookingTime)
          }
          // console.log(`🔍 Complete query filters: meal_type=${mealType}, cooking_time=${cookingTime}`)
        } else {
          // console.log('🔍 Ingredient mode: No meal type or cooking time filters applied')
        }
        
        const { data, error } = await query.limit(50)

        if (error) {
          // console.log('❌ Supabase error:', error.message)
          // setMessage({ type: 'error', text: 'Failed to load meals from database' }) // This line was removed
          return
        } else if (data && data.length > 0) {
          // console.log(`✅ Found ${data.length} meals from Supabase`)
          // console.log('📋 Supabase meals:', data.map(m => `${m.name} (${m.meal_type}, ${m.dietary_preference})`))
          
          // Debug: Show meals that contain rice
          if (showIngredientMode && selectedIngredients.includes('Rice')) {
            // console.log('🍚 Meals that might contain rice:')
            data.forEach(meal => {
              const hasRiceInName = meal.name.toLowerCase().includes('rice')
              const hasRiceInIngredients = meal.ingredients.some(ing => ing.toLowerCase().includes('rice'))
              if (hasRiceInName || hasRiceInIngredients) {
                // console.log(`  - &quot;${meal.name}&quot; - Rice in name: ${hasRiceInName}, Rice in ingredients: ${hasRiceInIngredients}`)
                if (hasRiceInIngredients) {
                  // console.log(`    Ingredients containing rice: ${meal.ingredients.filter(ing => ing.toLowerCase().includes('rice')).join(', ')}`)
                }
              }
            })
          }
          
          // Apply ingredient filtering for Supabase results if in ingredient mode
          if (showIngredientMode && selectedIngredients.length > 0) {
            // console.log(`🔍 Starting ingredient filtering for: ${selectedIngredients.join(', ')}`)
            
            // Smart ingredient filtering with scoring
            const scoredMeals = data.map(meal => {
              let score = 0
              let matchedIngredients = []
              let excludedByOptional = false
              
              // Check each selected ingredient against the meal
              selectedIngredients.forEach(ingredient => {
                const ingredientLower = ingredient.toLowerCase()
                
                // Check if ingredient appears in meal name (higher score)
                if (meal.name.toLowerCase().includes(ingredientLower)) {
                  score += 3
                  matchedIngredients.push(ingredient)
                  // console.log(`✅ &quot;${ingredient}&quot; found in meal name: &quot;${meal.name}&quot;`)
                }
                
                // Check if ingredient appears in ingredients list (highest score)
                // But first check if it's marked as optional
                const optionalIndicators = ['(optional)', '(opt)', 'optional', 'opt']
                const isOptional = meal.ingredients.some(mealIngredient => {
                  const mealIngredientLower = mealIngredient.toLowerCase()
                  const ingredientLower = ingredient.toLowerCase()
                  
                  // Only check for optional if the ingredient is actually found in this meal ingredient
                  if (mealIngredientLower.includes(ingredientLower)) {
                    return optionalIndicators.some(indicator => mealIngredientLower.includes(indicator))
                  }
                  return false
                })
                
                if (isOptional) {
                  // If any selected ingredient is optional, exclude this recipe entirely
                  excludedByOptional = true
                  // console.log(`❌ Excluding &quot;${meal.name}&quot; - &quot;${ingredient}&quot; is marked as optional`)
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
                  // console.log(`✅ &quot;${ingredient}&quot; found in ingredients list: &quot;${meal.name}&quot;`)
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
              if (matchedIngredients.length === selectedIngredients.length) {
                score += 10
              }
              
              const result = {
                ...meal,
                ingredientScore: score,
                matchedIngredients: matchedIngredients,
                matchPercentage: (matchedIngredients.length / selectedIngredients.length) * 100
              }
              
              if (matchedIngredients.length > 0) {
                // console.log(`📊 &quot;${meal.name}&quot; - Score: ${score}, Matches: ${matchedIngredients.join(', ')}, Match %: ${result.matchPercentage}%`)
              }
              
              return result
            })
            
            // console.log(`📋 Total meals with ingredient matches: ${scoredMeals.filter(m => m.matchedIngredients.length > 0).length}`)
            
            // Debug: Show all scored meals
            // console.log('📊 All scored meals:')
            scoredMeals.forEach(meal => {
              // console.log(`  - &quot;${meal.name}&quot; - Score: ${meal.ingredientScore}, Matches: ${meal.matchedIngredients.join(', ')}, Match %: ${meal.matchPercentage}%, Excluded: ${meal.excluded}`)
            })
            
            // Debug: Show excluded meals
            const excludedMeals = scoredMeals.filter(m => m.excluded)
            if (excludedMeals.length > 0) {
              // console.log('❌ Excluded meals:')
              excludedMeals.forEach(meal => {
                // console.log(`  - &quot;${meal.name}&quot; - Excluded: ${meal.excluded}`)
              })
            }
            
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

            const thresholds = getThresholdForIngredients(selectedIngredients.length)
            // console.log(`🎯 Adaptive thresholds for ${selectedIngredients.length} ingredients: Primary ${thresholds.primary}%, Fallback ${thresholds.fallback}, Final ${thresholds.final} ingredients`)

            // First try with primary threshold
            suggestions = scoredMeals
              .filter(meal => meal.ingredientScore > 0 && !meal.excluded && meal.matchPercentage >= thresholds.primary)
              .sort((a, b) => {
                if (b.ingredientScore !== a.ingredientScore) {
                  return b.ingredientScore - a.ingredientScore
                }
                return b.matchPercentage - a.matchPercentage
              })

            // console.log(`🔍 After primary filtering (${thresholds.primary}% threshold): ${suggestions.length} meals`)
            // console.log(`🔍 Meals with score > 0: ${scoredMeals.filter(m => m.ingredientScore > 0).length}`)
            // console.log(`🔍 Meals not excluded: ${scoredMeals.filter(m => !m.excluded).length}`)
            // console.log(`🔍 Meals with match % >= ${thresholds.primary}: ${scoredMeals.filter(m => m.matchPercentage >= thresholds.primary).length}`)
            
            // Debug: Show suggestions after primary filtering
            if (suggestions.length > 0) {
              // console.log('📊 Suggestions after primary filtering:')
              suggestions.forEach(meal => {
                // console.log(`  - &quot;${meal.name}&quot; - Score: ${meal.ingredientScore}, Match %: ${meal.matchPercentage}%`)
              })
            }

            // If no results with primary threshold, try fallback threshold
            if (suggestions.length === 0) {
              // console.log(`🔄 No results with ${thresholds.primary}% threshold, trying fallback: at least ${thresholds.fallback} ingredients`)
              
              suggestions = scoredMeals
                .filter(meal => meal.ingredientScore > 0 && !meal.excluded && meal.matchedIngredients.length >= thresholds.fallback)
                .sort((a, b) => {
                  if (b.ingredientScore !== a.ingredientScore) {
                    return b.ingredientScore - a.ingredientScore
                  }
                  return b.matchPercentage - a.matchPercentage
                })

              // console.log(`🔍 After fallback filtering (at least ${thresholds.fallback} ingredients): ${suggestions.length} meals`)
            }

            // If still no results, try final threshold
            if (suggestions.length === 0) {
              // console.log(`🔄 No results with fallback threshold, trying final: at least ${thresholds.final} ingredients`)
              
              suggestions = scoredMeals
                .filter(meal => meal.ingredientScore > 0 && !meal.excluded && meal.matchedIngredients.length >= thresholds.final)
                .sort((a, b) => {
                  if (b.ingredientScore !== a.ingredientScore) {
                    return b.ingredientScore - a.ingredientScore
                  }
                  return b.matchPercentage - a.matchPercentage
                })

              // console.log(`🔍 After final filtering (at least ${thresholds.final} ingredients): ${suggestions.length} meals`)
            }
            
            // console.log(`📊 Final suggestions:`, suggestions.slice(0, 3).map(m => 
            //   `${m.name} (Score: ${m.ingredientScore}, Matches: ${m.matchedIngredients.join(', ')}, Match %: ${m.matchPercentage}%)`
            // ))
            
            // Debug: Show suggestions array length and content right before meal selection
            // console.log(`🔍 Suggestions array before meal selection: ${suggestions.length} meals`)
            // console.log(`🔍 First 3 suggestions:`, suggestions.slice(0, 3).map(m => m.name))
            
            // Check if no meals match the ingredient criteria
            if (suggestions.length === 0) {
              const thresholdInfo = selectedIngredients.length === 1 
                ? `the ingredient &quot;${selectedIngredients[0]}&quot;`
                : `at least ${thresholds.primary}%, ${thresholds.fallback}, or ${thresholds.final} ingredients`
              
              // console.log(`❌ No meals found with ${thresholdInfo}`)
              alert(`No meals found containing ${thresholdInfo} of &quot;${selectedIngredients.join(', ')}&quot;. Try selecting different ingredients.`)
              return
            }
          } else if (!showIngredientMode) {
            // Only use all Supabase meals if we're NOT in ingredient mode
            suggestions = data
            // console.log(`✅ Using ${suggestions.length} Supabase meals`)
          }
        } else {
          // console.log('⚠️ No meals found in Supabase for the selected criteria')
          // setMessage({ type: 'info', text: 'No meals found for the selected criteria. Try different filters.' }) // This line was removed
          return
        }
      } else {
        // console.log('❌ Supabase not configured')
        // setMessage({ type: 'error', text: 'Database not configured. Please contact support.' }) // This line was removed
        return
      }

      // Get current filter key to track shown meals per filter combination
      const currentFilterKey = JSON.stringify({
        mealType,
        cookingTime,
        showIngredientMode,
        selectedIngredients: showIngredientMode ? selectedIngredients : [],
        leftoverMode: showIngredientMode ? leftoverMode : false
      })

      // Get shown meals for this specific filter combination
      const shownMealsKey = `shownMeals_${btoa(currentFilterKey).slice(0, 20)}`
      const shownMeals = JSON.parse(localStorage.getItem(shownMealsKey) || '[]')
      
      // console.log(`🎯 Current filter key: ${currentFilterKey}`)
      // console.log(`👀 Already shown meals for this filter: ${shownMeals.length}`)
      
      // Debug: Show suggestions array right before filtering by shown meals
      // console.log(`🔍 Suggestions array before shown meals filter: ${suggestions.length} meals`)
      // console.log(`🔍 Suggestions array type:`, typeof suggestions)
      // console.log(`🔍 Is suggestions an array?`, Array.isArray(suggestions))
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        // console.log(`🔍 First suggestion:`, suggestions[0].name)
      }

      // Filter out already shown meals for this filter combination
      const availableMeals = suggestions.filter(meal => !shownMeals.includes(meal.id))
      // console.log(`🎯 Available meals (excluding ${shownMeals.length} shown): ${availableMeals.length}`)

      let selectedMeal

      if (availableMeals.length > 0) {
        // Randomly select from available meals
        const randomIndex = Math.floor(Math.random() * availableMeals.length)
        selectedMeal = availableMeals[randomIndex]
        
        // Add to shown meals for this filter
        const updatedShownMeals = [...shownMeals, selectedMeal.id]
        localStorage.setItem(shownMealsKey, JSON.stringify(updatedShownMeals))
        
        // console.log(`🎯 Selected meal: ${selectedMeal.name} (ID: ${selectedMeal.id})`)
        // console.log(`📊 Total shown meals for this filter: ${updatedShownMeals.length}`)
      } else if (suggestions.length > 0) {
        // All meals for this filter have been shown - reset and start over
        // console.log('🔄 All meals shown for this filter, resetting...')
        localStorage.removeItem(shownMealsKey)
        
        // Randomly select from all suggestions
        const randomIndex = Math.floor(Math.random() * suggestions.length)
        selectedMeal = suggestions[randomIndex]
        
        // Start fresh tracking
        localStorage.setItem(shownMealsKey, JSON.stringify([selectedMeal.id]))
        
        // console.log(`🎯 Reset and selected: ${selectedMeal.name} (ID: ${selectedMeal.id})`)
      } else {
        // No meals found even after fallback - this shouldn't happen due to our filtering logic
        // console.error('❌ No meals available for selection - this indicates a logic error')
        alert('No meals found for your criteria. Please try different ingredients or filters.')
        return
      }
      
      // Safety check to ensure selectedMeal exists
      if (!selectedMeal) {
        // console.error('❌ selectedMeal is undefined - this indicates a logic error')
        alert('Something went wrong. Please try again!')
        return
      }
      
      // console.log(`📝 Description: ${selectedMeal.description}`)
      
      // Store the meal and search criteria in localStorage
      localStorage.setItem('currentMeal', JSON.stringify(selectedMeal))
      localStorage.setItem('searchCriteria', JSON.stringify({
        mealType,
        cookingTime,
        showIngredientMode,
        selectedIngredients: showIngredientMode ? selectedIngredients : [],
        leftoverMode: showIngredientMode ? leftoverMode : false
      }))
      
      // Redirect to results page with meal data
      const mealParam = encodeURIComponent(JSON.stringify(selectedMeal))
      router.push(`/result?meal=${mealParam}`)

    } catch (error) {
      // console.error('Error getting suggestion:', error)
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

  // Helper function to get ingredient icon
  const getIngredientIcon = (ingredient) => {
    return ingredient === 'Rice' ? '🍚' :
           ingredient === 'Plantain' ? '🍌' :
           ingredient === 'Yam' ? '🍠' :
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

  const handleMealTypeSelection = (type) => {
    setMealType(type)
  }

  const handleCookingTimeSelection = (time) => {
    setCookingTime(time)
  }

  const handleIngredientToggle = (ingredient) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    )
  }

  const handleGetSuggestion = () => {
    if (selectedIngredients.length === 0) {
      setValidationMessage('Please select at least one ingredient to find recipes you can make.')
      setShowValidationModal(true)
      return
    }

    // Validate selections for quick suggestion mode
    if (!showIngredientMode) {
      const missingSelections = []
      
      if (!mealType) {
        missingSelections.push('meal preference')
      }
      if (!cookingTime) {
        missingSelections.push('cooking time')
      }
      
      if (missingSelections.length > 0) {
        const message = `Please select your ${missingSelections.join(' and ')} to get personalized meal suggestions.`
        setValidationMessage(message)
        setShowValidationModal(true)
        return
      }
    }
    
    // Track suggestion button click
    const buttonType = showIngredientMode 
      ? (leftoverMode ? 'Transform Leftovers' : 'What Can I Make') 
      : 'Get Meal Suggestion'
    const searchCriteria = {
      mealType,
      cookingTime,
      selectedIngredients: showIngredientMode ? selectedIngredients : [],
      leftoverMode: showIngredientMode ? leftoverMode : false
    }
    analytics.trackSuggestionClick(buttonType, searchCriteria)
    
    setLoading(true)
    getSuggestion() // Reuse the existing getSuggestion function
  }

  // Show skeleton loader while page is loading
  if (pageLoading) {
    return <HomepageSkeleton />
  }

  return (
    <div className="min-h-screen bg-pattern relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-300/30 to-orange-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-200/20 to-yellow-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        
        {/* Optimized Hero Section */}
        <div className="text-center mb-6 sm:mb-8 animate-slide-in-up">
          <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Compact Logo Icon */}
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-strong animate-pulse-glow group-hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-medium">
                    <Heart className="w-2 h-2 text-white animate-bounce-light" />
                  </div>
                </div>
              </div>
              {/* Subtle floating elements */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-300 rounded-full opacity-60 animate-float"></div>
              <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-300 rounded-full opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* Compact Typography */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-fun bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 tracking-tight hover:scale-105 transition-transform duration-300 cursor-pointer">
                MomFudy
              </h1>
              <p className="text-gray-600 text-base sm:text-lg font-medium">Your Smart Kitchen Assistant</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Never wonder what to cook again</span>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6 sm:mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
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
              <span className="hidden sm:inline">Smart Ingredients</span>
              <span className="sm:hidden">Smart</span>
            </button>
          </div>
        </div>

        {/* Popular Smart Suggestions Section - Only show when ingredient mode is active */}
        {showIngredientMode && (
          <div className="mb-6 sm:mb-8 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CircleCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-green-800 font-bold text-base">🎯 Most Popular Feature</h3>
                  <p className="text-green-600 text-sm">72% of users prefer ingredient-based suggestions!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          {pageLoading ? (
            <HomepageSkeleton />
          ) : (
            <>
              {!showIngredientMode ? (
                <div className="card mb-8 sm:mb-12">
                  <div className="space-y-16">
                    {/* Meal Type - Enhanced Prominence */}
                    <div className="relative animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
                      {/* Attention-grabbing header */}
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '2s' }}>
                            What is your meal preference?
                          </h3>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium px-2">
                          Choose the perfect meal for your current mood and time of day!
                        </p>
                      </div>
                      
                      {/* Enhanced meal type options */}
                      <div className="flex justify-center">
                        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                          {mealTypes.map((type) => (
                            <button
                              key={type.value}
                              onClick={() => handleMealTypeSelection(type.value)}
                              className={`relative rounded-2xl p-4 transition-all duration-300 text-center ${
                                mealType === type.value 
                                  ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 shadow-lg transform scale-105' 
                                  : 'bg-white border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md hover:scale-102'
                              }`}
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <div className={`text-3xl ${mealType === type.value ? 'transform scale-110 animate-bounce' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                                  {type.emoji}
                                </div>
                                <span className={`text-sm font-semibold ${
                                  mealType === type.value ? 'text-indigo-800' : 'text-gray-700'
                                }`}>
                                  {type.label}
                                </span>
                              </div>
                              {mealType === type.value && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cooking Time - Enhanced Prominence */}
                    <div className="relative animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
                                            {/* Attention-grabbing header */}
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '2s' }}>
                            How much time do you have?
                          </h3>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium px-2">
                          This helps us find the perfect recipe for your schedule!
                        </p>
                      </div>
                      
                      {/* Enhanced cooking time options */}
                      <div className="flex justify-center">
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl">
                          {cookingTimes.map((time) => (
                            <button
                              key={time.value}
                              onClick={() => handleCookingTimeSelection(time.value)}
                              className={`relative rounded-xl sm:rounded-2xl p-3 sm:p-6 transition-all duration-300 text-center group ${
                                cookingTime === time.value 
                                  ? 'bg-gradient-to-br from-orange-100 to-red-100 border-2 sm:border-3 border-orange-400 shadow-lg sm:shadow-xl transform scale-105' 
                                  : 'bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-md sm:hover:shadow-lg hover:scale-102'
                              }`}
                            >
                              {/* Animated background for selected state */}
                              {cookingTime === time.value && (
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-xl sm:rounded-2xl animate-pulse"></div>
                              )}
                              
                              <div className="relative z-10 flex flex-col items-center space-y-2 sm:space-y-3">
                                <div className={`text-2xl sm:text-4xl ${cookingTime === time.value ? 'transform scale-110 animate-bounce' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                                  {time.emoji}
                                </div>
                                <div className="space-y-0.5 sm:space-y-1">
                                  <div className={`text-sm sm:text-lg font-bold ${
                                    cookingTime === time.value ? 'text-orange-800' : 'text-gray-800'
                                  }`}>
                                    {time.label}
                                  </div>

                                </div>
                              </div>
                              
                              {/* Selection indicator */}
                              {cookingTime === time.value && (
                                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                                  <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                                </div>
                              )}
                              
                              {/* Hover glow effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                          ))}
                        </div>
                      </div>
                      

                    </div>



                    {/* Get Meal Suggestion Button */}
                    <div className="flex flex-col items-center mt-12">
                      {/* Subtle selection status */}
                      {(mealType || cookingTime) && (
                        <div className="mb-4 text-center">
                          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                            <span>Ready with:</span>
                            {mealType && (
                              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-medium">
                                {mealTypes.find(t => t.value === mealType)?.label}
                              </span>
                            )}
                            {cookingTime && (
                              <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md font-medium">
                                {cookingTimes.find(t => t.value === cookingTime)?.label}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Main Action Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={getSuggestion}
                          disabled={leftoverMode || loading}
                          className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                            leftoverMode
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : loading
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white cursor-wait'
                              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                          }`}
                        >
                          {loading ? (
                            <>
                              <div className="loading-spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                              <span className="text-base whitespace-nowrap font-semibold text-white">
                                {leftoverMode ? 'Transforming Leftovers...' : 'Finding Perfect Meal...'}
                              </span>
                            </>
                          ) : (
                            <>
                              {leftoverMode ? (
                                <Recycle className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" />
                              ) : (
                                <Flame className="w-5 h-5 animate-pulse text-white" />
                              )}
                              <span className="text-base whitespace-nowrap font-semibold text-white">
                                {leftoverMode ? 'Coming Soon' : 'Get Meal Suggestion'}
                              </span>
                              {!leftoverMode && (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 text-white" />
                              )}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card mb-8 sm:mb-12">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      leftoverMode 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25'
                    }`}>
                      {leftoverMode ? (
                        <Refrigerator className="w-6 h-6 text-white" />
                      ) : (
                        <CircleCheck className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="heading-md text-gray-800">
                        {leftoverMode ? 'Transform Your Leftovers' : 'What ingredients do you have?'}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {leftoverMode 
                          ? 'Turn yesterday\'s meal into today\'s delicious dish'
                          : 'Select ingredients to find recipes you can make'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Compact Mode Toggle */}
                  <div className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex justify-center mb-6">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 inline-flex shadow-lg border border-gray-100">
                        <button
                          onClick={() => {
                            setLeftoverMode(false)
                            setSelectedIngredients([])
                          }}
                          className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2.5 ${
                            !leftoverMode 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md transform scale-105' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Utensils className={`w-4 h-4 ${!leftoverMode ? 'text-white' : 'text-gray-400'}`} />
                          <span className="hidden sm:inline text-sm">Fresh</span>
                          <span className="sm:hidden text-sm">Fresh</span>
                        </button>
                        
                        <button
                          disabled
                          className="px-6 py-2.5 rounded-xl font-medium text-gray-400 cursor-not-allowed flex items-center gap-2.5 relative"
                        >
                          <Recycle className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm">Leftovers</span>
                          <span className="sm:hidden text-sm">Leftovers</span>
                          
                          {/* Coming Soon Badge */}
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                            SOON
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ingredient Selection - Improved Design */}
                  <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="card">
                      {/* Enhanced Header */}
                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Search className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">What ingredients do you have?</h3>
                        </div>
                        <p className="text-gray-600 text-sm">Select your ingredients and we&apos;ll find perfect recipes for you!</p>
                      </div>

                      {/* Search Bar - More prominent */}
                      <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search ingredients or type to add custom ingredient..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && searchTerm.trim()) {
                              const customIngredient = searchTerm.trim()
                              if (!selectedIngredients.includes(customIngredient) && !commonIngredients.includes(customIngredient)) {
                                setSelectedIngredients(prev => [...prev, customIngredient])
                                setSearchTerm('')
                              }
                            }
                          }}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                        />
                        {searchTerm.trim() && !commonIngredients.includes(searchTerm.trim()) && !selectedIngredients.includes(searchTerm.trim()) && (
                          <button
                            onClick={() => {
                              const customIngredient = searchTerm.trim()
                              setSelectedIngredients(prev => [...prev, customIngredient])
                              setSearchTerm('')
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors duration-200"
                          >
                            Add
                          </button>
                        )}
                      </div>

                      {/* Selected Ingredients Display */}
                      {selectedIngredients.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <CircleCheck className="w-4 h-4 text-green-500" />
                            Selected Ingredients ({selectedIngredients.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedIngredients.map((ingredient, index) => (
                              <div
                                key={index}
                                className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm"
                              >
                                <span className="text-sm">{getIngredientIcon(ingredient)}</span>
                                <span className="text-green-700 text-sm font-medium">{ingredient}</span>
                                <button
                                  onClick={() => setSelectedIngredients(prev => prev.filter((_, i) => i !== index))}
                                  className="text-green-600 hover:text-green-800 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ingredients Grid - Better spacing and organization */}
                      <div className="space-y-4">
                        {/* Available Ingredients Section */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">All Available Ingredients</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {filteredIngredients.map((ingredient) => (
                              <button
                                key={ingredient}
                                onClick={() => handleIngredientToggle(ingredient)}
                                className={`group p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                                  selectedIngredients.includes(ingredient)
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md'
                                    : 'bg-white border-gray-200 hover:border-green-200'
                                }`}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <span className="text-2xl">{getIngredientIcon(ingredient)}</span>
                                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">{ingredient}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Clear All Button - Only show when ingredients are selected */}
                      {selectedIngredients.length > 0 && (
                        <div className="flex justify-center mt-6">
                          <button
                            onClick={() => setSelectedIngredients([])}
                            className="px-6 py-3 text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Clear All
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Improved Get Meal Suggestion Button */}
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={getSuggestion}
                      disabled={loading || (leftoverMode ? true : selectedIngredients.length === 0)}
                      className={`relative px-8 py-4 flex items-center justify-center gap-3 group transition-all duration-300 transform hover:scale-105 min-w-[280px] font-bold text-lg rounded-2xl shadow-xl border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        leftoverMode
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-300/20 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/25'
                      }`}
                    >
                      {/* Subtle background glow */}
                      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl ${
                        leftoverMode ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-green-400 to-emerald-400'
                      }`}></div>
                      
                      {loading ? (
                        <>
                          <div className="loading-spinner w-5 h-5 border-2 border-white/30 border-t-white"></div>
                          <span className="text-base whitespace-nowrap font-semibold text-white">
                            {leftoverMode ? 'Transforming Leftovers...' : 'Finding Perfect Recipes...'}
                          </span>
                        </>
                      ) : (
                        <>
                          {leftoverMode ? (
                            <Recycle className="w-6 h-6 text-gray-300" />
                          ) : (
                            <CircleCheck className="w-5 h-5 text-white" />
                          )}
                          <span className="text-base whitespace-nowrap font-semibold text-white">
                            {leftoverMode ? 'Coming Soon' : `Find Smart Recipes (${selectedIngredients.length} ingredients)`}
                          </span>
                          {!leftoverMode && (
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 text-white" />
                          )}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Stats */}
                  {!leftoverMode && selectedIngredients.length > 0 && (
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-700 font-medium">
                          {selectedIngredients.length} ingredient{selectedIngredients.length !== 1 ? 's' : ''} selected • Smart suggestions enabled
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}


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

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-in-up overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Complete Your Selection</h3>
                  <p className="text-sm text-gray-600">Let&apos;s find the perfect meal for you</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-gray-700 text-base leading-relaxed">
                  {validationMessage}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowValidationModal(false)
                    // Scroll to top to show selection areas
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Go to Selections
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
