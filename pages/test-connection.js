import { useState, useEffect } from 'react'
import Link from 'next/link'
import { testSupabaseConnection, getConnectionStatus, getSetupInstructions } from '../lib/supabase-test'
import { CheckCircle2, XCircle, AlertCircle, Info, Copy, ExternalLink } from 'lucide-react'

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const status = getConnectionStatus()
    setConnectionStatus(status)
  }, [])

  const runConnectionTest = async () => {
    setLoading(true)
    try {
      const result = await testSupabaseConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        connected: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'configured':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'not-configured':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'placeholder-values':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'configured':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'not-configured':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'placeholder-values':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200'
    }
  }

  const instructions = getSetupInstructions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Supabase Connection Test</h1>
          <p className="text-gray-600">Check if your Supabase database is properly connected</p>
        </div>

        {/* Current Status */}
        {connectionStatus && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            <div className={`p-4 rounded-lg border ${getStatusColor(connectionStatus.status)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(connectionStatus.status)}
                <div>
                  <p className="font-medium">{connectionStatus.message}</p>
                  <p className="text-sm opacity-75">Action: {connectionStatus.action}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Button */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <button
            onClick={runConnectionTest}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Test Connection
              </>
            )}
          </button>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className={`p-4 rounded-lg border ${
              testResult.connected 
                ? 'text-green-700 bg-green-50 border-green-200' 
                : 'text-red-700 bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {testResult.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {testResult.connected ? 'Connection Successful!' : 'Connection Failed'}
                </span>
              </div>
              
              {testResult.message && (
                <p className="mb-2">{testResult.message}</p>
              )}
              
              {testResult.error && (
                <p className="mb-2 text-sm">Error: {testResult.error}</p>
              )}
              
              {testResult.details && (
                <div className="text-sm">
                  {testResult.details.mealsCount !== undefined && (
                    <p>Meals in database: {testResult.details.mealsCount}</p>
                  )}
                  {testResult.details.url && (
                    <p>URL: {testResult.details.url}</p>
                  )}
                  {testResult.details.key && (
                    <p>Key: {testResult.details.key}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{instructions.title}</h2>
          <div className="space-y-4">
            {instructions.steps.map((step) => (
              <div key={step.step} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white text-sm rounded-full flex items-center justify-center font-medium">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{step.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                    
                    {step.details && (
                      <p className="text-gray-500 text-xs mb-2">{step.details}</p>
                    )}
                    
                    {step.url && (
                      <a 
                        href={step.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Visit {step.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    
                    {step.code && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Environment Variables</span>
                          <button
                            onClick={() => copyToClipboard(step.code)}
                            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                          {step.code}
                        </pre>
                      </div>
                    )}
                    
                    {step.command && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Command</span>
                          <button
                            onClick={() => copyToClipboard(step.command)}
                            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {step.command}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="btn-secondary inline-flex items-center gap-2"
          >
            ← Back to App
          </Link>
        </div>
      </div>
    </div>
  )
} 