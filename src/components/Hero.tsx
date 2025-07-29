'use client'

import { useState, useEffect } from 'react'
import ConeAnimation from './ConeWithInfoCards'
import GitForkAIUseCases from './GitForkAIUseCases'
import ToolPool from './ToolPool'
import Navbar from './ui/Navbar'

export default function Hero() {
  const [navbarVisible, setNavbarVisible] = useState(false)
  const [lightIntensity, setLightIntensity] = useState(0)
  const [scrollY, setScrollY] = useState(0)

  const handleLightIntensityChange = (intensity: number) => {
    setLightIntensity(intensity)
    
    // Show navbar earlier in the light animation for smoother reveal
    if (intensity >= 0.75 && !navbarVisible) {
      // Slightly longer delay for more dramatic entrance
      setTimeout(() => setNavbarVisible(true), 500)
    }
  }

  // Track scroll position for fade effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate fade opacity based on scroll position
  const fadeOpacity = Math.min(scrollY / 800, 0.85) // Max 85% opacity, fade over 800px

  return (
    <div className="relative bg-brandNight overflow-hidden">
      {/* Dark blur fade overlay for navbar area only */}
      <div 
        className="fixed top-0 left-0 right-0 z-[100] pointer-events-none transition-opacity duration-300"
        style={{
          height: '130px',
          background: `radial-gradient(ellipse 120% 100% at center top, 
            rgba(0, 0, 0, ${fadeOpacity * 0.85}) 0%, 
            rgba(0, 0, 0, ${fadeOpacity * 0.7}) 20%, 
            rgba(0, 0, 0, ${fadeOpacity * 0.5}) 40%, 
            rgba(0, 0, 0, ${fadeOpacity * 0.3}) 60%, 
            rgba(0, 0, 0, ${fadeOpacity * 0.1}) 80%, 
            transparent 100%
          )`,
          backdropFilter: `blur(${fadeOpacity * 4}px)`,
          opacity: fadeOpacity > 0.1 ? 1 : 0
        }}
      />
      
      {/* Navbar - positioned absolutely to overlay everything */}
      <Navbar isVisible={navbarVisible} lightIntensity={lightIntensity} />
      
      {/* Hero content - takes full screen starting from top */}
      <main className="h-screen px-4">
        <div className="w-full max-w-none h-full">
          {/* Center the 3D animation as main hero - full height from top */}
          <div className="flex flex-col items-center h-full">
            {/* Main 3D Cone Animation - Full viewport height */}
            <div className="w-full h-full max-w-none relative overflow-hidden">
              <ConeAnimation onLightIntensityChange={handleLightIntensityChange} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Section Separator */}
      <div className="relative bg-brandNight">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full">
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-brandNight px-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Section - Git Fork AI Use Cases */}
      <section className="relative bg-brandNight">
        <GitForkAIUseCases />
      </section>
      
      {/* Section Separator */}
      <div className="relative bg-brandNight">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full">
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-brandNight px-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Section - Tool Pool */}
      <section className="relative bg-brandNight">
        <ToolPool />
      </section>
    </div>
  )
} 