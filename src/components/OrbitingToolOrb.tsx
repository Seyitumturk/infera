'use client'

import { useEffect, useMemo, useState } from 'react'

export interface OrbitTool {
  id: number
  name: string
  vendor: string
  domain?: string
  color: string
}

interface OrbitingToolOrbProps {
  tools: OrbitTool[]
  selectedId?: number
  onSelect?: (toolId: number) => void
  className?: string
}

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function OrbitingToolOrb({ tools, selectedId, onSelect, className = '' }: OrbitingToolOrbProps) {
  const [expanded, setExpanded] = useState(false)
  const [radiusBase, setRadiusBase] = useState(72)
  const [radiusExpanded, setRadiusExpanded] = useState(150)

  useEffect(() => {
    const update = () => {
      const isMobile = window.innerWidth < 768
      setRadiusBase(isMobile ? 56 : 72)
      setRadiusExpanded(isMobile ? 120 : 170)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const visibleTools = useMemo(() => tools.slice(0, 12), [tools])
  const angleStep = (Math.PI * 2) / Math.max(visibleTools.length, 1)

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ height: 380 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Center gear icon */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
        <button
          className="rounded-full border"
          style={{
            width: 120,
            height: 120,
            borderColor: 'var(--border)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
          }}
          aria-label="Gear hub"
        >
          <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto" style={{ opacity: 0.9, transition: 'transform 400ms ease' , transform: expanded ? 'scale(1.04) rotate(8deg)' : 'scale(1) rotate(0deg)'}}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9aa7ff" />
                <stop offset="100%" stopColor="#6e59ff" />
              </linearGradient>
            </defs>
            <path fill="url(#g)" d="M28.4 4.6c1.7-.4 3.5-.4 5.2 0l1.6 4.9c1.8.5 3.5 1.4 5 2.6l5-1.6c1.1 1.3 2 3 2.6 4.7l-3.6 3.6c.4 1 .6 2.1.7 3.2 0 1.1-.2 2.2-.6 3.2l3.6 3.6c-.6 1.7-1.5 3.3-2.6 4.7l-5-1.6c-1.5 1.2-3.2 2.1-5 2.6l-1.6 4.9c-1.7.4-3.5.4-5.2 0l-1.6-4.9c-1.8-.5-3.5-1.4-5-2.6l-5 1.6c-1.1-1.3-2-3-2.6-4.7l3.6-3.6c-.4-1-.6-2.1-.6-3.2 0-1.1.2-2.2.6-3.2L9.6 15.2c.6-1.7 1.5-3.3 2.6-4.7l5 1.6c1.5-1.2 3.2-2.1 5-2.6l1.6-4.9ZM32 24c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Z"/>
          </svg>
        </button>
      </div>

      {/* Radial icons that fan in/out on hover */}
      {visibleTools.map((tool, index) => {
        const angle = -Math.PI / 2 + index * angleStep
        const radius = expanded ? radiusExpanded : radiusBase
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const isActive = tool.id === selectedId
        const delayMs = 20 * index
        return (
          <button
            key={tool.id}
            onClick={() => onSelect?.(tool.id)}
            className="absolute rounded-full group"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              width: 68,
              height: 68,
              transition: `transform 480ms cubic-bezier(0.2,0.8,0.2,1) ${delayMs}ms, box-shadow 240ms ease`,
              background: 'rgba(0,0,0,0.22)',
              border: `1px solid var(--border)`,
              backdropFilter: 'blur(6px)',
              boxShadow: isActive ? `0 10px 30px rgba(0,0,0,0.35), 0 0 0 6px ${tool.color}22` : '0 10px 30px rgba(0,0,0,0.35)'
            }}
            aria-label={tool.name}
            title={tool.name}
          >
            <div className="w-full h-full flex items-center justify-center">
              {tool.domain ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://logo.clearbit.com/${tool.domain}?size=96&format=png`}
                  alt={tool.vendor}
                  width={36}
                  height={36}
                  style={{ objectFit: 'contain', filter: 'saturate(1.05) contrast(1.03)' }}
                  draggable={false}
                />
              ) : (
                <span className="text-sm font-semibold" style={{ color: tool.color }}>{getInitials(tool.name)}</span>
              )}
            </div>
          </button>
        )
      })}

      {/* subtle hints */}
      <div className="absolute left-1/2 bottom-4 -translate-x-1/2 text-xs" style={{ color: 'var(--muted)' }}>
        Hover to explore tools
      </div>
    </div>
  )
}


