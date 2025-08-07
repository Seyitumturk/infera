'use client'

import { useMemo, useState, useEffect } from 'react'
import toolsData from '@/tools.json'

// Vendor tool structure (subset of tools.json)
interface VendorToolRaw {
  vendor_name: string
  product_name: string
  homepage_url: string
  one_liner: string
  primary_use_cases?: string[]
  integrations?: string[]
}

interface PoolTool {
  id: number
  vendor: string
  name: string
  oneLiner: string
  useCases: string[]
  integrations: string[]
  domain?: string
  color: string
}

const brandPalette = [
  '#6e59ff', '#24d07c', '#2563eb', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4', '#84cc16', '#e11d48',
  '#22c55e', '#3b82f6', '#a855f7', '#14b8a6', '#f97316'
]

function extractDomain(urlString: string): string | undefined {
  try {
    const u = new URL(urlString)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

interface ToolPoolProps {
  className?: string
}

export default function ToolPool({ className = "" }: ToolPoolProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationPhase, setAnimationPhase] = useState<'growing' | 'highlight' | 'fading'>('growing')
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [logoFail, setLogoFail] = useState<Record<number, boolean>>({})

  const poolTools: PoolTool[] = useMemo(() => {
    const raws = toolsData as VendorToolRaw[]
    // Diversify categories by first use case
    const buckets: Record<string, VendorToolRaw[]> = {}
    for (const item of raws) {
      const key = (item.primary_use_cases?.[0] || 'misc').toLowerCase()
      if (!buckets[key]) buckets[key] = []
      buckets[key].push(item)
    }
    const picked: VendorToolRaw[] = []
    // Take one from each bucket first
    Object.values(buckets).forEach((arr) => {
      if (picked.length < 8 && arr.length > 0) picked.push(arr[0])
    })
    // Fill remaining up to 12 with the rest
    for (const item of raws) {
      if (picked.length >= 12) break
      if (!picked.find((p) => p.vendor_name === item.vendor_name)) picked.push(item)
    }
    return picked.map((t, idx) => {
      const domain = extractDomain(t.homepage_url)
      return {
        id: idx + 1,
        vendor: t.vendor_name,
        name: t.product_name,
        oneLiner: t.one_liner,
        useCases: t.primary_use_cases ?? [],
        integrations: t.integrations ?? [],
        domain,
        color: brandPalette[idx % brandPalette.length]
      }
    })
  }, [])

  const currentTool = poolTools[currentIndex]

  // Cycle through tools
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase('fading')
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % poolTools.length)
        setAnimationPhase('growing')
        
        setTimeout(() => {
          setAnimationPhase('highlight')
        }, 800)
      }, 400)
    }, 4000)

    // Initial highlight phase
    setTimeout(() => {
      setAnimationPhase('highlight')
    }, 800)

    return () => clearInterval(interval)
  }, [])

  // Pull 2-letter abbreviation from tool name
  const getAbbr = (name: string) => {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  const cleanOneLiner = (text: string) =>
    text
      .replace(/:contentReference\[[^\]]+\]\{index=\d+\}\.?/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  const titleCase = (s: string) =>
    s
      .toLowerCase()
      .split(/[_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

  const humanizeToken = (token: string) => {
    if (!token) return token
    const norm = token.replaceAll('-', '_').toLowerCase()
    if (norm === 'other_or_unknown') return 'Other'
    return titleCase(norm)
  }

  return (
    <div className={`relative py-20 lg:py-32 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
        <div className="mb-16 lg:mb-24 flex flex-col items-center justify-center text-center w-full">
          <h2 className="tw-balance tracking-tight text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mx-auto max-w-[720px] w-full">
            Tool Pool
          </h2>
          <p className="tw-balance text-lg sm:text-xl text-gray-300 mt-3 mx-auto max-w-[720px] leading-relaxed w-full">
            Enterprise-grade integrations that power your AI workflows
          </p>
        </div>

        <div className="relative">
          {/* Minimal container - no background */}
          <div className="relative px-2 sm:px-4 lg:px-6">
            {/* Current tool display */}
            <div className="text-center mb-14 flex flex-col items-center space-y-4">
              <div
                className="inline-block px-6 py-2.5 rounded-full text-sm font-semibold mb-4 tp-chip"
                style={{
                  color: currentTool.color,
                  border: `1px solid ${currentTool.color}40`,
                  backgroundColor: `${currentTool.color}14`
                }}
              >
                {currentTool.useCases[0]?.replaceAll('_', ' ') || 'AI Tool'}
              </div>

              <h3
                className="tw-balance text-2xl sm:text-3xl font-extrabold tracking-tight text-white mx-auto w-full text-center"
              >
                {currentTool.name}
              </h3>

              <div className="mx-auto max-w-4xl w-full space-y-5">
                <p className="tw-balance text-base sm:text-lg text-gray-300 leading-relaxed w-full text-center">
                  {cleanOneLiner(currentTool.oneLiner)}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {currentTool.useCases.slice(0, 4).map((u, i) => (
                    <span key={i} className="tp-badge text-gray-200/90">
                      {humanizeToken(u)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-[820px] mx-auto mt-6">
                <div className="text-center flex flex-col items-center">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Integrations</h4>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {currentTool.integrations.slice(0, 6).map((it, i) => (
                      <span key={i} className="tp-badge text-gray-200/90">
                        {humanizeToken(it)}
                      </span>
                    ))}
                    {currentTool.integrations.length === 0 && (
                      <span className="text-white/70">—</span>
                    )}
                  </div>
                </div>
                <div className="text-center flex flex-col items-center">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Use Cases</h4>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {currentTool.useCases.slice(0, 6).map((u, i) => (
                      <span key={i} className="tp-badge text-gray-200/90">
                        {humanizeToken(u)}
                      </span>
                    ))}
                    {currentTool.useCases.length === 0 && (
                      <span className="text-white/70">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Icon grid visualization */}
            <div className="relative mt-12">
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-6 md:gap-7 max-w-5xl mx-auto justify-items-center tp-tilt transition-transform duration-500 place-items-center">
                {poolTools.map((tool, index) => {
                  const isActive = index === (hoverIndex ?? currentIndex)
                  const delay = `${Math.min(index * 60, 800)}ms`
                  return (
                    <button
                      key={tool.id}
                      onMouseEnter={() => setHoverIndex(index)}
                      onMouseLeave={() => setHoverIndex(null)}
                      onFocus={() => setHoverIndex(index)}
                      onBlur={() => setHoverIndex(null)}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={tool.name}
                      className="group relative inline-flex items-center justify-center"
                      style={{ animationDelay: delay }}
                    >
                      <div
                        className={`tp-icon`}
                        style={{
                          // @ts-ignore CSS custom prop
                          ['--icon-color' as any]: tool.color
                        }}
                      >
                        {tool.domain && !logoFail[tool.id] ? (
                          // Real logo via Clearbit CDN
                          <img
                            src={`https://logo.clearbit.com/${tool.domain}?size=128`}
                            alt={tool.vendor}
                            className="w-[60%] h-[60%] object-contain select-none"
                            onError={() => setLogoFail((p) => ({ ...p, [tool.id]: true }))}
                            draggable={false}
                          />
                        ) : (
                          <span className="tp-icon__abbr text-sm select-none" aria-hidden>
                            {getAbbr(tool.name)}
                          </span>
                        )}
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-black/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none text-center"
                        style={{ opacity: hoverIndex === index ? 1 : 0 }}
                      >
                        {tool.name}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {poolTools.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: index === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.3)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
