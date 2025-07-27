'use client'

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, PerspectiveCamera, Float } from '@react-three/drei'
import { useSpring, animated, config } from '@react-spring/three'
import * as THREE from 'three'
import ErrorBoundary from './ErrorBoundary'

// Individual cone piece component
function ConePiece({ 
  url, 
  position, 
  delay = 0, 
  index 
}: { 
  url: string
  position: [number, number, number]
  delay?: number
  index: number
}) {
  const { scene } = useGLTF(url)
  const meshRef = useRef<THREE.Group>(null)
  const [startAnimation, setStartAnimation] = useState(false)

  // Start animation with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  // Spring animation for falling effect
  const { position: animatedPosition, rotation, scale } = useSpring({
    position: startAnimation ? position : [position[0], position[1] + 8, position[2]],
    rotation: startAnimation ? [0, 0, 0] : [0.3, 0.3, 0.1],
    scale: startAnimation ? [1, 1, 1] : [0.8, 0.8, 0.8],
    config: {
      ...config.wobbly,
      tension: 100,
      friction: 26,
    },
  })

  // Subtle floating animation after landing
  useFrame((state) => {
    if (meshRef.current && startAnimation) {
      const t = state.clock.elapsedTime
      meshRef.current.position.y += Math.sin(t * 0.5 + index * 0.3) * 0.01
    }
  })

  // Clone the scene to avoid sharing materials
  const clonedScene = scene.clone()
  
  // Apply materials and lighting
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enhanced material with better reflections
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.6 + index * 0.1, 0.7, 0.5),
          metalness: 0.8,
          roughness: 0.2,
          envMapIntensity: 1.5,
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [clonedScene, index])

  return (
    <animated.group
      ref={meshRef}
      position={animatedPosition}
      rotation={rotation}
      scale={scale}
    >
      <primitive object={clonedScene} />
    </animated.group>
  )
}

// Camera controller for smooth orbiting
function CameraController() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useFrame((state) => {
    if (cameraRef.current) {
      const t = state.clock.elapsedTime * 0.1
      cameraRef.current.position.x = Math.sin(t) * 6
      cameraRef.current.position.z = Math.cos(t) * 6
      cameraRef.current.lookAt(0, 0, 0)
    }
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={45}
      position={[5, 3, 5]}
      near={0.1}
      far={100}
    />
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-brandInk border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 w-12 h-12 border border-brandInk/20 rounded-full mx-auto" />
        </div>
        <p className="text-gray-400 text-sm font-medium">Loading 3D experience...</p>
      </div>
    </div>
  )
}

// Error boundary component
function ErrorFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto">
          <span className="text-2xl">🔧</span>
        </div>
        <p className="text-gray-400 text-sm">3D model unavailable</p>
      </div>
    </div>
  )
}

// Main cone scene component
function ConeScene() {
  const coneFiles = [
    { url: '/cone/tek4.glb', position: [0, -1.5, 0] as [number, number, number], delay: 0 },
    { url: '/cone/tek3.glb', position: [0, -0.5, 0] as [number, number, number], delay: 300 },
    { url: '/cone/tek2.glb', position: [0, 0.5, 0] as [number, number, number], delay: 600 },
    { url: '/cone/tek.glb', position: [0, 1.5, 0] as [number, number, number], delay: 900 },
  ]

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 0, -20]} intensity={0.5} color="#4A90E2" />
      <pointLight position={[10, 0, -20]} intensity={0.5} color="#E24A90" />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Camera controller */}
      <CameraController />

      {/* Cone pieces */}
      {coneFiles.map((cone, index) => (
        <ConePiece
          key={cone.url}
          url={cone.url}
          position={cone.position}
          delay={cone.delay}
          index={index}
        />
      ))}

      {/* Floating particles for ambiance */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[3, 2, -2]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#4A90E2" />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh position={[-3, 1, -1]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#E24A90" />
        </mesh>
      </Float>
    </>
  )
}

// Main component export
export default function ConeAnimation() {
  return (
    <ErrorBoundary>
      <div className="w-full h-full relative">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance'
          }}
          style={{
            background: 'transparent',
          }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <ConeScene />
          </Suspense>
        </Canvas>
        
        {/* Gradient overlay for better integration */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-brandNight/20 via-transparent to-transparent" />
      </div>
    </ErrorBoundary>
  )
}

// Preload GLB files
useGLTF.preload('/cone/tek4.glb')
useGLTF.preload('/cone/tek3.glb')
useGLTF.preload('/cone/tek2.glb')
useGLTF.preload('/cone/tek.glb') 