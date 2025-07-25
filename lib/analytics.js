import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if the environment variables are properly set
const isValidUrl = supabaseUrl && supabaseUrl !== 'your_supabase_project_url_here' && !supabaseUrl.includes('placeholder')
const isValidKey = supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here' && !supabaseAnonKey.includes('placeholder')

const supabase = isValidUrl && isValidKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!supabase) {
  console.warn('Supabase not configured. Analytics will be disabled.')
}

// Analytics tracking functions
export const analytics = {
  // Track page visits
  async trackPageVisit(page, userAgent) {
    try {
      const ipAddress = await this.getClientIP()
      const isBlacklisted = await this.isIPBlacklisted(ipAddress)
      const isMyDevice = this.isMyDevice(userAgent, ipAddress)
      
      console.log('📊 Analytics tracking attempt:', {
        page,
        ipAddress,
        isBlacklisted,
        isMyDevice,
        userAgent: userAgent.substring(0, 100) + '...'
      })
      
      if (isBlacklisted || isMyDevice) {
        console.log('🚫 Device excluded from tracking:', isBlacklisted ? 'IP blacklisted' : 'My device detected')
        return
      }

      const sessionId = this.getSessionId()
      
      // More robust duplicate prevention
      const visitKey = `visited_${page}_${sessionId}`
      const globalVisitKey = `visited_${page}_${ipAddress}_${sessionId}`
      
      // Check both session-specific and global visit markers
      if (localStorage.getItem(visitKey) || localStorage.getItem(globalVisitKey)) {
        console.log('🔄 Page already visited in this session:', page)
        return
      }
      
      console.log('✅ Tracking page visit:', page, 'IP:', ipAddress, 'Session:', sessionId)
      
      if (!supabase) {
        console.log('📊 Analytics disabled - Supabase not configured')
        // Mark this page as visited in this session (both markers)
        localStorage.setItem(visitKey, 'true')
        localStorage.setItem(globalVisitKey, 'true')
        return
      }
      
      const { error } = await supabase
        .from('website_visits')
        .insert({
          page_visited: page,
          user_agent: userAgent,
          ip_address: ipAddress,
          session_id: sessionId,
          visit_time: new Date().toISOString()
        })

      if (error) {
        console.warn('Error tracking page visit:', error.message)
      } else {
        console.log('✅ Page visit tracked successfully')
        // Mark this page as visited in this session (both markers)
        localStorage.setItem(visitKey, 'true')
        localStorage.setItem(globalVisitKey, 'true')
      }
    } catch (error) {
      console.warn('Error in trackPageVisit:', error.message)
    }
  },

  // Track suggestion clicks
  async trackSuggestionClick(buttonType, searchCriteria) {
    try {
      const ipAddress = await this.getClientIP()
      const isBlacklisted = await this.isIPBlacklisted(ipAddress)
      const isMyDevice = this.isMyDevice(navigator.userAgent, ipAddress)
      
      if (isBlacklisted || isMyDevice) {
        console.log('🚫 Device excluded from tracking:', isBlacklisted ? 'IP blacklisted' : 'My device detected')
        return
      }

      const sessionId = this.getSessionId()
      console.log('📊 Tracking suggestion click:', buttonType, 'IP:', ipAddress)
      
      if (!supabase) {
        console.log('📊 Analytics disabled - Supabase not configured')
        return
      }
      
      const { error } = await supabase
        .from('suggestion_clicks')
        .insert({
          button_clicked: buttonType,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          session_id: sessionId,
          click_time: new Date().toISOString()
        })

      if (error) {
        console.warn('Error tracking suggestion click:', error.message)
      }
    } catch (error) {
      console.warn('Error in trackSuggestionClick:', error.message)
    }
  },

  // Track session start
  async trackSessionStart() {
    try {
      const ipAddress = await this.getClientIP()
      const isBlacklisted = await this.isIPBlacklisted(ipAddress)
      const isMyDevice = this.isMyDevice(navigator.userAgent, ipAddress)
      
      if (isBlacklisted || isMyDevice) {
        console.log('🚫 Device excluded from tracking:', isBlacklisted ? 'IP blacklisted' : 'My device detected')
        return
      }

      const sessionId = this.getSessionId()
      console.log('📊 Tracking session start:', sessionId, 'IP:', ipAddress)
      
      // Store session start in localStorage for now since we don't have a sessions table
      localStorage.setItem('momfoodie_session_start', new Date().toISOString())
      
      // Clear old visit markers for new session
      this.clearOldVisitMarkers(sessionId)
      
      // Clear IP cache for new session to ensure fresh IP detection
      localStorage.removeItem('momfoodie_cached_ip')
      localStorage.removeItem('momfoodie_ip_cache_time')
      console.log('🧹 Cleared IP cache for new session')
    } catch (error) {
      console.error('Error in trackSessionStart:', error)
    }
  },

  // Track session end
  async trackSessionEnd() {
    try {
      const ipAddress = await this.getClientIP()
      const isBlacklisted = await this.isIPBlacklisted(ipAddress)
      const isMyDevice = this.isMyDevice(navigator.userAgent, ipAddress)
      
      if (isBlacklisted || isMyDevice) {
        return
      }

      const sessionId = this.getSessionId()
      console.log('📊 Tracking session end:', sessionId, 'IP:', ipAddress)
      
      // Clear session data from localStorage
      localStorage.removeItem('momfoodie_session_start')
    } catch (error) {
      console.error('Error in trackSessionEnd:', error)
    }
  },

  // Get session ID
  getSessionId() {
    let sessionId = localStorage.getItem('momfoodie_session_id')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('momfoodie_session_id', sessionId)
    }
    return sessionId
  },

  // Get client IP address (with caching)
  async getClientIP() {
    try {
      // Check if we have a cached IP for this session
      const cachedIP = localStorage.getItem('momfoodie_cached_ip')
      const cacheTime = localStorage.getItem('momfoodie_ip_cache_time')
      
      // Use cached IP if it's less than 5 minutes old
      if (cachedIP && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime)
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          console.log('📋 Using cached IP:', cachedIP)
          return cachedIP
        }
      }
      
      console.log('🌐 Fetching new IP address...')
      const response = await fetch('/api/get-ip', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        console.warn('IP API returned non-OK status:', response.status)
        return 'unknown'
      }
      
      const data = await response.json()
      const ip = data.ip || 'unknown'
      
      // Cache the IP for 5 minutes
      localStorage.setItem('momfoodie_cached_ip', ip)
      localStorage.setItem('momfoodie_ip_cache_time', Date.now().toString())
      
      console.log('✅ IP cached:', ip)
      return ip
    } catch (error) {
      console.warn('Failed to get client IP:', error.message)
      return 'unknown'
    }
  },

  // Check if IP is blacklisted
  async isIPBlacklisted(ip) {
    // TEMPORARILY DISABLED: Device tracking table causing 406 errors
    // This function is not essential for core analytics functionality
    console.log('🔧 IP blacklist check disabled (device_tracking table issues)')
    return false
  },

  // Clear old visit markers for new session
  clearOldVisitMarkers(currentSessionId) {
    try {
      // Remove all visit markers that don't belong to current session
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('visited_') && !key.includes(currentSessionId)) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      if (keysToRemove.length > 0) {
        console.log('🧹 Cleared', keysToRemove.length, 'old visit markers')
      }
    } catch (error) {
      console.warn('Error clearing old visit markers:', error)
    }
  },

  // Debug function to check analytics state
  debugAnalyticsState() {
    const sessionId = this.getSessionId()
    const cachedIP = localStorage.getItem('momfoodie_cached_ip')
    const cacheTime = localStorage.getItem('momfoodie_ip_cache_time')
    const sessionStart = localStorage.getItem('momfoodie_session_start')
    
    // Get all visit markers
    const visitMarkers = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('visited_')) {
        visitMarkers.push(key)
      }
    }
    
    console.log('🔍 Analytics Debug Info:', {
      sessionId,
      cachedIP,
      cacheTime: cacheTime ? new Date(parseInt(cacheTime)).toISOString() : null,
      sessionStart: sessionStart ? new Date(sessionStart).toISOString() : null,
      visitMarkers,
      totalLocalStorageKeys: localStorage.length
    })
  },

  // Check if this is my device (multiple detection methods)
  isMyDevice(userAgent, ipAddress) {
    // TEMPORARY: Disable device exclusions for testing
    const disableExclusions = localStorage.getItem('momfoodie_disable_exclusions') === 'true'
    if (disableExclusions) {
      console.log('🧪 Device exclusions disabled for testing')
      return false
    }

    // Method 1: Check if device is marked as "my device" in localStorage
    const isMarkedAsMyDevice = localStorage.getItem('momfoodie_my_device') === 'true'
    if (isMarkedAsMyDevice) {
      console.log('🚫 Device marked as "my device" in localStorage')
      return true
    }

    // Method 2: Check for common development/private IP ranges (but allow localhost for testing)
    const privateIPRanges = [
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^fc00:/,
      /^fe80:/
    ]
    
    const isPrivateIP = privateIPRanges.some(range => range.test(ipAddress))
    if (isPrivateIP) {
      console.log('🚫 Private IP detected:', ipAddress)
      return true
    }

    // Method 3: Check for development user agents
    const devUserAgents = [
      /chrome-devtools/i,
      /chrome devtools/i,
      /firefox devtools/i,
      /safari devtools/i
    ]
    
    const isDevUserAgent = devUserAgents.some(pattern => pattern.test(userAgent))
    if (isDevUserAgent) {
      console.log('🚫 Development user agent detected')
      return true
    }

    // Method 4: Check for common development ports in referrer (but allow for testing)
    // Commented out to allow localhost testing
    /*
    if (typeof window !== 'undefined' && window.location) {
      const isDevPort = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 8000, 8080, 9000].includes(window.location.port)
      if (isDevPort) {
        console.log('🚫 Development port detected:', window.location.port)
        return true
      }
    }
    */

    return false
  }
}

