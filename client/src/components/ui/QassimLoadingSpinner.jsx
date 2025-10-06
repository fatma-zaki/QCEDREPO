import { useState, useEffect } from 'react'

const QassimLoadingSpinner = ({ 
  size = 'lg', // sm, md, lg, xl
  text = '',
  className = ''
}) => {
  const [currentText, setCurrentText] = useState('QASSIM CHAMBER')
  const [isArabic, setIsArabic] = useState(false)
  const [scratchActive, setScratchActive] = useState(false)

  const englishText = 'QASSIM CHAMBER'
  const arabicText = 'غرفة القصيم'

  useEffect(() => {
    const interval = setInterval(() => {
      setIsArabic(prev => !prev)
      setCurrentText(prev => prev === englishText ? arabicText : englishText)
      setScratchActive(true)
      
      // Reset scratch animation after it completes
      setTimeout(() => setScratchActive(false), 1000)
    }, 3000) // Switch every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28', 
    lg: 'w-36 h-36',
    xl: 'w-44 h-44'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const subTextSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
    xl: 'text-base'
  }

  const logoSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-18 h-18', 
    xl: 'w-22 h-22'
  }

  // Scratch animation component
  const ScratchText = ({ children, isArabic }) => {
    return (
      <div className="relative overflow-hidden">
        <div className={`${isArabic ? 'font-arabic text-right' : 'font-latin text-left'} font-bold text-qassim-blue tracking-wider select-none`}>
          {children}
        </div>
        {/* Scratch overlay effect */}
        {scratchActive && (
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent ${isArabic ? 'origin-right' : 'origin-left'}`}
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.9) 80%, transparent 100%)`,
              transform: isArabic ? 'translateX(100%)' : 'translateX(-100%)',
              animation: 'scratch 1s ease-in-out forwards'
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Main Spinner Container */}
      <div className={`relative ${sizeClasses[size]} mb-8`}>
        {/* Background Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-qassim-blue/5 animate-pulse"></div>
        
        {/* Outer Ring with Enhanced Gradient */}
        <div className="absolute inset-0 rounded-full">
          <div 
            className="w-full h-full rounded-full animate-spin"
            style={{
              background: `conic-gradient(from 0deg, #002944 0deg, #fbbf24 45deg, #002944 90deg, #fbbf24 135deg, #002944 180deg, #fbbf24 225deg, #002944 270deg, #fbbf24 315deg, #002944 360deg)`,
              mask: 'radial-gradient(circle, transparent 25%, black 30%)',
              WebkitMask: 'radial-gradient(circle, transparent 25%, black 30%)'
            }}
          />
        </div>
        
        {/* Middle Ring */}
        <div className="absolute inset-3 rounded-full">
          <div 
            className="w-full h-full rounded-full animate-spin-reverse"
            style={{
              background: `conic-gradient(from 180deg, #fbbf24 0deg, #002944 45deg, #fbbf24 90deg, #002944 135deg, #fbbf24 180deg, #002944 225deg, #fbbf24 270deg, #002944 315deg, #fbbf24 360deg)`,
              mask: 'radial-gradient(circle, transparent 35%, black 40%)',
              WebkitMask: 'radial-gradient(circle, transparent 35%, black 40%)'
            }}
          />
        </div>

        {/* Inner Core with Enhanced Design */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-qassim-blue via-qassim-blue-dark to-qassim-blue flex items-center justify-center shadow-2xl border-2 border-qassim-gold/20">
          <div className="text-white font-bold text-center leading-tight animate-pulse"
               style={{ 
                 fontSize: size === 'sm' ? '0.75rem' : size === 'md' ? '1rem' : size === 'lg' ? '1.25rem' : '1.5rem',
                 textShadow: '0 0 10px rgba(255,255,255,0.5)'
               }}>
            QC
          </div>
        </div>

        {/* Enhanced Floating Orbs */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-qassim-gold rounded-full animate-float opacity-70"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-${size === 'sm' ? '28px' : size === 'md' ? '36px' : size === 'lg' ? '44px' : '52px'})`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>

        {/* Pulsing Rings */}
        <div className="absolute inset-0 rounded-full border border-qassim-gold/40 animate-ping"></div>
        <div className="absolute inset-2 rounded-full border border-qassim-blue/30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute inset-4 rounded-full border border-qassim-gold/20 animate-ping" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Enhanced Text Display with Scratch Animation */}
      <div className="text-center space-y-3">
        <ScratchText isArabic={isArabic}>
          {currentText}
        </ScratchText>
        
        {text && (
          <div className={`text-gray-600 ${subTextSizeClasses[size]} animate-pulse font-medium`}>
            {text}
          </div>
        )}
        
        {/* Enhanced Loading Dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-qassim-blue rounded-full animate-bounce"
              style={{ 
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Custom CSS for scratch animation */}
      <style jsx>{`
        @keyframes scratch {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-scratch {
          animation: scratch 1s ease-in-out forwards;
        }
      `}</style>
    </div>
  )
}

export default QassimLoadingSpinner