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

// Studio Light Inside Cone - appears after 3 seconds
function StudioLight({ isActive }: { isActive: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null)
  const innerLightRef = useRef<THREE.PointLight>(null)
  const [lightIntensity, setLightIntensity] = useState(0)

  useEffect(() => {
    if (!isActive) return
    
    // Smooth fade-in animation
    const duration = 2000 // 2 seconds fade-in
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth ease-in-out curve
      const eased = 1 - Math.pow(1 - progress, 3)
      setLightIntensity(eased * 2.5) // Final intensity of 2.5
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [isActive])

  useFrame((state) => {
    if (lightRef.current && isActive) {
      // Subtle pulsing effect
      const time = state.clock.elapsedTime
      const pulse = 1 + Math.sin(time * 1.5) * 0.1 // 10% variation
      lightRef.current.intensity = lightIntensity * pulse
      
      // Soft color temperature variation (warm to cool)
      const colorShift = Math.sin(time * 0.8) * 0.1 + 0.9
      lightRef.current.color.setRGB(colorShift, colorShift * 0.95, 1)
    }
    
    if (innerLightRef.current && isActive) {
      // Inner glow with different timing
      const time = state.clock.elapsedTime
      const innerPulse = 1 + Math.sin(time * 2.2) * 0.15
      innerLightRef.current.intensity = lightIntensity * 0.8 * innerPulse
    }
  })

  if (!isActive) return null

  return (
    <group position={[0, -3.8, 0]}>
      {/* Main studio light - positioned inside cone center */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0]}
        intensity={lightIntensity}
        distance={25}
        decay={1.8}
        color="#ffffff"
        castShadow={false}
      />
      
      {/* Inner warm glow */}
      <pointLight
        ref={innerLightRef}
        position={[0, 0.2, 0]}
        intensity={lightIntensity * 0.8}
        distance={15}
        decay={2}
        color="#fff4e6"
        castShadow={false}
      />
      
      {/* Upward directional light for navbar reveal */}
      <spotLight
        position={[0, 0, 0]}
        target-position={[0, 15, 0]}
        angle={Math.PI / 3}
        penumbra={0.8}
        intensity={lightIntensity * 1.2}
        distance={30}
        decay={1.5}
        color="#ffffff"
        castShadow={false}
      />
    </group>
  )
}

// Modern Glassmorphic Navbar
function GlassmorphicNavbar({ isVisible }: { isVisible: boolean }) {
  const [navOpacity, setNavOpacity] = useState(0)
  
  useEffect(() => {
    if (!isVisible) return
    
    // Delayed reveal after light starts
    const timer = setTimeout(() => {
      const duration = 1500
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Smooth ease-out curve
        const eased = 1 - Math.pow(1 - progress, 2)
        setNavOpacity(eased)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    }, 800) // Start 800ms after light begins
    
    return () => clearTimeout(timer)
  }, [isVisible])
  
  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' }, 
    { label: 'Infera', href: '#infera' }
  ]

  return (
    <div 
      className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-1000"
      style={{
        opacity: navOpacity,
        transform: `translateX(-50%) translateY(${isVisible ? '0' : '-20px'})`,
      }}
    >
      <nav className="relative">
        {/* Main glassmorphic container */}
        <div className="relative backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-2xl px-8 py-4 shadow-2xl">
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] opacity-60"></div>
          
          {/* Navigation items */}
          <div className="relative flex items-center space-x-8">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className="relative group py-2 px-4 text-white/90 hover:text-white transition-all duration-300 font-medium text-sm tracking-wide"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: navOpacity > 0.5 ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-lg bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
                
                {/* Text */}
                <span className="relative z-10">{item.label}</span>
                
                {/* Active indicator */}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full"></div>
              </a>
            ))}
          </div>
          
          {/* Subtle animated border */}
          <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10" 
               style={{ 
                 background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))',
                 animation: navOpacity > 0.8 ? 'borderShimmer 3s ease-in-out infinite' : 'none'
               }}>
          </div>
        </div>
      </nav>
    </div>
  )
}

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
      position={animatedPosition}
      rotation={rotation}
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
  onAnimationComplete
}: { 
  onRingComplete: (ringIndex: number) => void
  onAnimationComplete: () => void
}) {
  const { viewport } = useThree()
  const [showStudioLight, setShowStudioLight] = useState(false)

  // Trigger studio light after 3 seconds (when animation settles)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStudioLight(true)
      onAnimationComplete()
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [onAnimationComplete])

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

      {/* Studio Light inside cone */}
      <StudioLight isActive={showStudioLight} />

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
export default function ConeWithInfoCards() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [revealedCards, setRevealedCards] = useState<number[]>([]) // Track which cards are revealed
  const [showFinalLayout, setShowFinalLayout] = useState(false) // Final layout with connection lines
  const [showNavbar, setShowNavbar] = useState(false) // Control navbar visibility

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const handleAnimationComplete = () => {
    // Show navbar when studio light activates
    setTimeout(() => {
      setShowNavbar(true)
    }, 1000) // 1 second after light starts
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
              onAnimationComplete={handleAnimationComplete}
            />
          </Suspense>
        </Canvas>
        
        {/* Glassmorphic Navbar - Revealed by studio light */}
        <GlassmorphicNavbar isVisible={showNavbar} />
        
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