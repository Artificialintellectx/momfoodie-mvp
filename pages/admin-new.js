import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  ChefHat, Plus, Save, Edit, Trash2, Eye, Search, Clock, Users, Zap, 
  CheckCircle2, AlertCircle, Star, BarChart3, Home, Settings, TrendingUp,
  Shield, Users2, FileText, Activity, Target, Heart
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
    blue: "from-blue-50 to-blue-100 border-blue-200 bg-blue-500 text-blue-600",
    green: "from-green-50 to-green-100 border-green-200 bg-green-500 text-green-600",
    purple: "from-purple-50 to-purple-100 border-purple-200 bg-purple-500 text-purple-600",
    orange: "from-orange-50 to-orange-100 border-orange-200 bg-orange-500 text-orange-600",
    yellow: "from-yellow-50 to-yellow-100 border-yellow-200 bg-yellow-500 text-yellow-600"
  }
  
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colors[color].split(' ')[2]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`text-2xl font-bold ${colors[color].split(' ')[3]}`}>
          {value}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{subtitle}</p>
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
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    visits: null,
    suggestions: null,
    averageTime: 0,
    returnUsage: null,
    feedback: null
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7')

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
    { value: 'halal', label: 'Halal', emoji: '🕌' },
    { value: 'traditional', label: 'Traditional', emoji: '🇳🇬' },
    { value: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
    { value: 'rice-based', label: 'Rice-Based', emoji: '🍚' },
    { value: 'high-protein', label: 'High-Protein', emoji: '💪' },
    { value: 'low-fat', label: 'Low-Fat', emoji: '🥑' },
    { value: 'soft-foods', label: 'Soft Foods', emoji: '🥣' }
  ]

  // Load data on component mount
  useEffect(() => {
    loadRecipes()
    loadAnalytics()
    getCurrentIP()
    checkDeviceMarked()
    loadBlacklistedIPs()
  }, [])

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      const [visits, suggestions, averageTime, returnUsage, feedback] = await Promise.all([
        analyticsDashboard.getWebsiteVisits(analyticsPeriod),
        analyticsDashboard.getSuggestionClicks(analyticsPeriod),
        analyticsDashboard.getAverageTimeSpent(analyticsPeriod),
        analyticsDashboard.getReturnUsage(analyticsPeriod),
        analyticsDashboard.getUserFeedback(analyticsPeriod)
      ])

      setAnalyticsData({ visits, suggestions, averageTime, returnUsage, feedback })
    } catch (error) {
      console.error('Error loading analytics:', error)
      setMessage({ type: 'error', text: 'Failed to load analytics data' })
    } finally {
      setAnalyticsLoading(false)
    }
  }, [analyticsPeriod])

  // Load analytics when period changes
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics()
    }
  }, [analyticsPeriod, activeTab, loadAnalytics])

  // Data loading functions
  const loadRecipes = async () => {
    setLoading(true)
    try {
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
      const ips = await analyticsDashboard.getBlacklistedIPs()
      setBlacklistedIPs(ips)
    } catch (error) {
      console.error('Error loading blacklisted IPs:', error)
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
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions.filter(i => i.trim())
      }

      if (editingRecipe) {
        const { error } = await supabase
          .from('meals')
          .update(recipeData)
          .eq('id', editingRecipe.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'Recipe updated successfully' })
      } else {
        const { error } = await supabase
          .from('meals')
          .insert([recipeData])

        if (error) throw error
        setMessage({ type: 'success', text: 'Recipe added successfully' })
      }

      setShowForm(false)
      resetForm()
      loadRecipes()
    } catch (error) {
      console.error('Error saving recipe:', error)
      setMessage({ type: 'error', text: 'Failed to save recipe' })
    }
  }

  const deleteRecipe = async (id) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    try {
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
  const filteredRecipes = meals.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <div className="divide-y divide-gray-200">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{recipe.name}</h4>
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
                      onClick={() => editRecipe(recipe)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'recipes' && <RecipesTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>

        {/* Recipe Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Form fields would go here - simplified for brevity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Add more form fields as needed */}
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