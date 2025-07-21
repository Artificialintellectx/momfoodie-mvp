// Supabase Connection Test
// This file helps diagnose Supabase connection issues

import { createClient } from '@supabase/supabase-js'

export const testSupabaseConnection = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 Supabase Connection Test')
  console.log('========================')

  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Environment variables are missing!')
    console.log('Please create a .env.local file with your Supabase credentials.')
    return {
      connected: false,
      error: 'Missing environment variables',
      details: {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey
      }
    }
  }

  // Check for placeholder values
  if (supabaseUrl === 'your_supabase_project_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
    console.log('❌ Environment variables contain placeholder values!')
    console.log('Please replace with your actual Supabase credentials.')
    return {
      connected: false,
      error: 'Placeholder values detected',
      details: {
        url: supabaseUrl,
        key: supabaseAnonKey ? '***' : 'missing'
      }
    }
  }

  try {
    // Create client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase client created successfully')

    // Test connection by querying the meals table
    console.log('🔍 Testing database connection...')
    const { data, error } = await supabase
      .from('meals')
      .select('count')
      .limit(1)

    if (error) {
      console.log('❌ Database connection failed:', error.message)
      return {
        connected: false,
        error: error.message,
        details: {
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      }
    }

    console.log('✅ Database connection successful!')
    console.log('✅ Meals table is accessible')

    // Get table info
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .limit(5)

    if (mealsError) {
      console.log('⚠️ Could not fetch meals:', mealsError.message)
    } else {
      console.log(`📊 Found ${meals.length} meals in database`)
    }

    return {
      connected: true,
      message: 'Supabase is connected and working!',
      details: {
        mealsCount: meals?.length || 0,
        url: supabaseUrl,
        key: '***' + supabaseAnonKey.slice(-4)
      }
    }

  } catch (error) {
    console.log('❌ Connection test failed:', error.message)
    return {
      connected: false,
      error: error.message,
      details: {
        type: error.name,
        message: error.message
      }
    }
  }
}

export const getConnectionStatus = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      status: 'not-configured',
      message: 'Environment variables not set',
      action: 'Create .env.local file'
    }
  }

  if (supabaseUrl === 'your_supabase_project_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
    return {
      status: 'placeholder-values',
      message: 'Using placeholder values',
      action: 'Replace with real credentials'
    }
  }

  return {
    status: 'configured',
    message: 'Environment variables set',
    action: 'Test connection'
  }
}

// Setup instructions
export const getSetupInstructions = () => {
  return {
    title: 'Supabase Setup Instructions',
    steps: [
      {
        step: 1,
        title: 'Create Supabase Project',
        description: 'Go to supabase.com and create a new project',
        url: 'https://supabase.com'
      },
      {
        step: 2,
        title: 'Get Project Credentials',
        description: 'Go to Settings > API in your Supabase dashboard',
        details: 'Copy the Project URL and anon/public key'
      },
      {
        step: 3,
        title: 'Create .env.local File',
        description: 'Create a .env.local file in your project root',
        code: `NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here`
      },
      {
        step: 4,
        title: 'Run Database Setup',
        description: 'Copy and run the SQL from database-setup.sql in your Supabase SQL editor',
        file: 'database-setup.sql'
      },
      {
        step: 5,
        title: 'Test Connection',
        description: 'Restart your development server and test the connection',
        command: 'npm run dev'
      }
    ]
  }
} 