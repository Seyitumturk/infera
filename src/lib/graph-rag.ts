import { Solution, Tool, ProcessFlag, SafeMetric, MatchedUseCase, ROICalculation, RoadmapItem } from './types'

/**
 * Core Graph RAG system for matching AI solutions to business problems
 */

export class GraphRAG {
  private solutions: Solution[]
  private tools: Tool[]
  private embeddings: Map<string, number[]> = new Map()

  constructor(solutions: Solution[], tools: Tool[]) {
    this.solutions = solutions
    this.tools = tools
  }

  /**
   * Simple similarity calculation using keyword matching and semantic overlap
   * In production, this would use actual vector embeddings
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = this.tokenize(text1)
    const words2 = this.tokenize(text2)
    
    const intersection = words1.filter(word => words2.includes(word))
    const union = [...new Set([...words1, ...words2])]
    
    return intersection.length / union.length
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
  }

  /**
   * Extract process flags from user responses
   */
  extractProcessFlags(answers: Array<{category: string, question: string, answer: any}>): ProcessFlag[] {
    const flags: ProcessFlag[] = []
    
    console.log('🏷️ Extracting process flags from answers:', answers)
    
    answers.forEach((answer, index) => {
      // Boolean answers (Yes responses)
      if (typeof answer.answer === 'boolean' && answer.answer) {
        flags.push({
          id: `flag_${index}`,
          label: this.answerToFlag(answer.question, answer.answer),
          category: answer.category,
          confidence: 0.9,
          editable: true
        })
      } 
      // String answers that indicate manual processes
      else if (typeof answer.answer === 'string') {
        const answerLower = answer.answer.toLowerCase()
        if (answerLower.includes('manual') || answerLower.includes('by hand') || 
            answerLower.includes('spreadsheet') || answerLower.includes('excel') ||
            answerLower.includes('email') || answerLower.includes('paper')) {
          flags.push({
            id: `flag_manual_${index}`,
            label: `Manual ${answer.category.toLowerCase()} process`,
            category: answer.category,
            confidence: 0.8,
            editable: true
          })
        }
      }
      // Multiple choice answers that suggest automation opportunities
      else if (Array.isArray(answer.answer) && answer.answer.length > 0) {
        answer.answer.forEach((choice: string, choiceIndex: number) => {
          if (choice.toLowerCase().includes('manual') || choice.toLowerCase().includes('repetitive')) {
            flags.push({
              id: `flag_choice_${index}_${choiceIndex}`,
              label: this.answerToFlag(answer.question, choice),
              category: answer.category,
              confidence: 0.7,
              editable: true
            })
          }
        })
      }
    })

    console.log('🏷️ Extracted flags:', flags)
    return flags
  }

  private answerToFlag(question: string, answer: any): string {
    if (question.includes('invoice')) return 'Manual invoice processing'
    if (question.includes('email')) return 'Manual email handling'
    if (question.includes('support')) return 'Manual customer support'
    if (question.includes('data entry')) return 'Manual data entry'
    if (question.includes('approval')) return 'Manual approval process'
    if (question.includes('document')) return 'Manual document processing'
    return 'Manual process identified'
  }

  /**
   * Extract safe metrics from user responses
   */
  extractSafeMetrics(answers: Array<{category: string, question: string, answer: any, metrics?: Record<string, any>}>): SafeMetric[] {
    const metrics: SafeMetric[] = []
    
    answers.forEach((answer, index) => {
      if (answer.metrics) {
        Object.entries(answer.metrics).forEach(([key, value]) => {
          if (typeof value === 'number') {
            metrics.push({
              id: `metric_${index}_${key}`,
              label: this.metricKeyToLabel(key),
              value: this.formatMetricValue(value, key),
              unit: this.getMetricUnit(key),
              editable: true
            })
          }
        })
      }
    })

    return metrics
  }

  private metricKeyToLabel(key: string): string {
    const labels: Record<string, string> = {
      'volume_per_month': 'Volume per month',
      'handling_time_minutes': 'Average handling time',
      'error_rate_percent': 'Error rate',
      'hourly_cost': 'Loaded hourly cost',
      'team_size': 'Team size'
    }
    return labels[key] || key.replace(/_/g, ' ')
  }

