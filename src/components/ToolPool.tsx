'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toolsData from '@/tools.json'
import OrbitingToolOrb from './OrbitingToolOrb'

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

  // no-op helper removed from previous slider

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
            <h2 className="text-4xl lg:text-5xl font-bold text-center" style={{ textAlign: 'center', width: '100%', marginBottom: '2rem', color: 'var(--text)' }}>
              Off-The-Shelf Tools That Fit You
            </h2>
            <p className="text-lg max-w-2xl text-center" style={{ textAlign: 'center', margin: '0 auto', marginTop: '0', color: 'var(--muted)' }}>
              Curated enterprise solutions from our comprehensive database
            </p>
          </div>
        </div>

        {/* 3D orb with orbiting icons */}
        <div className="relative mb-12">
          <OrbitingToolOrb
            tools={poolTools.map(t => ({ id: t.id, name: t.name, vendor: t.vendor, domain: t.domain, color: t.color }))}
            selectedId={poolTools[currentIndex]?.id}
            onSelect={(id) => {
              const idx = poolTools.findIndex(t => t.id === id)
              if (idx !== -1) setCurrentIndex(idx)
            }}
          />
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
            <h3 className="text-2xl lg:text-3xl font-bold text-center w-full" style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '0', color: 'var(--text)' }}>
              {currentTool.name}
            </h3>
            
            {/* Description */}
            <p className="max-w-2xl mx-auto leading-relaxed text-center" style={{ textAlign: 'center', margin: '0 auto', marginBottom: '2rem', color: 'var(--muted)' }}>
              {cleanOneLiner(currentTool.oneLiner)}
            </p>

            {/* Modern info grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
              {/* Use Cases */}
              <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: `1px solid var(--border)` }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--muted)' }}>Use Cases</h4>
                <div className="space-y-2">
                  {currentTool.useCases.slice(0, 2).map((useCase, i) => (
                    <div key={i} className="text-sm" style={{ color: 'var(--text)' }}>
                      {humanizeToken(useCase)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              {currentTool.integrations.length > 0 && (
                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: `1px solid var(--border)` }}>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Integrations</h4>
                  <div className="space-y-2">
                    {currentTool.integrations.slice(0, 2).map((integration, i) => (
                      <div key={i} className="text-sm" style={{ color: 'var(--text)' }}>
                        {humanizeToken(integration)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: `1px solid var(--border)` }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--muted)' }}>Pricing</h4>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>
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
