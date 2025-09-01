"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
  ProcessFlag, 
  SafeMetric, 
  CompanyProfile, 
  ProcessQuestion, 
  MatchedUseCase, 
  RoadmapItem,
  ROICalculation,
  RecommendedTool 
} from '@/lib/types'
import { AIClient } from '@/lib/ai-client'
import { 
  formatCurrency, 
  formatPercentage, 
  getPriorityColor, 
  getROIBadgeColor,
  formatTimelineBadge,
  getEffortDisplay,
  getImpactDisplay,
  loadSolutions,
  loadTools
} from '@/lib/utils'
import { 
  ArrowTrendingUpIcon as TrendingUp,
  ClockIcon as Clock,
  CurrencyDollarIcon as DollarSign,
  FlagIcon as Target,
  CheckCircleIcon as CheckCircle,
  ExclamationTriangleIcon as AlertTriangle,
  ArrowRightIcon as ArrowRight,
  ArrowDownTrayIcon as Download,
  CalendarIcon as Calendar,
  UsersIcon as Users,
  ChartBarIcon as BarChart3,
  BoltIcon as Zap
} from '@heroicons/react/24/outline'
import RecommendedToolsDisplay from '@/components/RecommendedToolsDisplay'

interface RoadmapGeneratorProps {
  processFlags: ProcessFlag[]
  safeMetrics: SafeMetric[]
  companyProfile: CompanyProfile
  answers: ProcessQuestion[]
}

export default function RoadmapGenerator({
  processFlags,
  safeMetrics,
  companyProfile,
  answers
}: RoadmapGeneratorProps) {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([])
  const [matchedUseCases, setMatchedUseCases] = useState<MatchedUseCase[]>([])
  const [recommendedTools, setRecommendedTools] = useState<RecommendedTool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'priority' | 'roi'>('timeline')

  useEffect(() => {
    const generateAIRoadmap = async () => {
      try {
        console.log('🚀 Starting AI-powered roadmap generation...')
        
        const [solutions, tools] = await Promise.all([
          loadSolutions(),
          loadTools()
        ])
        
        // Initialize AI Client (server-side API calls)
        const aiClient = new AIClient(solutions, tools)
        await aiClient.initialize()
        
        // Get custom problem text
        const customProblem = answers.find(a => a.category === 'custom')?.answer as string
        
        // Process user request with Claude Sonnet 4 via API
        const aiResults = await aiClient.processUserRequest(
          answers,
          customProblem,
          companyProfile
        )
        
        console.log('✅ AI analysis complete:', aiResults)
        console.log('📊 Matched solutions:', aiResults.matchedSolutions.length)
        console.log('🗺️ Roadmap items:', aiResults.roadmap.length)
        console.log('🔧 Recommended tools:', aiResults.recommendedTools?.length || 0)
        
        setMatchedUseCases(aiResults.matchedSolutions)
        setRoadmap(aiResults.roadmap)
        setRecommendedTools(aiResults.recommendedTools || [])
        
      } catch (error) {
        console.error('❌ AI roadmap generation failed:', error)
        
        // Show error message to user
        if (error.message.includes('API_KEY')) {
          alert('⚠️ API Keys Required!\n\nCreate a .env.local file with:\nANTHROPIC_API_KEY=your_key\nOPENAI_API_KEY=your_key')
        }
        
      } finally {
        setIsLoading(false)
      }
    }

    generateAIRoadmap()
  }, [processFlags, safeMetrics, companyProfile, answers])

  const totalSavings = roadmap.reduce((sum, item) => {
    // Handle both old and new ROI structure
    const savings = item.roi_calculation?.net_roi?.total_savings || item.roi?.annual_savings || 0
    return sum + savings
  }, 0)
  
  const totalInvestment = roadmap.reduce((sum, item) => {
    // Handle both old and new ROI structure  
    const investment = item.roi_calculation?.implementation_cost?.total_year_one || item.roi?.implementation_cost || 0
    return sum + investment
  }, 0)
  
  const avgROI = roadmap.length > 0 ? roadmap.reduce((sum, item) => {
    // Handle both old and new ROI structure
    const roi = item.roi_calculation?.net_roi?.roi_percentage || (item.roi?.annual_savings / item.roi?.implementation_cost * 100) || 0
    return sum + roi
  }, 0) / roadmap.length : 0

  const quickWins = roadmap.filter(item => item.priority === 'quick_win')
  const highPriority = roadmap.filter(item => item.priority === 'high')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted">Generating your AI roadmap...</p>
          <p className="text-xs text-muted mt-2">This may take 30-60 seconds...</p>
        </div>
      </div>
    )
  }

  if (roadmap.length === 0) {
    return (
      <section className="relative bg-bg py-section min-h-screen">
        <div className="container mx-auto px-layout max-w-4xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-elevation1">
                <AlertTriangle className="w-10 h-10 text-danger" />
              </div>
              <h2 className="text-2xl font-bold text-text mb-4">No Roadmap Generated</h2>
              <p className="text-lg text-muted mb-4">The AI analysis didn't produce any recommendations.</p>
              <p className="text-sm text-muted">Please check the browser console for error details.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative bg-bg py-section min-h-screen">
      <div className="container mx-auto px-layout max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Your AI Automation Roadmap
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Prioritized recommendations based on your business processes and potential ROI
          </p>
        </motion.div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Annual Savings</p>
                  <p className="text-2xl font-bold text-accent2">{formatCurrency(totalSavings)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Investment Required</p>
                  <p className="text-2xl font-bold text-text">{formatCurrency(totalInvestment)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Average ROI</p>
                  <p className="text-2xl font-bold text-accent">{formatPercentage(avgROI)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Quick Wins</p>
                  <p className="text-2xl font-bold text-accent2">{quickWins.length}</p>
                </div>
                <Zap className="w-8 h-8 text-accent2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Tools Section */}
        {recommendedTools.length > 0 && (
          <div className="mb-12">
            <RecommendedToolsDisplay 
              tools={recommendedTools}
              title="🎯 Personalized Tool Recommendations" 
              subtitle="AI-selected tools based on your workflow analysis and company profile"
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Roadmap */}
          <div className="lg:col-span-2">
            {/* View Mode Selector */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={viewMode === 'timeline' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('timeline')}
                size="sm"
              >
                Timeline View
              </Button>
              <Button
                variant={viewMode === 'priority' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('priority')}
                size="sm"
              >
                Priority View
              </Button>
              <Button
                variant={viewMode === 'roi' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('roi')}
                size="sm"
              >
                ROI View
              </Button>
            </div>

            {/* Roadmap Items */}
            <div className="space-y-4">
              {viewMode === 'timeline' && <TimelineView roadmap={roadmap} onSelectItem={setSelectedItem} />}
              {viewMode === 'priority' && <PriorityView roadmap={roadmap} onSelectItem={setSelectedItem} />}
              {viewMode === 'roi' && <ROIView roadmap={roadmap} onSelectItem={setSelectedItem} />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Strategy Call
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Share with Team
                  </Button>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickWins.length > 0 && (
                    <div className="p-3 bg-accent2/10 border border-accent2/20 rounded-lg">
                      <h4 className="font-medium text-accent2 mb-1">Start with Quick Wins</h4>
                      <p className="text-sm text-muted">
                        {quickWins.length} opportunities can deliver results in 30 days
                      </p>
                    </div>
                  )}
                  
                  {highPriority.length > 0 && (
                    <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                      <h4 className="font-medium text-accent mb-1">High-Impact Projects</h4>
                      <p className="text-sm text-muted">
                        {highPriority.length} high-priority initiatives identified
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-border/10 border border-border rounded-lg">
                    <h4 className="font-medium text-text mb-1">Budget Planning</h4>
                    <p className="text-sm text-muted">
                      ROI positive in {Math.round(totalInvestment / (totalSavings / 12))} months
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Item Detail */}
              {selectedItem && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedItem.title}</CardTitle>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(selectedItem.priority)}`}>
                        {selectedItem.priority.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded border ${formatTimelineBadge(selectedItem.timeline).color}`}>
                        {formatTimelineBadge(selectedItem.timeline).label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted">{selectedItem.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Annual Savings:</span>
                        <span className="font-medium text-accent2">
                          {formatCurrency(selectedItem.roi_calculation?.net_roi?.total_savings || selectedItem.roi?.annual_savings || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Implementation:</span>
                        <span className="font-medium text-text">
                          {formatCurrency(selectedItem.roi_calculation?.implementation_cost?.total_year_one || selectedItem.roi?.implementation_cost || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">ROI:</span>
                        <span className="font-medium text-accent">
                          {formatPercentage(selectedItem.roi_calculation?.net_roi?.roi_percentage || (selectedItem.roi?.annual_savings / selectedItem.roi?.implementation_cost * 100) || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-text">Key Metrics</h5>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getImpactDisplay(selectedItem.impact).color}`}>
                            {selectedItem.impact}
                          </div>
                          <div className="text-muted">Impact</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getEffortDisplay(selectedItem.effort).color}`}>
                            {selectedItem.effort}
                          </div>
                          <div className="text-muted">Effort</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-400">
                            {selectedItem.risk}
                          </div>
                          <div className="text-muted">Risk</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-text">Owner</h5>
                      <p className="text-sm text-muted">{selectedItem.owner}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-text">Success KPIs</h5>
                      <ul className="text-sm text-muted space-y-1">
                        {selectedItem.kpis.map((kpi, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-accent2" />
                            {kpi}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setSelectedItem(null)}>
                      View Implementation Details
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TimelineView({ 
  roadmap, 
  onSelectItem 
}: { 
  roadmap: RoadmapItem[]
  onSelectItem: (item: RoadmapItem) => void 
}) {
  const timelineGroups = {
    '30_days': roadmap.filter(item => item.timeline === '30_days'),
    '60_days': roadmap.filter(item => item.timeline === '60_days'),
    '90_days': roadmap.filter(item => item.timeline === '90_days'),
    'future': roadmap.filter(item => item.timeline === 'future')
  }

  return (
    <div className="space-y-8">
      {Object.entries(timelineGroups).map(([timeline, items]) => {
        if (items.length === 0) return null
        
        const timelineBadge = formatTimelineBadge(timeline)
        
        return (
          <div key={timeline}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-lg border text-sm font-medium ${timelineBadge.color}`}>
                {timelineBadge.label}
              </span>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted">{items.length} items</span>
            </div>
            
            <div className="grid gap-4">
              {items.map((item) => (
                <RoadmapCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PriorityView({ 
  roadmap, 
  onSelectItem 
}: { 
  roadmap: RoadmapItem[]
  onSelectItem: (item: RoadmapItem) => void 
}) {
  const priorityGroups = {
    'quick_win': roadmap.filter(item => item.priority === 'quick_win'),
    'high': roadmap.filter(item => item.priority === 'high'),
    'medium': roadmap.filter(item => item.priority === 'medium'),
    'low': roadmap.filter(item => item.priority === 'low')
  }

  const priorityLabels: Record<string, string> = {
    'quick_win': 'Quick Wins',
    'high': 'High Priority',
    'medium': 'Medium Priority',
    'low': 'Low Priority'
  }

  return (
    <div className="space-y-8">
      {Object.entries(priorityGroups).map(([priority, items]) => {
        if (items.length === 0) return null
        
        return (
          <div key={priority}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-lg border text-sm font-medium ${getPriorityColor(priority)}`}>
                {priorityLabels[priority]}
              </span>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted">{items.length} items</span>
            </div>
            
            <div className="grid gap-4">
              {items.map((item) => (
                <RoadmapCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ROIView({ 
  roadmap, 
  onSelectItem 
}: { 
  roadmap: RoadmapItem[]
  onSelectItem: (item: RoadmapItem) => void 
}) {
  const sortedByROI = [...roadmap].sort((a, b) => 
    b.roi_calculation.net_roi.roi_percentage - a.roi_calculation.net_roi.roi_percentage
  )

  return (
    <div className="space-y-4">
      {sortedByROI.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <RoadmapCard item={item} onClick={() => onSelectItem(item)} showROI />
        </motion.div>
      ))}
    </div>
  )
}

function RoadmapCard({ 
  item, 
  onClick, 
  showROI = false 
}: { 
  item: RoadmapItem
  onClick: () => void
  showROI?: boolean 
}) {
  // Handle both old and new ROI structure
  const roi = item.roi_calculation || item.roi
  const annualSavings = roi?.net_roi?.total_savings || roi?.annual_savings || 0
  const implementationCost = roi?.implementation_cost?.total_year_one || roi?.implementation_cost || 0
  const roiPercentage = roi?.net_roi?.roi_percentage || (annualSavings / implementationCost * 100) || 0
  const paybackMonths = roi?.net_roi?.payback_months || roi?.payback_months || Math.round(implementationCost / (annualSavings / 12)) || 0
  
  return (
    <Card interactive onClick={onClick} className="hover:scale-[1.02] transition-transform">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text mb-2">{item.title}</h3>
            <p className="text-sm text-muted mb-3 line-clamp-2">{item.description}</p>
            
            <div className="flex gap-2 mb-3">
              <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(item.priority)}`}>
                {item.priority.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 text-xs rounded border ${formatTimelineBadge(item.timeline).color}`}>
                {formatTimelineBadge(item.timeline).label}
              </span>
              <span className="px-2 py-1 text-xs rounded border border-border text-muted">
                {item.owner}
              </span>
            </div>
          </div>
          
          <div className="text-right ml-4">
            {showROI && (
              <div className="mb-2">
                <span className={`px-2 py-1 text-xs rounded border font-medium ${getROIBadgeColor(roiPercentage)}`}>
                  {formatPercentage(roiPercentage)} ROI
                </span>
              </div>
            )}
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted">Annual Savings</span>
            <p className="font-semibold text-accent2">{formatCurrency(annualSavings)}</p>
          </div>
          <div>
            <span className="text-muted">Investment</span>
            <p className="font-semibold text-text">{formatCurrency(implementationCost)}</p>
          </div>
          <div>
            <span className="text-muted">Payback</span>
            <p className="font-semibold text-accent">{Math.round(paybackMonths)} months</p>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted">Impact:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${
                    level <= item.impact ? 'bg-accent2' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted">Effort:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${
                    level <= item.effort ? 'bg-yellow-400' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}