  private formatMetricValue(value: number, key: string): string {
    if (key.includes('percent')) return `${value}%`
    if (key.includes('cost')) return `$${value}`
    if (key.includes('time') && key.includes('minutes')) return `${value} min`
    return value.toString()
  }

  private getMetricUnit(key: string): string | undefined {
    if (key.includes('percent')) return '%'
    if (key.includes('cost')) return '$'
    if (key.includes('minutes')) return 'min'
    if (key.includes('hours')) return 'hrs'
    return undefined
  }

  /**
   * Match solutions to identified process flags and problems
   */
  async matchSolutions(
    processFlags: ProcessFlag[], 
    customProblem?: string,
    industry?: string
  ): Promise<MatchedUseCase[]> {
    const matches: MatchedUseCase[] = []
    const searchTerms = this.buildSearchTerms(processFlags, customProblem)
    
    console.log('🔍 Graph RAG Debug:')
    console.log('- Process flags:', processFlags.length, processFlags)
    console.log('- Search terms:', searchTerms)
    console.log('- Custom problem:', customProblem)
    console.log('- Industry:', industry)
    console.log('- Total solutions to check:', this.solutions.length)

    for (const solution of this.solutions) {
      const score = this.calculateSolutionScore(solution, searchTerms, industry)
      
      // More permissive threshold + fallback matching
      if (score > 0.1 || processFlags.length === 0) { 
        const recommendedTools = this.findRecommendedTools(solution)
        
        matches.push({
          solution_id: solution.solution_id,
          match_score: score,
          reasoning: this.generateReasoning(solution, processFlags, score),
          solution,
          recommended_tools: recommendedTools
        })
      }
    }
    
    // If no matches found, include top 5 solutions as fallback
    if (matches.length === 0) {
      console.warn('No matches found, using fallback solutions')
      const fallbackSolutions = this.solutions.slice(0, 5)
      for (const solution of fallbackSolutions) {
        const recommendedTools = this.findRecommendedTools(solution)
        matches.push({
          solution_id: solution.solution_id,
          match_score: 0.5, // Default score
          reasoning: `General AI automation opportunity in ${solution.category.replace(/_/g, ' ')}`,
          solution,
          recommended_tools: recommendedTools
        })
      }
    }

    console.log(`✅ Found ${matches.length} matches`)
    return matches.sort((a, b) => b.match_score - a.match_score).slice(0, 10)
  }

  private buildSearchTerms(processFlags: ProcessFlag[], customProblem?: string): string[] {
    const terms = processFlags.map(flag => flag.label.toLowerCase())
    if (customProblem) {
      terms.push(...this.tokenize(customProblem))
    }
    return terms
  }

  private calculateSolutionScore(solution: Solution, searchTerms: string[], industry?: string): number {
    let score = 0

    // Match against pain points
    const painPointText = solution.pain_points.join(' ').toLowerCase()
    const painPointScore = searchTerms.reduce((acc, term) => {
      return acc + (painPointText.includes(term) ? 0.3 : 0)
    }, 0)

    // Match against description
    const descriptionScore = this.calculateSimilarity(
      solution.description,
      searchTerms.join(' ')
    ) * 0.4

    // Match against category keywords
    const categoryScore = searchTerms.reduce((acc, term) => {
      return acc + (solution.category.toLowerCase().includes(term) ? 0.2 : 0)
    }, 0)

    // Industry relevance boost
    let industryScore = 0
    if (industry && solution.real_example.client_industry.toLowerCase().includes(industry.toLowerCase())) {
      industryScore = 0.1
    }

    score = painPointScore + descriptionScore + categoryScore + industryScore
    return Math.min(score, 1) // Cap at 1.0
  }

  private generateReasoning(solution: Solution, processFlags: ProcessFlag[], score: number): string {
    const relevantFlags = processFlags.filter(flag => 
      solution.pain_points.some(pain => 
        pain.toLowerCase().includes(flag.label.toLowerCase().split(' ')[0])
      )
    )

    if (relevantFlags.length > 0) {
      return `Addresses ${relevantFlags.length} identified process issues: ${relevantFlags.map(f => f.label).join(', ')}. ${solution.real_example.specific_outcome}`
    }

    return `Strong semantic match (${Math.round(score * 100)}% relevance) based on problem characteristics. ${solution.real_example.specific_outcome}`
  }

