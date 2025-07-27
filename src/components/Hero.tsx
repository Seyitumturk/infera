'use client'

import { useState } from 'react'
import ConeAnimation from './ConeWithInfoCards'
import Navbar from './ui/Navbar'

export default function Hero() {
  const [navbarVisible, setNavbarVisible] = useState(false)
  const [lightIntensity, setLightIntensity] = useState(0)

  const handleLightIntensityChange = (intensity: number) => {
    setLightIntensity(intensity)
    
    // Show navbar only after light animation is completely finished
    if (intensity >= 1.0 && !navbarVisible) {
      // Add a small delay to ensure light is fully visible before navbar
      setTimeout(() => setNavbarVisible(true), 300)
    }
  }

  return (
    <main className="min-h-screen bg-brandNight flex items-center justify-center px-4 py-6 relative overflow-hidden">
      {/* Navbar - revealed by lighting */}
      <Navbar isVisible={navbarVisible} lightIntensity={lightIntensity} />
      
      <div className="w-full max-w-none">
        {/* Center the 3D animation as main hero */}
        <div className="flex flex-col items-center">
          {/* Main 3D Cone Animation - Full viewport */}
          <div className="w-full h-[80vh] lg:h-[90vh] max-w-none relative overflow-hidden">
            <ConeAnimation onLightIntensityChange={handleLightIntensityChange} />
          </div>
        </div>
      </div>
    </main>
  )
} 