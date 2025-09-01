'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toolsData from '@/tools.json'

// Vendor tool structure (subset of tools.json)
interface VendorToolRaw {
  vendor_name: string
  product_name: string
  homepage_url: string
  one_liner: string
  primary_use_cases?: string[]
  integrations?: string[]
  pricing_model?: string
  pricing_band_usd_per_month?: { low: number | null, high: number | null }
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
  price?: { low: number | null, high: number | null, model?: string }
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
  // Hover state removed to prevent jitter during re-renders; rely on CSS/whileHover
  const [logoFail, setLogoFail] = useState<Record<number, boolean>>({})
  const trackRef = useRef<HTMLDivElement>(null)
  const trackInnerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [trackX, setTrackX] = useState(0)

  const poolTools: PoolTool[] = useMemo(() => {
    const raws = toolsData as VendorToolRaw[]

    // Prefer well-known brands with high-quality Clearbit logos
    const preferredOrder = [
      'Tipalti',
      'Bill.com (BILL)',
      'Stampli',
      'Gorgias',
      'Cresta',
      'Conversica',
      'Ada',
      'Ultimate.ai',
      'Outreach',
      'Fireflies.ai',
      'Avoma',
      'Moveworks',
      'Aisera',
      'Espressive',
      'BigPanda',
      'Moogsoft',
      'PagerDuty',
      'AppZen',
      'Vic.ai',
      'Chili Piper',
      'AvidXchange',
      'MineralTree (Global Payments)'
    ]

    const domainOverrides: Record<string, string> = {
      'Tipalti': 'tipalti.com',
      'Bill.com (BILL)': 'bill.com',
      'Stampli': 'stampli.com',
      'Gorgias': 'gorgias.com',
      'Cresta': 'cresta.com',
      'Conversica': 'conversica.com',
      'Ada': 'ada.cx',
      'Ultimate.ai': 'ultimate.ai',
      'Outreach': 'outreach.io',
      'Fireflies.ai': 'fireflies.ai',
      'Avoma': 'avoma.com',
      'Moveworks': 'moveworks.com',
      'Aisera': 'aisera.com',
      'Espressive': 'espressive.com',
      'BigPanda': 'bigpanda.io',
      'Moogsoft': 'moogsoft.com',
      'PagerDuty': 'pagerduty.com',
      'AppZen': 'appzen.com',
      'Vic.ai': 'vic.ai',
      'Chili Piper': 'chilipiper.com',
      'AvidXchange': 'avidxchange.com',
      'MineralTree (Global Payments)': 'mineraltree.com'
    }

    const byPreference = [...raws].sort((a, b) => {
      const ai = preferredOrder.indexOf(a.vendor_name)
      const bi = preferredOrder.indexOf(b.vendor_name)
      const av = ai === -1 ? Number.POSITIVE_INFINITY : ai
      const bv = bi === -1 ? Number.POSITIVE_INFINITY : bi
      return av - bv
    })

    const picked = byPreference.slice(0, 12)

    return picked.map((t, idx) => {
      const domain = domainOverrides[t.vendor_name] || extractDomain(t.homepage_url)
      return {
        id: idx + 1,
        vendor: t.vendor_name,
        name: t.product_name,
        oneLiner: t.one_liner,
        useCases: t.primary_use_cases ?? [],
        integrations: t.integrations ?? [],
        domain,
        color: brandPalette[idx % brandPalette.length],
        price: t.pricing_band_usd_per_month || t.pricing_model ? {
          low: t.pricing_band_usd_per_month?.low ?? null,
          high: t.pricing_band_usd_per_month?.high ?? null,
          model: t.pricing_model
        } : undefined
      }
    })
  }, [])

