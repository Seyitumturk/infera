"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
const MDiv = (motion as any).div

// AI Use Case data structure
interface AIUseCase {
  id: number
  title: string
  solution: string
  how: string
  tools: string
  outcome: string
  color: string
}

const aiUseCases: AIUseCase[] = [
  {
    id: 1,
    title: "Cash stuck in AR",
    solution: "Smart dunning + payment links",
    how: "Reads invoices/remittances → nudges with the right message/time",
    tools: "Stripe Billing / Chargebee",
    outcome: "Faster cash; lower DSO",
    color: "#4f46e5"
  },
  {
    id: 2,
    title: "Invoice overload (AP)",
    solution: "Invoice capture + 3‑way match",
    how: "Extracts header/lines → matches PO/receipt → routes exceptions",
    tools: "Google DocAI / Rossum",
    outcome: "Touchless approvals; fewer errors",
    color: "#7c3aed"
  },
  {
    id: 3,
    title: "Leads leaking",
    solution: "Lead triage + instant booking",
    how: "Scores and routes inbound → auto‑schedules to the right rep",
    tools: "HubSpot Workflows / Chili Piper",
    outcome: "Higher speed‑to‑lead; more meetings",
    color: "#2563eb"
  },
  {
    id: 4,
    title: "Ticket volume too high",
    solution: "Tier‑1 assistant + deflection",
    how: "Answers FAQ from your help docs → routes edge cases cleanly",
    tools: "Zendesk AI / Intercom",
    outcome: "Lower handle time; higher deflection",
    color: "#0891b2"
  },
  {
    id: 5,
    title: "Churn sneaks up",
    solution: "Churn risk from tickets + product usage",
    how: "Flags risky accounts → triggers save playbooks and alerts",
    tools: "Gainsight / Amplitude",
    outcome: "Better retention; saved ARR",
    color: "#059669"
  },
  {
    id: 6,
    title: "Ad spend waste",
    solution: "Attribution cleanup (UTM hygiene)",
    how: "Validates tags → stitches sources → fixes CRM write‑backs",
    tools: "Segment / Hightouch",
    outcome: "Trusted pipeline; lower CAC",
    color: "#dc2626"
  },
  {
    id: 7,
    title: "Slow proposals/RFPs",
    solution: "Proposal/RFP answer co‑pilot",
    how: "Pulls approved answers with citations → drafts, routes for review",
    tools: "Loopio / Vector DB + LLM",
    outcome: "Faster submissions; higher win rate",
    color: "#ea580c"
  },
  {
    id: 8,
    title: "Contract risk & missed renewals",
    solution: "Clause extraction + renewal radar",
    how: "Reads PDFs → surfaces terms/obligations → alerts owners on dates",
    tools: "Evisort / Ironclad",
    outcome: "Fewer surprises; no missed renewals",
    color: "#d97706"
  },
  {
    id: 9,
    title: "Returns fraud & delays (e‑comm)",
    solution: "Photo QA + RMA routing",
    how: "Checks images for damage/fraud → auto‑approves or escalates",
    tools: "AWS Rekognition / Shopify Flow",
    outcome: "Faster refunds; lower loss rate",
    color: "#65a30d"
  },
  {
    id: 10,
    title: "Access/security drift",
    solution: "Access review co‑pilot",
    how: "Finds stale/high‑risk access → suggests removals → one‑click revoke",
    tools: "Okta Workflows / BetterCloud",
    outcome: "Fewer incidents; cleaner audits",
    color: "#7c2d12"
  }
]

interface GitForkAIUseCasesProps { className?: string }

