import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fallbackMeals, mealTypes, cookingTimes, dietaryPreferences } from '../lib/data'
import Link from 'next/link'
import { 
  Plus, 
  Save, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  ChefHat,
  Clock,
  Users,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { AdminPageSkeleton } from '../components/SkeletonLoader'

export default function Admin() {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [editingMeal, setEditingMeal] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dietaryFilter, setDietaryFilter] = useState('')
  const [groupBy, setGroupBy] = useState('none') // 'none', 'meal_type', 'dietary_preference', 'nested'
  const [message, setMessage] = useState({ type: '', text: '' })
  const [lastUpdatedId, setLastUpdatedId] = useState(null)
  const [lastLoadTime, setLastLoadTime] = useState(null)
  const [currentTime, setCurrentTime] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meal_type: '',
    dietary_preference: 'any',
    cooking_time: '',
    prep_time: '',
    difficulty: 'easy',
    ingredients: [''],
    instructions: [''],
    cuisine_type: 'Nigerian'
  })

  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    console.log('🔍 Admin: Component mounted, loading recipes...')
    // Force fresh data on mount
    loadRecipes()
    
    // Set current time on client side only
    setCurrentTime(new Date().toLocaleTimeString())
    
    // Also reload when window gains focus (in case user switches tabs)
    const handleFocus = () => {
      console.log('🔄 Admin: Window focused, reloading recipes...')
      loadRecipes()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadRecipes = async () => {
    setLoading(true)
    try {
      console.log('🔍 Admin: Loading recipes...')
      console.log('🔍 Admin: Supabase client available:', !!supabase)
      console.log('🔍 Admin: Environment variables:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      })
      
      if (supabase) {
        console.log('🔍 Admin: Querying Supabase meals table...')
        
        // Force cache busting by adding a timestamp and using different ordering
        const timestamp = Date.now()
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .order('id', { ascending: true }) // Change ordering to force fresh query
          .limit(1000) // Force fresh data
        
        console.log('🔍 Admin: Supabase response:', { data, error })
        console.log('🔍 Admin: Timestamp:', timestamp)
        
        if (error) {
          console.error('❌ Admin: Supabase error:', error)
          throw error
        }
        
        console.log(`✅ Admin: Found ${data?.length || 0} recipes from Supabase`)
        console.log('🔍 Admin: Recipe names:', data?.map(r => r.name))
        
        // Force a complete state refresh with multiple steps
        setMeals([]) // Clear first
        console.log('🔄 Admin: Cleared recipes state')
        
        // Wait a bit, then set new data
        setTimeout(() => {
          setMeals(data || [])
          setLastLoadTime(new Date().toLocaleTimeString())
          console.log('🔄 Admin: Set new recipes data:', data?.length || 0, 'recipes')
          console.log('🔄 Admin: New recipe names:', data?.map(r => r.name))
        }, 200)
        
      } else {
        console.log('⚠️ Admin: No Supabase client, using fallback data')
        // Fallback to local data
        setMeals(fallbackMeals)
      }
    } catch (error) {
      console.error('❌ Admin: Error loading recipes:', error)
      setMessage({ type: 'error', text: 'Failed to load recipes' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      meal_type: '',
      dietary_preference: 'any',
      cooking_time: '',
      prep_time: '',
      difficulty: 'easy',
      ingredients: [''],
      instructions: [''],
      cuisine_type: 'Nigerian'
    })
    setEditingMeal(null)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const errors = []
    
    if (!formData.name?.trim()) errors.push('Recipe name is required')
    if (!formData.description?.trim()) errors.push('Description is required')
    if (!formData.meal_type) errors.push('Meal type is required')
    if (!formData.cooking_time) errors.push('Cooking time is required')
    if (!formData.prep_time?.trim()) errors.push('Prep time is required')
    
    if (!formData.ingredients?.length || !Array.isArray(formData.ingredients) || formData.ingredients.every(i => !i.trim())) {
      errors.push('At least one ingredient is required')
    }
    
    if (!formData.instructions?.length || !Array.isArray(formData.instructions) || formData.instructions.every(i => !i.trim())) {
      errors.push('At least one instruction is required')
    }

    return errors
  }

  const saveRecipe = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') })
      return
    }

    setLoading(true)
    try {
      console.log('🔍 Admin: Saving recipe...')
      console.log('🔍 Admin: Form data:', formData)
      console.log('🔍 Admin: Supabase client available:', !!supabase)
      
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions.filter(i => i.trim())
      }

      console.log('🔍 Admin: Processed recipe data:', recipeData)

      if (editingMeal) {
        // Update existing recipe
        console.log('🔍 Admin: Updating existing recipe with ID:', editingMeal.id)
        if (supabase) {
          const { data, error } = await supabase
            .from('meals')
            .update(recipeData)
            .eq('id', editingMeal.id)
          
          console.log('🔍 Admin: Update response:', { data, error })
          if (error) {
            console.error('❌ Admin: Supabase update error details:', error)
            throw new Error(`Database update failed: ${error.message || error.details || 'Unknown error'}`)
          }
        } else {
          // Update local data
          setMeals(prev => prev.map(r => r.id === editingMeal.id ? { ...r, ...recipeData } : r))
        }
        setMessage({ type: 'success', text: 'Recipe updated successfully!' })
        setLastUpdatedId(editingMeal.id) // Track which recipe was updated
        
        // Clear the highlight after 3 seconds
        setTimeout(() => {
          setLastUpdatedId(null)
        }, 3000)
      } else {
        // Create new recipe
        console.log('🔍 Admin: Creating new recipe...')
        if (supabase) {
          const { data, error } = await supabase
            .from('meals')
            .insert([recipeData])
          
          console.log('🔍 Admin: Insert response:', { data, error })
          if (error) {
            console.error('❌ Admin: Supabase insert error details:', error)
            throw new Error(`Database insert failed: ${error.message || error.details || 'Unknown error'}`)
          }
        } else {
          // Add to local data
          const newRecipe = {
            ...recipeData,
            id: Date.now() // Simple ID for local storage
          }
          setMeals(prev => [newRecipe, ...prev])
        }
        setMessage({ type: 'success', text: 'Recipe created successfully!' })
      }

      // Clear the form and editing state
      resetForm()
      setShowForm(false)
      
      // Force reload recipes from database
      console.log('🔄 Admin: Reloading recipes after save...')
      await loadRecipes()
      
      // Double-check the specific recipe was updated
      if (editingMeal && supabase) {
        console.log('🔍 Admin: Verifying update for recipe ID:', editingMeal.id)
        const { data: verifyData, error: verifyError } = await supabase
          .from('meals')
          .select('*')
          .eq('id', editingMeal.id)
          .single()
        
        if (verifyError) {
          console.error('❌ Admin: Verification failed:', verifyError)
        } else {
          console.log('✅ Admin: Verified updated recipe:', verifyData)
        }
      }
      
    } catch (error) {
      console.error('❌ Admin: Error saving recipe:', error)
      setMessage({ type: 'error', text: 'Failed to save recipe' })
    } finally {
      setLoading(false)
    }
  }

  const deleteRecipe = async (id) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    setLoading(true)
    try {
      if (supabase) {
        const { error } = await supabase
          .from('meals')
          .delete()
          .eq('id', id)
        
        if (error) throw error
      } else {
        setMeals(prev => prev.filter(r => r.id !== id))
      }
      
      setMessage({ type: 'success', text: 'Recipe deleted successfully!' })
      loadRecipes()
    } catch (error) {
      console.error('Error deleting recipe:', error)
      setMessage({ type: 'error', text: 'Failed to delete recipe' })
    } finally {
      setLoading(false)
    }
  }

  const editRecipe = (recipe) => {
    setFormData({
      name: recipe.name,
      description: recipe.description,
      meal_type: recipe.meal_type,
      dietary_preference: recipe.dietary_preference,
      cooking_time: recipe.cooking_time,
      prep_time: recipe.prep_time,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [''],
      instructions: recipe.instructions.length > 0 ? recipe.instructions : [''],
      cuisine_type: recipe.cuisine_type || 'Nigerian'
    })
    setEditingMeal(recipe)
    setShowForm(true)
  }

  const filteredRecipes = meals.filter(recipe => {
    // Text search filter
    const matchesSearch = !searchTerm || 
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.meal_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Dietary preference filter
    const matchesDietary = !dietaryFilter || recipe.dietary_preference === dietaryFilter
    
    return matchesSearch && matchesDietary
  })

  // Group recipes based on selected grouping option
  const groupedRecipes = (() => {
    if (groupBy === 'none') {
      return { 'All Recipes': filteredRecipes }
    }
    
    if (groupBy === 'meal_type') {
      const groups = {}
      filteredRecipes.forEach(recipe => {
        const mealType = recipe.meal_type || 'Unknown'
        if (!groups[mealType]) {
          groups[mealType] = []
        }
        groups[mealType].push(recipe)
      })
      return groups
    }
    
    if (groupBy === 'dietary_preference') {
      const groups = {}
      filteredRecipes.forEach(recipe => {
        const dietary = recipe.dietary_preference || 'any'
        const dietaryLabel = dietaryPreferences.find(pref => pref.value === dietary)?.label || dietary
        if (!groups[dietaryLabel]) {
          groups[dietaryLabel] = []
        }
        groups[dietaryLabel].push(recipe)
      })
      return groups
    }
    
    if (groupBy === 'nested') {
      const groups = {}
      filteredRecipes.forEach(recipe => {
        const mealType = recipe.meal_type || 'Unknown'
        const dietary = recipe.dietary_preference || 'any'
        const dietaryLabel = dietaryPreferences.find(pref => pref.value === dietary)?.label || dietary
        
        if (!groups[mealType]) {
          groups[mealType] = {}
        }
        if (!groups[mealType][dietaryLabel]) {
          groups[mealType][dietaryLabel] = []
        }
        groups[mealType][dietaryLabel].push(recipe)
      })
      return groups
    }
    
    return { 'All Recipes': filteredRecipes }
  })()

  // Show skeleton loader while page is loading
  if (pageLoading) {
    return <AdminPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-medium">
                                  <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-fun bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">MomFudy Admin</h1>
            </div>
          <p className="text-gray-600">Manage your recipe database</p>
          <div className="mt-4">
            <Link
              href="/test-supabase-admin" 
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              🔧 Test Supabase Connection
            </Link>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Dietary Preferences</option>
              {dietaryPreferences.map(pref => (
                <option key={pref.value} value={pref.value}>
                  {pref.emoji} {pref.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="btn-primary flex items-center gap-2 px-6 py-2"
          >
            <Plus className="w-5 h-5" />
            Add New Recipe
          </button>
          <button
            onClick={() => {
              console.log('🔄 Admin: Manual refresh triggered')
              // Force complete reload by clearing state first
              setMeals([])
              setLoading(true)
              setTimeout(() => {
                loadRecipes()
              }, 100)
            }}
            className="btn-secondary flex items-center gap-2 px-6 py-2"
          >
            <Clock className="w-5 h-5" />
            Force Refresh
          </button>
        </div>

        {/* Grouping Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Group by:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setGroupBy('none')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  groupBy === 'none'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                No Grouping
              </button>
              <button
                onClick={() => setGroupBy('meal_type')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  groupBy === 'meal_type'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Meal Type
              </button>
              <button
                onClick={() => setGroupBy('dietary_preference')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  groupBy === 'dietary_preference'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Dietary Preference
              </button>
              <button
                onClick={() => setGroupBy('nested')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  groupBy === 'nested'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Meal Type + Dietary
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Total: {filteredRecipes.length} recipes</span>
            {groupBy !== 'none' && (
              <span>• {Object.keys(groupedRecipes).length} groups</span>
            )}
          </div>
        </div>

        {/* Recipe Form */}
        {showForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingMeal ? 'Edit Recipe' : 'Create New Recipe'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Jollof Rice"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type *</label>
                <select
                  value={formData.meal_type}
                  onChange={(e) => handleInputChange('meal_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select meal type</option>
                  {mealTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Time *</label>
                <select
                  value={formData.cooking_time}
                  onChange={(e) => handleInputChange('cooking_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select cooking time</option>
                  {cookingTimes.map(time => (
                    <option key={time.value} value={time.value}>
                      {time.emoji} {time.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time *</label>
                <input
                  type="text"
                  value={formData.prep_time}
                  onChange={(e) => handleInputChange('prep_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 30 mins"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Preference
                  <span className="text-xs text-gray-500 ml-1">(Select the most appropriate option)</span>
                </label>
                <select
                  value={formData.dietary_preference}
                  onChange={(e) => handleInputChange('dietary_preference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {dietaryPreferences.map(pref => (
                    <option key={pref.value} value={pref.value}>
                      {pref.emoji} {pref.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-gray-600">
                  <strong>Dietary Preference Guide:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• <strong>Any:</strong> Suitable for all diets</li>
                    <li>• <strong>Vegetarian:</strong> No meat or fish, but may include dairy/eggs</li>
                    <li>• <strong>Vegan:</strong> No animal products at all</li>
                    <li>• <strong>Halal:</strong> No pork or alcohol, follows Islamic dietary laws</li>
                    <li>• <strong>Pescatarian:</strong> Fish and seafood only, no other meat</li>
                    <li>• <strong>Lacto-Vegetarian:</strong> Dairy allowed, no meat/fish</li>
                    <li>• <strong>Gluten-Free:</strong> No wheat, barley, rye, or bread products</li>
                    <li>• <strong>Low-Sodium:</strong> Minimal salt, no seasoning cubes</li>
                    <li>• <strong>Diabetic-Friendly:</strong> Low glycemic index foods</li>
                    <li>• <strong>Low-Fat:</strong> Minimal oil and high-fat ingredients</li>
                    <li>• <strong>High-Protein:</strong> Rich in protein from meat, fish, eggs, beans, or dairy</li>
                    <li>• <strong>Soft Foods:</strong> Easy to chew and digest (porridge, soup, yam)</li>
                    <li>• <strong>High-Fiber:</strong> Rich in fiber (beans, vegetables, whole grains)</li>
                    <li>• <strong>Traditional:</strong> Classic Nigerian dishes (jollof, egusi, amala)</li>
                    <li>• <strong>Rice-Based:</strong> Meals centered around rice (jollof, fried rice, white rice)</li>
                    <li>• <strong>Swallow-Based:</strong> Starchy accompaniments (amala, eba, pounded yam, fufu)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Describe the recipe..."
              />
            </div>

            {/* Ingredients */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients *</label>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Rice (2 cups, washed)"
                  />
                  <button
                    onClick={() => removeArrayItem('ingredients', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('ingredients')}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Ingredient
              </button>
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructions *</label>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white text-sm rounded-full flex items-center justify-center font-medium mt-2">
                    {index + 1}
                  </span>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe this step..."
                  />
                  <button
                    onClick={() => removeArrayItem('instructions', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('instructions')}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                onClick={saveRecipe}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingMeal ? 'Update Recipe' : 'Save Recipe'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="card mb-4 bg-yellow-50 border-yellow-200">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info</h3>
          <div className="text-xs text-yellow-700">
            <p>Total recipes in state: {meals.length}</p>
            <p>Filtered recipes: {filteredRecipes.length}</p>
            <p>Last updated ID: {lastUpdatedId || 'None'}</p>
            <p>Last load time: {lastLoadTime || 'Never'}</p>
            <p>Current time: {currentTime || 'Loading...'}</p>
          </div>
        </div>

        {/* Recipes List */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recipe Database ({filteredRecipes.length})</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-500" />
              <p>Loading recipes...</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChefHat className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recipes found</p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupBy === 'nested' ? (
                // Nested grouping display
                Object.entries(groupedRecipes).map(([mealType, dietaryGroups]) => (
                  <div key={mealType} className="space-y-6">
                    {/* Meal Type Header */}
                    <div className="flex items-center justify-between border-b-2 border-blue-200 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                          <span className="text-xl">🍽️</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {mealType}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {Object.values(dietaryGroups).flat().length} total recipes
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dietary Preference Groups */}
                    <div className="space-y-6 ml-4">
                      {Object.entries(dietaryGroups).map(([dietaryLabel, recipes]) => (
                        <div key={dietaryLabel} className="space-y-4">
                          {/* Dietary Preference Header */}
                          <div className="flex items-center justify-between border-b border-green-200 pb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                <span className="text-lg">🥗</span>
                              </div>
                              <h4 className="text-lg font-semibold text-gray-700">
                                {dietaryLabel}
                              </h4>
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                                {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Recipes Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recipes.map((recipe) => (
                              <div 
                                key={`${recipe.id}-${recipe.updated_at || Date.now()}`} 
                                className={`border rounded-lg p-4 transition-all duration-300 ${
                                  recipe.id === lastUpdatedId 
                                    ? 'border-green-500 bg-green-50 shadow-lg' 
                                    : 'border-gray-200 hover:border-primary-300'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                                  <div className="flex items-center gap-1">
                                    {recipe.id === lastUpdatedId && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        Updated
                                      </span>
                                    )}
                                    <button
                                      onClick={() => editRecipe(recipe)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteRecipe(recipe.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                                
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {recipe.meal_type}
                                  </span>
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                    {recipe.difficulty}
                                  </span>
                                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                    {recipe.prep_time}
                                  </span>
                                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                                    {dietaryPreferences.find(pref => pref.value === recipe.dietary_preference)?.emoji || '🍽️'}
                                    {dietaryPreferences.find(pref => pref.value === recipe.dietary_preference)?.label || recipe.dietary_preference}
                                  </span>
                                </div>
                                
                                <div className="mt-3 text-xs text-gray-500">
                                  {recipe.ingredients.length} ingredients • {recipe.instructions.length} steps
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Regular grouping display
                Object.entries(groupedRecipes).map(([groupName, recipes]) => (
                  <div key={groupName} className="space-y-4">
                    {/* Group Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          groupBy === 'meal_type' 
                            ? 'bg-blue-100 text-blue-600' 
                            : groupBy === 'dietary_preference'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {groupBy === 'meal_type' ? (
                            <span className="text-lg">🍽️</span>
                          ) : groupBy === 'dietary_preference' ? (
                            <span className="text-lg">🥗</span>
                          ) : (
                            <ChefHat className="w-4 h-4" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {groupName}
                        </h3>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Recipes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recipes.map((recipe) => (
                        <div 
                          key={`${recipe.id}-${recipe.updated_at || Date.now()}`} 
                          className={`border rounded-lg p-4 transition-all duration-300 ${
                            recipe.id === lastUpdatedId 
                              ? 'border-green-500 bg-green-50 shadow-lg' 
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                            <div className="flex items-center gap-1">
                              {recipe.id === lastUpdatedId && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  Updated
                                </span>
                              )}
                              <button
                                onClick={() => editRecipe(recipe)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteRecipe(recipe.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                          
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {recipe.meal_type}
                            </span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              {recipe.difficulty}
                            </span>
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              {recipe.prep_time}
                            </span>
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                              {dietaryPreferences.find(pref => pref.value === recipe.dietary_preference)?.emoji || '🍽️'}
                              {dietaryPreferences.find(pref => pref.value === recipe.dietary_preference)?.label || recipe.dietary_preference}
                            </span>
                          </div>
                          
                          <div className="mt-3 text-xs text-gray-500">
                            {recipe.ingredients.length} ingredients • {recipe.instructions.length} steps
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 