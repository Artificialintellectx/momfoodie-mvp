import React from 'react'

// Shimmer effect component
const Shimmer = ({ className = '' }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
  </div>
)

// Skeleton Loader Component
export const SkeletonLoader = ({ variant = 'default', className = '' }) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded'
  
  const variants = {
    // Default skeleton
    default: 'h-4 w-full',
    
    // Text variants
    title: 'h-8 w-3/4',
    subtitle: 'h-6 w-1/2',
    text: 'h-4 w-full',
    textShort: 'h-4 w-2/3',
    
    // Button variants
    button: 'h-12 w-32',
    buttonSmall: 'h-8 w-24',
    
    // Card variants
    card: 'h-48 w-full',
    cardSmall: 'h-32 w-full',
    
    // Avatar variants
    avatar: 'h-12 w-12 rounded-full',
    avatarLarge: 'h-16 w-16 rounded-full',
    
    // List item variants
    listItem: 'h-16 w-full',
    listItemSmall: 'h-12 w-full',
    
    // Recipe specific variants
    recipeCard: 'h-64 w-full',
    ingredientItem: 'h-12 w-full',
    statsCard: 'h-20 w-full',
    
    // Custom dimensions
    custom: className
  }
  
  return (
    <div className={`${baseClasses} ${variants[variant] || variants.default}`}>
      <Shimmer />
    </div>
  )
}

// Recipe Card Skeleton
export const RecipeCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
      {/* Image placeholder with shimmer */}
      <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4 overflow-hidden">
        <Shimmer />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-transparent"></div>
      </div>
      
      {/* Title with staggered animation */}
      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-3 overflow-hidden" style={{ animationDelay: '0.2s' }}>
        <Shimmer />
      </div>
      
      {/* Description with staggered animation */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full overflow-hidden" style={{ animationDelay: '0.4s' }}>
          <Shimmer />
        </div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3 overflow-hidden" style={{ animationDelay: '0.6s' }}>
          <Shimmer />
        </div>
      </div>
      
      {/* Stats with staggered animation */}
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg overflow-hidden" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
            <Shimmer />
          </div>
        ))}
      </div>
    </div>
  )
}

// Homepage Skeleton
export const HomepageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Logo skeleton with shimmer */}
        <div className="text-center mb-12">
          <div className="relative w-28 h-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded-[2rem] mx-auto mb-4 overflow-hidden">
            <Shimmer />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-transparent"></div>
          </div>
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 mx-auto mb-2 overflow-hidden" style={{ animationDelay: '0.3s' }}>
            <Shimmer />
          </div>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-64 mx-auto overflow-hidden" style={{ animationDelay: '0.5s' }}>
            <Shimmer />
          </div>
        </div>
        
        {/* Toggle buttons skeleton with shimmer */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
            <Shimmer />
          </div>
        </div>
        
        {/* Main content skeleton */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
              <Shimmer />
            </div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <Shimmer />
            </div>
          </div>
          
          {/* Meal type skeleton with staggered animation */}
          <div className="mb-8">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-64 mb-6 overflow-hidden" style={{ animationDelay: '0.4s' }}>
              <Shimmer />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl overflow-hidden" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                  <Shimmer />
                </div>
              ))}
            </div>
          </div>
          
          {/* Cooking time skeleton with staggered animation */}
          <div className="mb-8">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 mb-6 overflow-hidden" style={{ animationDelay: '0.8s' }}>
              <Shimmer />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl overflow-hidden" style={{ animationDelay: `${1.0 + i * 0.1}s` }}>
                  <Shimmer />
                </div>
              ))}
            </div>
          </div>
          
          {/* Dietary preferences skeleton with staggered animation */}
          <div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-56 mb-6 overflow-hidden" style={{ animationDelay: '1.2s' }}>
              <Shimmer />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="relative h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl overflow-hidden" style={{ animationDelay: `${1.4 + i * 0.05}s` }}>
                  <Shimmer />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Floating button skeleton with shimmer */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="relative h-14 w-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
    </div>
  )
}