  const currentTool = poolTools[currentIndex]
  const baseCount = poolTools.length
  const displayTools = useMemo(() => {
    // Create many copies to ensure truly seamless infinite loop with better symmetry
    const copies = 12 // Even more copies for perfect symmetry
    const result = []
    for (let i = 0; i < copies; i++) {
      result.push(...poolTools)
    }
    return result
  }, [poolTools])

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
    }, 5000)

    // Initial highlight phase
    const startTimer = setTimeout(() => {
      setAnimationPhase('highlight')
    }, 800)

    return () => { clearInterval(interval); clearTimeout(startTimer) }
  }, [])

  // Compute transform X so the active item from the CENTER copy is pinned at center
  useEffect(() => {
    const container = trackRef.current
    const inner = trackInnerRef.current
    if (!container || !inner) return
    
    // Wait for layout to complete
    requestAnimationFrame(() => {
      const indexToCenter = baseCount * 6 + currentIndex // center from the middle set (7th copy out of 12)
      const item = itemRefs.current[indexToCenter]
      if (!item) return
      
      const itemCenter = item.offsetLeft + item.clientWidth / 2
      const containerCenter = container.clientWidth / 2
      const targetX = containerCenter - itemCenter - 30 // Another tiny bit to the right
      setTrackX(targetX)
    })
  }, [currentIndex, baseCount, displayTools])
  
  // Re-center on resize
  useEffect(() => {
    const onResize = () => {
      const container = trackRef.current
      if (!container) return
      
      requestAnimationFrame(() => {
        const indexToCenter = baseCount * 6 + currentIndex
        const item = itemRefs.current[indexToCenter]
        if (!item) return
        const itemCenter = item.offsetLeft + item.clientWidth / 2
        const containerCenter = container.clientWidth / 2
        setTrackX(containerCenter - itemCenter - 30) // Another tiny bit to the right
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [currentIndex, baseCount])

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
    const dictionary: Record<string, string> = {
      // Accounts Payable
      ap_invoice_capture: 'Invoice capture',
      ap_approval_routing: 'Approval routing',
      ap_3way_match: '3‑way PO matching',
      ap_erp_posting: 'ERP posting',
      // Customer Support
      cs_tier1_deflection: 'Self‑serve answers',
      cs_routing_escalation: 'Smart routing',
      cs_agent_assist: 'Agent assist',
      cs_qa_analytics: 'Conversation insights',
      // Sales
      sales_lead_routing: 'Lead routing',
      sales_email_drafting: 'Email drafting',
      sales_call_notes_sync: 'Call notes & CRM sync',
      // IT / Internal
      it_incident_triage: 'Incident triage',
      it_ticket_summarization: 'Ticket summaries',
      it_runbook_suggestion: 'Runbook suggestions',
      // HR
      hr_onboarding_doc_capture: 'HR onboarding capture',
      // Misc
      other_or_unknown: 'Other',
    }
    if (dictionary[norm]) return dictionary[norm]
    return titleCase(norm)
  }

  const formatPrice = (price?: { low: number | null, high: number | null, model?: string }) => {
    if (!price) return null
    if (price.low != null || price.high != null) {
      const low = price.low != null ? `$${price.low}` : '$?'
      const high = price.high != null && price.high !== price.low ? `–$${price.high}` : ''
      return `${low}${high}/mo`
    }
    if (price.model === 'contact_sales') return 'Contact sales'
    return price.model || 'Pricing varies'
  }

  return (
    <div className={`relative py-16 lg:py-24 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Modern header */}
        <div className="w-full mb-16">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white text-center" style={{ textAlign: 'center', width: '100%', marginBottom: '2rem' }}>
              Off-The-Shelf Tools That Fit You
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl text-center" style={{ textAlign: 'center', margin: '0 auto', marginTop: '0' }}>
              Curated enterprise solutions from our comprehensive database
            </p>
          </div>
        </div>

        {/* Modern tool carousel */}
        <div className="relative mb-12">
          <div
            ref={trackRef}
            className="overflow-hidden px-8"
          >
            <motion.div
              ref={trackInnerRef}
              className="flex items-center justify-center gap-8 py-12"
              animate={{ x: trackX }}
              transition={{ type: 'spring', stiffness: 180, damping: 28 }}
            >
                  {displayTools.map((tool, index) => {
                    const baseIdx = baseCount > 0 ? (index % baseCount) : 0
                    const visibleIndex = baseCount * 6 + currentIndex
                    const distance = Math.abs(index - visibleIndex)
                    const isActive = index === visibleIndex
                    
                    // Balanced scaling - prominent center with proper overflow handling
                    const baseScale = distance === 0 ? 1.8 : distance === 1 ? 0.9 : distance === 2 ? 0.7 : distance === 3 ? 0.5 : 0.3
                    const scale = baseScale
                    
                    // Better visibility - more logos visible for symmetry
                    const opacity = distance === 0 ? 1 : distance === 1 ? 0.8 : distance === 2 ? 0.6 : distance === 3 ? 0.4 : 0.2
                    return (
                      <motion.button
                        key={`${tool.id}-${index}`}
                        ref={(el) => (itemRefs.current[index] = el)}
                        onClick={() => setCurrentIndex(baseIdx)}
                        aria-label={tool.name}
                        className="group relative"
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className={`tp-icon ${isActive ? 'tp-icon--active' : 'tp-icon--muted'}`}
                          style={{ 
                            ['--icon-color' as any]: tool.color
                          }}
                          animate={{
                            scale,
                            opacity,
                            y: isActive ? -6 : 0
                          }}
                          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                          whileHover={{ 
                            scale: scale * 1.1,
                            transition: { duration: 0.2 }
                          }}
                        >
                          {tool.domain && !logoFail[tool.id] ? (
                            <img
                              src={`https://logo.clearbit.com/${tool.domain}?size=192&format=png`}
                              alt={tool.vendor}
                              className="logo-glass w-full h-full object-contain select-none"
                              onError={() => setLogoFail((p) => ({ ...p, [tool.id]: true }))}
                              draggable={false}
                              loading="lazy"
                            />
                          ) : (
                            <span className="tp-icon__abbr text-sm select-none" aria-hidden>
                              {getAbbr(tool.name)}
                            </span>
                          )}
                        </motion.div>

                        {/* Enhanced tooltip */}
                        <motion.div
                          className="z-30 absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl bg-black/90 text-white text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none text-center border border-white/10 max-w-[280px]"
                          initial={{ y: 10, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                        >
                          <div className="font-semibold text-white mb-1">{tool.name}</div>
                          <div className="text-xs text-gray-300">
                            {formatPrice(tool.price) || 'Contact for pricing'}
                          </div>
                          {tool.useCases[0] && (
                            <div className="text-xs text-gray-400 mt-1">
                              {humanizeToken(tool.useCases[0])}
                            </div>
                          )}
                        </motion.div>
                      </motion.button>
                    )
                  })}
                </motion.div>
              </div>

        </div>

        {/* Modern tool details */}
        <div className="w-full">
          <motion.div
            key={currentTool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            {/* Tool name */}
            <h3 className="text-2xl lg:text-3xl font-bold text-white text-center w-full" style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '0' }}>
              {currentTool.name}
            </h3>
            
            {/* Description */}
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-center" style={{ textAlign: 'center', margin: '0 auto', marginBottom: '2rem' }}>
              {cleanOneLiner(currentTool.oneLiner)}
            </p>

            {/* Modern info grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
              {/* Use Cases */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Use Cases</h4>
                <div className="space-y-2">
                  {currentTool.useCases.slice(0, 2).map((useCase, i) => (
                    <div key={i} className="text-white text-sm">
                      {humanizeToken(useCase)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              {currentTool.integrations.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Integrations</h4>
                  <div className="space-y-2">
                    {currentTool.integrations.slice(0, 2).map((integration, i) => (
                      <div key={i} className="text-white text-sm">
                        {humanizeToken(integration)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Pricing</h4>
                <div className="text-white font-semibold">
                  {formatPrice(currentTool.price) || 'Contact for pricing'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
