'use client'

import { useState } from 'react'
import ConeAnimation from './ConeWithInfoCards'
import Navbar from './ui/Navbar'

export default function Hero() {
  const [navbarVisible, setNavbarVisible] = useState(false)
  const [lightIntensity, setLightIntensity] = useState(0)

  const handleLightIntensityChange = (intensity: number) => {
    setLightIntensity(intensity)
    
    // Show navbar earlier in the light animation for smoother reveal
    if (intensity >= 0.75 && !navbarVisible) {
      // Slightly longer delay for more dramatic entrance
      setTimeout(() => setNavbarVisible(true), 500)
    }
  }

  return (
    <div className="relative min-h-screen bg-brandNight overflow-hidden">
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
    </div>
  )
} 