'use client'

import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, PerspectiveCamera, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { useSpring, animated, config } from '@react-spring/three'
import * as THREE from 'three'
import ErrorBoundary from './ErrorBoundary'
import { Card, CardHeader, CardTitle, CardDescription } from './ui/Card'

// Ring colors matching cone sections
const ringColors = [
  '#000000', // Top (1): Pure Black
  '#111111', // 2: Almost black
  '#1a1a1a', // 3: Deep charcoal
  '#2b2b2b', // 4: Dark gray
];

// Info card data positioned in horizontal rows aligned with cone sections
// Cone 3D positions: tek.glb=0.4, tek2.glb=0.15, tek3.glb=-0.15, tek4.glb=-0.4
// Equal positioning system for all cards
const getCardData = (isMobile: boolean) => {
  const distance = isMobile ? 240 : 400; // Equal distance for all cards
  const verticalSpacing = isMobile ? 80 : 100; // Equal vertical spacing
  
  return [
    {
      id: 1,
      title: "Tell Us How You Work",
      description: "Fast intake that understands your workflows, not just your software. Forms, CSVs, or links—zero fluff, no setup.",
      position: { x: -distance, y: -verticalSpacing * 1.5 }, // Top left
      ringIndex: 0,
      bgColor: ringColors[0]
    },
    {
      id: 2,
      title: "We Audit Your Ops", 
      description: "Get mapped to high-impact AI use cases—rooted in real agency builds, not guesswork. Our engine knows what works and where.",
      position: { x: distance, y: -verticalSpacing * 0.5 }, // Top right
      ringIndex: 1,
      bgColor: ringColors[1]
    },
    {
      id: 3,
      title: "Curated AI Stack",
      description: "Get tool picks or build plans tailored to your exact needs. From 100+ vetted solutions across top automation agencies.",
      position: { x: -distance, y: verticalSpacing * 0.5 }, // Bottom left
      ringIndex: 2,
      bgColor: ringColors[2]
    },
    {
      id: 4,
      title: "Your AI Roadmap",
      description: "Clear priorities, timelines, and ROI ranges—ready to share. No noise. Just a confident path forward.",
      position: { x: distance, y: verticalSpacing * 1.5 }, // Bottom right
      ringIndex: 3,
      bgColor: ringColors[3]
    }
  ];
}

// Performance-optimized cone piece component
function ConeSegment({ 
  url, 
  position, 
  delay = 0, 
  index,
  isVisible = true,
  onRingComplete
}: { 
  url: string
  position: [number, number, number]
  delay?: number
  index: number
  isVisible?: boolean
  onRingComplete?: (ringIndex: number) => void
}) {
  const { scene } = useGLTF(url)
  const meshRef = useRef<THREE.Group>(null)
  const [startAnimation, setStartAnimation] = useState(false)
  const { viewport } = useThree()

  // Start animation with delay
  useEffect(() => {
    if (!isVisible) return
    const timer = setTimeout(() => {
      setStartAnimation(true)
      // Call ring completion callback after animation time
      setTimeout(() => {
        onRingComplete?.(index)
      }, 1200)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay, isVisible, onRingComplete, index])

  // Memoized scene setup with original materials
  const enhancedScene = useMemo(() => {
    const clonedScene = scene.clone()
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          child.material.envMapIntensity = 1.5
          child.material.transparent = true
        }
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clonedScene
  }, [scene, index])

  // Gravity-like falling animation
  const { position: animatedPosition, rotation, scale, opacity } = useSpring({
    position: startAnimation ? position : [position[0], position[1] + 25, position[2]],
    rotation: [0, 0, 0],
    scale: startAnimation ? [8, 8, 8] : [0.1, 0.1, 0.1],
    opacity: startAnimation ? 1 : 0,
    config: {
      tension: 50,
      friction: 20,
      mass: 3,
    },
  })

  // Apply opacity to materials on each frame
  useFrame(() => {
    enhancedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.material.opacity = opacity.get()
      }
    })
  })

  if (!isVisible) return null

  return (
    <animated.group
      ref={meshRef}
      // @ts-ignore - React Spring types conflict with R3F types
      position={animatedPosition}
      // @ts-ignore
      rotation={rotation}
      // @ts-ignore  
      scale={scale}
    >
      <primitive object={enhancedScene} />
    </animated.group>
  )
}

