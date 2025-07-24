# MomFudy Analytics System

## Overview
The MomFudy analytics system tracks user behavior and provides insights into website usage, helping you understand how users interact with your recipe recommendation app.

## Features

### 📊 **Metrics Tracked**
1. **Website Visits** - Page visits with unique visitor tracking
2. **Suggestions Clicked** - Button clicks for getting meal suggestions (Get Meal Suggestion, What Can I Make, Try Another)
3. **Average Time Spent** - Session duration analysis
4. **Return Usage** - Repeat visitor tracking by IP address

### 🎯 **Key Insights**
- Most popular suggestion buttons and pages
- User engagement patterns (2-3 suggestions per session is ideal)
- Return clicker behavior (users who keep asking for more suggestions)
- Session duration trends
- Problem validation (frequent clicks = real need for suggestions)

## Database Setup

### 1. Run the Analytics Schema
Execute the SQL commands in `analytics-schema.sql` in your Supabase SQL editor:

```sql
-- This creates the necessary tables and indexes
-- Run the entire analytics-schema.sql file
```

### 2. Tables Created
- `analytics_visits` - Tracks page visits
- `analytics_suggestions` - Tracks suggestion button clicks (Get Meal Suggestion, What Can I Make, Try Another)
- `analytics_sessions` - Tracks user sessions and time spent

## Implementation Details

### 📍 **Tracking Points**
- **Homepage**: Tracks page visit, session start, and "Get Meal Suggestion"/"What Can I Make" button clicks
- **Result Page**: Tracks page visit and "Try Another" button clicks
- **Session End**: Tracks when users leave the site

### 🔧 **Files Modified**
- `lib/analytics.js` - Core analytics functions
- `pages/index.js` - Homepage tracking
- `pages/result.js` - Result page tracking
- `pages/admin.js` - Analytics dashboard
- `pages/api/get-ip.js` - IP address detection

### 📱 **Admin Dashboard**
Access analytics at `/admin` to view:
- Real-time metrics
- Top performing suggestion buttons
- Average clicks per session (2-3 is ideal)
- Return clicker analysis (users who keep asking for more)
- Page visit statistics
- Return visitor analysis

## Usage

### For Users
Analytics tracking is automatic and privacy-friendly:
- No personal data collected
- Only IP addresses for unique visitor tracking
- Session data for engagement analysis

### For Admins
1. **View Analytics**: Go to `/admin` and scroll to the Analytics Dashboard
2. **Filter by Period**: Select 7, 30, or 90 days
3. **Refresh Data**: Click the refresh button for real-time updates

## Privacy & Compliance

### ✅ **Privacy-Friendly**
- No personal information collected
- IP addresses used only for unique visitor counting
- No tracking across different websites
- Data stored securely in Supabase

### 🔒 **Data Security**
- Row Level Security (RLS) enabled
- Secure API endpoints
- No sensitive user data stored

## Troubleshooting

### Common Issues

1. **Analytics not loading**
   - Check Supabase connection
   - Verify tables exist in database
   - Check browser console for errors

2. **IP address showing as 'unknown'**
   - Verify `/api/get-ip.js` route is working
   - Check network connectivity

3. **Session tracking issues**
   - Ensure localStorage is enabled
   - Check for browser privacy settings

### Debug Commands
```javascript
// Check analytics data in browser console
console.log('Analytics data:', analyticsData)

// Test IP detection
fetch('/api/get-ip').then(r => r.json()).then(console.log)
```

## Future Enhancements

### 🚀 **Potential Additions**
- Geographic location tracking
- Device type analytics
- Search term analysis
- Recipe rating tracking
- User journey mapping

### 📈 **Advanced Metrics**
- Conversion rate analysis
- A/B testing support
- Cohort analysis
- Retention metrics

## Support

For issues or questions about the analytics system:
1. Check the browser console for errors
2. Verify database tables exist
3. Test API endpoints manually
4. Review Supabase logs for connection issues 