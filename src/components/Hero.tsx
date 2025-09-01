'use client'

import { useState, useEffect } from 'react'
import ConeAnimation from './ConeWithInfoCards'
import GitForkAIUseCases from './GitForkAIUseCases'
import ToolPool from './ToolPool'
import Navbar from './ui/Navbar'

export default function Hero({ onStartAudit }: { onStartAudit?: () => void }) {
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
    <div className="relative bg-gradient-to-b from-[#06080a] via-[#0a0c10] to-[#06080a] overflow-hidden">
      {/* Modern blur fade overlay for navbar */}
      <div 
        className="fixed top-0 left-0 right-0 z-[100] pointer-events-none transition-opacity duration-300"
        style={{
          height: '120px',
          background: `linear-gradient(to bottom, 
            rgba(6, 8, 10, ${fadeOpacity * 0.95}) 0%, 
            rgba(6, 8, 10, ${fadeOpacity * 0.8}) 30%, 
            rgba(6, 8, 10, ${fadeOpacity * 0.4}) 60%, 
            transparent 100%
          )`,
          backdropFilter: `blur(${fadeOpacity * 8}px) saturate(180%)`,
          opacity: fadeOpacity > 0.1 ? 1 : 0
        }}
      />
      
      {/* Navbar - positioned absolutely to overlay everything */}
      <Navbar isVisible={navbarVisible} lightIntensity={lightIntensity} />
      
      {/* Hero content - modern full-screen layout */}
      <main className="relative h-screen">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-32 right-20 w-96 h-96 bg-accent2/20 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-accent/5 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full h-full">
          {/* Main 3D Cone Animation - Enhanced with modern frame */}
          <div className="w-full h-full relative">
            <ConeAnimation onLightIntensityChange={handleLightIntensityChange} onStartAudit={onStartAudit} />
            
            {/* Modern overlay frame */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm m-8"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern section divider */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent h-px"></div>
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-accent2/20 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <div className="w-2 h-2 bg-gradient-to-r from-accent to-accent2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Modern Use Cases Section */}
      <section className="relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent2/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <GitForkAIUseCases />
        </div>
      </section>
      
      {/* Modern section divider */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent h-px"></div>
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent2/20 to-accent/20 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <div className="w-2 h-2 bg-gradient-to-r from-accent2 to-accent rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Modern Tool Pool Section */}
      <section className="relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent2/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <ToolPool />
        </div>
      </section>
    </div>
  )
} 