// Analytics dashboard functions
export const analyticsDashboard = {
  // Get website visits analytics
  async getWebsiteVisits(period = '7d') {
    try {
      if (!supabase) {
        console.log('📊 Analytics disabled - Supabase not configured')
        return { total: 0, uniqueVisitors: 0, byPage: {} }
      }
      
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 1
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('website_visits')
        .select('*')
        .gte('visit_time', startDate.toISOString())
        .order('visit_time', { ascending: false })

      if (error) {
        console.warn('Error fetching website visits:', error.message)
        return { total: 0, uniqueVisitors: 0, byPage: {} }
      }

      return {
        total: data.length,
        uniqueVisitors: this.getUniqueVisitors(data),
        byPage: this.groupByPage(data)
      }
    } catch (error) {
      console.warn('Error in getWebsiteVisits:', error.message)
      return { total: 0, uniqueVisitors: 0, byPage: {} }
    }
  },

  // Get suggestion clicks analytics
  async getSuggestionClicks(period = '7d') {
    try {
      if (!supabase) {
        console.log('📊 Analytics disabled - Supabase not configured')
        return { total: 0, averageClicksPerSession: 0, topButtonTypes: [], returnClickers: [] }
      }
      
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 1
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('suggestion_clicks')
        .select('*')
        .gte('click_time', startDate.toISOString())
        .order('click_time', { ascending: false })

      if (error) {
        console.warn('Error fetching suggestion clicks:', error.message)
        return { total: 0, averageClicksPerSession: 0, topButtonTypes: [], returnClickers: [] }
      }

      return {
        total: data.length,
        averageClicksPerSession: this.getAverageClicksPerSession(data),
        topButtonTypes: this.getTopButtonTypes(data),
        returnClickers: this.getReturnClickers(data)
      }
    } catch (error) {
      console.warn('Error in getSuggestionClicks:', error.message)
      return { total: 0, averageClicksPerSession: 0, topButtonTypes: [], returnClickers: [] }
    }
  },

  // Get average time spent (simplified since we don't have sessions table)
  async getAverageTimeSpent(period = '7d') {
    try {
      // For now, return 0 since we don't have proper session tracking
      // This can be enhanced later with a sessions table
      return 0
    } catch (error) {
      console.error('Error getting average time spent:', error)
      return 0
    }
  },

  // Get return usage
  async getReturnUsage(period = '7d') {
    try {
      if (!supabase) {
        console.log('📊 Analytics disabled - Supabase not configured')
        return { returnVisitors: 0, totalVisitors: 0, percentage: 0 }
      }
      
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 1
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('website_visits')
        .select('ip_address, visit_time')
        .gte('visit_time', startDate.toISOString())

      if (error) throw error

      const visitsByIP = this.groupByIP(data)
      const returnVisitors = Object.values(visitsByIP).filter(visits => visits.length > 1).length
      const totalVisitors = Object.keys(visitsByIP).length

      return {
        returnVisitors,
        totalVisitors,
        percentage: totalVisitors > 0 ? Math.round((returnVisitors / totalVisitors) * 100) : 0
      }
    } catch (error) {
      console.error('Error getting return usage:', error)
      return { returnVisitors: 0, totalVisitors: 0, percentage: 0 }
    }
  },

  // Helper functions
  groupByPage(data) {
    return data.reduce((acc, visit) => {
      acc[visit.page_visited] = (acc[visit.page_visited] || 0) + 1
      return acc
    }, {})
  },

  groupByDay(data) {
    return data.reduce((acc, visit) => {
      const date = new Date(visit.visit_time).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
  },

  getUniqueVisitors(data) {
    const uniqueIPs = new Set(data.map(visit => visit.ip_address))
    return uniqueIPs.size
  },

  groupByButtonType(data) {
    return data.reduce((acc, click) => {
      acc[click.button_clicked] = (acc[click.button_clicked] || 0) + 1
      return acc
    }, {})
  },

  getTopButtonTypes(data) {
    const byType = this.groupByButtonType(data)
    return Object.entries(byType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))
  },

  getAverageClicksPerSession(data) {
    const sessions = new Set(data.map(click => click.session_id))
    return sessions.size > 0 ? Math.round(data.length / sessions.size * 10) / 10 : 0
  },

  getReturnClickers(data) {
    const clicksByIP = this.groupByIP(data)
    return Object.values(clicksByIP).filter(clicks => clicks.length > 1).length
  },

  groupByIP(data) {
    return data.reduce((acc, item) => {
      if (!acc[item.ip_address]) {
        acc[item.ip_address] = []
      }
      acc[item.ip_address].push(item)
      return acc
    }, {})
  },

  // IP Blacklist management functions (TEMPORARILY DISABLED - device_tracking table issues)
  async getBlacklistedIPs() {
    console.log('🔧 getBlacklistedIPs disabled (device_tracking table issues)')
    return []
  },

  async addBlacklistedIP(ipAddress, description = '') {
    console.log('🔧 addBlacklistedIP disabled (device_tracking table issues)')
    return { success: false, error: 'Device tracking temporarily disabled' }
  },

  async removeBlacklistedIP(ipAddress) {
    console.log('🔧 removeBlacklistedIP disabled (device_tracking table issues)')
    return { success: false, error: 'Device tracking temporarily disabled' }
  },

  // Get user feedback analytics
  async getUserFeedback(period = '7d') {
    try {
      if (!supabase) {
        console.log('📊 Analytics disabled - Supabase not configured')
        return { 
          total: 0, 
          averageRating: 0, 
          ratingDistribution: {}, 
          topRatedMeals: [],
          recentFeedback: []
        }
      }
      
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 1
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        total: data.length,
        averageRating: this.calculateAverageRating(data),
        ratingDistribution: this.getRatingDistribution(data),
        topRatedMeals: this.getTopRatedMeals(data),
        recentFeedback: data.slice(0, 10) // Last 10 feedback entries
      }
    } catch (error) {
      console.error('Error getting user feedback:', error)
      return { 
        total: 0, 
        averageRating: 0, 
        ratingDistribution: {}, 
        topRatedMeals: [],
        recentFeedback: []
      }
    }
  },

  // Calculate average rating
  calculateAverageRating(data) {
    if (!data || data.length === 0) return 0
    const totalRating = data.reduce((sum, item) => sum + item.rating, 0)
    return Math.round((totalRating / data.length) * 10) / 10 // Round to 1 decimal place
  },

  // Get rating distribution
  getRatingDistribution(data) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    data.forEach(item => {
      if (distribution[item.rating] !== undefined) {
        distribution[item.rating]++
      }
    })
    return distribution
  },

  // Get top rated meals
  getTopRatedMeals(data) {
    const mealRatings = {}
    
    data.forEach(item => {
      if (!mealRatings[item.meal_name]) {
        mealRatings[item.meal_name] = { total: 0, count: 0, average: 0 }
      }
      mealRatings[item.meal_name].total += item.rating
      mealRatings[item.meal_name].count++
    })

    // Calculate averages
    Object.keys(mealRatings).forEach(mealName => {
      mealRatings[mealName].average = Math.round((mealRatings[mealName].total / mealRatings[mealName].count) * 10) / 10
    })

    // Sort by average rating and return top 10
    return Object.entries(mealRatings)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10)
  }
} 