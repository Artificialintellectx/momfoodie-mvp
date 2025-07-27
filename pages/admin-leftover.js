import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChefHat, Plus, Save, Edit, Trash2, Eye, Search, Clock, Users, Zap, 
  CheckCircle2, AlertCircle, Star, BarChart3, Home, Settings, TrendingUp,
  Shield, Users2, FileText, Activity, Target, Heart, Recycle, ArrowLeft,
  Filter, Grid, List, RefreshCw, Copy, Share2
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminLeftover() {
  const [transformations, setTransformations] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadTransformations()
  }, [])

  const loadTransformations = async () => {
    try {
      setLoading(true)
      
      if (!supabase) {
        console.log('📊 Supabase not configured.')
        setTransformations([])
        return
      }

      const { data, error } = await supabase
        .from('leftover_transformations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading transformations:', error)
        setMessage('Error loading transformations. Please check if the database table exists.')
        setTransformations([])
      } else {
        console.log('✅ Transformations loaded:', data?.length || 0)
        setTransformations(data || [])
        setMessage('')
      }
    } catch (error) {
      console.error('Error loading transformations:', error)
      setMessage('Error loading transformations.')
      setTransformations([])
    } finally {
      setLoading(false)
    }
  }

  const createSampleData = async () => {
    try {
      if (!supabase) {
        alert('Database not configured')
        return
      }

      const sampleData = [
        {
          original_leftover: 'Leftover Jollof Rice',
          transformation_name: 'Jollof Rice Pancakes',
          description: 'Transform your leftover jollof rice into delicious savory pancakes.',
          difficulty_level: 'easy',
          prep_time: '10 mins',
          cooking_time: '15 mins',
          total_time: '25 mins',
          additional_ingredients: ['Eggs (2 pieces)', 'Flour (1/2 cup)', 'Baking powder (1/2 tsp)'],
          required_ingredients: ['Eggs', 'Flour'],
          optional_ingredients: ['Cheese'],
          transformation_steps: [
            'Break up the leftover jollof rice with a fork',
            'In a bowl, whisk together eggs, flour, and baking powder',
            'Add the broken-up jollof rice to the mixture',
            'Heat oil in a non-stick pan over medium heat',
            'Drop spoonfuls of the mixture into the pan',
            'Cook for 3-4 minutes until golden brown',
            'Flip and cook for another 2-3 minutes',
            'Serve hot with ketchup or pepper sauce'
          ],
          tips: "Make sure the rice is not too wet. If it is, add a bit more flour.",
          meal_type: 'breakfast',
          dietary_tags: ['vegetarian', 'quick', 'budget-friendly'],
          estimated_cost: 'Low'
        },
        {
          original_leftover: 'Leftover White Rice and Stew',
          transformation_name: 'Fried Rice with Stew',
          description: 'Transform your plain rice and stew into a flavorful fried rice dish.',
          difficulty_level: 'easy',
          prep_time: '15 mins',
          cooking_time: '10 mins',
          total_time: '25 mins',
          additional_ingredients: ['Vegetable oil (3 tbsp)', 'Onions (1 medium)', 'Carrots (1 medium)'],
          required_ingredients: ['Vegetable oil', 'Onions'],
          optional_ingredients: ['Green beans'],
          transformation_steps: [
            'Heat oil in a large wok over high heat',
            'Add diced onions and stir-fry for 2 minutes',
            'Add diced carrots and stir-fry for 3 minutes',
            'Add the leftover rice and break it up with a spatula',
            'Add the leftover stew and mix thoroughly',
            'Cook for 5-7 minutes, stirring occasionally',
            'Serve hot with additional stew on the side'
          ],
          tips: 'Use high heat for authentic fried rice texture.',
          meal_type: 'lunch',
          dietary_tags: ['quick', 'budget-friendly'],
          estimated_cost: 'Low'
        }
      ]

      const { error } = await supabase
        .from('leftover_transformations')
        .insert(sampleData)

      if (error) {
        console.error('Error creating sample data:', error)
        alert('Failed to create sample data. Please check if the table exists.')
        return
      }

      console.log('✅ Sample data created successfully')
      alert('Sample data created successfully!')
      await loadTransformations()
    } catch (error) {
      console.error('Error creating sample data:', error)
      alert('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Admin</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Leftover Transformations</h1>
                  <p className="text-sm text-gray-600">Manage transformation recipes for leftover meals</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={createSampleData}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Create Sample Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Database Setup Instructions */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Database Setup</h3>
              <p className="text-gray-600">Follow these steps to set up the leftover transformations table</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Execute the SQL Schema</p>
                <p className="text-sm text-gray-600">Run the SQL commands in <code className="bg-gray-100 px-2 py-1 rounded">leftover-transformations-schema.sql</code> in your Supabase SQL editor</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Create Sample Data</p>
                <p className="text-sm text-gray-600">Click the &quot;Create Sample Data&quot; button above to populate the table with example transformations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Start Adding Your Own</p>
                <p className="text-sm text-gray-600">Once the table is set up, you can start adding your own transformation recipes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        {message && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">{message}</p>
            </div>
          </div>
        )}

        {/* Transformations List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="loading-spinner w-6 h-6 border-2 border-green-500/30 border-t-green-500"></div>
              <span className="text-gray-600">Loading transformations...</span>
            </div>
          </div>
        ) : transformations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Recycle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No transformations found</h3>
            <p className="text-gray-600 mb-6">
              The database table might not be set up yet. Please follow the setup instructions above.
            </p>
            <button
              onClick={createSampleData}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              Create Sample Data
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                Transformations ({transformations.length})
              </h3>
              <button
                onClick={loadTransformations}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            
            <div className="grid gap-6">
              {transformations.map((transformation) => (
                <div key={transformation.id} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">{transformation.transformation_name}</h4>
                      <p className="text-gray-600 mb-3">{transformation.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Recycle className="w-4 h-4" />
                          <span className="font-medium">{transformation.original_leftover}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{transformation.total_time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          <span className="capitalize">{transformation.difficulty_level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChefHat className="w-4 h-4" />
                          <span className="capitalize">{transformation.meal_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {transformation.dietary_tags?.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 