  private findRecommendedTools(solution: Solution): Tool[] {
    const recommendedTools: Tool[] = []

    // Find tools that match the solution's tools_used
    for (const toolName of solution.tools_used) {
      const matchingTools = this.tools.filter(tool => 
        tool.product_name.toLowerCase().includes(toolName.toLowerCase()) ||
        tool.vendor_name.toLowerCase().includes(toolName.toLowerCase()) ||
        toolName.toLowerCase().includes(tool.vendor_name.toLowerCase())
      )
      recommendedTools.push(...matchingTools)
    }

    // Find tools by use case matching
    const useCase = this.mapCategoryToUseCase(solution.category)
    if (useCase) {
      const useCaseTools = this.tools.filter(tool =>
        tool.primary_use_cases.includes(useCase)
      )
      recommendedTools.push(...useCaseTools.slice(0, 3))
    }

    // Remove duplicates and return top 5
    const unique = recommendedTools.filter((tool, index, self) => 
      index === self.findIndex(t => t.vendor_name === tool.vendor_name && t.product_name === tool.product_name)
    )

    return unique.slice(0, 5)
  }

  private mapCategoryToUseCase(category: string): string | null {
    const mapping: Record<string, string> = {
      'content_creation_automation': 'content_generation',
      'customer_service_support': 'cs_tier1_deflection',
      'sales_process_automation': 'sales_lead_routing',
      'marketing_workflow_automation': 'marketing_automation',
      'document_processing': 'ap_invoice_capture',
      'project_management_enhancement': 'pm_automation',
      'email_communication_automation': 'email_automation',
      'lead_qualification_scoring': 'sales_lead_routing',
      'competitive_intelligence': 'market_intelligence'
    }
    return mapping[category] || null
  }

  /**
   * Calculate ROI for a matched solution
   */
  calculateROI(
    solution: Solution,
    metrics: SafeMetric[],
    companySize: string = 'smb'
  ): ROICalculation {
    // Extract relevant metrics or use defaults
    const volumePerMonth = this.getMetricValue(metrics, 'volume_per_month') || this.getDefaultVolume(solution.category, companySize)
    const handlingTimeMinutes = this.getMetricValue(metrics, 'handling_time_minutes') || this.getDefaultHandlingTime(solution.category)
    const hourlyRate = this.getMetricValue(metrics, 'hourly_cost') || this.getDefaultHourlyRate(companySize)
    const errorRate = this.getMetricValue(metrics, 'error_rate_percent') || 5

    // Calculate automation percentage based on solution complexity
    const automationPercentage = this.estimateAutomationPercentage(solution.implementation.technical_complexity)

    // Labor savings calculation
    const monthlyHours = (volumePerMonth * handlingTimeMinutes) / 60
    const monthlySavings = monthlyHours * automationPercentage * hourlyRate
    const annualLaborSavings = monthlySavings * 12

    // Error reduction savings
    const currentErrorCost = volumePerMonth * 12 * 0.1 * hourlyRate // Assume 10% of items cause errors
    const errorReductionSavings = currentErrorCost * 0.7 // 70% error reduction

    // Implementation costs
    const setupCost = solution.implementation.setup_cost_usd.low || 0
    const monthlyCost = solution.implementation.monthly_cost_usd.low || 0
    const annualToolCost = monthlyCost * 12

    const totalSavings = annualLaborSavings + errorReductionSavings
    const totalCost = setupCost + annualToolCost
    const netBenefit = totalSavings - totalCost
    const roiPercentage = totalCost > 0 ? (netBenefit / totalCost) * 100 : 0
    const paybackMonths = totalCost > 0 ? (totalCost / (totalSavings / 12)) : 0

    return {
      labor_savings: {
        items_per_month: volumePerMonth,
        minutes_per_item: handlingTimeMinutes,
        automation_percentage: automationPercentage,
        loaded_cost_per_hour: hourlyRate,
        annual_savings: annualLaborSavings
      },
      error_reduction: {
        current_error_cost: currentErrorCost,
        reduction_percentage: 70,
        annual_savings: errorReductionSavings
      },
      implementation_cost: {
        tool_cost_annual: annualToolCost,
        setup_cost: setupCost,
        ongoing_cost: annualToolCost,
        total_year_one: setupCost + annualToolCost
      },
      net_roi: {
        total_savings: totalSavings,
        total_cost: totalCost,
        net_benefit: netBenefit,
        roi_percentage: roiPercentage,
        payback_months: paybackMonths
      }
    }
  }

