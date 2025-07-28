import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  ChefHat, Plus, Save, Edit, Trash2, Eye, Search, Clock, Users, Zap, 
  CheckCircle2, AlertCircle, Star, BarChart3, Home, Settings, TrendingUp,
  Shield, Users2, FileText, Activity, Target, Heart, Recycle
} from 'lucide-react'
import { analytics, analyticsDashboard } from '../lib/analytics'
import { supabase } from '../lib/supabase'

// Tab components
const TabButton = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
      active 
        ? 'bg-orange-500 text-white shadow-md' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Icon className="w-5 h-5" />
    {children}
  </button>
)

const MetricCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => {
  const colors = {
    blue: {
      bg: "from-blue-50 to-blue-100 border-blue-200",
      iconBg: "bg-blue-500",
      textColor: "text-blue-600"
    },
    green: {
      bg: "from-green-50 to-green-100 border-green-200",
      iconBg: "bg-green-500",
      textColor: "text-green-600"
    },
    purple: {
      bg: "from-purple-50 to-purple-100 border-purple-200",
      iconBg: "bg-purple-500",
      textColor: "text-purple-600"
    },
    orange: {
      bg: "from-orange-50 to-orange-100 border-orange-200",
      iconBg: "bg-orange-500",
      textColor: "text-orange-600"
    },
    yellow: {
      bg: "from-yellow-50 to-yellow-100 border-yellow-200",
      iconBg: "bg-yellow-500",
      textColor: "text-yellow-600"
    }
  }
  
  const colorScheme = colors[color] || colors.blue
  
  return (
    <div className={`bg-gradient-to-br ${colorScheme.bg} border rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorScheme.iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`text-2xl font-bold ${colorScheme.textColor}`}>
          {value}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  )
}

const RecipeCard = ({ recipe, onEdit, onDelete, viewMode = 'list' }) => {
  if (viewMode === 'grid') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1 mr-2">{recipe.name}</h4>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(recipe)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(recipe.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-gray-600 mb-3 line-clamp-3 text-sm">{recipe.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            {recipe.meal_type}
          </span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
            {recipe.difficulty}
          </span>
          {recipe.prep_time && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
              {recipe.prep_time}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {recipe.ingredients?.length || 0} ingredients • {recipe.instructions?.length || 0} steps
        </div>
      </div>
    )
  }

  // List view (default)
  return (
    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h5 className="text-md font-semibold text-gray-800 mb-2">{recipe.name}</h5>
          <p className="text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {recipe.meal_type}
            </span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              {recipe.difficulty}
            </span>
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
              {recipe.prep_time}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(recipe)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(recipe.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminNew() {
  // State management
  const [activeTab, setActiveTab] = useState('overview')
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [groupBy, setGroupBy] = useState('none')
  const [dietaryFilter, setDietaryFilter] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    visits: null,
    suggestions: null,
    averageTime: 0,
    returnUsage: null,
    feedback: null
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d')

  // Device management state
  const [currentIP, setCurrentIP] = useState('')
  const [deviceMarked, setDeviceMarked] = useState(false)
  const [blacklistedIPs, setBlacklistedIPs] = useState([])
  const [blacklistLoading, setBlacklistLoading] = useState(false)
  const [newIPAddress, setNewIPAddress] = useState('')
  const [newIPDescription, setNewIPDescription] = useState('')

  // Recipe form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meal_type: 'breakfast',
    dietary_preference: 'any',
    cooking_time: 'regular',
    prep_time: '',
    difficulty: 'medium',
    ingredients: [''],
    instructions: [''],
    cuisine_type: 'Nigerian'
  })

  const dietaryPreferences = [
    { value: 'any', label: 'Any', emoji: '🍽️' },
    { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
    { value: 'vegan', label: 'Vegan', emoji: '🌱' },
    { value: 'halal', label: 'Halal', emoji: '🇸🇦' },
    { value: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
    { value: 'lacto_vegetarian', label: 'Lacto-Vegetarian', emoji: '🥛' },
    { value: 'gluten_free', label: 'Gluten-Free', emoji: '🌾' },
    { value: 'low_sodium', label: 'Low-Sodium', emoji: '🧂' },
    { value: 'diabetic_friendly', label: 'Diabetic-Friendly', emoji: '🩺' },
    { value: 'low_fat', label: 'Low-Fat', emoji: '🥑' },
    { value: 'high_protein', label: 'High-Protein', emoji: '💪' },
    { value: 'soft_foods', label: 'Soft Foods', emoji: '🥣' },
    { value: 'high_fiber', label: 'High-Fiber', emoji: '🌾' },
    { value: 'traditional', label: 'Traditional', emoji: '🇳🇬' },
    { value: 'rice_based', label: 'Rice-Based', emoji: '🍚' },
    { value: 'swallow_based', label: 'Swallow-Based', emoji: '🥄' }
  ]

  // Load data on component mount
  useEffect(() => {
    loadRecipes()
    getCurrentIP()
    checkDeviceMarked()
    loadBlacklistedIPs()
  }, [])

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      console.log('🔄 Loading analytics data for period:', analyticsPeriod)
      
      // Use individual try-catch blocks for each analytics call
      let visits = null
      let suggestions = null
      let averageTime = 0
      let returnUsage = null
      let feedback = null

      try {
        visits = await analyticsDashboard.getWebsiteVisits(analyticsPeriod)
        console.log('✅ Website visits loaded:', visits)
      } catch (error) {
        console.warn('Failed to load website visits:', error.message)
      }

      try {
        suggestions = await analyticsDashboard.getSuggestionClicks(analyticsPeriod)
        console.log('✅ Suggestion clicks loaded:', suggestions)
      } catch (error) {
        console.warn('Failed to load suggestion clicks:', error.message)
      }

      try {
        averageTime = await analyticsDashboard.getAverageTimeSpent(analyticsPeriod)
        console.log('✅ Average time loaded:', averageTime)
      } catch (error) {
        console.warn('Failed to load average time spent:', error.message)
      }

      try {
        returnUsage = await analyticsDashboard.getReturnUsage(analyticsPeriod)
        console.log('✅ Return usage loaded:', returnUsage)
      } catch (error) {
        console.warn('Failed to load return usage:', error.message)
      }

      try {
        feedback = await analyticsDashboard.getUserFeedback(analyticsPeriod)
        console.log('✅ User feedback loaded:', feedback)
      } catch (error) {
        console.warn('Failed to load user feedback:', error.message)
      }

      const analyticsDataToSet = {
        visits,
        suggestions,
        averageTime,
        returnUsage,
        feedback
      }

      console.log('📊 Setting analytics data:', analyticsDataToSet)
      setAnalyticsData(analyticsDataToSet)

    } catch (error) {
      console.warn('Error in analytics loading:', error.message)
      // Don't show error message to user, just set empty data
      setAnalyticsData({
        visits: null,
        suggestions: null,
        averageTime: 0,
        returnUsage: null,
        feedback: null
      })
    } finally {
      setAnalyticsLoading(false)
    }
  }, [analyticsPeriod])

  // Load analytics when period changes (must come after loadAnalytics definition)
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics()
    }
  }, [analyticsPeriod, activeTab, loadAnalytics])

  // Data loading functions
  const loadRecipes = async () => {
    setLoading(true)
    try {
      if (!supabase) {
        console.log('📊 Supabase not configured. Using fallback data.')
        // Use fallback data when Supabase is not configured
        setMeals([])
        setMessage({ type: 'info', text: 'Using fallback data - Supabase not configured' })
        return
      }
      
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMeals(data || [])
    } catch (error) {
      console.error('Error loading recipes:', error)
      setMessage({ type: 'error', text: 'Failed to load recipes' })
    } finally {
      setLoading(false)
    }
  }

  const loadBlacklistedIPs = async () => {
    setBlacklistLoading(true)
    try {
      console.log('🔄 Loading blacklisted IPs...')
      const ips = await analyticsDashboard.getBlacklistedIPs()
      setBlacklistedIPs(ips || [])
    } catch (error) {
      console.warn('Failed to load blacklisted IPs:', error.message)
      setBlacklistedIPs([])
      // Don't show error message to user for this, just log it
    } finally {
      setBlacklistLoading(false)
    }
  }

  const getCurrentIP = async () => {
    try {
      const response = await fetch('/api/get-ip')
      const data = await response.json()
      setCurrentIP(data.ip)
    } catch (error) {
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
    localStorage.setItem('momfoodie_my_device', 'true')
    setDeviceMarked(true)
    setMessage({ type: 'success', text: 'Device marked as excluded from analytics' })
  }

  const unmarkCurrentDevice = () => {
    localStorage.removeItem('momfoodie_my_device')
    setDeviceMarked(false)
    setMessage({ type: 'success', text: 'Device analytics tracking enabled' })
  }

  // Recipe management functions
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      meal_type: 'breakfast',
      dietary_preference: 'any',
      cooking_time: 'regular',
      prep_time: '',
      difficulty: 'medium',
      ingredients: [''],
      instructions: [''],
      cuisine_type: 'Nigerian'
    })
    setEditingRecipe(null)
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

  const saveRecipe = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setMessage({ type: 'error', text: 'Recipe name is required' })
        return
      }
      
      if (!formData.description.trim()) {
        setMessage({ type: 'error', text: 'Recipe description is required' })
        return
      }
      
      if (!formData.meal_type) {
        setMessage({ type: 'error', text: 'Meal type is required' })
        return
      }

      // Filter out empty ingredients and instructions
      const filteredIngredients = formData.ingredients.filter(i => i.trim())
      const filteredInstructions = formData.instructions.filter(i => i.trim())
      
      if (filteredIngredients.length === 0) {
        setMessage({ type: 'error', text: 'At least one ingredient is required' })
        return
      }
      
      if (filteredInstructions.length === 0) {
        setMessage({ type: 'error', text: 'At least one instruction step is required' })
        return
      }

      const recipeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        meal_type: formData.meal_type,
        dietary_preference: formData.dietary_preference || 'any',
        cooking_time: formData.cooking_time || 'regular',
        prep_time: formData.prep_time?.trim() || '',
        difficulty: formData.difficulty || 'medium',
        ingredients: filteredIngredients,
        instructions: filteredInstructions,
        cuisine_type: formData.cuisine_type?.trim() || 'Nigerian'
      }

      console.log('Saving recipe data:', recipeData)

      if (!supabase) {
        setMessage({ type: 'error', text: 'Cannot save recipe - Supabase not configured' })
        return
      }

      if (editingRecipe) {
        const { error } = await supabase
          .from('meals')
          .update(recipeData)
          .eq('id', editingRecipe.id)

        if (error) {
          console.error('Supabase update error:', error)
          throw error
        }
        setMessage({ type: 'success', text: 'Recipe updated successfully' })
      } else {
        const { error } = await supabase
          .from('meals')
          .insert([recipeData])

        if (error) {
          console.error('Supabase insert error:', error)
          throw error
        }
        setMessage({ type: 'success', text: 'Recipe added successfully' })
      }

      setShowForm(false)
      resetForm()
      loadRecipes()
    } catch (error) {
      console.error('Error saving recipe:', error)
      let errorMessage = 'Failed to save recipe'
      
      if (error.message) {
        errorMessage += `: ${error.message}`
      } else if (error.details) {
        errorMessage += `: ${error.details}`
      }
      
      setMessage({ type: 'error', text: errorMessage })
    }
  }

  const deleteRecipe = async (id) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    try {
      if (!supabase) {
        setMessage({ type: 'error', text: 'Cannot delete recipe - Supabase not configured' })
        return
      }

      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Recipe deleted successfully' })
      loadRecipes()
    } catch (error) {
      console.error('Error deleting recipe:', error)
      setMessage({ type: 'error', text: 'Failed to delete recipe' })
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
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cuisine_type: recipe.cuisine_type
    })
    setEditingRecipe(recipe)
    setShowForm(true)
  }

  // Filter recipes
  const filteredRecipes = meals.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
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
    
    if (groupBy === 'cooking_time') {
      const groups = {}
      filteredRecipes.forEach(recipe => {
        const cookingTime = recipe.cooking_time || 'regular'
        // Convert cooking time to readable labels
        const cookingTimeLabels = {
          'quick': 'Quick (Under 30 min)',
          'regular': 'Regular (30-60 min)',
          'slow': 'Slow (Over 60 min)'
        }
        const label = cookingTimeLabels[cookingTime] || cookingTime
        if (!groups[label]) {
          groups[label] = []
        }
        groups[label].push(recipe)
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
    
    if (groupBy === 'meal_cooking') {
      const groups = {}
      const cookingTimeLabels = {
        'quick': 'Quick (Under 30 min)',
        'regular': 'Regular (30-60 min)',
        'slow': 'Slow (Over 60 min)'
      }
      filteredRecipes.forEach(recipe => {
        const mealType = recipe.meal_type || 'Unknown'
        const cookingTime = recipe.cooking_time || 'regular'
        const cookingTimeLabel = cookingTimeLabels[cookingTime] || cookingTime
        
        if (!groups[mealType]) {
          groups[mealType] = {}
        }
        if (!groups[mealType][cookingTimeLabel]) {
          groups[mealType][cookingTimeLabel] = []
        }
        groups[mealType][cookingTimeLabel].push(recipe)
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

  // Tab content components
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Recipes"
          value={meals.length}
          subtitle="In database"
          icon={FileText}
          color="blue"
        />
        <MetricCard
          title="Website Visits"
          value={analyticsData.visits?.total || 0}
          subtitle="Last 7 days"
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Suggestion Clicks"
          value={analyticsData.suggestions?.total || 0}
          subtitle="Last 7 days"
          icon={Target}
          color="purple"
        />
        <MetricCard
          title="User Ratings"
          value={analyticsData.feedback?.total || 0}
          subtitle="Total feedback"
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Recipes in Database</p>
                <p className="text-sm text-gray-600">{meals.length} total recipes</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {meals.length > 0 ? new Date(meals[0].created_at).toLocaleDateString() : 'No recipes'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Website Traffic</p>
                <p className="text-sm text-gray-600">{analyticsData.visits?.uniqueVisitors || 0} unique visitors</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">User Engagement</p>
                <p className="text-sm text-gray-600">{analyticsData.suggestions?.total || 0} suggestion clicks</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
        </div>
      </div>
    </div>
  )

  const RecipesTab = () => (
    <div className="space-y-6">
      {/* Recipe Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <select
            value={dietaryFilter}
            onChange={(e) => setDietaryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
      </div>

      {/* Grouping Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Group by:</span>
          <div className="flex gap-2 flex-wrap">
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
              onClick={() => setGroupBy('cooking_time')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                groupBy === 'cooking_time'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cooking Time
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
              onClick={() => setGroupBy('meal_cooking')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                groupBy === 'meal_cooking'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Meal Type + Cooking Time
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex flex-col gap-0.5">
                    <div className="w-full h-0.5 bg-current"></div>
                    <div className="w-full h-0.5 bg-current"></div>
                    <div className="w-full h-0.5 bg-current"></div>
                  </div>
                  List
                </div>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="w-full h-full bg-current rounded-sm"></div>
                    <div className="w-full h-full bg-current rounded-sm"></div>
                    <div className="w-full h-full bg-current rounded-sm"></div>
                    <div className="w-full h-full bg-current rounded-sm"></div>
                  </div>
                  Grid
                </div>
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
      </div>

      {/* Recipe List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Recipes ({filteredRecipes.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No recipes found</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6' : 'divide-y divide-gray-200'}>
            {groupBy === 'nested' || groupBy === 'meal_cooking' ? (
              // Nested grouping display
              Object.entries(groupedRecipes).map(([mealType, subGroups]) => (
                <div key={mealType} className={viewMode === 'grid' ? 'col-span-full' : 'p-6'}>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 bg-blue-50 px-3 py-2 rounded-lg">
                    {mealType} ({Object.values(subGroups).flat().length} recipes)
                  </h4>
                  {Object.entries(subGroups).map(([subGroup, recipes]) => (
                    <div key={subGroup} className={viewMode === 'grid' ? 'mb-6' : 'ml-4 mb-4'}>
                      <h5 className={`text-md font-medium text-gray-700 mb-2 px-2 py-1 rounded ${
                        groupBy === 'meal_cooking' ? 'bg-yellow-50' : 'bg-green-50'
                      }`}>
                        {subGroup} ({recipes.length} recipes)
                      </h5>
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                        {recipes.map((recipe) => (
                          <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onEdit={editRecipe}
                            onDelete={deleteRecipe}
                            viewMode={viewMode}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              // Regular grouping display
              Object.entries(groupedRecipes).map(([groupName, recipes]) => (
                <div key={groupName} className={viewMode === 'grid' ? 'col-span-full' : 'p-6'}>
                  <h4 className={`text-lg font-semibold text-gray-800 mb-4 px-3 py-2 rounded-lg ${
                    groupBy === 'cooking_time' ? 'bg-yellow-50' : 'bg-blue-50'
                  }`}>
                    {groupName} ({recipes.length} recipes)
                  </h4>
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                    {recipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onEdit={editRecipe}
                        onDelete={deleteRecipe}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )

  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* Analytics Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">📊 Analytics Dashboard</h3>
        <div className="flex items-center gap-4">
          <select 
            value={analyticsPeriod} 
            onChange={(e) => setAnalyticsPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button 
            onClick={loadAnalytics}
            disabled={analyticsLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {analyticsLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button 
            onClick={async () => {
              setAnalyticsLoading(true)
              try {
                // Generate test data for both visits and clicks
                await analytics.trackPageVisit('test_page', navigator.userAgent)
                await analytics.trackSuggestionClick('test_button', {})
                await loadAnalytics()
                setMessage({ type: 'success', text: 'Test data generated successfully!' })
              } catch (error) {
                setMessage({ type: 'error', text: 'Failed to generate test data' })
              } finally {
                setAnalyticsLoading(false)
              }
            }}
            disabled={analyticsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            Generate Test Data
          </button>
          
          <button 
            onClick={() => {
              const currentState = localStorage.getItem('momfoodie_disable_exclusions') === 'true'
              const newState = !currentState
              localStorage.setItem('momfoodie_disable_exclusions', newState.toString())
              setMessage({ 
                type: 'success', 
                text: `Analytics exclusions ${newState ? 'disabled' : 'enabled'} for testing` 
              })
              console.log(`🧪 Analytics exclusions ${newState ? 'disabled' : 'enabled'}`)
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
          >
            {localStorage.getItem('momfoodie_disable_exclusions') === 'true' ? '🔒 Enable Exclusions' : '🔓 Disable Exclusions'}
          </button>
          <button 
            onClick={async () => {
              if (confirm('Are you sure you want to reset all analytics data? This cannot be undone.')) {
                try {
                  console.log('🗑️ Resetting analytics data...')
                  
                  if (!supabase) {
                    setMessage({ 
                      type: 'error', 
                      text: 'Cannot reset analytics - Supabase not configured' 
                    })
                    return
                  }
                  
                  // Clear all analytics tables - delete all records
                  const { error: visitsError } = await supabase.from('website_visits').delete().gte('id', 1)
                  const { error: clicksError } = await supabase.from('suggestion_clicks').delete().gte('id', 1)
                  const { error: feedbackError } = await supabase.from('user_feedback').delete().gte('id', 1)
                  
                  if (visitsError) console.error('Error clearing visits:', visitsError)
                  if (clicksError) console.error('Error clearing clicks:', clicksError)
                  if (feedbackError) console.error('Error clearing feedback:', feedbackError)
                  
                  // Clear localStorage visit markers
                  const keysToRemove = []
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    if (key && key.startsWith('visited_')) {
                      keysToRemove.push(key)
                    }
                  }
                  keysToRemove.forEach(key => localStorage.removeItem(key))
                  
                  setMessage({ 
                    type: 'success', 
                    text: 'Analytics data reset successfully' 
                  })
                  console.log('✅ Analytics data reset successfully')
                  loadAnalytics() // Reload to show empty data
                } catch (error) {
                  console.error('Failed to reset analytics data:', error)
                  setMessage({ 
                    type: 'error', 
                    text: 'Failed to reset analytics data' 
                  })
                }
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
          >
            🗑️ Reset Analytics
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Website Visits"
              value={analyticsData.visits?.total || 0}
              subtitle={`${analyticsData.visits?.uniqueVisitors || 0} unique visitors`}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Suggestion Clicks"
              value={analyticsData.suggestions?.total || 0}
              subtitle={`${analyticsData.suggestions?.averageClicksPerSession || 0} avg per session`}
              icon={Target}
              color="green"
            />
            <MetricCard
              title="Avg. Time Spent"
              value={`${Math.round((analyticsData.averageTime || 0) / 60)}m`}
              subtitle={`${analyticsData.averageTime || 0} seconds per session`}
              icon={Clock}
              color="purple"
            />
            <MetricCard
              title="Return Visitors"
              value={analyticsData.returnUsage?.returnVisitors || 0}
              subtitle={`${analyticsData.returnUsage?.totalVisitors || 0} total unique IPs`}
              icon={Users2}
              color="orange"
            />
          </div>

          {/* No Data Message */}
          {(!analyticsData.visits || analyticsData.visits.total === 0) && 
           (!analyticsData.suggestions || analyticsData.suggestions.total === 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
              <BarChart3 className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Analytics Data Yet</h3>
              <p className="text-yellow-700 mb-4">
                Analytics data will appear here once users start visiting your website and interacting with meal suggestions.
              </p>
              <div className="text-sm text-yellow-600">
                <p>• Visit the homepage to generate some test data</p>
                <p>• Click &quot;Get Meal Suggestion&quot; to track interactions</p>
                <p>• Check back here to see the analytics</p>
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

          {/* User Feedback Details */}
          {analyticsData.feedback && analyticsData.feedback.total > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">⭐ User Feedback Details</h3>
              
              {/* Feedback Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Average Rating</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.feedback.averageRating || 0}/5
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Total Feedback</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.feedback.total || 0}
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChefHat className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Rated Meals</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData.feedback.topRatedMeals?.length || 0}
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              {analyticsData.feedback.ratingDistribution && Object.keys(analyticsData.feedback.ratingDistribution).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">📊 Rating Distribution</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = analyticsData.feedback.ratingDistribution[rating] || 0
                      const percentage = analyticsData.feedback.total > 0 ? Math.round((count / analyticsData.feedback.total) * 100) : 0
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-2 w-16">
                            <span className="text-sm font-medium text-gray-600">{rating}★</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="w-16 text-right">
                            <span className="text-sm font-medium text-gray-600">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Top Rated Meals */}
              {analyticsData.feedback.topRatedMeals && analyticsData.feedback.topRatedMeals.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">🏆 Top Rated Meals</h4>
                  <div className="space-y-2">
                    {analyticsData.feedback.topRatedMeals.slice(0, 5).map((meal, index) => (
                      <div key={meal.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <span className="font-medium text-gray-800">{meal.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.round(meal.average) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            {meal.average}/5 ({meal.count} ratings)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Feedback */}
              {analyticsData.feedback.recentFeedback && analyticsData.feedback.recentFeedback.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">🕒 Recent Feedback</h4>
                  <div className="space-y-3">
                    {analyticsData.feedback.recentFeedback.slice(0, 5).map((feedback, index) => (
                      <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{feedback.meal_name}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {feedback.comment && (
                          <p className="text-sm text-gray-600 mt-2">{feedback.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )

  const SettingsTab = () => (
    <div className="space-y-6">
      {/* Device Management */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 Device Management</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h4 className="text-md font-semibold text-blue-800 mb-4">🖥️ Current Device Status</h4>
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
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔗 Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Home className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-800">Go to Homepage</p>
              <p className="text-sm text-gray-600">View the main website</p>
            </div>
          </Link>
          
          <Link
            href="/leftover-transformations"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Recycle className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-800">Leftover Transformations</p>
              <p className="text-sm text-gray-600">Manage leftover meal transformations</p>
            </div>
          </Link>

          <Link
            href="/test-supabase-admin"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-800">Test Database</p>
              <p className="text-sm text-gray-600">Check Supabase connection</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )

  const LeftoversTab = () => (
    <div className="space-y-6">
      {/* Coming Soon Header */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Recycle className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Leftover Transformations</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Transform leftover meals into delicious new dishes! This feature will help users reduce food waste 
          by providing creative recipes to repurpose their leftovers.
        </p>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-full inline-block mb-6">
          COMING SOON
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 border border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Smart Transformations</h4>
            <p className="text-sm text-gray-600">
              AI-powered suggestions to transform leftovers into new meals
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Time-Saving</h4>
            <p className="text-sm text-gray-600">
              Quick recipes that make the most of your leftover ingredients
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Reduce Waste</h4>
            <p className="text-sm text-gray-600">
              Help users save money and reduce food waste at home
            </p>
          </div>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Planned Features</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Dedicated Admin Interface</p>
              <p className="text-sm text-gray-600">Manage transformation recipes with full CRUD operations</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Smart Ingredient Matching</p>
              <p className="text-sm text-gray-600">Suggest transformations based on available leftovers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Step-by-Step Instructions</p>
              <p className="text-sm text-gray-600">Detailed cooking steps for each transformation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">User Feedback System</p>
              <p className="text-sm text-gray-600">Rate and review transformation success</p>
            </div>
          </div>
        </div>
      </div>

      {/* Development Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Development Status</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Database Schema</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Ready</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Admin Interface</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Ready</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">User Interface</span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">In Progress</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Integration</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Pending</span>
          </div>
        </div>
      </div>
    </div>
  )

  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-medium">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-fun bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              MomFudy Admin
            </h1>
          </div>
          <p className="text-gray-600">Manage your recipe database and analytics</p>
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            <TabButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
              icon={Activity}
            >
              Overview
            </TabButton>
            <TabButton 
              active={activeTab === 'recipes'} 
              onClick={() => setActiveTab('recipes')}
              icon={FileText}
            >
              Recipes
            </TabButton>
            <TabButton 
              active={activeTab === 'analytics'} 
              onClick={() => setActiveTab('analytics')}
              icon={TrendingUp}
            >
              Analytics
            </TabButton>
            <TabButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              icon={Settings}
            >
              Settings
            </TabButton>
            <TabButton 
              active={activeTab === 'leftovers'} 
              onClick={() => setActiveTab('leftovers')}
              icon={Recycle}
            >
              Leftovers
            </TabButton>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'recipes' && <RecipesTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'leftovers' && <LeftoversTab />}
        </div>

        {/* Recipe Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter recipe name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type *</label>
                    <select
                      value={formData.meal_type}
                      onChange={(e) => handleInputChange('meal_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Describe the recipe..."
                  />
                </div>

                {/* Recipe Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
                    <select
                      value={formData.dietary_preference}
                      onChange={(e) => handleInputChange('dietary_preference', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {dietaryPreferences.map(pref => (
                        <option key={pref.value} value={pref.value}>
                          {pref.emoji} {pref.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Time</label>
                    <select
                      value={formData.cooking_time}
                      onChange={(e) => handleInputChange('cooking_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="quick">Quick (Under 30 min)</option>
                      <option value="regular">Regular (30-60 min)</option>
                      <option value="elaborate">Elaborate (Over 60 min)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time</label>
                    <input
                      type="text"
                      value={formData.prep_time}
                      onChange={(e) => handleInputChange('prep_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., 15 minutes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                    <input
                      type="text"
                      value={formData.cuisine_type}
                      onChange={(e) => handleInputChange('cuisine_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., Nigerian, Italian, etc."
                    />
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Ingredients *</label>
                  <div className="space-y-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder={`Ingredient ${index + 1}`}
                        />
                        {formData.ingredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('ingredients', index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayItem('ingredients')}
                    className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    + Add Ingredient
                  </button>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Instructions *</label>
                  <div className="space-y-3">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={instruction}
                            onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder={`Step ${index + 1}`}
                          />
                        </div>
                        {formData.instructions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('instructions', index)}
                            className="flex-shrink-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayItem('instructions')}
                    className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    + Add Step
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRecipe}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {editingRecipe ? 'Update Recipe' : 'Add Recipe'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 