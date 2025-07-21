# MomFoodie MVP - Product Requirements Document

## Executive Summary

**Product Name**: MomFoodie MVP  
**Version**: 1.0  
**Target Launch**: Immediate (Post-Validation)  
**Primary Goal**: Solve the daily cooking decision paralysis experienced by Nigerian women  

## Problem Statement

**Validated Pain Points from Survey:**
- 80% of users experience cooking indecision daily/weekly
- 70% spend 30+ minutes just deciding what to cook
- 60% have ordered takeout due to decision paralysis
- Current solutions (YouTube, WhatsApp, family calls) are time-consuming and inconsistent

**Core Problem**: "I don't know what to cook" wastes significant time and mental energy daily.

## Target Users

**Primary Persona**: Busy Bisi
- Age: 26-35
- Location: Abuja, Lagos, Enugu (Urban Nigeria)
- Job: Full-time professional
- Family: Married with expectations to cook regularly
- Pain: Spends 1+ hour daily just deciding what to cook
- Behavior: Already searches for solutions online

**Secondary Persona**: Overwhelmed Oyin
- Age: 26-35
- Job: Part-time/Business owner
- Pain: Multiple daily decision paralysis moments
- Behavior: Calls family for advice, orders takeout when stuck

## Product Vision

**Vision Statement**: "Eliminate cooking decision paralysis for Nigerian women in under 30 seconds."

**Success Metrics**:
- Reduce decision time from 30+ minutes to under 2 minutes
- 70% of users return within 24 hours
- 50% use app 3+ times per week
- 80% say they'd recommend to friends

## MVP Feature Requirements

### Core Features (Must Have)

#### 1. Quick Meal Suggestion Engine
**User Story**: "As a busy mother, I want instant meal suggestions so I can stop wasting time deciding what to cook."

**Functionality**:
- Single-click meal suggestion
- Filter by meal type (Breakfast, Lunch, Dinner)
- Filter by dietary preference (Any, Vegetarian, Vegan, etc.)
- Filter by cooking time (Quick <30 mins, Regular 30-60 mins, Elaborate 60+ mins)
- Random suggestion generator

**Acceptance Criteria**:
- User gets 1-3 meal suggestions within 5 seconds
- Suggestions include Nigerian dishes relevant to user's filters
- Each suggestion shows: Name, Description, Prep Time, Ingredients
- "Get Another Suggestion" functionality

#### 2. Ingredient-Based Suggestions
**User Story**: "As someone staring at my fridge, I want suggestions based on what I already have."

**Functionality**:
- Common ingredient checkboxes (Rice, Plantain, Tomatoes, etc.)
- "What can I make with these?" button
- Smart matching with available recipes

#### 3. Quick Recipe Details
**User Story**: "As someone who found a good suggestion, I want basic cooking guidance."

**Functionality**:
- Ingredient list for each suggestion
- Basic cooking steps (3-5 simple steps)
- Estimated cooking and prep time
- Difficulty level indicator

#### 4. Favorites & History
**User Story**: "As a repeat user, I want to save good suggestions for later."

**Functionality**:
- Heart/Save button for each suggestion
- "My Saved Recipes" section
- Recent suggestions history
- Quick access to frequently saved items

### Secondary Features (Should Have)

#### 5. Share Functionality
**User Story**: "As someone who found a great recipe, I want to share it with family/friends."

**Functionality**:
- WhatsApp sharing integration
- Copy recipe to clipboard
- Share button for each suggestion

#### 6. Feedback System
**User Story**: "As a user, I want to rate suggestions so the app learns my preferences."

**Functionality**:
- Simple thumbs up/down after each suggestion
- "Was this helpful?" quick feedback
- Optional comment box

### Nice-to-Have Features (Future Versions)

- Shopping list generation
- Meal planning calendar
- Video cooking instructions
- User profile and preferences
- Community recipe sharing

## Technical Requirements

### Frontend Technology Stack
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)
- **Deployment**: Vercel

### Backend Technology Stack
- **Database**: Supabase (PostgreSQL)
- **Authentication**: None (MVP is login-free)
- **API**: Supabase REST API
- **Storage**: Supabase for recipe data

### Performance Requirements
- **Load Time**: < 3 seconds on 3G connection
- **Suggestion Response**: < 2 seconds
- **Mobile Responsive**: Works on all screen sizes
- **Offline Capability**: Basic functionality with cached data

### Database Schema

