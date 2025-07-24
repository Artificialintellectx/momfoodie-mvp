import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Analytics tracking functions
export const analytics = {
  // Track page visits
  async trackPageVisit(page, userAgent) {
    try {
      const ipAddress = await this.getClientIP()
      const isBlacklisted = await this.isIPBlacklisted(ipAddress)
      const isMyDevice = this.isMyDevice(userAgent, ipAddress)
      
      if (isBlacklisted || isMyDevice) {
        console.log('🚫 Device excluded from tracking:', isBlacklisted ? 'IP blacklisted' : 'My device detected')
        return
      }

      console.log('📊 Tracking page visit:', page, 'IP:', ipAddress)
      
      const { error } = await supabase
        .from('analytics_visits')
        .insert({
          page,
          user_agent: userAgent,
          ip_address: ipAddress,
          visited_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error tracking page visit:', error)
      }
    } catch (error) {
      console.error('Error in trackPageVisit:', error)
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

      console.log('📊 Tracking suggestion click:', buttonType, 'IP:', ipAddress)
      
      const { error } = await supabase
        .from('analytics_suggestions')
        .insert({
          button_type: buttonType,
          search_criteria: JSON.stringify(searchCriteria),
          ip_address: ipAddress,
          clicked_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error tracking suggestion click:', error)
      }
    } catch (error) {
      console.error('Error in trackSuggestionClick:', error)
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
      
      const { error } = await supabase
        .from('analytics_sessions')
        .insert({
          session_id: sessionId,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          started_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error tracking session start:', error)
      }
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
      
      const { error } = await supabase
        .from('analytics_sessions')
        .update({
          ended_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .is('ended_at', null)

      if (error) {
        console.error('Error tracking session end:', error)
      }
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

  // Get client IP
  async getClientIP() {
    try {
      const response = await fetch('/api/get-ip')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error('Error getting client IP:', error)
      return 'unknown'
    }
  },

  // Check if IP is blacklisted
  async isIPBlacklisted(ip) {
    try {
      const { data, error } = await supabase
        .from('analytics_ip_blacklist')
        .select('ip_address')
        .eq('ip_address', ip)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking IP blacklist:', error)
        return false
      }
      return !!data // Return true if IP is found in blacklist
    } catch (error) {
      console.error('Error checking IP blacklist:', error)
      return false
    }
  },

  // Check if this is my device (multiple detection methods)
  isMyDevice(userAgent, ipAddress) {
    // Method 1: Check if device is marked as "my device" in localStorage
    const isMarkedAsMyDevice = localStorage.getItem('momfoodie_my_device') === 'true'
    if (isMarkedAsMyDevice) {
      console.log('🚫 Device marked as "my device" in localStorage')
      return true
    }

    // Method 2: Check for common development/private IP ranges
    const privateIPRanges = [
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^127\./,
      /^::1$/,
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
      /localhost/i,
      /127\.0\.0\.1/i,
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

    // Method 4: Check for common development ports in referrer
    if (typeof window !== 'undefined' && window.location) {
      const isDevPort = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 8000, 8080, 9000].includes(window.location.port)
      if (isDevPort) {
        console.log('🚫 Development port detected:', window.location.port)
        return true
      }
    }

    return false
  }
}

// Analytics dashboard functions
export const analyticsDashboard = {
  // Get website visits
  async getWebsiteVisits(period = '7d') {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 1
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('analytics_visits')
        .select('*')
        .gte('visited_at', startDate.toISOString())
        .order('visited_at', { ascending: false })

      if (error) throw error

      return {
        total: data.length,
        byPage: this.groupByPage(data),
        byDay: this.groupByDay(data),
        uniqueVisitors: this.getUniqueVisitors(data)
      }
    } catch (error) {
      console.error('Error getting website visits:', error)
      return { total: 0, byPage: {}, byDay: {}, uniqueVisitors: 0 }
    }
  },

  // Get suggestion clicks
  async getSuggestionClicks(period = '7d') {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 1
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('analytics_suggestions')
        .select('*')
        .gte('clicked_at', startDate.toISOString())
        .order('clicked_at', { ascending: false })

      if (error) throw error

      return {
        total: data.length,
        byButtonType: this.groupByButtonType(data),
        topButtonTypes: this.getTopButtonTypes(data),
        averageClicksPerSession: this.getAverageClicksPerSession(data),
        returnClickers: this.getReturnClickers(data)
      }
    } catch (error) {
      console.error('Error getting suggestion clicks:', error)
      return { 
        total: 0, 
        byButtonType: {}, 
        topButtonTypes: [], 
        averageClicksPerSession: 0,
        returnClickers: 0
      }
    }
  },

  // Get average time spent
  async getAverageTimeSpent(period = '7d') {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 1
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('started_at', startDate.toISOString())
        .not('ended_at', 'is', null)

      if (error) throw error

      const completedSessions = data.filter(session => session.ended_at)
      const totalTime = completedSessions.reduce((total, session) => {
        const start = new Date(session.started_at)
        const end = new Date(session.ended_at)
        return total + (end - start)
      }, 0)

      return completedSessions.length > 0 ? Math.round(totalTime / completedSessions.length / 1000) : 0
    } catch (error) {
      console.error('Error getting average time spent:', error)
      return 0
    }
  },

  // Get return usage
  async getReturnUsage(period = '7d') {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 1
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('analytics_visits')
        .select('ip_address, visited_at')
        .gte('visited_at', startDate.toISOString())

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
      acc[visit.page] = (acc[visit.page] || 0) + 1
      return acc
    }, {})
  },

  groupByDay(data) {
    return data.reduce((acc, visit) => {
      const date = new Date(visit.visited_at).toLocaleDateString()
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
      acc[click.button_type] = (acc[click.button_type] || 0) + 1
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

  // IP Blacklist management functions
  async getBlacklistedIPs() {
    try {
      const { data, error } = await supabase
        .from('analytics_ip_blacklist')
        .select('*')
        .order('added_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting blacklisted IPs:', error)
      return []
    }
  },

  async addBlacklistedIP(ipAddress, description = '') {
    try {
      const { error } = await supabase
        .from('analytics_ip_blacklist')
        .insert({
          ip_address: ipAddress,
          description: description
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error adding blacklisted IP:', error)
      return false
    }
  },

  async removeBlacklistedIP(ipAddress) {
    try {
      const { error } = await supabase
        .from('analytics_ip_blacklist')
        .delete()
        .eq('ip_address', ipAddress)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing blacklisted IP:', error)
      return false
    }
  },

  // Get user feedback analytics
  async getUserFeedback(period = '7d') {
    try {
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