// Dynamic camera controller
function DynamicCameraController() {
  const { viewport } = useThree()
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useFrame((state) => {
    if (cameraRef.current) {
      const t = state.clock.elapsedTime * 0.15
      const elapsedTime = state.clock.elapsedTime * 1000
      
      const baseDistance = viewport.width > 768 ? 35 : 40
      const startHeight = viewport.width > 768 ? 10 : 8
      const finalDistance = baseDistance * 0.45
      const finalHeight = startHeight + 10
      
      let zoomProgress = 0
      
      if (elapsedTime <= 600) {
        zoomProgress = Math.min(elapsedTime / 600, 1) * 0.25
      } else if (elapsedTime <= 1000) {
        const localProgress = (elapsedTime - 600) / 400
        zoomProgress = 0.25 + (Math.min(localProgress, 1) * 0.25)
      } else if (elapsedTime <= 1400) {
        const localProgress = (elapsedTime - 1000) / 400
        zoomProgress = 0.5 + (Math.min(localProgress, 1) * 0.25)
      } else if (elapsedTime <= 1800) {
        const localProgress = (elapsedTime - 1400) / 400
        zoomProgress = 0.75 + (Math.min(localProgress, 1) * 0.25)
      } else {
        zoomProgress = 1
      }
      
      const easedProgress = 1 - Math.pow(1 - zoomProgress, 3)
      
      const currentDistance = baseDistance + (finalDistance - baseDistance) * easedProgress
      const currentHeight = startHeight + (finalHeight - startHeight) * easedProgress
      
      const heightVariation = animationComplete ? Math.sin(t) * 0.8 : 0
      const finalY = currentHeight + heightVariation
      
      cameraRef.current.position.x = currentDistance
      cameraRef.current.position.z = currentDistance
      cameraRef.current.position.y = finalY
      cameraRef.current.lookAt(0, 0, 0)
    }
  })

  const distance = viewport.width > 768 ? 35 : 40
  const startHeight = viewport.width > 768 ? 10 : 8
  const fov = viewport.width > 768 ? 60 : 70

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={fov}
      position={[distance, startHeight, distance]}
      near={0.1}
      far={100}
    />
  )
}

// Optimized cone scene
function OptimizedConeScene({ 
  onRingComplete,
  lightIntensity = 0
}: { 
  onRingComplete: (ringIndex: number) => void
  lightIntensity?: number
}) {
  const { viewport } = useThree()

  const coneFiles = [
    { url: '/cone/tek.glb', position: [0, 0.4, 0] as [number, number, number], delay: 300 },      // Top ring
    { url: '/cone/tek2.glb', position: [0, 0.15, 0] as [number, number, number], delay: 700 },   // Second ring
    { url: '/cone/tek3.glb', position: [0, -0.15, 0] as [number, number, number], delay: 1100 }, // Third ring  
    { url: '/cone/tek4.glb', position: [0, -0.4, 0] as [number, number, number], delay: 1500 },  // Bottom ring
  ]

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[8, 8, 4]}
        intensity={viewport.width < 768 ? 0.8 : 1.2}
        castShadow={viewport.width >= 768}
        shadow-mapSize-width={viewport.width < 768 ? 1024 : 2048}
        shadow-mapSize-height={viewport.width < 768 ? 1024 : 2048}
      />
      <pointLight position={[-8, 0, -15]} intensity={0.4} color="#4A90E2" />
      <pointLight position={[8, 0, -15]} intensity={0.4} color="#E24A90" />

      {/* Flashlight beam from cone top */}
      {lightIntensity > 0 && (
        <spotLight
          position={[0, -3.6, 0]}
          target-position={[0, 10, 0]}
          angle={Math.PI / 3}
          penumbra={0.8}
          intensity={lightIntensity * 3}
          color="#ffffff"
          distance={30}
          decay={1}
        />
      )}

      <Environment preset="city" />
      <DynamicCameraController />

      <group position={[0, -4.0, 0]}>
        {coneFiles.map((cone, index) => (
          <ConeSegment
            key={cone.url}
            url={cone.url}
            position={cone.position}
            delay={cone.delay}
            index={index}
            isVisible={true}
            onRingComplete={onRingComplete}
          />
        ))}
      </group>
    </>
  )
}

