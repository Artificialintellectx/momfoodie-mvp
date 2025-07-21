import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fallbackMeals, mealTypes, cookingTimes, dietaryPreferences } from '../lib/data'
import { 
  Plus, 
  Save, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  ChefHat,
  Clock,
  Utensils,
  Users,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function Admin() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

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
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    setLoading(true)
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setRecipes(data || [])
      } else {
        // Fallback to local data
        setRecipes(fallbackMeals)
      }
    } catch (error) {
      console.error('Error loading recipes:', error)
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

  const validateForm = () => {
    const errors = []
    
    if (!formData.name.trim()) errors.push('Recipe name is required')
    if (!formData.description.trim()) errors.push('Description is required')
    if (!formData.meal_type) errors.push('Meal type is required')
    if (!formData.cooking_time) errors.push('Cooking time is required')
    if (!formData.prep_time) errors.push('Prep time is required')
    
    if (formData.ingredients.length === 0 || formData.ingredients.every(i => !i.trim())) {
      errors.push('At least one ingredient is required')
    }
    
    if (formData.instructions.length === 0 || formData.instructions.every(i => !i.trim())) {
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
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions.filter(i => i.trim())
      }

      if (editingRecipe) {
        // Update existing recipe
        if (supabase) {
          const { error } = await supabase
            .from('meals')
            .update(recipeData)
            .eq('id', editingRecipe.id)
          
          if (error) throw error
        } else {
          // Update local data
          setRecipes(prev => prev.map(r => r.id === editingRecipe.id ? { ...r, ...recipeData } : r))
        }
        setMessage({ type: 'success', text: 'Recipe updated successfully!' })
      } else {
        // Create new recipe
        if (supabase) {
          const { error } = await supabase
            .from('meals')
            .insert([recipeData])
          
          if (error) throw error
        } else {
          // Add to local data
          const newRecipe = {
            ...recipeData,
            id: Date.now() // Simple ID for local storage
          }
          setRecipes(prev => [newRecipe, ...prev])
        }
        setMessage({ type: 'success', text: 'Recipe created successfully!' })
      }

      resetForm()
      setShowForm(false)
      loadRecipes()
    } catch (error) {
      console.error('Error saving recipe:', error)
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
        setRecipes(prev => prev.filter(r => r.id !== id))
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
    setEditingRecipe(recipe)
    setShowForm(true)
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.meal_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-10 h-10 text-primary-600" />
            <h1 className="text-3xl font-bold text-gradient">MomFoodie Admin</h1>
          </div>
          <p className="text-gray-600">Manage your recipe database</p>
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

        {/* Recipe Form */}
        {showForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
                <select
                  value={formData.dietary_preference}
                  onChange={(e) => handleInputChange('dietary_preference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {dietaryPreferences.map(pref => (
                    <option key={pref.value} value={pref.value}>{pref.label}</option>
                  ))}
                </select>
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
                {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
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
              <Utensils className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recipes found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                    <div className="flex items-center gap-1">
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
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    {recipe.ingredients.length} ingredients • {recipe.instructions.length} steps
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 