#### meals Table
```sql
- id (Primary Key)
- name (VARCHAR) - Recipe name
- description (TEXT) - Brief description
- meal_type (ENUM) - breakfast, lunch, dinner
- dietary_preference (ENUM) - any, vegetarian, vegan, etc.
- cooking_time (ENUM) - quick, regular, elaborate
- prep_time (VARCHAR) - "30 mins", "1 hour"
- difficulty (ENUM) - easy, medium, hard
- ingredients (TEXT[]) - Array of ingredients
- instructions (TEXT[]) - Array of cooking steps
- cuisine_type (VARCHAR) - Nigerian, International
- created_at (TIMESTAMP)
```

#### user_feedback Table (Optional)
```sql
- id (Primary Key)
- meal_id (Foreign Key)
- rating (INTEGER) - 1-5 or thumbs up/down
- comment (TEXT)
- created_at (TIMESTAMP)
```

## User Experience Requirements

### Design Principles
1. **Speed First**: Every interaction should feel instant
2. **Nigerian-Centric**: Authentic local cuisine focus
3. **Mobile-First**: Optimized for smartphone usage
4. **Zero Friction**: No registration, no complex forms

### User Flow

#### Primary Flow: Getting a Suggestion
1. User opens app
2. (Optional) Select filters (meal type, time, dietary)
3. Click "Get Suggestion" button
4. View suggestion with details
5. (Optional) Save, share, or get another suggestion

#### Secondary Flow: Ingredient-Based Search
1. User opens app
2. Navigate to "What can I make?" section
3. Select available ingredients
4. Get suggestions based on ingredients
5. View and interact with suggestions

### Content Requirements

#### Initial Recipe Database
**Minimum 50 recipes covering**:
- 15 Breakfast options (Akara, Moi Moi, Yam & Egg, etc.)
- 20 Lunch options (Jollof Rice, Egusi, Fried Rice, etc.)
- 15 Dinner options (Pepper Soup, Rice & Stew, etc.)

**Each recipe must include**:
- Authentic Nigerian name
- Clear ingredient list with local alternatives
- Realistic prep/cooking times
- Simple 3-5 step instructions
- Dietary classification

#### Content Tone
- Warm and encouraging
- Nigerian English/expressions where appropriate
- Practical and realistic about time/ingredients
- Celebrates Nigerian cuisine

## Success Metrics & KPIs

### User Engagement
- **Daily Active Users**: Target 70% of testers use 3+ times/week
- **Session Duration**: Average 2-5 minutes (quick but valuable)
- **Return Rate**: 60% return within 24 hours
- **Suggestions per Session**: 2-3 on average

### Product Validation
- **Problem Solving**: 80% report reduced decision time
- **Satisfaction**: 4+ star average rating
- **Word of Mouth**: 50% refer the app to others
- **Retention**: 40% still active after 1 month

### Technical Performance
- **Load Time**: < 3 seconds average
- **Error Rate**: < 5% of requests
- **Mobile Usage**: 80%+ of traffic
- **Search Success**: 90% of suggestions rated helpful

## Risk Assessment

### High Risk
- **Content Quality**: Poor recipe suggestions kill user trust
- **Performance**: Slow load times frustrate time-pressed users
- **Relevance**: Non-Nigerian recipes reduce authenticity

### Medium Risk
- **User Adoption**: Getting initial users to try and stick
- **Technical Scaling**: Database performance with growth
- **Content Maintenance**: Keeping recipe database fresh

### Mitigation Strategies
- Start with curated, tested Nigerian recipes
- Focus on performance optimization from day 1
- Build feedback loops for continuous improvement
- Plan content update workflows

## Launch Strategy

### Phase 1: Closed Beta (Week 1-2)
- Deploy to 10 survey respondents
- Daily usage monitoring and feedback collection
- Rapid iteration based on user behavior

### Phase 2: Referral Expansion (Week 3-4)
- Each satisfied user invites 1-2 friends
- Expand to 25-30 users
- Validate product-market fit signals

### Phase 3: Soft Launch (Week 5-8)
- Share in Nigerian cooking WhatsApp groups
- Instagram/social media launch
- Target 100+ users
- Prepare for scale

## Future Roadmap (Post-MVP)

### Version 1.1 (Month 2)
- User accounts and personalization
- Meal planning calendar
- Shopping list generation
- Enhanced sharing features

### Version 1.2 (Month 3)
- Video cooking instructions
- Community features
- Premium subscription model
- Advanced dietary filters

### Version 2.0 (Month 6)
- AI-powered personalized suggestions
- Nutritional information
- Marketplace integration
- Multi-city expansion

## Conclusion

This MVP focuses on solving the core validated problem: reducing cooking decision time from 30+ minutes to under 2 minutes. By prioritizing speed, relevance, and Nigerian cuisine authenticity, MomFoodie will provide immediate value to our target users while establishing a foundation for future growth.

**Key Success Factor**: The app must feel faster and more relevant than current solutions (YouTube search, family calls, WhatsApp groups) while celebrating Nigerian food culture.