'use client'

import { useState, useEffect } from 'react'
import { MizarUI } from './MizarStack3D'
import ToolPool from './ToolPool'
import Navbar from './ui/Navbar'

export default function Hero({ onStartAudit }: { onStartAudit?: () => void }) {
  const [navbarVisible, setNavbarVisible] = useState(false)
  const [lightIntensity, setLightIntensity] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Manual transform controls
  const [pitch, setPitch] = useState(-25)            // deg
  const [yaw, setYaw] = useState(-12)               // deg
  const [roll, setRoll] = useState(0)               // deg
  const [perspective, setPerspective] = useState(1400) // px
  const [perspOriginX, setPerspOriginX] = useState(60) // %
  const [perspOriginY, setPerspOriginY] = useState(-20) // % (can be negative)
  const [zGap, setZGap] = useState(180)             // px
  const [yOffset, setYOffset] = useState(40)        // px
  const [xOffset, setXOffset] = useState(30)        // px
  const [cameraZ, setCameraZ] = useState(0)         // px (positive brings stack closer)
  const [baseSize, setBaseSize] = useState(1.0)     // multiplier for intrinsic UI size
  const [controlsOpen, setControlsOpen] = useState(false)

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

  // Reveal navbar without cone sequence
  useEffect(() => {
    const t = setTimeout(() => setNavbarVisible(true), 500)
    return () => clearTimeout(t)
  }, [])

  // Load saved transform settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mizar_transform_controls')
      if (saved) {
        const v = JSON.parse(saved)
        if (typeof v.pitch === 'number') setPitch(v.pitch)
        if (typeof v.yaw === 'number') setYaw(v.yaw)
        if (typeof v.roll === 'number') setRoll(v.roll)
        if (typeof v.perspective === 'number') setPerspective(v.perspective)
        if (typeof v.perspOriginX === 'number') setPerspOriginX(v.perspOriginX)
        if (typeof v.perspOriginY === 'number') setPerspOriginY(v.perspOriginY)
        if (typeof v.zGap === 'number') setZGap(v.zGap)
        if (typeof v.yOffset === 'number') setYOffset(v.yOffset)
        if (typeof v.xOffset === 'number') setXOffset(v.xOffset)
        if (typeof v.cameraZ === 'number') setCameraZ(v.cameraZ)
        if (typeof v.baseSize === 'number') setBaseSize(v.baseSize)
      } else {
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        setBaseSize(dpr)
      }
    } catch {}
  }, [])

  // Persist settings
  useEffect(() => {
    try {
      const payload = {
        pitch, yaw, roll, perspective, perspOriginX, perspOriginY, zGap, yOffset, xOffset, cameraZ, baseSize
      }
      localStorage.setItem('mizar_transform_controls', JSON.stringify(payload))
    } catch {}
  }, [pitch, yaw, roll, perspective, perspOriginX, perspOriginY, zGap, yOffset, xOffset, cameraZ, baseSize])

  const applyTabletopPreset = () => {
    // Tabletop: strong pitch like laid on a desk, mild yaw, zero roll
    setPitch(-65)
    setYaw(-8)
    setRoll(0)
    setPerspective(1600)
    setPerspOriginX(55)
    setPerspOriginY(-10)
    setZGap(150)
    setYOffset(32)
    setXOffset(24)
  }

  const resetPreset = () => {
    setPitch(-25)
    setYaw(-12)
    setRoll(0)
    setPerspective(1400)
    setPerspOriginX(60)
    setPerspOriginY(-20)
    setZGap(180)
    setYOffset(40)
    setXOffset(30)
    setCameraZ(0)
    setBaseSize(1.0)
  }

  // Calculate fade opacity based on scroll position
  const fadeOpacity = Math.min(scrollY / 800, 0.85) // Max 85% opacity, fade over 800px

  return (
    <div className="relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Modern blur fade overlay for navbar */}
      <div 
        className="fixed top-0 left-0 right-0 z-[100] pointer-events-none transition-opacity duration-300"
        style={{
          height: '120px',
          background: `linear-gradient(to bottom, 
            var(--bg) 0%, 
            var(--bg) 30%, 
            transparent 60%, 
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
          {/* Linear-style hero layout: text left, 3D stack right */}
          <div className="w-full h-full relative flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Text column */}
                <div className="order-1 lg:order-none max-w-xl z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl mb-6"
                       style={{ backgroundColor: 'var(--surface)', border: `1px solid var(--border)` }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }}></div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Mizar • ACME Corp · AI Audit</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold leading-[1.1] tracking-[-0.02em] mb-4" style={{ color: 'var(--text)' }}>
                    Mizar is trained on industry automation playbooks
                  </h1>
                  <p className="text-lg leading-relaxed font-normal max-w-3xl mb-2" style={{ color: 'var(--muted)' }}>
                    Mizar analyzes your operations against proven automation frameworks, delivering strategic recommendations with quantified business impact and phased implementation roadmaps.
                  </p>
                </div>

                {/* 3D UI column */}
                <div className="order-2 lg:order-none flex justify-center lg:justify-end lg:pl-8">
                  <div
                    className="relative transition-all duration-700 ease-out lg:mr-[-40px]"
                    style={{
                      // Linear-like perspective controls
                      '--perspective': `${perspective}px`,
                      '--persp-origin': `${perspOriginX}% ${perspOriginY}%`,
                      '--pitch': `${pitch}deg`,
                      '--yaw': `${yaw}deg`,
                      '--roll': `${roll}deg`,
                      '--z-gap': `${zGap}px`,
                      '--y-offset': `${yOffset}px`,
                      '--x-offset': `${xOffset}px`,
                      '--camera-z': `${cameraZ}px`,
                      perspective: 'var(--perspective)'
                    } as React.CSSProperties}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div
                      className="relative"
                      style={{
                        transformStyle: 'preserve-3d',
                        perspectiveOrigin: 'var(--persp-origin)',
                        width: 'min(720px, 90vw)',
                        transform: `translateZ(var(--camera-z))`
                      }}
                    >
                      {/* Layer 3 (Background) */}
                      <div
                        className="absolute will-change-transform transition-all duration-700"
                        style={{
                          transformStyle: 'preserve-3d',
                          transformOrigin: 'center center',
                          transform: `
                            rotateX(var(--pitch))
                            rotateY(var(--yaw))
                            rotateZ(var(--roll))
                            translateZ(calc(var(--z-gap) * -2))
                            translateY(calc(var(--y-offset) * 2))
                            translateX(calc(var(--x-offset) * 2))
                            ${isHovered ? 'scale(0.88)' : 'scale(0.85)'}
                          `,
                          filter: 'brightness(0.4) blur(0.5px)',
                          opacity: 0.6,
                          boxShadow: '0 80px 120px -20px rgba(0,0,0,0.8)'
                        }}
                      >
                        <MizarUI width={Math.round(720 * baseSize)} height={Math.round(480 * baseSize)} />
                      </div>

                      {/* Layer 2 (Middle) */}
                      <div
                        className="absolute will-change-transform transition-all duration-700"
                        style={{
                          transformStyle: 'preserve-3d',
                          transformOrigin: 'center center',
                          transform: `
                            rotateX(var(--pitch))
                            rotateY(var(--yaw))
                            rotateZ(var(--roll))
                            translateZ(calc(var(--z-gap) * -1))
                            translateY(var(--y-offset))
                            translateX(var(--x-offset))
                            ${isHovered ? 'scale(0.94)' : 'scale(0.92)'}
                          `,
                          filter: 'brightness(0.7)',
                          opacity: 0.8,
                          boxShadow: '0 60px 100px -15px rgba(0,0,0,0.7)'
                        }}
                      >
                        <MizarUI width={Math.round(720 * baseSize)} height={Math.round(480 * baseSize)} />
                      </div>

                      {/* Layer 1 (Foreground) */}
                      <div
                        className="relative will-change-transform transition-all duration-700"
                        style={{
                          transformStyle: 'preserve-3d',
                          transformOrigin: 'center center',
                          transform: `
                            rotateX(var(--pitch))
                            rotateY(var(--yaw))
                            rotateZ(var(--roll))
                            translateZ(0px)
                            translateY(0px)
                            translateX(0px)
                            scale(1)
                          `,
                          backfaceVisibility: 'hidden',
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale',
                          textRendering: 'geometricPrecision',
                          boxShadow: `
                            0 50px 100px -20px rgba(0,0,0,0.5),
                            0 30px 60px -30px rgba(0,0,0,0.6),
                            0 10px 20px -10px rgba(0,0,0,0.4)
                          `
                        }}
                      >
                        <MizarUI width={Math.round(720 * baseSize)} height={Math.round(480 * baseSize)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating transform control panel */}
      <div className="fixed right-4 bottom-4 z-[120]">
        <button
          className="px-3 py-2 rounded-md text-sm font-medium"
          style={{ backgroundColor: 'var(--surface)', border: `1px solid var(--border)`, color: 'var(--text)' }}
          onClick={() => setControlsOpen(v => !v)}
          aria-label="Toggle transform controls"
        >
          {controlsOpen ? 'Hide Controls' : 'Show Controls'}
        </button>

        {controlsOpen && (
          <div
            className="mt-3 w-[320px] max-h-[70vh] overflow-auto rounded-lg p-3 space-y-3 shadow-xl"
            style={{ backgroundColor: 'var(--surface)', border: `1px solid var(--border)'` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>3D Controls</span>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--accent)', color: 'white' }} onClick={applyTabletopPreset}>Tabletop</button>
                <button className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--surface)', border: `1px solid var(--border)`, color: 'var(--text)' }} onClick={resetPreset}>Reset</button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-2 text-xs" style={{ color: 'var(--text)' }}>
              <label className="block">Pitch ({pitch}°)
                <input type="range" min={-90} max={90} step={1} value={pitch} onChange={e => setPitch(parseInt(e.target.value))} className="w-full" />
              </label>
              <label className="block">Yaw ({yaw}°)
                <input type="range" min={-45} max={45} step={1} value={yaw} onChange={e => setYaw(parseInt(e.target.value))} className="w-full" />
              </label>
              <label className="block">Roll ({roll}°)
                <input type="range" min={-20} max={20} step={1} value={roll} onChange={e => setRoll(parseInt(e.target.value))} className="w-full" />
              </label>
              <label className="block">Perspective ({perspective}px)
                <input type="range" min={600} max={2400} step={50} value={perspective} onChange={e => setPerspective(parseInt(e.target.value))} className="w-full" />
              </label>
              <label className="block">Origin X ({perspOriginX}%)
                <input type="range" min={0} max={100} step={1} value={perspOriginX} onChange={e => setPerspOriginX(parseInt(e.target.value))} className="w-full" />
              </label>
              <label className="block">Origin Y ({perspOriginY}%)
                <input type="range" min={-50} max={100} step={1} value={perspOriginY} onChange={e => setPerspOriginY(parseInt(e.target.value))} className="w-full" />
              </label>
              <label className="block">Z Gap ({zGap}px)
                <input type="range" min={60} max={300} step={5} value={zGap} onChange={e => setZGap(parseInt(e.target.value))} className="w-full" />
              </label>
              <label className="block">Y Offset ({yOffset}px)
                <input type="range" min={0} max={100} step={2} value={yOffset} onChange={e => setYOffset(parseInt(e.target.value))} className="w-full" />
              </label>
              <label className="block">X Offset ({xOffset}px)
                <input type="range" min={-100} max={100} step={2} value={xOffset} onChange={e => setXOffset(parseInt(e.target.value))} className="w-full" />
              </label>
              <label className="block">Zoom ({cameraZ}px)
                <input type="range" min={-300} max={300} step={5} value={cameraZ} onChange={e => setCameraZ(parseInt(e.target.value))} className="w-full" />
              </label>
              <label className="block">Base Size ({(baseSize*100).toFixed(0)}%)
                <input type="range" min={80} max={200} step={5} value={Math.round(baseSize*100)} onChange={e => setBaseSize(parseInt(e.target.value)/100)} className="w-full" />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Modern section divider */}
      <div className="relative">
        <div className="absolute inset-0 h-px" style={{ background: `linear-gradient(to right, transparent, var(--border), transparent)` }}></div>
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-accent2/20 flex items-center justify-center backdrop-blur-sm" 
               style={{ border: `1px solid var(--border)` }}>
            <div className="w-2 h-2 bg-gradient-to-r from-accent to-accent2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Removed duplicate 3D stack section to avoid repeating cards */}
      
      {/* Modern section divider */}
      <div className="relative">
        <div className="absolute inset-0 h-px" style={{ background: `linear-gradient(to right, transparent, var(--border), transparent)` }}></div>
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent2/20 to-accent/20 flex items-center justify-center backdrop-blur-sm" 
               style={{ border: `1px solid var(--border)` }}>
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