// Modern card component with sophisticated animation states
function InfoCard({ 
  card, 
  index, 
  isRevealed, 
  showFinalLayout, 
  isMobile 
}: { 
  card: ReturnType<typeof getCardData>[0]
  index: number
  isRevealed: boolean
  showFinalLayout: boolean
  isMobile: boolean 
}) {
  const getCardStyles = () => {
    if (!isRevealed) {
      // Hidden state
      return {
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(0.8)',
        left: `calc(50% + ${card.position.x}px)`,
        top: `calc(50% + ${card.position.y}px)`,
      }
    }
    
    // Always stay in original positions - no stacking
    return {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)',
      left: `calc(50% + ${card.position.x}px)`,
      top: `calc(50% + ${card.position.y}px)`,
    }
  }
  
  const isLeftSide = card.position.x < 0
  const coneX = 0 // Center of cone
  const coneY = card.position.y * 0.1 // Approximate cone section Y position
  
  return (
    <>
      {/* Modern connection line - appears when card is revealed */}
      <div 
        className={`absolute z-10 transition-all duration-[1500ms] ease-in-out ${isRevealed ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}
        style={{
          left: `calc(50% + ${isLeftSide ? card.position.x + (isMobile ? 120 : 150) : coneX}px)`,
          top: `calc(50% + ${card.position.y}px)`,
          width: `${Math.abs(card.position.x) - (isMobile ? 120 : 150)}px`,
          height: '1px',
          background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 80%, rgba(255,255,255,0) 100%)`,
          transformOrigin: isLeftSide ? 'left center' : 'right center',
          transitionDelay: '500ms', // Appear 500ms after card reveals
          filter: 'blur(0.5px)',
        }}
      />
      
      {/* Subtle glow effect */}
      <div 
        className={`absolute z-5 transition-all duration-[2000ms] ease-in-out ${isRevealed ? 'opacity-30 scale-x-100' : 'opacity-0 scale-x-0'}`}
        style={{
          left: `calc(50% + ${isLeftSide ? card.position.x + (isMobile ? 120 : 150) : coneX}px)`,
          top: `calc(50% + ${card.position.y - 1}px)`,
          width: `${Math.abs(card.position.x) - (isMobile ? 120 : 150)}px`,
          height: '3px',
          background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0) 100%)`,
          transformOrigin: isLeftSide ? 'left center' : 'right center',
          transitionDelay: '700ms', // Glow appears 200ms after main line
          filter: 'blur(2px)',
        }}
      />
      
      {/* Plain text */}
      <div 
        className="absolute z-20 transition-all duration-1000 ease-out"
        style={{
          ...getCardStyles(),
          transitionDelay: `${index * 300}ms`
        }}
      >
        <div className={`${isMobile ? 'w-64' : 'w-80'} space-y-3`}>
          <h3 className="text-sm font-semibold text-white tracking-wide">
            {card.title}
          </h3>
          <p className="text-xs text-white/80 leading-relaxed">
            {card.description}
          </p>
        </div>
      </div>
    </>
  )
}

// Loading component
function EnhancedLoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-brandInk border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 w-16 h-16 border border-brandInk/10 rounded-full mx-auto" />
          <div className="absolute inset-2 w-12 h-12 border border-brandInk/30 rounded-full mx-auto" />
        </div>
        <div className="space-y-2">
          <p className="text-gray-300 text-sm font-medium">Preparing 3D experience</p>
          <p className="text-gray-500 text-xs">Loading cone segments...</p>
        </div>
      </div>
    </div>
  )
}

// Main component
export default function ConeWithInfoCards({ 
  onLightIntensityChange 
}: { 
  onLightIntensityChange?: (intensity: number) => void 
}) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [revealedCards, setRevealedCards] = useState<number[]>([]) // Track which cards are revealed
  const [showFinalLayout, setShowFinalLayout] = useState(false) // Final layout with connection lines
  const [lightIntensity, setLightIntensity] = useState(0) // Light intensity for navbar reveal
  const [textVisible, setTextVisible] = useState(false) // Hero text visibility

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // One-time smooth light intensity animation that triggers after cone animation settles
  useEffect(() => {
    let animationStarted = false
    
    const lightTimer = setTimeout(() => {
      if (animationStarted) return // Prevent multiple animations
      animationStarted = true
      
      // Start smooth light intensity animation after cone rings complete
      let intensity = 0
      const duration = 3500 // 3.5 seconds for slower, more dramatic transition
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Smooth easing function (ease-out cubic for dramatic reveal)
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        intensity = easedProgress
        
        setLightIntensity(intensity)
        onLightIntensityChange?.(intensity)
        
        // Show hero text when light reaches 50% intensity (earlier for smoother reveal)
        if (intensity >= 0.5 && !textVisible) {
          setTextVisible(true)
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }, 3200) // Start slightly later to ensure cone animation is fully complete
    
    return () => clearTimeout(lightTimer)
  }, []) // No dependencies to prevent multiple runs

  const handleRingComplete = (ringIndex: number) => {
    setRevealedCards(prev => {
      const newRevealed = [...prev, ringIndex]
      // If all 4 cards are revealed, show connection lines
      if (newRevealed.length === 4) {
        setTimeout(() => {
          setShowFinalLayout(true)
        }, 2000) // Wait 2s after last card reveals
      }
      return newRevealed
    })
  }

  const cardData = getCardData(isMobile)

  if (!mounted) {
    return <EnhancedLoadingFallback />
  }

  return (
    <ErrorBoundary>
      <div className="w-full h-full relative overflow-hidden px-4">
        {/* 3D Canvas */}
        <Canvas
          shadows
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          style={{
            background: 'transparent',
            zIndex: 1,
          }}
          camera={{ position: [35, 10, 35], fov: 60 }}
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Suspense fallback={null}>
            <OptimizedConeScene 
              onRingComplete={handleRingComplete}
              lightIntensity={lightIntensity}
            />
          </Suspense>
        </Canvas>
        
                 {/* Hero text within the light beam area - positioned lower */}
         <div className={`absolute top-[15%] left-1/2 transform -translate-x-1/2 text-center space-y-6 max-w-2xl px-4 transition-all duration-1000 ease-out z-30 ${
           textVisible 
             ? 'opacity-100 translate-y-0' 
             : 'opacity-0 translate-y-8'
         }`}>
          <h1 className="text-3xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
            AI opportunities, quantified.
          </h1>
          
          <p className="text-base lg:text-lg text-gray-200 leading-relaxed">
            Infera analyzes your business and delivers a clear, prioritized AI roadmap.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              className="px-8 py-4 bg-brandInk hover:bg-ink80 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brandInk focus:ring-offset-2 focus:ring-offset-brandNight shadow-lg"
              aria-label="Start an AI audit"
            >
              Start an AI audit
            </button>
            
            <button 
              className="px-8 py-4 border border-gray-600 hover:border-gray-500 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-brandNight shadow-lg backdrop-blur-sm"
              aria-label="See sample roadmap"
            >
              See sample roadmap
            </button>
          </div>
        </div>
        
        {/* Single smooth light beam overlay - behind the cone */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            zIndex: -1,
            opacity: lightIntensity
          }}
        >
                     {/* Wide scattered upward light - extends to top */}
           <div 
             className="absolute left-1/2 transform -translate-x-1/2"
             style={{
               bottom: '45%',
               width: `${350 + lightIntensity * 450}px`,
               height: `${750 + lightIntensity * 400}px`,
               background: `linear-gradient(180deg, 
                 rgba(255, 255, 255, 0.025) 0%,
                 rgba(255, 255, 255, 0.035) 30%,
                 rgba(255, 255, 255, 0.018) 60%,
                 rgba(255, 255, 255, 0.008) 80%,
                 transparent 100%)`,
               filter: 'blur(100px)',
               borderRadius: '50%',
             }}
           />
           
           {/* Medium scattered upward light - extends to top */}
           <div 
             className="absolute left-1/2 transform -translate-x-1/2"
             style={{
               bottom: '45%',
               width: `${250 + lightIntensity * 350}px`,
               height: `${700 + lightIntensity * 350}px`,
               background: `linear-gradient(180deg, 
                 rgba(255, 255, 255, 0.035) 0%,
                 rgba(255, 255, 255, 0.05) 40%,
                 rgba(255, 255, 255, 0.025) 70%,
                 rgba(255, 255, 255, 0.012) 90%,
                 transparent 100%)`,
               filter: 'blur(70px)',
               borderRadius: '50%',
             }}
           />
           
           {/* Core scattered upward light - extends to top */}
           <div 
             className="absolute left-1/2 transform -translate-x-1/2"
             style={{
               bottom: '45%',
               width: `${180 + lightIntensity * 250}px`,
               height: `${650 + lightIntensity * 300}px`,
               background: `linear-gradient(180deg, 
                 rgba(255, 255, 255, 0.05) 0%,
                 rgba(255, 255, 255, 0.075) 50%,
                 rgba(255, 255, 255, 0.035) 80%,
                 transparent 100%)`,
               filter: 'blur(50px)',
               borderRadius: '50%',
             }}
           />
           
           {/* Bright inner upward light - extends to top */}
           <div 
             className="absolute left-1/2 transform -translate-x-1/2"
             style={{
               bottom: '45%',
               width: `${120 + lightIntensity * 180}px`,
               height: `${600 + lightIntensity * 250}px`,
               background: `linear-gradient(180deg, 
                 rgba(255, 255, 255, 0.065) 0%,
                 rgba(255, 255, 255, 0.095) 60%,
                 rgba(255, 255, 255, 0.045) 85%,
                 transparent 100%)`,
               filter: 'blur(30px)',
               borderRadius: '50%',
             }}
           />
          
          
          
          {/* Point source */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{
              bottom: '45%',
              width: '8px',
              height: '8px',
              background: `rgba(255, 255, 255, 0.6)`,
              borderRadius: '50%',
              filter: 'blur(3px)',
            }}
          />
        </div>
        
        {/* Modern sequenced cards */}
        {cardData.map((card, index) => (
          <InfoCard 
            key={card.id} 
            card={card} 
            index={index} 
            isRevealed={revealedCards.includes(card.ringIndex)}
            showFinalLayout={showFinalLayout}
            isMobile={isMobile}
          />
        ))}
        
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="absolute inset-0 bg-gradient-to-t from-brandNight/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brandNight/10 via-transparent to-brandNight/10" />
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Preload GLB files
useGLTF.preload('/cone/tek4.glb')
useGLTF.preload('/cone/tek3.glb')
useGLTF.preload('/cone/tek2.glb')
useGLTF.preload('/cone/tek.glb') 