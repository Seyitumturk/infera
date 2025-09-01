'use client'

import { Canvas } from '@react-three/fiber'
import { Html, RoundedBox, ContactShadows, Environment } from '@react-three/drei'
import { a, useSpring, useTrail } from '@react-spring/three'
import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

type Chip = { id: string; label: string; text: string }

interface UseCaseSuitcase3DProps {
  chips: Chip[]
  accent?: string
  seed?: number
  headline?: string
}

export default function UseCaseSuitcase3D({ chips, accent = '#8aa0ff', seed = 0, headline }: UseCaseSuitcase3DProps) {
  // Randomized tiny offsets for a natural look
  const offsets = useMemo(() => chips.map((_, i) => ({
    x: (((i + seed) % 2) ? -1 : 1) * 0.06 * (i + 1),
    z: -0.1 - i * 0.12
  })), [chips, seed])

  return (
    <div className="relative w-full max-w-6xl mx-auto h-[520px] md:h-[560px]">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0.62, 2.5], fov: 42 }}>
        {/* Studio lighting: neutral, soft, minimal */}
        <ambientLight intensity={0.5} />
        <rectAreaLight position={[2.2, 1.8, 1.9]} args={[3.2, 1.4]} intensity={5.2} color={0xffffff} />
        <spotLight position={[0, 2.4, -2.2]} angle={0.42} penumbra={1} intensity={0.9} color={0xffffff} />
        <Environment preset="studio" background={false} />

        {/* Scene rotation: sweep +45deg to -45deg then settle center */}
        <SceneMotion>
          <Suitcase chips={chips} offsets={offsets} accent={accent} headline={headline} />
          <ContactShadows position={[0, -0.26, 0]} opacity={0.22} scale={6} blur={3.4} far={2.5} color="#000" />
        </SceneMotion>
      </Canvas>

      {/* Always-visible front overlay featured card */}
      {headline && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -8 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.98, 1.02, 1, 1], x: [0, 0, 200, 240], y: [-8, -8, -8, -8] }}
          transition={{ duration: 4.6, ease: 'easeInOut', times: [0, 0.22, 0.75, 1], repeat: Infinity, repeatDelay: 1.6 }}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[46%]"
          style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
        >
          <div style={{ position: 'absolute', inset: -6, filter: 'blur(18px)', background: 'radial-gradient(closest-side, rgba(255,255,255,0.14), transparent 70%)', opacity: 0.7 }} />
          <div
            style={{
              width: 230,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))',
              boxShadow: '0 12px 36px rgba(0,0,0,0.28)',
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 600,
              padding: '12px 14px'
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', opacity: 0.6 }}>Use Case</div>
            <div style={{ fontSize: 15, lineHeight: 1.35, marginTop: 4 }}>{headline}</div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function SceneMotion({ children }: { children: React.ReactNode }) {
  const motion = useSpring({
    from: { ry: -0.08 },
    to: async (next) => {
      // very slow alternating sway; keeps front mostly visible
      while (true) {
        await next({ ry: 0.08, config: { duration: 9000 } as any })
        await next({ ry: -0.08, config: { duration: 9000 } as any })
      }
    },
  })
  return (
    <a.group rotation-z={0} rotation-x={0.05} rotation-y={motion.ry as any} position={[0, -0.15, 0]}>
      {children}
    </a.group>
  )
}

function Suitcase({ chips, offsets, accent, headline }: { chips: Chip[]; offsets: { x: number; z: number }[]; accent: string; headline?: string }) {
  // Lid open animation
  const lidSpring = useSpring({
    from: { r: 0 },
    to: async (next) => {
      // small delay to let body settle
      await next({ r: -0.95 })
    },
    config: { tension: 80, friction: 14, mass: 1.1 }
  })

  // Cards trail animation
  const trail = useTrail(chips.length, {
    from: { y: 0.22, rx: 0, ry: 0, s: 1, o: 0.3 },
    to: async (next) => {
      for (let i = 0; i < chips.length; i++) {
        await next({ o: 1 })
      }
    },
    config: { tension: 80, friction: 18, mass: 1.0 },
    delay: 200
  })


  useEffect(() => {
    // intentionally left to retrigger springs on mount via key from parent
  }, [chips])

  return (
    <group>
      {/* Base body */}
      <RoundedBox args={[1.8, 0.48, 1.2]} radius={0.12} smoothness={4} position={[0, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial roughness={0.28} metalness={0.22} color="#2c3138" envMapIntensity={1.15} clearcoat={0.6} clearcoatRoughness={0.3} />
      </RoundedBox>

      {/* Edge ring for highlight */}
      <RoundedBox args={[1.82, 0.5, 1.22]} radius={0.13} smoothness={3} position={[0, 0, 0]}>
        <meshBasicMaterial color={'#ffffff'} transparent opacity={0.05} />
      </RoundedBox>

      {/* Lid (pivot at hinge) */}
      <group position={[0, 0.32, -0.6]}>
        <a.group rotation-x={lidSpring.r} position={[0, 0, 0.6]}>
          <RoundedBox args={[1.8, 0.16, 1.2]} radius={0.12} smoothness={4} castShadow receiveShadow>
            <meshPhysicalMaterial roughness={0.25} metalness={0.35} color="#363c46" envMapIntensity={1.25} clearcoat={0.65} clearcoatRoughness={0.28} />
          </RoundedBox>
        </a.group>
      </group>

      {/* Minimal latch hints */}
      <RoundedBox args={[0.12, 0.05, 0.016]} radius={0.01} position={[-0.45, 0.12, 0.61]}>
        <meshStandardMaterial color="#b7bec8" metalness={0.6} roughness={0.35} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.05, 0.016]} radius={0.01} position={[0.45, 0.12, 0.61]}>
        <meshStandardMaterial color="#b7bec8" metalness={0.6} roughness={0.35} />
      </RoundedBox>

      {/* Removed in-canvas featured card; replaced with front overlay for guaranteed visibility */}

      {/* Cards grid inside suitcase with spotlight scan */}
      {trail.map((styles, i) => (
        <a.group key={chips[i].id} position={[i === 1 ? 0.08 : i === 2 ? -0.14 : 0.22, styles.y as any, -0.12 - i * 0.14]} rotation-x={0} rotation-y={0}>
          <RoundedBox args={[0.9, 0.055, 0.6]} radius={0.06} smoothness={4} castShadow receiveShadow>
            <a.meshPhysicalMaterial color="#262a31" roughness={0.45} metalness={0.18} transparent opacity={styles.o} />
          </RoundedBox>
          {/* Content */}
          <Html transform distanceFactor={1.65} position={[0, 0.028, 0]} occlude>
            <div
              style={{
                width: '360px',
                maxWidth: '54vw',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))',
                boxShadow: '0 16px 50px rgba(0,0,0,0.4)',
                color: 'white'
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(215,220,230,0.9)', marginBottom: 6 }}>
                {chips[i].label}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.5, color: 'rgba(250,252,255,0.96)' }}>
                {chips[i].text}
              </div>
            </div>
          </Html>
          {/* Moving spotlight to highlight one tile */}
          <a.spotLight
            position={[0, 0.65, 0.32]}
            angle={0.6}
            penumbra={1}
            intensity={styles.o.to((v) => 0.8 * v) as any}
            color={accent as any}
            target-position={[0, 0, 0]}
          />
        </a.group>
      ))}
    </group>
  )
}


