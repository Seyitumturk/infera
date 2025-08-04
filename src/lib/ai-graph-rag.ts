import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { Solution, Tool, ProcessFlag, SafeMetric, MatchedUseCase, ROICalculation, RoadmapItem, CompanyProfile } from './types'

/**
 * REAL AI-Powered Graph RAG System using Claude Sonnet 4 + OpenAI Embeddings
 */

interface KnowledgeNode {
  id: string
  type: 'solution' | 'tool' | 'problem' | 'process'
  content: string
  metadata: Record<string, any>
  embedding: number[]
}

interface KnowledgeEdge {
  from: string
  to: string
  relationship: string
  weight: number
}

export class AIGraphRAG {
  private anthropic: Anthropic
  private openai: OpenAI
  private solutions: Solution[]
  private tools: Tool[]
  private knowledgeGraph: { nodes: KnowledgeNode[], edges: KnowledgeEdge[] } = { nodes: [], edges: [] }
  private isInitialized = false

  constructor(solutions: Solution[], tools: Tool[]) {
    // Check for API keys
    const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY

    if (!anthropicKey) {
      throw new Error('❌ ANTHROPIC_API_KEY is required! Add it to your .env file')
    }
    if (!openaiKey) {
      throw new Error('❌ OPENAI_API_KEY is required! Add it to your .env file')
    }

    this.anthropic = new Anthropic({ 
      apiKey: anthropicKey,
      dangerouslyAllowBrowser: true // For client-side usage
    })
    this.openai = new OpenAI({ 
      apiKey: openaiKey,
      dangerouslyAllowBrowser: true
    })
    this.solutions = solutions
    this.tools = tools
  }

  /**
   * Initialize the knowledge graph with embeddings
   */
  async initialize(): Promise<void> {
    console.log('🧠 Initializing AI Graph RAG...')
    
    try {
      // Create embeddings for all solutions and tools
      await this.buildKnowledgeGraph()
      this.isInitialized = true
      console.log('✅ AI Graph RAG initialized with', this.knowledgeGraph.nodes.length, 'nodes')
    } catch (error) {
      console.error('❌ Failed to initialize AI Graph RAG:', error)
      throw error
    }
  }

  /**
   * Build knowledge graph with vector embeddings
   */
  private async buildKnowledgeGraph(): Promise<void> {
    const nodes: KnowledgeNode[] = []
    const edges: KnowledgeEdge[] = []

    // Process solutions into knowledge nodes
    for (const solution of this.solutions) {
      const content = `${solution.name}: ${solution.description}. Pain points: ${solution.pain_points.join(', ')}`
      const embedding = await this.getEmbedding(content)
      
      nodes.push({
        id: `solution_${solution.solution_id}`,
        type: 'solution',
        content,
        metadata: solution,
        embedding
      })
    }

    // Process tools into knowledge nodes  
    for (const tool of this.tools) {
      const content = `${tool.vendor_name} ${tool.product_name}: ${tool.one_liner}. Use cases: ${tool.primary_use_cases.join(', ')}`
      const embedding = await this.getEmbedding(content)
      
      nodes.push({
        id: `tool_${tool.vendor_name}_${tool.product_name}`,
        type: 'tool', 
        content,
        metadata: tool,
        embedding
      })
    }

    // Create edges between related solutions and tools
    this.createKnowledgeEdges(nodes, edges)

    this.knowledgeGraph = { nodes, edges }
  }

