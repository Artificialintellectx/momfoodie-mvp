# 🍽️ MomFoodie MVP - Never Wonder What to Cook Again!

**The instant Nigerian meal suggestion app that solves cooking decision paralysis in under 30 seconds.**

Based on validated user research showing that 80% of Nigerian women experience daily cooking indecision and waste 30+ minutes just deciding what to cook.

## 🎯 Problem Solved

**Validated Pain Points:**
- 80% experience cooking indecision daily/weekly
- 70% spend 30+ minutes just deciding what to cook
- 60% have ordered takeout due to decision paralysis
- Current solutions (YouTube, family calls) are time-consuming

**Our Solution:** Instant Nigerian meal suggestions in under 30 seconds.

## ✨ Features

### Core MVP Features
- **⚡ Quick Suggestions** - Get meal ideas in under 5 seconds
- **🍳 Meal Type Filters** - Breakfast, lunch, dinner options
- **⏰ Time-Based Filtering** - Quick, regular, or elaborate meals
- **🥗 Dietary Preferences** - Any, vegetarian, vegan options
- **🛒 Ingredient-Based Search** - "What can I make with what I have?"
- **❤️ Save Favorites** - Keep your best discoveries
- **📱 Share Recipes** - WhatsApp integration for easy sharing
- **👍 Feedback System** - Rate suggestions to improve recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (optional but recommended)

### Installation

1. **Clone the project**
   ```bash
   cd /Users/ugome/Desktop/momfoodie-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database (optional)**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL commands in `database-setup.sql`
   - Copy your project URL and anon key to `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Validation Results

Based on 10 user interviews with Nigerian women aged 26-35:

### Pain Points Confirmed ✅
- **40%** experience cooking indecision daily
- **20%** experience it multiple times per day
- **50%** spend more than 1 hour just deciding what to cook
- **70%** spend 30+ minutes on meal decisions

### Target Audience ✅
- **Primary**: Working mothers, ages 26-35, Abuja/Lagos
- **Profile**: Cook 5-6 times/week but struggle with decision fatigue
- **Behavior**: Already search for solutions (YouTube, WhatsApp, family)

## 🛠️ Technical Stack

### Frontend
- **Next.js 14** - React framework with latest features
- **React 18** - UI library with hooks
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Progressive Web App** - Mobile app experience

### Backend
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Built-in data protection
- **REST API** - Simple database queries

## 📈 Success Metrics

### User Engagement (Current Targets)
- **70%** of testers use 3+ times per week
- **60%** return within 24 hours
- **2-3** suggestions viewed per session
- **40%** still active after 1 month

### Problem Solving
- **80%** report reduced decision time
- **4+** star average satisfaction rating
- **50%** refer the app to others
- **< 2 minutes** average decision time (vs 30+ minutes before)

## 🚢 Deployment

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in dashboard
4. Deploy automatically

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
```

### Production Cleanup Checklist
Before deploying to production:

1. **Environment Setup**:
   - Create `.env.local` file with your Supabase credentials
   - Ensure all environment variables are properly set

2. **Code Cleanup**:
   - Remove or comment out debug console.log statements
   - Test all functionality thoroughly
   - Ensure no sensitive data is exposed

3. **Performance Optimization**:
   - Build and test the production build locally
   - Check for any console errors or warnings
   - Verify all features work as expected

4. **Security Check**:
   - Ensure no API keys are hardcoded
   - Verify Supabase RLS policies are properly configured
   - Test with different user scenarios

## 🔧 Development

### Project Structure
```