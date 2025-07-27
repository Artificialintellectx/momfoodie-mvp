import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ArrowLeft, ChefHat, Heart, Sparkles, Clock } from 'lucide-react'
import { dietaryPreferences } from '../lib/data'

export default function NoResults() {
  const router = useRouter()
  const { dietaryPreference, mealType, cookingTime, ingredients } = router.query
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setPageLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const getDietaryPreferenceLabel = (value) => {
    const pref = dietaryPreferences.find(p => p.value === value)
    return pref ? pref.label : value
  }

  const getDietaryPreferenceEmoji = (value) => {
    const pref = dietaryPreferences.find(p => p.value === value)
    return pref ? pref.emoji : '🍽️'
  }

  const goBack = () => {
    router.back()
  }

  const goHome = () => {
    router.push('/')
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-strong">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-fun bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              MomFudy
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
          
          {/* Sad Chef Icon */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Oops! No recipes found 😔
          </h2>

          {/* Selected Criteria */}
          {(dietaryPreference && dietaryPreference !== 'any') || ingredients ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-100">
              <p className="text-gray-700 mb-2">
                <span className="font-medium">You selected:</span>
              </p>
              {dietaryPreference && dietaryPreference !== 'any' && (
                <div className="flex items-center justify-center gap-2 text-lg mb-2">
                  <span className="text-2xl">{getDietaryPreferenceEmoji(dietaryPreference)}</span>
                  <span className="font-semibold text-gray-800">
                    {getDietaryPreferenceLabel(dietaryPreference)}
                  </span>
                </div>
              )}
              {ingredients && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">Ingredients:</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {ingredients.split(',').map((ingredient, index) => (
                      <span key={index} className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-orange-200">
                        {ingredient.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {mealType && (
                <div className="mt-2 text-sm text-gray-600">
                  + {mealType} meal
                </div>
              )}
              {cookingTime && (
                <div className="mt-1 text-sm text-gray-600">
                  + {cookingTime} cooking time
                </div>
              )}
            </div>
          ) : null}

          {/* Message */}
          <div className="mb-8">
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              {ingredients 
                ? `We&apos;re sorry, but we don&apos;t have any recipes that use your selected ingredients yet.`
                : `We&apos;re sorry, but we don&apos;t have any recipes that match your dietary preference yet.`
              }
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              Don&apos;t worry! We&apos;re constantly adding new recipes to our platform, and we&apos;ve noted your request for more{' '}
              <span className="font-semibold text-gray-800">
                {ingredients 
                  ? 'ingredient-based recipes'
                  : dietaryPreference && dietaryPreference !== 'any' 
                    ? getDietaryPreferenceLabel(dietaryPreference) 
                    : 'diverse'
                }
              </span>{' '}
              options.
            </p>
          </div>

          {/* What We're Doing */}
          <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              What we&apos;re working on
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span>Expanding our recipe database</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Adding more dietary options</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span>Improving recipe variety</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span>User feedback integration</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={goHome}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <ChefHat className="w-5 h-5" />
              Try Different Filters
            </button>
            <button
              onClick={goBack}
              className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Encouraging Message */}
          <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <p className="text-gray-700 text-sm">
              <Heart className="w-4 h-4 inline text-green-500 mr-1" />
              <span className="font-medium">Pro tip:</span> Try selecting &quot;Any&quot; dietary preference to see all available recipes, or explore different meal types and cooking times!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 