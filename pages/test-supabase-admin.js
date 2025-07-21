import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function TestSupabaseAdmin() {
  const [status, setStatus] = useState('')
  const [testResult, setTestResult] = useState('')

  const checkEnvironment = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    setStatus(`
🔍 Environment Variables Check:
- NEXT_PUBLIC_SUPABASE_URL: ${url ? '✅ Set' : '❌ Missing'}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${key ? '✅ Set' : '❌ Missing'}
- Supabase Client: ${supabase ? '✅ Available' : '❌ Not Available'}

${url === 'your_supabase_project_url_here' ? '⚠️ URL is still placeholder value' : ''}
${key === 'your_supabase_anon_key_here' ? '⚠️ Key is still placeholder value' : ''}
    `)
  }

  const testConnection = async () => {
    if (!supabase) {
      setTestResult('❌ Cannot test: Supabase client not available')
      return
    }

    try {
      setTestResult('🔄 Testing connection...')
      
      // Test basic connection
      const { data, error } = await supabase
        .from('meals')
        .select('count')
        .limit(1)
      
      if (error) {
        setTestResult(`❌ Connection failed: ${error.message}`)
      } else {
        setTestResult('✅ Connection successful! Supabase is working.')
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Supabase Admin Test</h1>
        
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Environment Check</h2>
          <button 
            onClick={checkEnvironment}
            className="btn-primary mb-4"
          >
            Check Environment Variables
          </button>
          <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
            {status || 'Click button to check environment variables'}
          </pre>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Connection Test</h2>
          <button 
            onClick={testConnection}
            className="btn-primary mb-4"
            disabled={!supabase}
          >
            Test Supabase Connection
          </button>
          <div className="bg-gray-100 p-4 rounded text-sm">
            {testResult || 'Click button to test connection'}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Setup Instructions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold">1. Create .env.local file</h3>
              <p>In your project root, create a file called <code>.env.local</code></p>
            </div>
            
            <div>
              <h3 className="font-semibold">2. Add your Supabase credentials</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold">3. Get your credentials from Supabase</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600">Supabase Dashboard</a></li>
                <li>Select your project</li>
                <li>Go to Settings → API</li>
                <li>Copy &quot;Project URL&quot; and &quot;anon public&quot; key</li>
                <li>Paste them in your .env.local file</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold">4. Restart your development server</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs">
{`npm run dev`}
              </pre>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/admin" className="btn-secondary">
            ← Back to Admin
          </Link>
        </div>
      </div>
    </div>
  )
} 