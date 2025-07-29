'use client'

import { useState, useEffect, useMemo } from 'react'

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

interface GitForkAIUseCasesProps {
  className?: string
}

export default function GitForkAIUseCases({ className = "" }: GitForkAIUseCasesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationPhase, setAnimationPhase] = useState<'growing' | 'highlight' | 'fading'>('growing')

  const currentUseCase = aiUseCases[currentIndex]
  const branchCount = aiUseCases.length

  // Cycle through use cases
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase('fading')
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % branchCount)
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
  }, [branchCount])

  // Generate branch data for the 3 main categories with tree-like positioning
  const branchData = useMemo(() => {
    const currentCase = aiUseCases[currentIndex]
    return [
      {
        id: 'how',
        title: 'How it works',
        content: currentCase.how,
        y: 180,
        direction: 'right',
        branchEndX: 600,
        textX: 620,
        textY: 180
      },
      {
        id: 'outcome', 
        title: 'Outcome',
        content: currentCase.outcome,
        y: 250,
        direction: 'left',
        branchEndX: 400,
        textX: 380,
        textY: 250
      },
      {
        id: 'tools',
        title: 'Tools', 
        content: currentCase.tools,
        y: 320,
        direction: 'right',
        branchEndX: 600,
        textX: 620,
        textY: 320
      }
    ]
  }, [currentIndex])

  return (
    <div className={`py-24 lg:py-40 ${className}`} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8" style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Section Header */}
        <div className="text-center" style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '6rem' }}>
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white"
            style={{ textAlign: 'center', width: '100%', display: 'block', margin: '0 auto', marginBottom: '2.5rem' }}
          >
            Use Case Suitecase
          </h2>
          <p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            style={{ textAlign: 'center', width: '100%', display: 'block', margin: '0 auto' }}
          >
            Real AI solutions for the problems that keep SMBs up at night. 
            Each branch represents a proven automation pathway.
          </p>
        </div>

        {/* Current Use Case Title */}
        <div className="text-center" style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '5rem' }}>
          <div className="flex items-center justify-center gap-3" style={{ justifyContent: 'center', textAlign: 'center', display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentUseCase.color }}
            />
            <span className="text-sm font-medium text-gray-400">
              Use Case #{currentUseCase.id}
            </span>
          </div>
          <h3 
            className="text-3xl lg:text-4xl font-bold text-white"
            style={{ textAlign: 'center', width: '100%', display: 'block', margin: '0 auto', marginBottom: '2rem' }}
          >
            {currentUseCase.title}
          </h3>
          <p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            style={{ textAlign: 'center', width: '100%', display: 'block', margin: '0 auto' }}
          >
            {currentUseCase.solution}
          </p>
        </div>

        {/* Main Git Fork Visualization - Centered */}
        <div className="flex justify-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: '5rem' }}>
          <div className="relative" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg 
              width="1000" 
              height="500" 
              viewBox="0 0 1000 500" 
              className="w-full max-w-5xl"
              style={{ display: 'block', margin: '0 auto' }}
            >
                {/* Glow effects */}
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  <filter id="activeGlow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Main trunk - vertical centered */}
                <line 
                  x1="500" 
                  y1="100" 
                  x2="500" 
                  y2="400" 
                  stroke="#4b5563" 
                  strokeWidth="4"
                  className="transition-all duration-1000"
                />

                {/* Main trunk nodes */}
                <circle cx="500" cy="100" r="6" fill="#6b7280" />
                <circle cx="500" cy="400" r="6" fill="#6b7280" />

                {/* Branch lines and nodes */}
                {branchData.map((branch, index) => {
                  const isLeft = branch.direction === 'left'
                  
                  return (
                    <g key={branch.id}>
                      {/* Horizontal branch line */}
                      <line
                        x1="500"
                        y1={branch.y}
                        x2={branch.branchEndX}
                        y2={branch.y}
                        stroke="#6b7280"
                        strokeWidth="3"
                        className="transition-all duration-1000"
                        style={{
                          opacity: 1,
                          strokeDasharray: animationPhase === 'growing' ? '100' : 'none',
                          strokeDashoffset: animationPhase === 'growing' ? '100' : '0',
                          animation: animationPhase === 'growing' ? 'drawLine 0.6s ease-out forwards' : 'none'
                        }}
                      />
                      

                      
                      {/* Branch connection node */}
                      <circle 
                        cx="500" 
                        cy={branch.y}
                        r="4"
                        fill="#9ca3af"
                        className="transition-all duration-1000"
                      />
                      
                      {/* Branch endpoint node */}
                      <circle
                        cx={branch.branchEndX}
                        cy={branch.y}
                        r="5"
                        fill="#9ca3af"
                        className="transition-all duration-1000"
                        style={{
                          opacity: animationPhase === 'highlight' ? 1 : 0.8
                        }}
                      />
                      
                      {/* Branch title */}
                      <text
                        x={branch.textX}
                        y={branch.textY - 10}
                        className="text-white font-semibold text-lg fill-current"
                        textAnchor={isLeft ? 'end' : 'start'}
                      >
                        {branch.title}
                      </text>
                      
                      {/* Branch content */}
                      <foreignObject
                        x={isLeft ? branch.textX - 300 : branch.textX}
                        y={branch.textY + 5}
                        width="300"
                        height="50"
                      >
                        <div className={`text-gray-300 text-sm leading-relaxed ${isLeft ? 'text-right' : 'text-left'}`}>
                          {branch.content}
                        </div>
                      </foreignObject>
                    </g>
                  )
                })}

                {/* DNA double helix - two intertwining strands */}
                <g>
                  {/* Left DNA strand */}
                  <path
                    d="M 450,150 C 470,170 490,190 450,210 C 410,230 430,250 470,270 C 510,290 490,310 450,330 C 410,350 430,370 450,390"
                    stroke="#6b7280"
                    strokeWidth="2.5"
                    fill="none"
                    className="transition-all duration-1000"
                    style={{
                      opacity: 0.6,
                      strokeDasharray: animationPhase === 'growing' ? '400' : 'none',
                      strokeDashoffset: animationPhase === 'growing' ? '400' : '0',
                      animation: animationPhase === 'growing' ? 'drawLine 1.5s ease-out 0.4s forwards' : 'none'
                    }}
                  />
                  
                  {/* Right DNA strand - mirrors the left strand */}
                  <path
                    d="M 550,150 C 530,170 510,190 550,210 C 590,230 570,250 530,270 C 490,290 510,310 550,330 C 590,350 570,370 550,390"
                    stroke="#6b7280"
                    strokeWidth="2.5"
                    fill="none"
                    className="transition-all duration-1000"
                    style={{
                      opacity: 0.6,
                      strokeDasharray: animationPhase === 'growing' ? '400' : 'none',
                      strokeDashoffset: animationPhase === 'growing' ? '400' : '0',
                      animation: animationPhase === 'growing' ? 'drawLine 1.5s ease-out 0.6s forwards' : 'none'
                    }}
                  />
                  
                  {/* DNA base pair connections */}
                  <g className="opacity-30">
                    <line x1="450" y1="210" x2="550" y2="210" stroke="#6b7280" strokeWidth="1" />
                    <line x1="470" y1="270" x2="530" y2="270" stroke="#6b7280" strokeWidth="1" />
                    <line x1="450" y1="330" x2="550" y2="330" stroke="#6b7280" strokeWidth="1" />
                  </g>
                </g>

                {/* Commit indicators along main trunk */}
                <g className="opacity-40">
                  <circle cx="500" cy="130" r="2" fill="#6b7280" />
                  <circle cx="500" cy="200" r="2" fill="#6b7280" />
                  <circle cx="500" cy="280" r="2" fill="#6b7280" />
                  <circle cx="500" cy="350" r="2" fill="#6b7280" />
                  <circle cx="500" cy="380" r="2" fill="#6b7280" />
                </g>
              </svg>

              {/* CSS for line drawing animation */}
              <style jsx>{`
                @keyframes drawLine {
                  to {
                    stroke-dashoffset: 0;
                  }
                }
              `}</style>
            </div>
        </div>
      </div>
    </div>
  )
}
