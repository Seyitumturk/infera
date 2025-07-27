'use client'

import ConeAnimation from './ConeWithInfoCards'

export default function Hero() {
  return (
    <main className="min-h-screen bg-brandNight flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-none">
        {/* Center the 3D animation as main hero */}
        <div className="flex flex-col items-center space-y-12">
          {/* Main 3D Cone Animation - Expanded viewport */}
          <div className="w-full h-[80vh] lg:h-[90vh] max-w-none relative overflow-hidden">
            <ConeAnimation />
          </div>
          
          {/* Minimal text below animation */}
          <div className="text-center space-y-6 max-w-2xl">
            <h1 className="text-3xl lg:text-5xl font-bold leading-tight tracking-tight">
              AI opportunities, quantified.
            </h1>
            
            <p className="text-base lg:text-lg text-gray-300 leading-relaxed">
              Infera analyzes your business and delivers a clear, prioritized AI roadmap.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                className="px-8 py-4 bg-brandInk hover:bg-ink80 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brandInk focus:ring-offset-2 focus:ring-offset-brandNight"
                aria-label="Start an AI audit"
              >
                Start an AI audit
              </button>
              
              <button 
                className="px-8 py-4 border border-gray-600 hover:border-gray-500 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-brandNight"
                aria-label="See sample roadmap"
              >
                See sample roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 