  private getMetricValue(metrics: SafeMetric[], key: string): number | null {
    const metric = metrics.find(m => m.id.includes(key))
    if (metric) {
      const numValue = parseFloat(metric.value.replace(/[^0-9.-]/g, ''))
      return isNaN(numValue) ? null : numValue
    }
    return null
  }

  private getDefaultVolume(category: string, companySize: string): number {
    const baseVolumes: Record<string, number> = {
      'document_processing': 200,
      'customer_service_support': 150,
      'sales_process_automation': 100,
      'email_communication_automation': 500,
      'content_creation_automation': 20
    }

    const sizeMultipliers: Record<string, number> = {
      'startup': 0.3,
      'smb': 1,
      'midmarket': 3,
      'enterprise': 10
    }

    return (baseVolumes[category] || 100) * (sizeMultipliers[companySize] || 1)
  }

  private getDefaultHandlingTime(category: string): number {
    const handlingTimes: Record<string, number> = {
      'document_processing': 15,
      'customer_service_support': 8,
      'sales_process_automation': 30,
      'email_communication_automation': 3,
      'content_creation_automation': 120
    }
    return handlingTimes[category] || 15
  }

  private getDefaultHourlyRate(companySize: string): number {
    const rates: Record<string, number> = {
      'startup': 45,
      'smb': 55,
      'midmarket': 75,
      'enterprise': 95
    }
    return rates[companySize] || 55
  }

  private estimateAutomationPercentage(complexity: string): number {
    switch (complexity) {
      case 'low': return 0.8
      case 'medium': return 0.6
      case 'high': return 0.4
      default: return 0.6
    }
  }

  /**
   * Generate prioritized roadmap from matched solutions
   */
  generateRoadmap(
    matchedUseCases: MatchedUseCase[],
    metrics: SafeMetric[],
    companySize: string = 'smb'
  ): RoadmapItem[] {
    const roadmapItems: RoadmapItem[] = []

    matchedUseCases.forEach((useCase, index) => {
      const roiCalc = this.calculateROI(useCase.solution, metrics, companySize)
      const priority = this.calculatePriority(useCase, roiCalc)
      const timeline = this.estimateTimeline(useCase.solution, priority)

      roadmapItems.push({
        id: `roadmap_${index}`,
        title: useCase.solution.name,
        description: useCase.solution.description,
        priority,
        impact: this.scoreImpact(roiCalc),
        effort: this.scoreEffort(useCase.solution),
        risk: this.scoreRisk(useCase.solution),
        timeline,
        roi_calculation: roiCalc,
        solution: useCase.solution,
        recommended_approach: this.recommendApproach(useCase.solution, roiCalc),
        next_steps: this.generateNextSteps(useCase.solution),
        owner: this.suggestOwner(useCase.solution.category),
        kpis: this.suggestKPIs(useCase.solution.category)
      })
    })

    return this.prioritizeRoadmap(roadmapItems)
  }

  private calculatePriority(useCase: MatchedUseCase, roi: ROICalculation): 'quick_win' | 'high' | 'medium' | 'low' {
    const score = useCase.match_score
    const roiScore = roi.net_roi.roi_percentage / 100
    const paybackScore = roi.net_roi.payback_months < 6 ? 1 : 0.5

    const totalScore = (score + roiScore + paybackScore) / 3

    if (totalScore > 0.8 && roi.net_roi.payback_months < 3) return 'quick_win'
    if (totalScore > 0.6) return 'high'
    if (totalScore > 0.4) return 'medium'
    return 'low'
  }

