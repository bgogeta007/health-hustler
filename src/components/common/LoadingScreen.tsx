import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => {
  const [showTip, setShowTip] = useState(false)
  
  // Show a tip after 3 seconds of loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(true)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-dark-bg transition-colors duration-200 z-50">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-primary-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-t-transparent border-r-accent-500 border-b-transparent border-l-transparent animate-spin animation-delay-150"></div>
        <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-t-transparent border-r-transparent border-b-secondary-500 border-l-transparent animate-spin animation-delay-300"></div>
      </div>
      
      <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">{message}</h2>
      
      {showTip && (
        <div className="mt-8 max-w-sm text-center text-gray-600 dark:text-gray-400 animate-fade-in">
          <p className="italic">
            "The journey of a thousand miles begins with a single step."
          </p>
        </div>
      )}
    </div>
  )
}

export default LoadingScreen