export default function GitForkAIUseCases({ className = "" }: GitForkAIUseCasesProps) {
  const [index, setIndex] = useState(0)
  const current = aiUseCases[index]

  // Clarified detail chips: Solution, How (Outcome removed per request)
  const detailChips = useMemo(
    () => [
      { key: 'solution', label: 'Solution', text: current.solution },
      { key: 'how', label: 'How it works', text: current.how },
    ],
    [current]
  )

  // Tools list
  const tools = useMemo(
    () => current.tools.split('/').map((t) => t.trim()).filter(Boolean),
    [current]
  )
  const branchColors = ['#2563eb', '#ef4444', '#f59e0b', '#10b981']
  const [outgoingPaths, setOutgoingPaths] = useState<string[]>([])
  const [incomingPath, setIncomingPath] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const sourceRef = useRef<HTMLDivElement>(null)
  const hubRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<(HTMLDivElement | null)[]>([])

  // Map a tool name to a logo domain for a modern brand icon (Clearbit)
  const getDomainForTool = (name: string): string | undefined => {
    const n = name.toLowerCase()
    if (n.includes('stripe')) return 'stripe.com'
    if (n.includes('chargebee')) return 'chargebee.com'
    if (n.includes('google')) return 'google.com'
    if (n.includes('docai')) return 'cloud.google.com'
    if (n.includes('rossum')) return 'rossum.ai'
    if (n.includes('hubspot')) return 'hubspot.com'
    if (n.includes('chili piper')) return 'chilipiper.com'
    if (n.includes('zendesk')) return 'zendesk.com'
    if (n.includes('intercom')) return 'intercom.com'
    if (n.includes('gainsight')) return 'gainsight.com'
    if (n.includes('amplitude')) return 'amplitude.com'
    if (n.includes('segment')) return 'segment.com'
    if (n.includes('hightouch')) return 'hightouch.com'
    if (n.includes('loopio')) return 'loopio.com'
    if (n.includes('evisort')) return 'evisort.com'
    if (n.includes('ironclad')) return 'ironcladapp.com'
    if (n.includes('rekognition') || n.includes('aws')) return 'aws.amazon.com'
    if (n.includes('shopify')) return 'shopify.com'
    if (n.includes('okta')) return 'okta.com'
    if (n.includes('bettercloud')) return 'bettercloud.com'
    return undefined
  }

  // Optional auto-advance (pause if user interacts later if needed)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % aiUseCases.length), 7000)
    return () => clearInterval(id)
  }, [])

  // Compute connector paths from source -> hub and hub -> chip
  useEffect(() => {
    const compute = () => {
      const container = containerRef.current
      const source = sourceRef.current
      const hub = hubRef.current
      if (!container || !source || !hub) return
      const c = container.getBoundingClientRect()
      const s = source.getBoundingClientRect()
      const h = hub.getBoundingClientRect()

      // Helper: build an orthogonal path with slightly rounded corners
      const buildOrthogonalPath = (
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        options?: { cornerRadius?: number; startOffset?: number; endOffset?: number }
      ): string => {
        const cornerRadiusBase = options?.cornerRadius ?? 10
        const startOffset = options?.startOffset ?? 12
        const endOffset = options?.endOffset ?? 12

        // Apply small offsets so lines do not overlap node borders
        const sx = startX + startOffset
        const ex = endX - endOffset
        const sy = startY
        const ey = endY

        const midX = sx + (ex - sx) / 2
        const verticalDistance = Math.abs(ey - sy)
        const r = Math.min(cornerRadiusBase, Math.max(2, verticalDistance / 2))
        const dirY = ey >= sy ? 1 : -1

        // Two elbows: at (midX, sy) and (midX, ey)
        // H to midX - r, quarter curve to V segment, V to ey - r, quarter curve, then H to end
        return [
          `M ${sx} ${sy}`,
          `H ${midX - r}`,
          `Q ${midX} ${sy} ${midX} ${sy + dirY * r}`,
          `V ${ey - dirY * r}`,
          `Q ${midX} ${ey} ${midX + r} ${ey}`,
          `H ${ex}`
        ].join(' ')
      }

      // Incoming (source -> hub) — rigid orthogonal with rounded corners
      const inStartX = s.right - c.left
      const inStartY = s.top - c.top + s.height / 2
      const inEndX = h.left - c.left
      const inEndY = h.top - c.top + h.height / 2
      setIncomingPath(
        buildOrthogonalPath(inStartX, inStartY, inEndX, inEndY, {
          cornerRadius: 12,
          startOffset: 14,
          endOffset: 10
        })
      )

      // Outgoing (hub -> chips)
      const startX = h.right - c.left
      const startTop = h.top - c.top
      const height = h.height
      const newPaths: string[] = []
      const chipCount = chipRefs.current.filter(Boolean).length || 0
      chipRefs.current.forEach((chip, i) => {
        if (!chip) return
        const r = chip.getBoundingClientRect()
        const endX = r.left - c.left
        const endY = r.top - c.top + r.height / 2
        const startY = startTop + ((i + 0.5) * height) / Math.max(chipCount, 1)
        newPaths.push(
          buildOrthogonalPath(startX, startY, endX, endY, {
            cornerRadius: 12,
            startOffset: 10,
            endOffset: 14
          })
        )
      })
      setOutgoingPaths(newPaths)
    }
    compute()
    const ro = new ResizeObserver(compute)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [index, detailChips.length])

  return (
    <div className={`relative pt-16 pb-24 lg:pt-28 lg:pb-40 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-28 lg:mb-36 text-center max-w-4xl mx-auto">
          <h2 className="tw-balance text-[40px] sm:text-[54px] lg:text-[64px] leading-[1.05] font-extrabold text-white" style={{marginBottom: '2rem'}}>
            Mizar is trained on industry automation playbooks
          </h2>
          <p className="text-[18px] lg:text-[20px] text-gray-300 leading-relaxed">
            Mizar analyzes your operations against proven automation frameworks, delivering strategic recommendations with quantified business impact and phased implementation roadmaps.
          </p>
        </div>
        {/* Single Use Case – node graph with center hub */}
        <div className="relative">
          <div className="flex justify-center">
            {/* Node graph */}
            <div ref={containerRef} className="relative w-full max-w-[1120px] mx-auto">
              <div className="relative flex items-center justify-between gap-14">
                {/* Source/browser */}
                <div ref={sourceRef} className="shrink-0 w-[420px] h-[240px] rounded-2xl border border-white/12 bg-white/[0.03] shadow-ambient p-9 flex items-center justify-center text-center">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-gray-400/80 mb-2">Business Pain</div>
                    <div className="text-white font-semibold leading-snug text-xl sm:text-2xl">
                      {current.title}
                    </div>
                  </div>
                </div>

                {/* Hub */}
                <div ref={hubRef} className="shrink-0 w-[72px] h-[72px] rounded-2xl border border-white/12 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                  {/* Triangle icon */}
                  <svg width="22" height="20" viewBox="0 0 28 24" aria-hidden="true">
                    <path d="M14 2l12 20H2L14 2z" fill="#fff" opacity="0.9"/>
                  </svg>
                </div>

                {/* Destinations */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] uppercase tracking-wide text-gray-400/80">Custom AI Solutions</div>
                    </div>
                    <AnimatePresence mode="wait">
                      <MDiv
                        key={current.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="flex flex-col gap-4"
                      >
                        {detailChips.map((chip, i) => (
                          <div key={chip.key} className="relative" ref={(el) => { chipRefs.current[i] = el }}>
                           <div className="inline-flex items-start gap-4 rounded-xl bg-white/[0.06] border border-white/12 px-6 py-5 text-gray-200/95 shadow-ambient min-w-[380px] h-[128px]">
                              <span className="mt-1 w-3 h-3 rounded-full" style={{ backgroundColor: branchColors[i % branchColors.length] }} />
                              <div>
                                <div className="text-[12px] uppercase tracking-wide text-gray-400/80">{chip.label}</div>
                                <div className="font-medium text-lg leading-snug text-gray-100 line-clamp-3">{chip.text}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Tools row (logos only) */}
                        <div className="relative" ref={(el) => { chipRefs.current[detailChips.length] = el }}>
                          <div className="inline-flex items-start gap-4 rounded-xl bg-white/[0.06] border border-white/12 px-6 py-5 text-gray-200/95 shadow-ambient min-w-[380px] h-[128px]">
                            <span className="mt-1 w-3 h-3 rounded-full" style={{ backgroundColor: branchColors[detailChips.length % branchColors.length] }} />
                            <div className="w-full">
                              <div className="text-[12px] uppercase tracking-wide text-gray-400/80">Tools</div>
                              <div className="flex items-center gap-3 pt-2 flex-wrap">
                                {tools.map((t) => {
                                  const domain = getDomainForTool(t)
                                  return (
                                    <div
                                      key={t}
                                      className="group inline-flex items-center gap-2 rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 hover:bg-white/[0.1] transition-colors"
                                      title={t}
                                    >
                                      {domain ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={`https://logo.clearbit.com/${domain}?size=128`}
                                          alt={t}
                                          className="w-6 h-6 object-contain opacity-90 rounded-md"
                                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                                        />
                                      ) : (
                                        <span className="inline-block w-6 h-6 rounded-md bg-white/30" />
                                      )}
                                      <span className="text-sm text-gray-100/90 font-medium tracking-tight whitespace-nowrap">
                                        {t}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </MDiv>
                    </AnimatePresence>
                    
                  </div>
              </div>

              {/* Dynamic connectors */}
              <svg className="pointer-events-none absolute inset-0" width="100%" height="100%">
                {incomingPath && (
                  <path
                    d={incomingPath}
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    fill="none"
                  />
                )}
                {outgoingPaths.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    stroke={branchColors[i % branchColors.length]}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    fill="none"
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Dots only */}
          <div className="mt-10 flex items-center justify-center">
            <div className="flex gap-2">
              {aiUseCases.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