  private estimateTimeline(solution: Solution, priority: string): '30_days' | '60_days' | '90_days' | 'future' {
    const complexity = solution.implementation.technical_complexity
    const weeks = solution.implementation.timeline_weeks.max

    if (priority === 'quick_win') return '30_days'
    if (weeks <= 4 && complexity === 'low') return '30_days'
    if (weeks <= 8 && complexity !== 'high') return '60_days'
    if (weeks <= 12) return '90_days'
    return 'future'
  }

  private scoreImpact(roi: ROICalculation): 1 | 2 | 3 | 4 | 5 {
    const annualSavings = roi.net_roi.total_savings
    if (annualSavings > 200000) return 5
    if (annualSavings > 100000) return 4
    if (annualSavings > 50000) return 3
    if (annualSavings > 20000) return 2
    return 1
  }

  private scoreEffort(solution: Solution): 1 | 2 | 3 | 4 | 5 {
    const hours = solution.implementation.team_hours_required
    const complexity = solution.implementation.technical_complexity

    let score = 1
    if (hours > 100) score += 2
    else if (hours > 50) score += 1

    if (complexity === 'high') score += 2
    else if (complexity === 'medium') score += 1

    return Math.min(score, 5) as 1 | 2 | 3 | 4 | 5
  }

  private scoreRisk(solution: Solution): 1 | 2 | 3 | 4 | 5 {
    const complexity = solution.implementation.technical_complexity
    const timeline = solution.implementation.timeline_weeks.max

    let risk = 1
    if (complexity === 'high') risk += 2
    else if (complexity === 'medium') risk += 1

    if (timeline > 12) risk += 2
    else if (timeline > 6) risk += 1

    return Math.min(risk, 5) as 1 | 2 | 3 | 4 | 5
  }

  private recommendApproach(solution: Solution, roi: ROICalculation): 'tool' | 'build' | 'hybrid' {
    const complexity = solution.implementation.technical_complexity
    const roiPercentage = roi.net_roi.roi_percentage

    if (complexity === 'low' && roiPercentage > 100) return 'tool'
    if (complexity === 'high' && roiPercentage > 300) return 'build'
    return 'hybrid'
  }

  private generateNextSteps(solution: Solution): string[] {
    const steps = [
      'Stakeholder alignment meeting',
      'Vendor evaluation and selection',
      'Pilot implementation planning'
    ]

    if (solution.implementation.technical_complexity === 'high') {
      steps.push('Technical architecture review', 'Security and compliance assessment')
    }

    steps.push('Go-live planning', 'Success metrics definition')
    return steps
  }

  private suggestOwner(category: string): string {
    const owners: Record<string, string> = {
      'document_processing': 'Finance/Operations',
      'customer_service_support': 'Customer Success',
      'sales_process_automation': 'Sales Operations',
      'marketing_workflow_automation': 'Marketing',
      'email_communication_automation': 'Operations',
      'content_creation_automation': 'Marketing'
    }
    return owners[category] || 'Operations'
  }

  private suggestKPIs(category: string): string[] {
    const kpis: Record<string, string[]> = {
      'document_processing': ['Processing time reduction', 'Error rate decrease', 'Cost per transaction'],
      'customer_service_support': ['First-call resolution', 'Response time', 'Customer satisfaction'],
      'sales_process_automation': ['Lead conversion rate', 'Sales cycle length', 'Pipeline velocity'],
      'marketing_workflow_automation': ['Campaign ROI', 'Lead generation', 'Content output'],
      'email_communication_automation': ['Response time', 'Email volume processed', 'Accuracy rate']
    }
    return kpis[category] || ['Efficiency improvement', 'Cost reduction', 'Time savings']
  }

  private prioritizeRoadmap(items: RoadmapItem[]): RoadmapItem[] {
    return items.sort((a, b) => {
      // Quick wins first
      if (a.priority === 'quick_win' && b.priority !== 'quick_win') return -1
      if (b.priority === 'quick_win' && a.priority !== 'quick_win') return 1

      // Then by impact/effort ratio
      const aRatio = a.impact / a.effort
      const bRatio = b.impact / b.effort
      if (aRatio !== bRatio) return bRatio - aRatio

      // Finally by ROI
      return b.roi_calculation.net_roi.roi_percentage - a.roi_calculation.net_roi.roi_percentage
    })
  }
}