// Result Page Skeleton
export const ResultPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton with shimmer */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
            <Shimmer />
          </div>
          <div className="flex gap-2">
            <div className="relative h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <Shimmer />
            </div>
            <div className="relative h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <Shimmer />
            </div>
          </div>
        </div>
        
        {/* Hero section skeleton with shimmer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="text-center mb-6">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mx-auto mb-3 overflow-hidden" style={{ animationDelay: '0.3s' }}>
              <Shimmer />
            </div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mx-auto overflow-hidden" style={{ animationDelay: '0.5s' }}>
              <Shimmer />
            </div>
          </div>
          
          {/* Stats skeleton with staggered animation */}
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg overflow-hidden" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
                <Shimmer />
              </div>
            ))}
          </div>
        </div>
        
        {/* Ingredients skeleton with shimmer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 overflow-hidden" style={{ animationDelay: '0.9s' }}>
              <Shimmer />
            </div>
            <div className="relative h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded overflow-hidden" style={{ animationDelay: '1.1s' }}>
              <Shimmer />
            </div>
          </div>
          
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg overflow-hidden" style={{ animationDelay: `${1.3 + i * 0.1}s` }}>
                <Shimmer />
              </div>
            ))}
          </div>
        </div>
        
        {/* Video tutorial skeleton with shimmer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-28 overflow-hidden" style={{ animationDelay: '1.9s' }}>
              <Shimmer />
            </div>
            <div className="relative h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden" style={{ animationDelay: '2.1s' }}>
              <Shimmer />
            </div>
          </div>
          
          <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl overflow-hidden" style={{ animationDelay: '2.3s' }}>
            <Shimmer />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-transparent"></div>
          </div>
        </div>
        
        {/* Floating button skeleton with shimmer */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="relative h-14 w-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Page Skeleton
export const AdminPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton with shimmer */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
              <Shimmer />
            </div>
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <Shimmer />
            </div>
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-64 mx-auto overflow-hidden" style={{ animationDelay: '0.4s' }}>
            <Shimmer />
          </div>
        </div>
        
        {/* Form skeleton with shimmer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-6 overflow-hidden" style={{ animationDelay: '0.6s' }}>
            <Shimmer />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 mb-2 overflow-hidden" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                    <Shimmer />
                  </div>
                  <div className="relative h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded overflow-hidden" style={{ animationDelay: `${1.0 + i * 0.1}s` }}>
                    <Shimmer />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 mb-2 overflow-hidden" style={{ animationDelay: `${1.3 + i * 0.1}s` }}>
                    <Shimmer />
                  </div>
                  <div className="relative h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded overflow-hidden" style={{ animationDelay: `${1.5 + i * 0.1}s` }}>
                    <Shimmer />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <div className="relative h-12 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded overflow-hidden" style={{ animationDelay: '1.8s' }}>
              <Shimmer />
            </div>
          </div>
        </div>
        
        {/* Recipe list skeleton with shimmer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-6 overflow-hidden" style={{ animationDelay: '2.0s' }}>
            <Shimmer />
          </div>
          
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg overflow-hidden" style={{ animationDelay: `${2.2 + i * 0.1}s` }}>
                  <Shimmer />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="relative h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3 overflow-hidden" style={{ animationDelay: `${2.4 + i * 0.1}s` }}>
                    <Shimmer />
                  </div>
                  <div className="relative h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 overflow-hidden" style={{ animationDelay: `${2.6 + i * 0.1}s` }}>
                    <Shimmer />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative h-8 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded overflow-hidden" style={{ animationDelay: `${2.8 + i * 0.1}s` }}>
                    <Shimmer />
                  </div>
                  <div className="relative h-8 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded overflow-hidden" style={{ animationDelay: `${3.0 + i * 0.1}s` }}>
                    <Shimmer />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonLoader 