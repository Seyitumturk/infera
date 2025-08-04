import { Solution, Tool, ProcessFlag, SafeMetric, MatchedUseCase, RoadmapItem, CompanyProfile } from './types'

/**
 * Client-side AI service that calls server-side API routes
 */

interface KnowledgeNode {
  id: string
  type: 'solution' | 'tool'
  content: string
  metadata: Solution | Tool
  embedding: number[]
}

export class AIClient {
  private solutions: Solution[]
  private tools: Tool[]
  private knowledgeNodes: KnowledgeNode[] = []
  private isInitialized = false

  constructor(solutions: Solution[], tools: Tool[]) {
    this.solutions = solutions
    this.tools = tools
  }

  /**
   * Initialize embeddings for solutions and tools
   */
  async initialize(): Promise<void> {
    console.log('🧠 Initializing AI Client...')
    
    try {
      // Prepare texts for embedding
      const solutionTexts = this.solutions.map(solution => 
        `${solution.name}: ${solution.description}. Pain points: ${solution.pain_points.join(', ')}`
      )
      
      const toolTexts = this.tools.map(tool => 
        `${tool.vendor_name} ${tool.product_name}: ${tool.one_liner}. Use cases: ${tool.primary_use_cases.join(', ')}`
      )

      const allTexts = [...solutionTexts, ...toolTexts]

      // Get embeddings from server
      const response = await fetch('/api/ai/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: allTexts })
      })

      if (!response.ok) {
        throw new Error(`Embedding API failed: ${response.statusText}`)
      }

      const { embeddings } = await response.json()

      // Create knowledge nodes
      this.knowledgeNodes = [
        ...this.solutions.map((solution, index) => ({
          id: `solution_${solution.solution_id}`,
          type: 'solution' as const,
          content: solutionTexts[index],
          metadata: solution,
          embedding: embeddings[index]
        })),
        ...this.tools.map((tool, index) => ({
          id: `tool_${tool.vendor_name}_${tool.product_name}`,
          type: 'tool' as const,
          content: toolTexts[index],
          metadata: tool,
          embedding: embeddings[this.solutions.length + index]
        }))
      ]

      this.isInitialized = true
      console.log('✅ AI Client initialized with', this.knowledgeNodes.length, 'knowledge nodes')

    } catch (error) {
      console.error('❌ Failed to initialize AI Client:', error)
      throw error
    }
  }

  /**
   * Analyze user input using Claude
   */
  async analyzeUserInput(
    answers: Array<{category: string, question: string, answer: any}>,
    customProblem?: string,
    companyProfile?: CompanyProfile
  ): Promise<{
    processFlags: ProcessFlag[],
    safeMetrics: SafeMetric[],
    semanticIntent: string,
    problemContext: string,
    aiInsights: string[]
  }> {
    console.log('🔍 Analyzing user input with AI...')

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, customProblem, companyProfile })
      })

      if (!response.ok) {
        throw new Error(`Analysis API failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      console.log('✅ User analysis complete')
      return result

    } catch (error) {
      console.error('❌ User analysis failed:', error)
      throw error
    }
  }

  /**
   * Find similar solutions using vector search
   */
  async findSimilarSolutions(queryText: string, topK: number = 10): Promise<MatchedUseCase[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Get embedding for query
      const response = await fetch('/api/ai/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: [queryText] })
      })

      if (!response.ok) {
        throw new Error(`Embedding API failed: ${response.statusText}`)
      }

      const { embeddings } = await response.json()
      const queryEmbedding = embeddings[0]

      // Calculate similarities with solution nodes
      const solutionNodes = this.knowledgeNodes.filter(n => n.type === 'solution')
      const similarities = solutionNodes.map(node => ({
        node,
        similarity: this.cosineSimilarity(queryEmbedding, node.embedding)
      }))

      // Sort by similarity and take top K
      const topMatches = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK)

      // Convert to MatchedUseCase format
      return topMatches.map(match => ({
        solution_id: (match.node.metadata as Solution).solution_id,
        match_score: match.similarity,
        reasoning: `AI semantic match (${Math.round(match.similarity * 100)}% similarity)`,
        solution: match.node.metadata as Solution,
        recommended_tools: this.getRecommendedTools(match.node.metadata as Solution)
      }))

    } catch (error) {
      console.error('❌ Vector search failed:', error)
      throw error
    }
  }

  /**
   * Generate AI roadmap
   */
  async generateRoadmap(
    userAnalysis: any,
    companyProfile: CompanyProfile,
    matchedSolutions: MatchedUseCase[]
  ): Promise<RoadmapItem[]> {
    console.log('🚀 Generating AI roadmap...')

    try {
      const response = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnalysis, companyProfile, matchedSolutions })
      })

      if (!response.ok) {
        throw new Error(`Roadmap API failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      const roadmapItems: RoadmapItem[] = result.roadmap.map((item: any, index: number) => ({
        id: `roadmap_${index}`,
        title: item.title || matchedSolutions[index]?.solution.name || 'AI Solution',
        description: item.description || matchedSolutions[index]?.solution.description || '',
        priority: item.priority || 'medium',
        impact: item.impact || 3,
        effort: item.effort || 3,
        risk: item.risk || 2,
        timeline: item.timeline || '60_days',
        roi_calculation: this.createROICalculation(item.roi_estimate || {}),
        solution: matchedSolutions[index]?.solution,
        recommended_approach: item.recommended_approach || 'tool',
        next_steps: item.next_steps || ['Evaluate solution', 'Plan implementation'],
        owner: item.owner || 'Operations',
        kpis: item.kpis || ['Efficiency improvement', 'Cost reduction']
      }))

      console.log('✅ AI roadmap generated')
      return roadmapItems

    } catch (error) {
      console.error('❌ Roadmap generation failed:', error)
      throw error
    }
  }

  /**
   * Main processing method
   */
  async processUserRequest(
    answers: Array<{category: string, question: string, answer: any}>,
    customProblem?: string,
    companyProfile?: CompanyProfile
  ): Promise<{
    processFlags: ProcessFlag[],
    safeMetrics: SafeMetric[],
    matchedSolutions: MatchedUseCase[],
    roadmap: RoadmapItem[],
    aiInsights: string[],
    recommendedTools: any[]
  }> {
    try {
      // Step 1: AI analysis (now includes recommended tools)
      const userAnalysis = await this.analyzeUserInput(answers, customProblem, companyProfile)

      // Step 2: Vector similarity search
      const queryText = `${userAnalysis.semanticIntent} ${userAnalysis.problemContext} ${customProblem || ''}`
      const matchedSolutions = await this.findSimilarSolutions(queryText, 8)

      // Step 3: Generate roadmap
      const roadmap = await this.generateRoadmap(userAnalysis, companyProfile!, matchedSolutions)

      return {
        processFlags: userAnalysis.processFlags,
        safeMetrics: userAnalysis.safeMetrics,
        matchedSolutions,
        roadmap,
        aiInsights: userAnalysis.aiInsights,
        recommendedTools: (userAnalysis as any).recommendedTools || []
      }

    } catch (error) {
      console.error('❌ AI processing failed:', error)
      throw error
    }
  }

  /**
   * Cosine similarity calculation
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  }

  /**
   * Get recommended tools for a solution
   */
  private getRecommendedTools(solution: Solution): Tool[] {
    const toolNodes = this.knowledgeNodes.filter(n => n.type === 'tool')
    const recommended: Tool[] = []

    for (const toolName of solution.tools_used) {
      const matching = toolNodes.find(n => 
        n.content.toLowerCase().includes(toolName.toLowerCase())
      )
      if (matching) {
        recommended.push(matching.metadata as Tool)
      }
    }

    return recommended.slice(0, 3)
  }

  /**
   * Create ROI calculation from estimate
   */
  private createROICalculation(estimate: any): any {
    const annualSavings = estimate.annual_savings || 50000
    const implementationCost = estimate.implementation_cost || 10000
    const paybackMonths = estimate.payback_months || 6

    return {
      labor_savings: {
        items_per_month: 100,
        minutes_per_item: 15,
        automation_percentage: 0.7,
        loaded_cost_per_hour: 50,
        annual_savings: annualSavings
      },
      error_reduction: {
        current_error_cost: 2000,
        reduction_percentage: 50,
        annual_savings: 1000
      },
      implementation_cost: {
        tool_cost_annual: implementationCost * 0.8,
        setup_cost: implementationCost * 0.2,
        ongoing_cost: implementationCost * 0.8,
        total_year_one: implementationCost
      },
      net_roi: {
        total_savings: annualSavings,
        total_cost: implementationCost,
        net_benefit: annualSavings - implementationCost,
        roi_percentage: ((annualSavings - implementationCost) / implementationCost) * 100,
        payback_months: paybackMonths
      }
    }
  }
}