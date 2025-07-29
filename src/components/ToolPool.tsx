'use client'

import { useState, useEffect } from 'react'

// Tool data structure
interface Tool {
  id: number
  name: string
  category: string
  description: string
  integration: string
  benefit: string
  color: string
}

const tools: Tool[] = [
  {
    id: 1,
    name: "Stripe Billing",
    category: "Payments",
    description: "Automated billing and subscription management",
    integration: "API + Webhooks",
    benefit: "Streamlined revenue collection",
    color: "#4f46e5"
  },
  {
    id: 2,
    name: "Google DocAI",
    category: "Document Processing",
    description: "Extract data from invoices and documents",
    integration: "Cloud API",
    benefit: "Touchless document processing",
    color: "#7c3aed"
  },
  {
    id: 3,
    name: "HubSpot Workflows",
    category: "CRM Automation",
    description: "Lead scoring and automated routing",
    integration: "REST API + Webhooks",
    benefit: "Higher conversion rates",
    color: "#2563eb"
  },
  {
    id: 4,
    name: "Zendesk AI",
    category: "Customer Support",
    description: "Intelligent ticket routing and responses",
    integration: "Apps Framework",
    benefit: "Reduced response times",
    color: "#0891b2"
  },
  {
    id: 5,
    name: "Gainsight",
    category: "Customer Success",
    description: "Churn prediction and health scoring",
    integration: "Data Sync + Rules",
    benefit: "Proactive retention",
    color: "#059669"
  },
  {
    id: 6,
    name: "Segment",
    category: "Data Pipeline",
    description: "Customer data platform and routing",
    integration: "Event Tracking",
    benefit: "Unified customer view",
    color: "#dc2626"
  },
  {
    id: 7,
    name: "Loopio",
    category: "Proposal Management",
    description: "RFP response automation",
    integration: "Content Library API",
    benefit: "Faster proposal turnaround",
    color: "#ea580c"
  },
  {
    id: 8,
    name: "Ironclad",
    category: "Contract Management",
    description: "Contract lifecycle automation",
    integration: "Workflow Engine",
    benefit: "Reduced legal bottlenecks",
    color: "#d97706"
  },
  {
    id: 9,
    name: "AWS Rekognition",
    category: "Computer Vision",
    description: "Image and video analysis",
    integration: "ML APIs",
    benefit: "Automated quality control",
    color: "#65a30d"
  },
  {
    id: 10,
    name: "Okta Workflows",
    category: "Identity Management",
    description: "Access governance and automation",
    integration: "SCIM + SAML",
    benefit: "Enhanced security posture",
    color: "#7c2d12"
  }
]

interface ToolPoolProps {
  className?: string
}

export default function ToolPool({ className = "" }: ToolPoolProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationPhase, setAnimationPhase] = useState<'growing' | 'highlight' | 'fading'>('growing')

  const currentTool = tools[currentIndex]

  // Cycle through tools
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase('fading')
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % tools.length)
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

  return (
    <div className={`relative py-20 lg:py-32 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
        <div className="text-center mb-16 lg:mb-24">
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white"
            style={{ textAlign: 'center', width: '100%', display: 'block', margin: '0 auto', marginBottom: '2.5rem' }}
          >
            Tool Pool
          </h2>
          <p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            style={{ textAlign: 'center', width: '100%', display: 'block', margin: '0 auto' }}
          >
            Enterprise-grade integrations that power your AI workflows
          </p>
        </div>

        <div className="relative">
          {/* Glass morphism container */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12 border border-white/10">
            {/* Current tool display */}
            <div className="text-center mb-12">
              <div 
                className="inline-block px-6 py-3 rounded-full text-sm font-semibold mb-4 transition-all duration-500"
                style={{ 
                  backgroundColor: `${currentTool.color}20`,
                  color: currentTool.color,
                  border: `1px solid ${currentTool.color}40`
                }}
              >
                {currentTool.category}
              </div>
              
              <h3 
                className="text-3xl font-bold text-white mb-4 transition-all duration-500"
                style={{
                  opacity: animationPhase === 'fading' ? 0.3 : 1,
                  transform: animationPhase === 'highlight' ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {currentTool.name}
              </h3>
              
              <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                {currentTool.description}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Integration</h4>
                  <p className="text-white">{currentTool.integration}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Benefit</h4>
                  <p className="text-white">{currentTool.benefit}</p>
                </div>
              </div>
            </div>

            {/* Tool grid visualization */}
            <div className="relative overflow-hidden">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3 max-w-4xl mx-auto">
                {tools.map((tool, index) => (
                  <div
                    key={tool.id}
                    className="relative aspect-square rounded-lg border transition-all duration-500 flex items-center justify-center"
                    style={{
                      backgroundColor: index === currentIndex ? `${tool.color}20` : 'rgba(255,255,255,0.05)',
                      borderColor: index === currentIndex ? `${tool.color}60` : 'rgba(255,255,255,0.1)',
                      transform: index === currentIndex && animationPhase === 'highlight' ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: index === currentIndex ? `0 0 20px ${tool.color}40` : 'none'
                    }}
                  >
                    <div className="text-center">
                      <div 
                        className="w-2 h-2 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: tool.color }}
                      />
                      <div className="text-xs text-gray-400 font-mono">
                        {tool.id.toString().padStart(2, '0')}
                      </div>
                    </div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      {tool.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {tools.map((_, index) => (
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
