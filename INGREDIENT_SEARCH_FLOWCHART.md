# Ingredient Search Flowchart

## Complete Search Flow

```mermaid
flowchart TD
    A[User Selects Ingredients] --> B[Click 'What Can I Make?']
    B --> C[Fetch All Meals from Supabase]
    C --> D[First Search: 50% Threshold]
    D --> E{Found Recipes?}
    
    E -->|Yes| F[Store Results with 50% Threshold]
    E -->|No| G[Second Search: 25% Threshold]
    
    G --> H{Found Recipes?}
    H -->|Yes| I[Store Results with 25% Threshold]
    H -->|No| J[Show 'No Recipes Found' Message]
    
    F --> K[Calculate Priority Scores]
    I --> K
    K --> L[Sort by Priority: First Word → Second Word → Third Word]
    L --> M[Randomly Select Recipe from Priority-Sorted Results]
    M --> N[Store in localStorage]
    N --> O[Redirect to Result Page]
    
    O --> P[Display Recipe]
    P --> Q[User Clicks 'Get Another Recipe']
    
    Q --> R[Load Cached Results]
    R --> S[Filter Out Shown Meals]
    S --> T{Available Recipes?}
    
    T -->|Yes| U[Randomly Select New Recipe from Priority-Sorted Pool]
    T -->|No| V{All Recipes Shown?}
    
    V -->|Yes| W{Current Threshold 50%?}
    W -->|Yes| X[Show Modal: Continue with 25%?]
    W -->|No| Y[Show Exhaustion Modal]
    
    X -->|Yes| Z[Perform 25% Search with Priority Sorting]
    X -->|No| Y
    
    Z --> AA[Update Threshold to 25%]
    AA --> BB[Sort New Results by Priority]
    BB --> U
    
    U --> CC[Update Shown Meals Tracking]
    CC --> DD[Display New Recipe]
    DD --> Q
    
    Y --> EE[User Options: Reset/Homepage]
```

## Detailed Component Flow

### 1. Initial Search Process with Priority Sorting

```mermaid
flowchart TD
    A[User Input] --> B[Validate Ingredients]
    B --> C[Create Search Criteria]
    C --> D[Query Supabase Database]
    D --> E[Filter by Ingredient Presence]
    E --> F[Calculate Title Relevance]
    F --> G[Apply 50% Threshold]
    G --> H{Meet Threshold?}
    H -->|Yes| I[Calculate Priority Scores]
    H -->|No| J[Apply 25% Threshold]
    J --> K{Meet Threshold?}
    K -->|Yes| L[Calculate Priority Scores]
    K -->|No| M[Return Empty Results]
    
    I --> N[Sort by Priority: First Word → Second Word → Third Word]
    L --> N
    N --> O[Return Priority-Sorted Recipes]
```

### 2. Priority Calculation Process

```mermaid
flowchart TD
    A[Recipe Title] --> B[Split into Words]
    B --> C[For Each Selected Ingredient]
    C --> D[Find Earliest Position in Title]
    D --> E[Calculate Priority Score]
    E --> F[Track First Selected Ingredient Priority]
    F --> G[Count Total Ingredient Matches]
    G --> H[Return Composite Priority Score]
    
    H --> I[Sort Recipes by Priority]
    I --> J[First Word Matches: Highest Priority]
    J --> K[Second Word Matches: Medium Priority]
    K --> L[Third Word Matches: Lower Priority]
```

### 3. Caching System with Priority Preservation

```mermaid
flowchart TD
    A[Search Request] --> B[Generate Cache Key with Threshold & Phase]
    B --> C{Check Cache}
    C -->|Hit| D[Return Priority-Sorted Cached Results]
    C -->|Miss| E[Perform Fresh Search]
    E --> F[Calculate Priority Scores]
    F --> G[Sort by Priority]
    G --> H[Store Priority-Sorted Results in Cache]
    H --> I[Return Priority-Sorted Results]
    D --> J[Continue with Priority-Sorted Results]
    I --> J
```

### 4. Recipe Navigation Flow with Priority

```mermaid
flowchart TD
    A[Get New Suggestion] --> B[Load Search Criteria]
    B --> C[Generate Filter Key]
    C --> D[Get Shown Meals]
    D --> E[Filter Available Meals from Priority-Sorted Pool]
    E --> F{Meals Available?}
    F -->|Yes| G[Random Selection from Priority-Sorted Available Meals]
    F -->|No| H[Check All Shown]
    H --> I{All Shown?}
    I -->|Yes| J[Show Continuation Modal]
    I -->|No| K[Reset Shown Meals]
    G --> L[Update Display]
    J --> M[User Choice]
    M -->|Continue| N[25% Threshold Search with Priority Sorting]
    M -->|Stop| O[Exhaustion Message]
```

