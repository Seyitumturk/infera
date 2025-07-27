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

  // Start camera movement after all pieces have landed
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, 3000) // Start after all pieces have fallen
    return () => clearTimeout(timer)
  }, [])

     useFrame((state) => {
     if (cameraRef.current && animationComplete) {
       const t = state.clock.elapsedTime * 0.15
       
       // Move towards a more top-down, 2D-like view
       const progress = Math.min((state.clock.elapsedTime - 3) / 8, 1) // Slow transition over 8 seconds
       const baseDistance = viewport.width > 768 ? 35 : 40
       const baseHeight = viewport.width > 768 ? 6 : 5
       
       // Gradually move towards more overhead position
       const targetDistance = baseDistance * 0.7 // Move closer
       const targetHeight = baseHeight + 12 // Much higher for 2D view
       
       const currentDistance = baseDistance + (targetDistance - baseDistance) * progress
       const currentHeight = baseHeight + (targetHeight - baseHeight) * progress
       
       // Add gentle variation on top of the transition
       const heightVariation = Math.sin(t) * 1.5
       const finalHeight = currentHeight + heightVariation
       
       cameraRef.current.position.x = currentDistance
       cameraRef.current.position.z = currentDistance
       cameraRef.current.position.y = finalHeight
       cameraRef.current.lookAt(0, 0, 0)
     }
   })

  const distance = viewport.width > 768 ? 35 : 40
  const height = viewport.width > 768 ? 6 : 5
  const fov = viewport.width > 768 ? 60 : 70

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={fov}
      position={[distance, height, distance]}
      near={0.1}
      far={100}
      onUpdate={(camera) => !animationComplete && camera.lookAt(0, 0, 0)}
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
                     camera={{ position: [35, 6, 35], fov: 60 }}
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