  /**
   * Get vector embedding using OpenAI
   */
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      })
      return response.data[0].embedding
    } catch (error) {
      console.error('Failed to get embedding:', error)
      return Array(1536).fill(0) // Fallback zero vector
    }
  }

  /**
   * Create semantic relationships between knowledge nodes
   */
  private createKnowledgeEdges(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): void {
    // Link solutions to relevant tools based on tools_used
    for (const solutionNode of nodes.filter(n => n.type === 'solution')) {
      const solution = solutionNode.metadata as Solution
      
      for (const toolName of solution.tools_used) {
        const matchingTools = nodes.filter(n => 
          n.type === 'tool' && 
          (n.content.toLowerCase().includes(toolName.toLowerCase()) ||
           toolName.toLowerCase().includes((n.metadata as Tool).vendor_name.toLowerCase()))
        )
        
        for (const toolNode of matchingTools) {
          edges.push({
            from: solutionNode.id,
            to: toolNode.id,
            relationship: 'uses_tool',
            weight: 0.8
          })
        }
      }
    }
  }

  /**
   * Use Claude Sonnet 4 to analyze user input and extract semantic insights
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
    console.log('🔍 Analyzing user input with Claude Sonnet 4 (THE BEAST!)...')

    const prompt = `You are a friendly AI business consultant who understands SMB pain points. The user just shared their daily frustrations in casual, conversational language.

COMPANY CONTEXT:
- Business type: ${companyProfile?.industry || 'Not specified'}
- Team size: ${companyProfile?.size || 'Not specified'} 
- Budget comfort: ${companyProfile?.budget_range || 'Not specified'}

USER'S FRUSTRATIONS & RESPONSES:
${answers.map(a => `${a.category} - ${a.question}: ${JSON.stringify(a.answer)}`).join('\\n')}

ADDITIONAL CONCERNS:
${customProblem || 'None mentioned'}

TRANSLATE THEIR PAIN INTO BUSINESS INSIGHTS:

1. PROCESS FLAGS: Convert their frustrations into specific automation opportunities:
   - "Too many emails" → "Email management automation"
   - "Chasing approvals" → "Approval workflow automation"  
   - "Manual data entry" → "Document processing automation"
   - "Customer support taking forever" → "Customer service automation"
   - "Tracking invoices/payments" → "Accounts payable automation"

2. SAFE METRICS: Estimate time/cost from casual descriptions:
   - "A few hours here and there" → 5 hours/week
   - "About half a day" → 4 hours/week
   - "A full day or more" → 8 hours/week
   - "All we do sometimes" → 20+ hours/week

3. SEMANTIC INTENT: What's really bothering them day-to-day? (use their language)
4. PROBLEM CONTEXT: Their practical business reality and constraints
5. AI INSIGHTS: Actionable automation wins they can implement

Remember: They spoke about daily headaches, not technical workflows. Interpret their emotions and frustrations into concrete automation opportunities.

Return ONLY this JSON (no markdown, no explanations):
{
  "processFlags": [{"id": "string", "label": "string", "category": "string", "confidence": 0.0-1.0, "editable": true}],
  "safeMetrics": [{"id": "string", "label": "string", "value": "string", "unit": "string", "editable": true}],
  "semanticIntent": "string describing their real daily pain",
  "problemContext": "string with practical business context", 
  "aiInsights": ["insight1", "insight2", "insight3"]
}`

    try {
      // Add retry logic for rate limiting
      const response = await this.makeClaudeRequestWithRetry({
        model: 'claude-sonnet-4-20250514', // Claude Sonnet 4 - THE BEAST!
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const result = JSON.parse(response.content[0].text)
      console.log('✅ Claude analysis complete:', result)
      return result

    } catch (error) {
      console.error('❌ Claude analysis failed:', error)
      // Fallback to simple extraction
      return this.fallbackAnalysis(answers, customProblem)
    }
  }

  /**
   * Fallback analysis if Claude fails
   */
  private fallbackAnalysis(
    answers: Array<{category: string, question: string, answer: any}>,
    customProblem?: string
  ) {
    const processFlags: ProcessFlag[] = []
    const safeMetrics: SafeMetric[] = []

    answers.forEach((answer, index) => {
      if (typeof answer.answer === 'boolean' && answer.answer) {
        processFlags.push({
          id: `flag_${index}`,
          label: `Manual ${answer.category} process`,
          category: answer.category,
          confidence: 0.8,
          editable: true
        })
      }
    })

    return {
      processFlags,
      safeMetrics,
      semanticIntent: customProblem || 'Business process automation',
      problemContext: 'SMB looking for AI automation opportunities',
      aiInsights: ['Manual processes identified', 'Automation opportunities available']
    }
  }

  /**
   * Vector similarity search for matching solutions
   */
  async findSimilarSolutions(queryText: string, topK: number = 10): Promise<KnowledgeNode[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const queryEmbedding = await this.getEmbedding(queryText)
    const solutionNodes = this.knowledgeGraph.nodes.filter(n => n.type === 'solution')

    // Calculate cosine similarity
    const similarities = solutionNodes.map(node => ({
      node,
      similarity: this.cosineSimilarity(queryEmbedding, node.embedding)
    }))

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(s => s.node)
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
   * Generate AI-powered roadmap using Claude
   */
  async generateIntelligentRoadmap(
    userAnalysis: any,
    companyProfile: CompanyProfile,
    matchedSolutions: MatchedUseCase[]
  ): Promise<RoadmapItem[]> {
    console.log('🚀 Generating intelligent roadmap with Claude...')

    const prompt = `You are an expert AI implementation consultant. Generate a strategic AI roadmap.

COMPANY PROFILE:
- Industry: ${companyProfile.industry}
- Size: ${companyProfile.size}
- Budget: ${companyProfile.budget}

USER ANALYSIS:
- Core Challenge: ${userAnalysis.semanticIntent}
- Context: ${userAnalysis.problemContext}
- AI Insights: ${userAnalysis.aiInsights.join(', ')}

MATCHED SOLUTIONS (${matchedSolutions.length}):
${matchedSolutions.map((m, i) => `${i+1}. ${m.solution.name}: ${m.solution.description} (Score: ${m.match_score.toFixed(2)})`).join('\\n')}

GENERATE A STRATEGIC ROADMAP:

For each solution, provide:
1. Priority level (quick_win/high/medium/low)
2. Implementation timeline (30_days/60_days/90_days/future)
3. Impact score (1-5)
4. Effort score (1-5) 
5. Risk assessment (1-5)
6. ROI calculation estimates
7. Strategic reasoning
8. Next steps
9. Success metrics

Consider:
- Company size constraints
- Industry-specific factors
- Budget limitations
- Technical complexity
- Change management
- Interdependencies

Return JSON array of roadmap items with detailed analysis.`

    try {
      const response = await this.makeClaudeRequestWithRetry({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const roadmapData = JSON.parse(response.content[0].text)
      console.log('✅ Intelligent roadmap generated')
      return this.formatRoadmapItems(roadmapData, matchedSolutions)

    } catch (error) {
      console.error('❌ Roadmap generation failed:', error)
      return this.fallbackRoadmap(matchedSolutions)
    }
  }

  /**
   * Format roadmap items from Claude response
   */
  private formatRoadmapItems(roadmapData: any[], matchedSolutions: MatchedUseCase[]): RoadmapItem[] {
    return roadmapData.map((item, index) => ({
      id: `roadmap_${index}`,
      title: item.title || matchedSolutions[index]?.solution.name || 'AI Solution',
      description: item.description || matchedSolutions[index]?.solution.description || '',
      priority: item.priority || 'medium',
      impact: item.impact || 3,
      effort: item.effort || 3,
      risk: item.risk || 2,
      timeline: item.timeline || '60_days',
      roi_calculation: item.roi_calculation || this.calculateBasicROI(matchedSolutions[index]?.solution),
      solution: matchedSolutions[index]?.solution,
      recommended_approach: item.recommended_approach || 'tool',
      next_steps: item.next_steps || ['Evaluate solution', 'Plan implementation'],
      owner: item.owner || 'Operations',
      kpis: item.kpis || ['Efficiency improvement', 'Cost reduction']
    }))
  }

  /**
   * Fallback roadmap generation
   */
  private fallbackRoadmap(matchedSolutions: MatchedUseCase[]): RoadmapItem[] {
    return matchedSolutions.slice(0, 5).map((match, index) => ({
      id: `roadmap_${index}`,
      title: match.solution.name,
      description: match.solution.description,
      priority: index === 0 ? 'quick_win' : 'high',
      impact: 4,
      effort: 3,
      risk: 2,
      timeline: '60_days',
      roi_calculation: this.calculateBasicROI(match.solution),
      solution: match.solution,
      recommended_approach: 'tool',
      next_steps: ['Stakeholder meeting', 'Vendor evaluation', 'Pilot implementation'],
      owner: 'Operations',
      kpis: ['Time savings', 'Cost reduction', 'Error reduction']
    }))
  }

  /**
   * Basic ROI calculation
   */
  private calculateBasicROI(solution: Solution): ROICalculation {
    const monthlySavings = 5000
    const setupCost = solution.implementation.setup_cost_usd.low || 1000
    const monthlyCost = solution.implementation.monthly_cost_usd.low || 200

    return {
      labor_savings: {
        items_per_month: 100,
        minutes_per_item: 15,
        automation_percentage: 0.7,
        loaded_cost_per_hour: 50,
        annual_savings: monthlySavings * 12
      },
      error_reduction: {
        current_error_cost: 2000,
        reduction_percentage: 50,
        annual_savings: 1000
      },
      implementation_cost: {
        tool_cost_annual: monthlyCost * 12,
        setup_cost: setupCost,
        ongoing_cost: monthlyCost * 12,
        total_year_one: setupCost + (monthlyCost * 12)
      },
      net_roi: {
        total_savings: (monthlySavings * 12) + 1000,
        total_cost: setupCost + (monthlyCost * 12),
        net_benefit: ((monthlySavings * 12) + 1000) - (setupCost + (monthlyCost * 12)),
        roi_percentage: 200,
        payback_months: 6
      }
    }
  }

  /**
   * Main orchestration method
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
    aiInsights: string[]
  }> {
    try {
      // Step 1: AI analysis of user input
      const userAnalysis = await this.analyzeUserInput(answers, customProblem, companyProfile)

      // Step 2: Vector similarity search for solutions
      const queryText = `${userAnalysis.semanticIntent} ${userAnalysis.problemContext} ${customProblem || ''}`
      const similarNodes = await this.findSimilarSolutions(queryText, 10)

      // Step 3: Create matched solutions
      const matchedSolutions: MatchedUseCase[] = similarNodes.map((node, index) => ({
        solution_id: node.metadata.solution_id,
        match_score: 0.9 - (index * 0.1), // Decreasing scores
        reasoning: `AI semantic match: ${userAnalysis.semanticIntent}`,
        solution: node.metadata as Solution,
        recommended_tools: this.getRecommendedTools(node.metadata as Solution)
      }))

      // Step 4: Generate intelligent roadmap
      const roadmap = await this.generateIntelligentRoadmap(userAnalysis, companyProfile!, matchedSolutions)

      return {
        processFlags: userAnalysis.processFlags,
        safeMetrics: userAnalysis.safeMetrics,
        matchedSolutions,
        roadmap,
        aiInsights: userAnalysis.aiInsights
      }

    } catch (error) {
      console.error('❌ AI processing failed:', error)
      throw error
    }
  }

  /**
   * Make Claude request with retry logic for rate limiting
   */
  private async makeClaudeRequestWithRetry(request: any, maxRetries: number = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.anthropic.messages.create(request)
      } catch (error: any) {
        console.log(`🔄 Claude API attempt ${attempt}/${maxRetries}:`, error.status)
        
        if (error.status === 529 && attempt < maxRetries) {
          // Exponential backoff for overload errors
          const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
          console.log(`⏱️ Retrying in ${delay/1000}s due to API overload...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        throw error // Re-throw if not retryable or max retries reached
      }
    }
  }

  /**
   * Get recommended tools for a solution
   */
  private getRecommendedTools(solution: Solution): Tool[] {
    const toolNodes = this.knowledgeGraph.nodes.filter(n => n.type === 'tool')
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
}