import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if the environment variables are properly set (not placeholder values)
const isValidUrl = supabaseUrl && supabaseUrl !== 'your_supabase_project_url_here' && !supabaseUrl.includes('placeholder')
const isValidKey = supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here' && !supabaseAnonKey.includes('placeholder')

if (!isValidUrl || !isValidKey) {
  console.warn('Missing or invalid Supabase environment variables. App will use fallback data.')
}

export const supabase = isValidUrl && isValidKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Types for our meals (JSDoc comments for documentation)
/**
 * @typedef {Object} Meal
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {'breakfast' | 'lunch' | 'dinner'} meal_type
 * @property {string} dietary_preference
 * @property {'quick' | 'regular' | 'elaborate'} cooking_time
 * @property {string} prep_time
 * @property {'easy' | 'medium' | 'hard'} difficulty
 * @property {string[]} ingredients
 * @property {string[]} instructions
 * @property {string} cuisine_type
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} UserFeedback
 * @property {number} [id]
 * @property {number} meal_id
 * @property {number} rating
 * @property {string} [comment]
 * @property {string} [created_at]
 */

// Analytics helper (for future use)
export const trackEvent = (event, properties) => {
  if (typeof window !== 'undefined') {
    console.log('Event:', event, properties)
    // Future: Add Google Analytics or other tracking
  }
}
