# 🔄 Ingredient Search Flowchart

## Process Overview

```mermaid
flowchart TD
    A[User Opens App] --> B[Toggle 'My Ingredients']
    B --> C[Select Ingredients]
    C --> D[Click 'What Can I Make?']
    D --> E[Query Supabase Database]
    E --> F[Apply Ingredient Filtering]
    F --> G[Calculate Adaptive Thresholds]
    G --> H{Primary Threshold Met?}
    H -->|Yes| I[Filter by Primary Threshold]
    H -->|No| J[Apply Fallback Threshold]
    J --> K{Fallback Threshold Met?}
    K -->|Yes| L[Filter by Fallback Threshold]
    K -->|No| M[Apply Final Threshold]
    M --> N[Filter by Final Threshold]
    I --> O[Check Repetition Prevention]
    L --> O
    N --> O
    O --> P{Meals Available?}
    P -->|Yes| Q[Randomly Select Meal]
    P -->|No| R[Show Exhaustion Modal]
    Q --> S[Display Result]
    R --> T[User Chooses Action]
    T --> U[Reset or Go Home]
```

## Detailed Filtering Process

```mermaid
flowchart TD
    A[Recipe from Database] --> B[Check Recipe Name]
    B --> C{Ingredient in Name?}
    C -->|Yes| D[Score +3]
    C -->|No| E[Score +0]
    D --> F[Check Ingredients List]
    E --> F
    F --> G{Ingredient in List?}
    G -->|Yes| H[Score +5]
    G -->|No| I[Score +0]
    H --> J[Check for Optional]
    I --> J
    J --> K{Marked as Optional?}
    K -->|Yes| L[Exclude Recipe]
    K -->|No| M[Calculate Match Percentage]
    L --> N[Recipe Excluded]
    M --> O[Apply Thresholds]
    O --> P{Primary Threshold Met?}
    P -->|Yes| Q[Include in Results]
    P -->|No| R{Fallback Threshold Met?}
    R -->|Yes| S[Include in Results]
    R -->|No| T{Final Threshold Met?}
    T -->|Yes| U[Include in Results]
    T -->|No| V[Exclude from Results]
```

## Adaptive Threshold Logic

```mermaid
flowchart TD
    A[Number of Selected Ingredients] --> B{Count = 1?}
    B -->|Yes| C[Primary: 0%, Fallback: 1, Final: 1]
    B -->|No| D{Count = 2?}
    D -->|Yes| E[Primary: 100%, Fallback: 1, Final: 1]
    D -->|No| F{Count = 4?}
    F -->|Yes| G[Primary: 70%, Fallback: 2, Final: 1]
    F -->|No| H{Count 5-6?}
    H -->|Yes| I[Primary: 70%, Fallback: 3, Final: 2]
    H -->|No| J{Count 7-10?}
    J -->|Yes| K[Primary: 70%, Fallback: 4, Final: 2]
    J -->|No| L{Count 11-15?}
    L -->|Yes| M[Primary: 70%, Fallback: 5, Final: 2]
    L -->|No| N[Primary: 70%, Fallback: 6, Final: 2]
```

## Repetition Prevention System

```mermaid
flowchart TD
    A[Filtered Suggestions] --> B[Generate Filter Key]
    B --> C[Get Shown Meals from localStorage]
    C --> D[Filter Out Already Shown Meals]
    D --> E[Filter Out Current Meal]
    E --> F{Available Meals > 0?}
    F -->|Yes| G[Randomly Select Meal]
    F -->|No| H{All Meals Shown?}
    H -->|Yes| I[Reset Shown Meals]
    H -->|No| J[Show Exhaustion Modal]
    G --> K[Add to Shown Meals]
    I --> L[Start Fresh]
    J --> M[User Action]
    K --> N[Display New Meal]
    L --> N
    M --> O[Reset or Go Home]
```

## Error Handling Flow

```mermaid
flowchart TD
    A[User Action] --> B{Database Connected?}
    B -->|No| C[Show Error: Database Not Configured]
    B -->|Yes| D[Query Database]
    D --> E{Query Successful?}
    E -->|No| F[Show Error: Database Error]
    E -->|Yes| G[Apply Filtering]
    G --> H{Any Results Found?}
    H -->|No| I[Show: No Meals Found]
    H -->|Yes| J[Check Repetition]
    J --> K{Meals Available?}
    K -->|No| L[Show Exhaustion Modal]
    K -->|Yes| M[Display Results]
    C --> N[User Fixes Configuration]
    F --> N
    I --> O[User Adjusts Ingredients]
    L --> P[User Chooses Action]
    N --> Q[Retry]
    O --> Q
    P --> Q
```

## Data Flow Architecture

```mermaid
flowchart LR
    A[User Interface] --> B[React State]
    B --> C[LocalStorage]
    C --> D[Supabase Database]
    D --> E[Filtering Engine]
    E --> F[Threshold Calculator]
    F --> G[Repetition Prevention]
    G --> H[Result Display]
    H --> I[User Feedback]
    I --> J[Analytics Tracking]
```

## Key Decision Points

### 1. **Ingredient Mode Toggle**
- **Condition**: `showIngredientMode === true`
- **Effect**: Bypasses meal type and cooking time filters
- **Behavior**: Only filters by selected ingredients

### 2. **Threshold Application**
- **Primary**: Try exact percentage match
- **Fallback**: Try minimum ingredient count
- **Final**: Use most lenient criteria

### 3. **Repetition Prevention**
- **Current Meal**: Always excluded from next suggestion
- **Shown Meals**: Tracked per filter combination
- **Reset**: When all meals shown for current filter

### 4. **Exhaustion Handling**
- **Condition**: No meals available after all filters
- **Options**: Reset shown meals or return to homepage
- **User Choice**: Determines next action

## Performance Optimization Points

1. **Database Query**: Limited to 50 meals maximum
2. **String Matching**: Case-insensitive for consistency
3. **Caching**: localStorage for shown meals tracking
4. **Lazy Loading**: Only process when needed
5. **Error Boundaries**: Graceful degradation on failures

---

**Visual Documentation**: This flowchart complements the detailed technical documentation and provides a clear visual representation of the ingredient search process flow. 