import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fallbackMeals, mealTypes, cookingTimes, dietaryPreferences } from '../lib/data'
import { analyticsDashboard } from '../lib/analytics'
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
  AlertCircle,
  Star,
  BarChart3
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
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    visits: null,
    suggestions: null,
    averageTime: 0,
    returnUsage: null,
    feedback: null
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsPeriod, setAnalyticsPeriod] = useState(30)
  
  // IP Blacklist state
  const [blacklistedIPs, setBlacklistedIPs] = useState([])
  const [blacklistLoading, setBlacklistLoading] = useState(false)
  const [newIPAddress, setNewIPAddress] = useState('')
  const [newIPDescription, setNewIPDescription] = useState('')
  const [currentIP, setCurrentIP] = useState('')
  const [deviceMarked, setDeviceMarked] = useState(false)

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
    loadAnalytics()
    loadBlacklistedIPs()
    getCurrentIP()
    checkDeviceMarked()
    
    // Set current time on client side only
    setCurrentTime(new Date().toLocaleTimeString())
    
    // Also reload when window gains focus (in case user switches tabs)
    const handleFocus = () => {
      console.log('🔄 Admin: Window focused, reloading recipes...')
      loadRecipes()
      loadAnalytics()
      loadBlacklistedIPs()
      getCurrentIP()
      checkDeviceMarked()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [analyticsPeriod])

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      console.log('📊 Loading analytics data...')
      
      const [visits, suggestions, averageTime, returnUsage, feedback] = await Promise.all([
        analyticsDashboard.getWebsiteVisits(analyticsPeriod),
        analyticsDashboard.getSuggestionClicks(analyticsPeriod),
        analyticsDashboard.getAverageTimeSpent(analyticsPeriod),
        analyticsDashboard.getReturnUsage(analyticsPeriod),
        analyticsDashboard.getUserFeedback(analyticsPeriod)
      ])

      setAnalyticsData({
        visits,
        suggestions,
        averageTime,
        returnUsage,
        feedback
      })
      
      console.log('✅ Analytics data loaded')
    } catch (error) {
      console.error('❌ Error loading analytics:', error)
      setMessage({ type: 'error', text: 'Failed to load analytics data' })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const loadBlacklistedIPs = async () => {
    setBlacklistLoading(true)
    try {
      const ips = await analyticsDashboard.getBlacklistedIPs()
      setBlacklistedIPs(ips)
    } catch (error) {
      console.error('❌ Error loading blacklisted IPs:', error)
      setMessage({ type: 'error', text: 'Failed to load blacklisted IPs' })
    } finally {
      setBlacklistLoading(false)
    }
  }

  const addBlacklistedIP = async () => {
    if (!newIPAddress.trim()) {
      setMessage({ type: 'error', text: 'Please enter an IP address' })
      return
    }

    try {
      const result = await analyticsDashboard.addBlacklistedIP(newIPAddress.trim(), newIPDescription.trim())
      if (result.success) {
        setMessage({ type: 'success', text: 'IP address added to blacklist' })
        setNewIPAddress('')
        setNewIPDescription('')
        loadBlacklistedIPs()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add IP address' })
      }
    } catch (error) {
      console.error('❌ Error adding blacklisted IP:', error)
      setMessage({ type: 'error', text: 'Failed to add IP address' })
    }
  }

  const removeBlacklistedIP = async (ipAddress) => {
    try {
      const result = await analyticsDashboard.removeBlacklistedIP(ipAddress)
      if (result.success) {
        setMessage({ type: 'success', text: 'IP address removed from blacklist' })
        loadBlacklistedIPs()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to remove IP address' })
      }
    } catch (error) {
      console.error('❌ Error removing blacklisted IP:', error)
      setMessage({ type: 'error', text: 'Failed to remove IP address' })
    }
  }

  const getCurrentIP = async () => {
    try {
      const response = await fetch('/api/get-ip')
      const data = await response.json()
      setCurrentIP(data.ip)
    } catch (error) {
      console.error('Error getting current IP:', error)
      setCurrentIP('unknown')
    }
  }

  const checkDeviceMarked = () => {
    if (typeof window !== 'undefined') {
      const marked = localStorage.getItem('momfoodie_my_device') === 'true'
      setDeviceMarked(marked)
    }
  }

  const markCurrentDevice = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('momfoodie_my_device', 'true')
      setDeviceMarked(true)
      setMessage({ type: 'success', text: 'Current device marked as "my device" - excluded from analytics' })
    }
  }

  const unmarkCurrentDevice = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('momfoodie_my_device')
      setDeviceMarked(false)
      setMessage({ type: 'success', text: 'Current device unmarked - will be tracked in analytics' })
    }
  }

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

        {/* Analytics Dashboard */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">📊 Analytics Dashboard</h2>
            <div className="flex items-center gap-4">
              <select 
                value={analyticsPeriod} 
                onChange={(e) => setAnalyticsPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <button 
                onClick={loadAnalytics}
                disabled={analyticsLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {analyticsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          ) : (
            <>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Website Visits */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {analyticsData.visits?.total || 0}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Website Visits</h3>
                  <p className="text-sm text-gray-600">
                    {analyticsData.visits?.uniqueVisitors || 0} unique visitors
                  </p>
                </div>

                {/* Suggestions Clicked */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {analyticsData.suggestions?.total || 0}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Suggestion Buttons Clicked</h3>
                  <p className="text-sm text-gray-600">
                    {analyticsData.suggestions?.averageClicksPerSession || 0} avg per session
                  </p>
                </div>

                {/* Average Time Spent */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {Math.round((analyticsData.averageTime || 0) / 60)}m
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Avg. Time Spent</h3>
                  <p className="text-sm text-gray-600">
                    {analyticsData.averageTime || 0} seconds per session
                  </p>
                </div>

                {/* Return Usage */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {analyticsData.returnUsage?.returnVisitors || 0}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Return Visitors</h3>
                  <p className="text-sm text-gray-600">
                    {analyticsData.returnUsage?.totalUniqueIPs || 0} total unique IPs
                  </p>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Button Types */}
                {analyticsData.suggestions?.topButtonTypes && analyticsData.suggestions.topButtonTypes.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Top Button Types</h3>
                    <div className="space-y-3">
                      {analyticsData.suggestions.topButtonTypes.slice(0, 5).map((button, index) => (
                        <div key={button.buttonType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-800">{button.buttonType}</span>
                          </div>
                          <span className="text-sm font-semibold text-green-600">{button.count} clicks</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Page Visits */}
                {analyticsData.visits?.byPage && Object.keys(analyticsData.visits.byPage).length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 Page Visits</h3>
                    <div className="space-y-3">
                      {Object.entries(analyticsData.visits.byPage)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([page, count]) => (
                          <div key={page} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-800 capitalize">{page}</span>
                            <span className="text-sm font-semibold text-blue-600">{count} visits</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Return Clickers Details */}
              {analyticsData.suggestions?.returnClickers && analyticsData.suggestions.returnClickers.length > 0 && (
                <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🔄 Return Clickers (Multiple Suggestions)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-700">IP Address</th>
                          <th className="text-left py-2 font-medium text-gray-700">Click Count</th>
                          <th className="text-left py-2 font-medium text-gray-700">First Click</th>
                          <th className="text-left py-2 font-medium text-gray-700">Last Click</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.suggestions.returnClickers.slice(0, 10).map((clicker, index) => (
                          <tr key={clicker.ip} className="border-b border-gray-100">
                            <td className="py-2 text-gray-800 font-mono text-xs">{clicker.ip}</td>
                            <td className="py-2">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                {clicker.clickCount} clicks
                              </span>
                            </td>
                            <td className="py-2 text-gray-600 text-xs">
                              {new Date(clicker.firstClick).toLocaleDateString()}
                            </td>
                            <td className="py-2 text-gray-600 text-xs">
                              {new Date(clicker.lastClick).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Return Visitors Details */}
              {analyticsData.returnUsage?.topReturnVisitors && analyticsData.returnUsage.topReturnVisitors.length > 0 && (
                <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🔄 Top Return Visitors</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-700">IP Address</th>
                          <th className="text-left py-2 font-medium text-gray-700">Visit Count</th>
                          <th className="text-left py-2 font-medium text-gray-700">First Visit</th>
                          <th className="text-left py-2 font-medium text-gray-700">Last Visit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.returnUsage.topReturnVisitors.slice(0, 10).map((visitor, index) => (
                          <tr key={visitor.ip} className="border-b border-gray-100">
                            <td className="py-2 text-gray-800 font-mono text-xs">{visitor.ip}</td>
                            <td className="py-2">
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                                {visitor.visitCount} visits
                              </span>
                            </td>
                            <td className="py-2 text-gray-600 text-xs">
                              {new Date(visitor.firstVisit).toLocaleDateString()}
                            </td>
                            <td className="py-2 text-gray-600 text-xs">
                              {new Date(visitor.lastVisit).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Debug Info */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">🔍 Debug Info</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Analytics Period: {analyticsPeriod} days</p>
                  <p>Data Loaded: {analyticsData.visits ? 'Yes' : 'No'}</p>
                  <p>Total Visits: {analyticsData.visits?.total || 0}</p>
                  <p>Total Suggestions: {analyticsData.suggestions?.total || 0}</p>
                  <p>Average Time: {analyticsData.averageTime || 0} seconds</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Feedback Analytics */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">⭐ User Feedback Analytics</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Period:</span>
              <select 
                value={analyticsPeriod} 
                onChange={(e) => setAnalyticsPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading feedback data...</p>
            </div>
          ) : analyticsData.feedback ? (
            <>
              {/* Feedback Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Feedback */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {analyticsData.feedback.total || 0}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Ratings</h3>
                  <p className="text-sm text-gray-600">
                    User feedback received
                  </p>
                </div>

                {/* Average Rating */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white fill-current" />
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">
                      {analyticsData.feedback.averageRating || 0}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Rating</h3>
                  <p className="text-sm text-gray-600">
                    Out of 5 stars
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {Object.values(analyticsData.feedback.ratingDistribution || {}).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Rating Distribution</h3>
                  <p className="text-sm text-gray-600">
                    Across all ratings
                  </p>
                </div>
              </div>

              {/* Rating Distribution Chart */}
              {analyticsData.feedback.ratingDistribution && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Rating Distribution</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = analyticsData.feedback.ratingDistribution[rating] || 0
                      const total = analyticsData.feedback.total || 1
                      const percentage = Math.round((count / total) * 100)
                      return (
                        <div key={rating} className="flex items-center gap-4">
                          <div className="flex items-center gap-2 w-16">
                            <span className="text-sm font-medium text-gray-700">{rating}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="w-16 text-right">
                            <span className="text-sm font-medium text-gray-700">{count}</span>
                            <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Top Rated Meals */}
              {analyticsData.feedback.topRatedMeals && analyticsData.feedback.topRatedMeals.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top Rated Meals</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-700">Meal Name</th>
                          <th className="text-left py-2 font-medium text-gray-700">Average Rating</th>
                          <th className="text-left py-2 font-medium text-gray-700">Total Ratings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.feedback.topRatedMeals.map((meal, index) => (
                          <tr key={meal.name} className="border-b border-gray-100">
                            <td className="py-2 text-gray-800 font-medium">{meal.name}</td>
                            <td className="py-2">
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-600 font-bold">{meal.average}</span>
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              </div>
                            </td>
                            <td className="py-2">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                {meal.count} ratings
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recent Feedback */}
              {analyticsData.feedback.recentFeedback && analyticsData.feedback.recentFeedback.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🕒 Recent Feedback</h3>
                  <div className="space-y-3">
                    {analyticsData.feedback.recentFeedback.map((feedback, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{feedback.meal_name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No feedback data available</p>
            </div>
          )}
        </div>

        {/* Device Management */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">📱 Device Management</h2>
            <button 
              onClick={() => { loadBlacklistedIPs(); getCurrentIP(); checkDeviceMarked(); }}
              disabled={blacklistLoading}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 disabled:opacity-50"
            >
              {blacklistLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Current Device Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">🖥️ Current Device Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Current IP Address</label>
                <div className="px-3 py-2 bg-white border border-blue-300 rounded-lg font-mono text-sm">
                  {currentIP || 'Loading...'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Analytics Status</label>
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  deviceMarked 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {deviceMarked ? '🚫 Excluded from Analytics' : '📊 Tracked in Analytics'}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {deviceMarked ? (
                <button
                  onClick={unmarkCurrentDevice}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  ✅ Enable Analytics for This Device
                </button>
              ) : (
                <button
                  onClick={markCurrentDevice}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  🚫 Exclude This Device from Analytics
                </button>
              )}
              <button
                onClick={() => {
                  if (currentIP && newIPAddress !== currentIP) {
                    setNewIPAddress(currentIP)
                    setNewIPDescription('Current device')
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                📝 Add Current IP to Blacklist
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              💡 <strong>Tip:</strong> Marking your device excludes it from analytics tracking. 
              This works even if your IP changes, unlike IP blacklisting.
            </p>
          </div>
        </div>

        {/* IP Blacklist Management */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">🚫 IP Blacklist Management</h2>

          {/* Add New IP */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">➕ Add IP to Blacklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IP Address *</label>
                <input
                  type="text"
                  value={newIPAddress}
                  onChange={(e) => setNewIPAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., 192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newIPDescription}
                  onChange={(e) => setNewIPDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., My phone, Wife's laptop"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addBlacklistedIP}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  Add to Blacklist
                </button>
              </div>
            </div>
          </div>

          {/* Blacklisted IPs List */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Blacklisted IP Addresses</h3>
            {blacklistLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading blacklisted IPs...</p>
              </div>
            ) : blacklistedIPs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No IP addresses are currently blacklisted.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-700">IP Address</th>
                      <th className="text-left py-2 font-medium text-gray-700">Description</th>
                      <th className="text-left py-2 font-medium text-gray-700">Added</th>
                      <th className="text-left py-2 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blacklistedIPs.map((ip) => (
                      <tr key={ip.id} className="border-b border-gray-100">
                        <td className="py-2 text-gray-800 font-mono text-sm">{ip.ip_address}</td>
                        <td className="py-2 text-gray-600">{ip.description || '-'}</td>
                        <td className="py-2 text-gray-600 text-xs">
                          {new Date(ip.added_at).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => removeBlacklistedIP(ip.ip_address)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
