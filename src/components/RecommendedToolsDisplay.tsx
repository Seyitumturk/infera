'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { RecommendedTool } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
  CursorArrowRaysIcon as Sparkles,
  GlobeAltIcon as Globe,
  CurrencyDollarIcon as DollarSign,
  ClockIcon as Clock,
  CheckCircleIcon as Check,
  ArrowTopRightOnSquareIcon as ExternalLink
} from '@heroicons/react/24/outline'

interface RecommendedToolsDisplayProps {
  tools: RecommendedTool[]
  title?: string
  subtitle?: string
  showAll?: boolean
}

export default function RecommendedToolsDisplay({ 
  tools, 
  title = "🎯 Personalized Tool Recommendations",
  subtitle = "AI-selected tools based on your specific workflow and company profile",
  showAll = false 
}: RecommendedToolsDisplayProps) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null)
  const [showAllTools, setShowAllTools] = useState(showAll)

  const displayedTools = showAllTools ? tools : tools.slice(0, 4)

  const formatPricing = (pricing: { low: number | null; high: number | null }) => {
    if (!pricing.low && !pricing.high) return 'Contact for pricing'
    if (!pricing.low) return `Up to $${pricing.high}/month`
    if (!pricing.high) return `From $${pricing.low}/month`
    return `$${pricing.low}-${pricing.high}/month`
  }

  const formatTimeToValue = (time: { low: number; high: number }) => {
    if (time.low === time.high) return `${time.low} weeks`
    return `${time.low}-${time.high} weeks`
  }

  const getCategoryColor = (useCase: string) => {
    if (useCase.includes('ap_')) return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    if (useCase.includes('cs_')) return 'text-green-400 bg-green-500/20 border-green-500/30'
    if (useCase.includes('sales_')) return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
    if (useCase.includes('it_')) return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    return 'text-accent bg-accent/20 border-accent/30'
  }

  if (tools.length === 0) {
    return (
      <Card glass className="text-center py-12">
        <CardContent>
          <Sparkles className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-text mb-2">No tool recommendations yet</h3>
          <p className="text-muted">Complete the intake process to get personalized tool suggestions</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-text">{title}</h2>
        <p className="text-muted max-w-3xl mx-auto text-lg">{subtitle}</p>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {displayedTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                glass 
                className={`h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-accent/20 ${
                  expandedTool === tool.id ? 'ring-2 ring-accent border-l-accent' : ''
                }`}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <CardTitle className="text-xl font-bold text-text leading-tight">
                        {tool.vendor_name} {tool.product_name}
                      </CardTitle>
                      <CardDescription className="text-base line-clamp-2 leading-relaxed">
                        {tool.one_liner}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(tool.homepage_url, '_blank')}
                      className="ml-2 p-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Use Cases Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tool.primary_use_cases.slice(0, 2).map((useCase) => (
                      <span
                        key={useCase}
                        className={`px-2 py-1 text-xs rounded border ${getCategoryColor(useCase)}`}
                      >
                        {useCase.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                      </span>
                    ))}
                    {tool.primary_use_cases.length > 2 && (
                      <span className="px-2 py-1 text-xs text-muted bg-surface rounded border border-border">
                        +{tool.primary_use_cases.length - 2} more
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-3 bg-surface/50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted font-medium">Pricing</p>
                        <p className="text-sm font-semibold text-text">
                          {formatPricing(tool.pricing_band_usd_per_month)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-surface/50 rounded-lg">
                      <Clock className="w-5 h-5 text-accent2 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted font-medium">Time to Value</p>
                        <p className="text-sm font-semibold text-text">
                          {formatTimeToValue(tool.time_to_value_weeks)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Company Size Fit */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-muted font-medium">Perfect for:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tool.ideal_customer.company_size.map((size) => (
                        <span key={size} className="px-3 py-1.5 text-sm bg-green-500/20 text-green-400 rounded-full border border-green-500/30 font-medium">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Match Reasoning */}
                  <div className="p-4 bg-accent/10 rounded-xl border border-accent/30 space-y-2">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm text-accent font-semibold">Why this fits your needs:</p>
                        <p className="text-sm text-text leading-relaxed">{tool.match_reasoning}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(tool.homepage_url, '_blank')}
                      className="flex-1"
                    >
                      Learn More
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
                    >
                      {expandedTool === tool.id ? 'Less' : 'Details'}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedTool === tool.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-border"
                      >
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-text mb-1">All Use Cases</h4>
                            <div className="flex flex-wrap gap-1">
                              {tool.primary_use_cases.map((useCase) => (
                                <span
                                  key={useCase}
                                  className="px-2 py-1 text-xs bg-surface rounded border border-border text-muted"
                                >
                                  {useCase.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-text mb-1">Target Industries</h4>
                            <div className="flex flex-wrap gap-1">
                              {tool.ideal_customer.verticals.slice(0, 3).map((vertical) => (
                                <span
                                  key={vertical}
                                  className="px-2 py-1 text-xs bg-surface rounded border border-border text-muted"
                                >
                                  {vertical.replace(/_/g, ' ')}
                                </span>
                              ))}
                              {tool.ideal_customer.verticals.length > 3 && (
                                <span className="px-2 py-1 text-xs text-muted">
                                  +{tool.ideal_customer.verticals.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More Button */}
      {tools.length > 4 && !showAllTools && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setShowAllTools(true)}
            className="border border-border hover:border-accent"
          >
            Show {tools.length - 4} More Tools
          </Button>
        </div>
      )}
    </div>
  )
}