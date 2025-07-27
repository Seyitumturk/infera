'use client'

import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, PerspectiveCamera, Float, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { useSpring, animated, config } from '@react-spring/three'
import * as THREE from 'three'
import ErrorBoundary from './ErrorBoundary'

// Performance-optimized cone piece component
function ConeSeconadypiece({ 
  url, 
  position, 
  delay = 0, 
  index,
  isVisible = true
}: { 
  url: string
  position: [number, number, number]
  delay?: number
  index: number
  isVisible?: boolean
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
    }, delay)
    return () => clearTimeout(timer)
  }, [delay, isVisible])

     // Memoized scene setup with original materials
   const enhancedScene = useMemo(() => {
     const clonedScene = scene.clone()
     clonedScene.traverse((child) => {
       if (child instanceof THREE.Mesh) {
         // Keep original materials but enhance for better lighting
         if (child.material) {
           child.material.envMapIntensity = 1.5
           child.material.transparent = true // Enable transparency for opacity control
         }
         child.castShadow = true
         child.receiveShadow = true
       }
     })
     return clonedScene
   }, [scene, index])

     // Gravity-like falling animation with visibility - massive scale and straight down
   const { position: animatedPosition, rotation, scale, opacity } = useSpring({
     position: startAnimation ? position : [position[0], position[1] + 20, position[2]],
     rotation: [0, 0, 0], // Always straight, no rotation
     scale: startAnimation ? [8, 8, 8] : [0, 0, 0], // Start invisible, scale to massive
     opacity: startAnimation ? 1 : 0, // Hidden until animation starts
     config: {
       tension: 60,
       friction: 25,
       mass: 2,
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

   // No floating animation - pieces stay in place after falling

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

// Dynamic camera controller with smooth vertical movement after animation
function DynamicCameraController() {
  const { viewport } = useThree()
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const [animationComplete, setAnimationComplete] = useState(false)

     // Mark animation complete when all rings have finished falling
   useEffect(() => {
     const timer = setTimeout(() => {
       setAnimationComplete(true)
     }, 2000) // 1800ms total ring animation + 200ms buffer
     return () => clearTimeout(timer)
   }, [])

     useFrame((state) => {
     if (cameraRef.current) {
       const t = state.clock.elapsedTime * 0.15
       const elapsedTime = state.clock.elapsedTime * 1000 // Convert to milliseconds
       
       const baseDistance = viewport.width > 768 ? 35 : 40
       const startHeight = viewport.width > 768 ? 10 : 8
       const finalDistance = baseDistance * 0.45 // Final zoom target
       const finalHeight = startHeight + 10 // Final height target
       
       // Progressive zoom tied to ring falling timing
       // Ring timing: 300ms, 700ms, 1100ms, 1500ms + 300ms fall time = 1800ms total
       let zoomProgress = 0
       
       if (elapsedTime <= 600) {
         // Ring 1 falling (300ms + 300ms fall) -> 25% zoom
         zoomProgress = Math.min(elapsedTime / 600, 1) * 0.25
       } else if (elapsedTime <= 1000) {
         // Ring 2 falling (700ms + 300ms fall) -> 50% zoom
         const localProgress = (elapsedTime - 600) / 400
         zoomProgress = 0.25 + (Math.min(localProgress, 1) * 0.25)
       } else if (elapsedTime <= 1400) {
         // Ring 3 falling (1100ms + 300ms fall) -> 75% zoom
         const localProgress = (elapsedTime - 1000) / 400
         zoomProgress = 0.5 + (Math.min(localProgress, 1) * 0.25)
       } else if (elapsedTime <= 1800) {
         // Ring 4 falling (1500ms + 300ms fall) -> 100% zoom
         const localProgress = (elapsedTime - 1400) / 400
         zoomProgress = 0.75 + (Math.min(localProgress, 1) * 0.25)
       } else {
         // All rings landed - final position
         zoomProgress = 1
       }
       
       // Apply smooth easing to zoom progress
       const easedProgress = 1 - Math.pow(1 - zoomProgress, 3) // ease-out cubic
       
       // Smooth interpolation from start to final position
       const currentDistance = baseDistance + (finalDistance - baseDistance) * easedProgress
       const currentHeight = startHeight + (finalHeight - startHeight) * easedProgress
       
       // Add gentle variation only after all animations complete
       const heightVariation = animationComplete ? Math.sin(t) * 0.8 : 0
       const finalY = currentHeight + heightVariation
       
       cameraRef.current.position.x = currentDistance
       cameraRef.current.position.z = currentDistance
       cameraRef.current.position.y = finalY
       cameraRef.current.lookAt(0, 0, 0)
     }
   })

     const distance = viewport.width > 768 ? 35 : 40
   const startHeight = viewport.width > 768 ? 10 : 8 // Start more normalized
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

// Optimized scene with reduced complexity for mobile
function OptimizedConeScene() {
  const { viewport } = useThree()
  const isMobile = viewport.width < 768

     const coneFiles = [
     { url: '/cone/tek4.glb', position: [0, -0.3, 0] as [number, number, number], delay: 300 },
     { url: '/cone/tek3.glb', position: [0, -0.1, 0] as [number, number, number], delay: 700 },
     { url: '/cone/tek2.glb', position: [0, 0.1, 0] as [number, number, number], delay: 1100 },
     { url: '/cone/tek.glb', position: [0, 0.3, 0] as [number, number, number], delay: 1500 },
   ]

  return (
    <>
      {/* Adaptive lighting setup */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[8, 8, 4]}
        intensity={isMobile ? 0.8 : 1.2}
        castShadow={!isMobile}
        shadow-mapSize-width={isMobile ? 1024 : 2048}
        shadow-mapSize-height={isMobile ? 1024 : 2048}
      />
      <pointLight position={[-8, 0, -15]} intensity={0.4} color="#4A90E2" />
      <pointLight position={[8, 0, -15]} intensity={0.4} color="#E24A90" />

      {/* Environment for reflections - reduced quality on mobile */}
      <Environment preset="city" />

             {/* Dynamic camera with post-animation movement */}
       <DynamicCameraController />

      {/* Cone pieces */}
      {coneFiles.map((cone, index) => (
        <ConeSeconadypiece
          key={cone.url}
          url={cone.url}
          position={cone.position}
          delay={cone.delay}
          index={index}
          isVisible={true}
        />
      ))}

             {/* No floating particles - cone is the main focus */}
    </>
  )
}

// Enhanced loading component
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

// Main optimized component
export default function ConeAnimationOptimized() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <EnhancedLoadingFallback />
  }

  return (
    <ErrorBoundary>
      <div className="w-full h-full relative overflow-hidden">
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
          }}
                     camera={{ position: [35, 10, 35], fov: 60 }}
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Suspense fallback={null}>
            <OptimizedConeScene />
          </Suspense>
        </Canvas>
        
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-brandNight/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brandNight/10 via-transparent to-brandNight/10" />
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Preload GLB files for better performance
useGLTF.preload('/cone/tek4.glb')
useGLTF.preload('/cone/tek3.glb')
useGLTF.preload('/cone/tek2.glb')
useGLTF.preload('/cone/tek.glb') 