## State Management Flow

### LocalStorage Structure with Priority

```mermaid
graph LR
    A[searchCriteria] --> B[Current Search Parameters]
    C[ingredient_search_key] --> D[Priority-Sorted Cached Results]
    E[shownMeals_hash] --> F[Tracked Shown Recipes per Filter]
    G[currentMeal] --> H[Currently Displayed Recipe]
    I[previousMeals] --> J[Recipe History]
```

### Search Phases with Priority

```mermaid
flowchart LR
    A[Primary Search] --> B[50% Threshold + Priority Sorting]
    A --> C[25% Threshold + Priority Sorting]
    D[Secondary Search] --> E[25% Threshold + Priority Sorting]
    F[Exhaustion] --> G[No More Priority-Sorted Recipes]
```

## Error Handling Flow

```mermaid
flowchart TD
    A[Search Error] --> B{Error Type}
    B -->|No Results| C[Try Lower Threshold with Priority Sorting]
    B -->|Database Error| D[Show Error Message]
    B -->|Cache Error| E[Regenerate Results with Priority Sorting]
    B -->|State Error| F[Reset and Retry]
    
    C --> G{Lower Threshold Results?}
    G -->|Yes| H[Continue with Priority-Sorted Results]
    G -->|No| I[Show No Results Message]
    
    D --> J[User Retry Option]
    E --> K[Fresh Database Query with Priority Sorting]
    F --> L[Clear localStorage]
```

## Performance Optimization Flow

```mermaid
flowchart TD
    A[User Request] --> B{Check Cache}
    B -->|Hit| C[Return Priority-Sorted Cached Data]
    B -->|Miss| D[Database Query]
    D --> E[Process Results with Priority Calculation]
    E --> F[Sort by Priority]
    F --> G[Store Priority-Sorted Results in Cache]
    G --> H[Return Priority-Sorted Results]
    
    C --> I[Fast Response]
    H --> I
    
    I --> J[Update UI]
    J --> K[Track Analytics]
```

## Key Decision Points

### Priority-Based Threshold Selection Logic

```mermaid
flowchart TD
    A[Ingredient Count] --> B{Count = 1?}
    B -->|Yes| C[Show All with Ingredient + Priority Sorting]
    B -->|No| D[Use 50% Threshold + Priority Sorting]
    D --> E{Results Found?}
    E -->|Yes| F[Use 50% Priority-Sorted Results]
    E -->|No| G[Use 25% Threshold + Priority Sorting]
    G --> H{Results Found?}
    H -->|Yes| I[Use 25% Priority-Sorted Results]
    H -->|No| J[No Priority-Sorted Results Available]
```

### Priority-Based Continuation Logic

```mermaid
flowchart TD
    A[All Priority-Sorted Recipes Shown] --> B{Current Threshold}
    B -->|50%| C[Offer 25% Continuation with Priority Sorting]
    B -->|25%| D[Show Exhaustion]
    
    C --> E{User Accepts?}
    E -->|Yes| F[Perform 25% Search with Priority Sorting]
    E -->|No| G[End Search]
    
    F --> H[Display Priority-Sorted New Results]
    G --> I[Show End Message]
```

## Priority System Visualization

### Priority Score Calculation

```mermaid
flowchart TD
    A[Recipe Title] --> B[Split into Words]
    B --> C[For Each Selected Ingredient]
    C --> D[Find Position in Title]
    D --> E[Calculate Position Score]
    E --> F[Track First Selected Ingredient]
    F --> G[Count Total Matches]
    G --> H[Composite Score: FirstIngredient*10000 + Position*100 + Matches*10]
```

### Priority Sorting Example

```mermaid
flowchart LR
    A["Rice and Stew<br/>Priority: 10"] --> B[Highest Priority]
    C["Rice with Beef<br/>Priority: 20"] --> D[High Priority]
    E["Beef Stew with Rice<br/>Priority: 30020"] --> F[Medium Priority]
    G["Chicken Rice<br/>Priority: 10110"] --> H[Lower Priority]
    I["Stew with Rice and Beef<br/>Priority: 20220"] --> J[Lowest Priority]
```

This flowchart documentation provides a visual representation of how the ingredient search system works with the new priority-based sorting feature, making it easier to understand the complex logic flow and decision points in the system. 