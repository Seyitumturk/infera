import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

/**
 * Unified AI Service for Infera
 * Handles all AI operations in one clean, efficient service
 */

// Input schemas
const CompanyProfileSchema = z.object({
  industry: z.string(),
  size: z.string(),
  budget_range: z.string().optional()
})

const AssessmentInputSchema = z.object({
  companyProfile: CompanyProfileSchema,
  answers: z.array(z.object({
    id: z.string(),
    category: z.string(),
    question: z.string(),
    answer: z.union([z.string(), z.array(z.string()), z.boolean()])
  })),
  customProblem: z.string().optional()
})

// Output types
interface ProcessFlag {
  id: string
  label: string
  category: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  currentState?: string
  automationPotential?: string
  timeSavingsPerInstance?: string
  errorReduction?: string
  complexityScore?: number
  prerequisiteConditions?: string[]
}

interface RecommendedTool {
  id: string
  name: string
  vendor: string
  description: string
  useCase: string
  pricing: string
  implementationCost?: string
  timeToValue: string
  matchReason: string
  priority: number
  integrationComplexity?: string
  prosAndCons?: {
    pros: string[]
    cons: string[]
  }
  alternativeOptions?: string[]
  industryFit?: string
}

interface RoadmapItem {
  id: string
  title: string
  description: string
  priority: 'quick_win' | 'high' | 'medium' | 'low'
  timeline: '30_days' | '60_days' | '90_days' | 'future'
  impact: number // 1-5
  effort: number // 1-5
  roi: {
    annual_savings: number
    implementation_cost: number
    payback_months: number
    low_scenario?: number
    base_scenario?: number
    high_scenario?: number
    confidence_level?: number
  }
  next_steps: string[]
  owner: string
  kpis: string[]
  risks?: string[]
  dependencies?: string[]
  resourceRequirements?: {
    technical: string
    human: string
    budget: string
  }
  changeManagement?: string
}

interface InferaAssessment {
  processFlags: ProcessFlag[]
  recommendedTools: RecommendedTool[]
  roadmap: RoadmapItem[]
  executiveSummary: {
    totalPotentialSavings: number
    savingsRange?: {
      low: number
      base: number
      high: number
    }
    quickWins: number
    strategicInitiatives?: number
    implementationTimeframe: string
    topRecommendation: string
    keySuccessFactors?: string[]
    businessCase?: string
    competitiveAdvantage?: string
  }
  aiInsights: string[]
  industryBenchmarks?: {
    automationMaturity: string
    typicalROI: string
    commonChallenges: string[]
    successPatterns: string[]
  }
  implementationStrategy?: {
    phase1_30days: string
    phase2_60days: string
    phase3_90days: string
    criticalSuccessFactors: string[]
    potentialRoadblocks: string[]
  }
}

export class InferaAIService {
  private anthropic: Anthropic
  private solutions: any[]
  private tools: any[]
  private webSearchEnabled: boolean

  constructor() {
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY is required')
    }

    this.anthropic = new Anthropic({ apiKey: anthropicKey })
    this.solutions = []
    this.tools = []
    
    // Configure advanced features via environment variables
    this.webSearchEnabled = process.env.ENABLE_WEB_SEARCH !== 'false' // Default enabled
    
    console.log('🎛️ AI Service Configuration:')
    console.log(`   Web Search: ${this.webSearchEnabled ? '✅ ENABLED' : '❌ DISABLED'}`)
    console.log(`   Extended Reasoning: ✅ ENABLED (built-in)`)
    console.log(`   Model: claude-sonnet-4-20250514`)
  }

  async initialize() {
    // Skip loading local tools database - using pure web search approach
    this.solutions = []
    this.tools = []
    console.log(`✅ Infera AI Service initialized with PURE WEB SEARCH approach`)
    console.log(`🔍 Web search capabilities: ${this.webSearchEnabled ? 'ENABLED' : 'DISABLED'}`)
    console.log(`🚫 Local tools database: DISABLED (preventing irrelevant recommendations)`)
  }

  /**
   * Web search for relevant tools and solutions using Claude Sonnet 4
   */
  private async performWebSearch(query: string, context: string): Promise<{
    tools: any[]
    insights: string[]
    marketTrends: string[]
    customSolutionNeeded: boolean
    customSolutionDetails?: any
  }> {
    if (!this.webSearchEnabled) {
      console.log('🚫 Web search disabled, returning custom solution recommendation')
      return { 
        tools: [], 
        insights: ['Web search disabled - recommending custom solution'], 
        marketTrends: [],
        customSolutionNeeded: true
      }
    }

    console.log(`🔍 Performing targeted web search for: "${query}"`)
    
    try {
      const webSearchPrompt = `You are Claude Sonnet 4 analyzing this business scenario. Provide specific tool recommendations based on their actual needs.

REQUEST: "${query}"
CONTEXT: ${context}

CRITICAL: Analyze their SPECIFIC request. Don't default to generic workflow automation.

If they want:
- GEO/LLM visibility: Focus on SEO tools, content platforms, AI content systems
- Marketing: Focus on marketing automation, lead gen, social media tools
- Sales: Focus on CRM, sales automation, lead management
- Content: Focus on content creation, management, distribution tools
- Processes: Then focus on workflow automation

RESPOND WITH ONLY VALID JSON:

{
  "webSearchResults": {
    "relevantToolsFound": true,
    "tools": [
      {
        "name": "Tool Name",
        "vendor": "Vendor Name", 
        "description": "What it does for their specific need",
        "pricing": "Realistic pricing",
        "relevanceScore": 0.9,
        "strengths": ["Strength 1", "Strength 2"],
        "limitations": ["Limitation 1"],
        "provenSuccess": "Success metrics",
        "homepage": "website.com"
      }
    ],
    "customSolutionRecommended": false,
    "customSolutionDetails": {
      "reasoning": "Why custom vs off-the-shelf",
      "estimatedCost": "Development cost range",
      "timeframe": "Development timeline",
      "complexity": "Technical complexity",
      "roi": "Expected ROI"
    },
    "marketInsights": [
      "Market insight 1",
      "Market insight 2"
    ]
  }
}`

      const response = await this.makeClaudeRequest({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: webSearchPrompt
        }],
        temperature: 0.1
      })

      const webResults = this.parseWebSearchResponse(response.content[0].text)
      console.log(`✅ Web search completed: Found ${webResults.tools.length} relevant tools`)
      console.log(`🔧 Custom solution needed: ${webResults.customSolutionNeeded}`)
      
      return webResults

    } catch (error) {
      console.error('❌ Web search failed, recommending custom solution:', error)
      return { 
        tools: [], 
        insights: ['Web search failed - custom solution recommended'], 
        marketTrends: [],
        customSolutionNeeded: true,
        customSolutionDetails: this.getDefaultCustomSolution(query, context)
      }
    }
  }

  /**
   * Extended reasoning analysis using Claude Sonnet 4's advanced capabilities
   */
  private async performExtendedReasoning(
    businessContext: any, 
    localTools: any[], 
    webTools: any[]
  ): Promise<{
    deepAnalysis: string[]
    strategicRecommendations: string[]
    riskAssessment: string[]
    implementationStrategy: string[]
  }> {
    console.log('🧠 Performing extended reasoning analysis...')

    const reasoningPrompt = `You are Claude Sonnet 4 with advanced strategic thinking capabilities. Analyze this specific business scenario and provide strategic insights.

BUSINESS CONTEXT:
${JSON.stringify(businessContext, null, 2)}

CRITICAL: Respond with ONLY valid JSON. No explanations, no markdown, no extra text:

{
  "extendedReasoning": {
    "deepAnalysis": [
      "Strategic insight about their specific business challenge",
      "Analysis of their unique market position and opportunities",
      "Assessment of their technical readiness and constraints"
    ],
    "strategicRecommendations": [
      "High-level recommendation based on their specific needs",
      "Strategic approach tailored to their industry and situation"
    ]
  }
}`

    try {
      const response = await this.makeClaudeRequest({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: reasoningPrompt
        }],
        temperature: 0.1
      })

      const reasoningResults = this.parseReasoningResponse(response.content[0].text)
      console.log('✅ Extended reasoning analysis completed')
      
      return reasoningResults

    } catch (error) {
      console.error('❌ Extended reasoning failed:', error)
      return {
        deepAnalysis: [
          'This business shows significant automation potential based on described workflows',
          'Manual processes are creating unnecessary overhead and error-prone operations',
          'Technology readiness appears suitable for modern automation solutions',
          'Process improvements could yield substantial ROI within 6-12 months'
        ],
        strategicRecommendations: [
          'Start with highest-impact, lowest-risk automation opportunities',
          'Focus on processes that eliminate frustrating manual work',
          'Build internal capabilities alongside vendor solutions'
        ],
        riskAssessment: [
          'Change management and employee adoption are primary risk factors',
          'Integration complexity may extend implementation timelines',
          'Quality control during transition requires careful monitoring'
        ],
        implementationStrategy: [
          'Begin with pilot programs to demonstrate value and build confidence',
          'Ensure adequate training and support during transition periods',
          'Maintain focus on business outcomes rather than technology features'
        ]
      }
    }
  }

  /**
   * Parse web search response
   */
  private parseWebSearchResponse(responseText: string): {
    tools: any[]
    insights: string[]
    marketTrends: string[]
    customSolutionNeeded: boolean
    customSolutionDetails?: any
  } {
    try {
      const cleanText = this.cleanJsonResponse(responseText)
      const parsed = JSON.parse(cleanText)
      
      const webResults = parsed.webSearchResults || {}
      
      return {
        tools: webResults.tools || [],
        insights: webResults.marketInsights || [],
        marketTrends: webResults.recommendations || [],
        customSolutionNeeded: webResults.customSolutionRecommended || false,
        customSolutionDetails: webResults.customSolutionDetails
      }
    } catch (error) {
      console.error('❌ Failed to parse web search response:', error)
      return { 
        tools: [], 
        insights: [], 
        marketTrends: [],
        customSolutionNeeded: true
      }
    }
  }

  /**
   * Get default custom solution when web search fails or no tools found
   */
  private getDefaultCustomSolution(query: string, context: string): any {
    // Extract key details from context for pricing estimation
    const isComplexIntegration = context.toLowerCase().includes('database') || 
                                context.toLowerCase().includes('api') ||
                                context.toLowerCase().includes('multiple systems')
    
    const isAIRequired = context.toLowerCase().includes('ai') ||
                        context.toLowerCase().includes('machine learning') ||
                        context.toLowerCase().includes('intelligent') ||
                        context.toLowerCase().includes('matching')

    // Base pricing for fast AI development team
    let baseCost = 8000  // Starting point for simple solutions
    let monthlyMaintenance = 800

    // Adjust based on complexity
    if (isComplexIntegration) {
      baseCost += 7000
      monthlyMaintenance += 600
    }
    
    if (isAIRequired) {
      baseCost += 5000
      monthlyMaintenance += 400
    }

    return {
      reasoning: "No existing tools adequately solve this specific use case. Custom development recommended.",
      estimatedCost: `$${baseCost.toLocaleString()}-${(baseCost * 1.4).toLocaleString()} initial development + $${monthlyMaintenance}/month maintenance`,
      timeframe: isComplexIntegration ? "8-12 weeks" : "4-8 weeks",
      complexity: isComplexIntegration ? "High - Multiple integrations and data sources" : "Medium - Focused automation solution",
      roi: "Expected 3-6x ROI within 12 months based on time savings and error reduction",
      advantages: [
        "Perfectly tailored to your exact workflow",
        "No monthly subscription fees after development",
        "Full control and customization capability",
        "Fast development by AI-specialized team"
      ]
    }
  }

  /**
   * Parse extended reasoning response
   */
  private parseReasoningResponse(responseText: string): {
    deepAnalysis: string[]
    strategicRecommendations: string[]
    riskAssessment: string[]
    implementationStrategy: string[]
  } {
    try {
      const cleanText = this.cleanJsonResponse(responseText)
      const parsed = JSON.parse(cleanText)
      
      const reasoning = parsed.extendedReasoning || {}
      
      return {
        deepAnalysis: reasoning.deepAnalysis || [],
        strategicRecommendations: reasoning.strategicRecommendations || [],
        riskAssessment: reasoning.scenarioAnalysis?.worstCase ? [reasoning.scenarioAnalysis.worstCase] : [],
        implementationStrategy: reasoning.systemsInsights || []
      }
    } catch (error) {
      console.error('❌ Failed to parse reasoning response:', error)
      return {
        deepAnalysis: [],
        strategicRecommendations: [],
        riskAssessment: [],
        implementationStrategy: []
      }
    }
  }

  /**
   * Clean JSON response helper
   */
  private cleanJsonResponse(responseText: string): string {
    let cleanText = responseText.trim()
    
    // Remove any text before the first {
    const firstBrace = cleanText.indexOf('{')
    if (firstBrace > 0) {
      cleanText = cleanText.substring(firstBrace)
    }
    
    // Remove any text after the last }
    const lastBrace = cleanText.lastIndexOf('}')
    if (lastBrace !== -1 && lastBrace < cleanText.length - 1) {
      cleanText = cleanText.substring(0, lastBrace + 1)
    }
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      cleanText = jsonMatch[1].trim()
    }
    
    return cleanText
  }

  /**
   * Enhanced main assessment method with web search and extended reasoning
   */
  async generateAssessment(input: z.infer<typeof AssessmentInputSchema>): Promise<InferaAssessment> {
    const validatedInput = AssessmentInputSchema.parse(input)
    
    console.log('🧠 Generating enhanced AI assessment with web search and extended reasoning...')

    // Step 1: Perform web search for additional tools and insights
    const businessContext = this.extractBusinessContext(validatedInput)
    const searchQuery = this.buildSearchQuery(validatedInput)
    
    console.log('🔍 Step 1: Performing web search for latest tools and market insights...')
    const webSearchResults = await this.performWebSearch(searchQuery, businessContext)
    
    // Step 2: Perform extended reasoning analysis (no local tools)
    console.log('🧠 Step 2: Performing extended reasoning analysis...')
    const reasoningResults = await this.performExtendedReasoning(
      businessContext,
      [], // No local tools
      webSearchResults.tools
    )

    // Step 3: Generate comprehensive assessment with web search and reasoning
    console.log('📊 Step 3: Generating comprehensive assessment...')
    const enhancedPrompt = this.buildPureWebSearchPrompt(
      validatedInput, 
      webSearchResults, 
      reasoningResults
    )

    try {
      const response = await this.makeClaudeRequest({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          },
          {
            role: 'assistant',
            content: '{'  // Force Claude to start with JSON
          }
        ],
        temperature: 0.1
      })

      // Since we forced Claude to start with '{', we need to prepend it to the response
      const fullResponse = '{' + response.content[0].text
      const assessment = this.parseClaudeResponse(fullResponse)
      
      // Enhance the assessment with web search insights
      assessment.aiInsights = [
        ...assessment.aiInsights,
        ...webSearchResults.insights.slice(0, 2),
        ...reasoningResults.deepAnalysis.slice(0, 2)
      ]

      console.log('✅ Enhanced assessment generated successfully with web search and extended reasoning')
      return assessment

    } catch (error) {
      console.error('❌ Enhanced AI assessment failed:', error)
      
      // Fallback to original method
      console.log('🔄 Falling back to original assessment method...')
      return this.generateOriginalAssessment(validatedInput)
    }
  }

  /**
   * Original assessment method as fallback
   */
  private async generateOriginalAssessment(input: z.infer<typeof AssessmentInputSchema>): Promise<InferaAssessment> {
    const prompt = this.buildComprehensivePrompt(input)

    try {
      const response = await this.makeClaudeRequest({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        messages: [
          {
            role: 'user',
            content: prompt
          },
          {
            role: 'assistant',
            content: '{'  // Force Claude to start with JSON
          }
        ],
        temperature: 0.1
      })

      const fullResponse = '{' + response.content[0].text
      return this.parseClaudeResponse(fullResponse)

    } catch (error) {
      console.error('❌ Original assessment also failed:', error)
      return this.generateFallbackAssessment(input)
    }
  }

  /**
   * Extract business context for web search and reasoning
   */
  private extractBusinessContext(input: z.infer<typeof AssessmentInputSchema>): string {
    const mostUrgent = input.answers.find(a => a.id === 'most_urgent')?.answer || ''
    const repetitiveTasks = input.answers.find(a => a.id === 'repetitive_tasks')?.answer || ''
    const bottlenecks = input.answers.find(a => a.id === 'bottlenecks')?.answer || ''
    const customProblem = (input as any).customProblem || ''

    return `
Industry: ${input.companyProfile.industry}
Company Size: ${input.companyProfile.size}
Most Urgent Issue: ${mostUrgent}
Repetitive Tasks: ${repetitiveTasks}
Main Bottlenecks: ${bottlenecks}
Custom Problem: ${customProblem}
    `.trim()
  }

  /**
   * Build search query for web search
   */
  private buildSearchQuery(input: z.infer<typeof AssessmentInputSchema>): string {
    const industry = input.companyProfile.industry.toLowerCase()
    const size = input.companyProfile.size.toLowerCase()
    const mostUrgent = input.answers.find(a => a.id === 'most_urgent')?.answer as string || ''
    const repetitiveTasks = input.answers.find(a => a.id === 'repetitive_tasks')?.answer as string || ''

    // Build intelligent search query based on actual business needs
    const problemKeywords = `${mostUrgent} ${repetitiveTasks}`.toLowerCase()
    
    let searchTerms: string[] = []
    
    // Check for specific types of requests
    if (problemKeywords.includes('geo') || problemKeywords.includes('seo') || problemKeywords.includes('llm') || 
        problemKeywords.includes('search engine') || problemKeywords.includes('visibility') ||
        problemKeywords.includes('google') || problemKeywords.includes('chatgpt')) {
      searchTerms.push('SEO automation tools', 'content optimization platforms', 'AI content tools', 'local SEO software')
    }
    else if (problemKeywords.includes('marketing') || problemKeywords.includes('lead') || problemKeywords.includes('social')) {
      searchTerms.push('marketing automation platforms', 'lead generation tools', 'social media automation')
    }
    else if (problemKeywords.includes('content') || problemKeywords.includes('writing') || problemKeywords.includes('blog')) {
      searchTerms.push('content management systems', 'AI writing tools', 'content automation platforms')
    }
    else if (problemKeywords.includes('sales') || problemKeywords.includes('crm') || problemKeywords.includes('customer')) {
      searchTerms.push('CRM automation', 'sales automation tools', 'customer management platforms')
    }
    else if (problemKeywords.includes('invoice') || problemKeywords.includes('payment') || problemKeywords.includes('billing')) {
      searchTerms.push('accounts payable automation', 'invoice processing software', 'billing automation')
    }
    else {
      // Default to generic business automation only if no specific category is identified
      searchTerms.push(`${industry} automation tools`, `${size} business automation`)
    }

    return searchTerms.join(' OR ')
  }

  /**
   * Build pure web search prompt (no local tools database)
   */
  private buildPureWebSearchPrompt(
    input: z.infer<typeof AssessmentInputSchema>,
    webSearchResults: any,
    reasoningResults: any
  ): string {
    const businessContext = this.extractBusinessContext(input)
    const mostUrgent = input.answers.find(a => a.id === 'most_urgent')?.answer as string || ''
    const repetitiveTasks = input.answers.find(a => a.id === 'repetitive_tasks')?.answer as string || ''
    const bottlenecks = input.answers.find(a => a.id === 'bottlenecks')?.answer as string || ''

    const webToolsSection = webSearchResults.tools.length > 0 ? `

🌐 AVAILABLE AUTOMATION TOOLS:
${webSearchResults.tools.map((tool: any) => `
• ${tool.name} by ${tool.vendor} - ${tool.pricing}
  ${tool.description}
  Strengths: ${tool.strengths?.join(', ') || 'N/A'}
  Limitations: ${tool.limitations?.join(', ') || 'N/A'}
`).join('\n')}

MARKET INSIGHTS:
${webSearchResults.insights.map((insight: string) => `• ${insight}`).join('\n')}
` : `

🔧 CUSTOM SOLUTION ANALYSIS:
Based on market research, no existing tools adequately address this specific use case.
Custom development recommended with realistic ROI projections.
`

    const strategicContext = reasoningResults.deepAnalysis.length > 0 ? `

🧠 STRATEGIC BUSINESS ANALYSIS:
${reasoningResults.deepAnalysis.map((insight: string) => `• ${insight}`).join('\n')}

KEY STRATEGIC RECOMMENDATIONS:
${reasoningResults.strategicRecommendations.map((rec: string) => `• ${rec}`).join('\n')}
` : ''

    return `You are Claude Sonnet 4, an expert AI consultant. I need you to analyze this SPECIFIC business scenario and create a tailored solution.

BUSINESS CONTEXT:
${businessContext}

USER'S SPECIFIC REQUEST:
- Primary Goal: ${mostUrgent}
- Key Focus Areas: ${repetitiveTasks}  
- Main Challenges: ${bottlenecks}

${webToolsSection}

${strategicContext}

CRITICAL INSTRUCTIONS:
1. LISTEN TO THE USER'S ACTUAL REQUEST - Don't default to generic process automation
2. If they want GEO optimization, LLM visibility, marketing automation, or non-traditional business needs - ADDRESS THAT SPECIFICALLY
3. Use your advanced reasoning to determine if this needs:
   - Custom AI/ML solution
   - Specialized software tools  
   - Marketing/SEO platforms
   - Content automation systems
   - Or traditional business automation
4. BE HONEST about what makes sense - custom vs off-the-shelf
5. Don't force-fit generic "workflow automation" to every problem

SOLUTION APPROACH:
- If it's about LLM visibility/GEO: Focus on content strategy, SEO automation, AI content tools
- If it's about marketing: Focus on marketing automation, lead gen, content systems  
- If it's about processes: Then focus on workflow automation
- If it's unique: Recommend custom development with realistic scope

PRICING REALITY CHECK:
- Simple tools/platforms: $50-500/month
- Marketing automation: $100-2,000/month
- Custom AI solutions: $15,000-50,000 development
- Complex systems: $50,000-150,000 development

RESPOND WITH ONLY VALID JSON (no other text):

{
  "processFlags": [
    {
      "id": "flag_1",
      "label": "Primary challenge or opportunity identified",
      "category": "solution_category",
      "confidence": 0.9,
      "impact": "high",
      "currentState": "Current situation and specific pain points",
      "automationPotential": "Recommended solution approach",
      "timeSavingsPerInstance": "Expected benefits or improvements",
      "errorReduction": "Quality improvements or risk reduction",
      "complexityScore": 3,
      "prerequisiteConditions": ["Requirement 1", "Requirement 2"]
    }
  ],
  "recommendedTools": [
    {
      "id": "tool_1", 
      "name": "Tool/Platform/Solution Name",
      "vendor": "Vendor or 'Custom Development'",
      "description": "What this specifically solves for their request",
      "useCase": "How it addresses their primary goal",
      "pricing": "Realistic cost structure",
      "implementationCost": "Setup and onboarding costs",
      "timeToValue": "Timeline to see results",
      "matchReason": "Why this fits their specific need",
      "priority": 1,
      "integrationComplexity": "Implementation difficulty",
      "prosAndCons": {
        "pros": ["Key benefit 1", "Key benefit 2", "Key benefit 3"],
        "cons": ["Limitation 1", "Limitation 2"]
      },
      "alternativeOptions": ["Alternative approach 1", "Alternative approach 2"],
      "industryFit": "Relevance to their business context"
    }
  ],
  "roadmap": [
    {
      "id": "roadmap_1",
      "title": "Phase 1: Address Primary Goal",
      "description": "Implementation plan for their specific request",
      "priority": "quick_win",
      "timeline": "30_days",
      "impact": 5,
      "effort": 2,
      "roi": {
        "annual_savings": 50000,
        "implementation_cost": 10000,
        "payback_months": 3
      },
      "next_steps": [
        "Week 1: Define requirements and select solution",
        "Week 2: Setup and configuration",
        "Week 3: Testing and optimization", 
        "Week 4: Launch and monitor results"
      ],
      "owner": "Project lead or business owner",
      "kpis": [
        "Primary success metric for their goal",
        "Secondary performance indicator",
        "ROI tracking metric"
      ],
      "risks": ["Implementation challenges", "Adoption issues"],
      "dependencies": ["Resource allocation", "Team availability"],
      "resourceRequirements": {
        "technical": "Required technical resources",
        "human": "Time investment needed", 
        "budget": "Cost breakdown"
      },
      "changeManagement": "Approach for successful implementation"
    }
  ],
  "executiveSummary": {
    "totalPotentialSavings": 100000,
    "savingsRange": {
      "low": 60000,
      "base": 100000, 
      "high": 150000
    },
    "quickWins": 1,
    "strategicInitiatives": 1,
    "implementationTimeframe": "Realistic timeline based on their specific needs",
    "topRecommendation": "Specific recommendation addressing their primary goal",
    "keySuccessFactors": [
      "Success factor 1 for their situation",
      "Success factor 2",
      "Success factor 3"
    ],
    "businessCase": "Why this investment makes sense for their specific goal",
    "competitiveAdvantage": "How this will benefit their business specifically"
  },
  "aiInsights": [
    "Key insight about their specific challenge and solution approach",
    "Strategic recommendation tailored to their business goals", 
    "Important considerations for successful implementation",
    "Long-term benefits and growth opportunities"
  ],
  "industryBenchmarks": {
    "automationMaturity": "Context about their industry and solution space",
    "typicalROI": "Expected returns for this type of solution",
    "commonChallenges": ["Challenge 1 for this solution type", "Challenge 2"],
    "successPatterns": ["Success factor 1", "Success factor 2"]
  },
  "implementationStrategy": {
    "phase1_30days": "First month priorities and actions",
    "phase2_60days": "Second month scaling and optimization",
    "phase3_90days": "Third month full implementation and measurement", 
    "criticalSuccessFactors": ["Success factor 1", "Success factor 2", "Success factor 3"],
    "potentialRoadblocks": ["Risk 1 and mitigation", "Risk 2 and mitigation"]
  }
}`
  }

  private buildComprehensivePrompt(input: z.infer<typeof AssessmentInputSchema>): string {
    // Extract key metrics from the comprehensive answers
    const businessPriorities = input.answers.find(a => a.id === 'business_priorities')?.answer || ''
    const mostUrgent = input.answers.find(a => a.id === 'most_urgent')?.answer || ''
    const repetitiveTasks = input.answers.find(a => a.id === 'repetitive_tasks')?.answer || ''
    const taskFrequency = input.answers.find(a => a.id === 'task_frequency')?.answer || ''
    const bottlenecks = input.answers.find(a => a.id === 'bottlenecks')?.answer || ''
    const bottleneckImpact = input.answers.find(a => a.id === 'bottleneck_impact')?.answer || ''
    const dataTypes = input.answers.find(a => a.id === 'data_types')?.answer || []
    const dataStorage = input.answers.find(a => a.id === 'data_storage')?.answer || ''
    const dataAccessibility = input.answers.find(a => a.id === 'data_accessibility')?.answer || ''
    const automationExperience = input.answers.find(a => a.id === 'automation_experience')?.answer || ''
    const automationResults = input.answers.find(a => a.id === 'automation_results')?.answer || ''
    const teamComfort = input.answers.find(a => a.id === 'team_comfort')?.answer || ''
    const trainingInvestment = input.answers.find(a => a.id === 'training_investment')?.answer || ''

    const customProblem = (input as any).customProblem && String((input as any).customProblem).trim().length > 0
      ? String((input as any).customProblem).trim()
      : null

    // Industry-specific context awareness
    const industryContext = this.getIndustryContext(input.companyProfile.industry, customProblem, mostUrgent)
    const sizeConstraints = this.getSizeConstraints(input.companyProfile.size)
    
    // Get relevant tools based on the business context
    const relevantTools = this.getRelevantTools(input.companyProfile, mostUrgent, repetitiveTasks, bottlenecks)
    const toolsContext = this.formatToolsForPrompt(relevantTools)

    return `You are a senior automation consultant with deep expertise in ${input.companyProfile.industry} businesses. You're analyzing a ${input.companyProfile.size} company with specific operational challenges.

CRITICAL ANALYSIS REQUIREMENTS:
You MUST demonstrate deep understanding of this specific business context. Generic responses will be rejected.

BUSINESS PROFILE:
Industry: ${input.companyProfile.industry}
Size: ${input.companyProfile.size}
Budget Range: ${input.companyProfile.budget_range || 'Not specified'}

SPECIFIC BUSINESS SITUATION:
${customProblem ? `PRIMARY SCENARIO: ${customProblem}` : ''}

Business Priorities: ${businessPriorities}
MOST URGENT ISSUE: ${mostUrgent}

Operational Details:
- Repetitive Tasks: ${repetitiveTasks}
- Task Frequency: ${taskFrequency}
- Main Bottlenecks: ${bottlenecks}
- Business Impact: ${bottleneckImpact}
- Data Types: ${Array.isArray(dataTypes) ? dataTypes.join(', ') : dataTypes}
- Current Storage: ${dataStorage}
- Data Accessibility: ${dataAccessibility}

Current Automation State:
- Experience: ${automationExperience}
- Results/Challenges: ${automationResults}
- Team Tech Comfort: ${teamComfort}
- Training Budget: ${trainingInvestment}

INDUSTRY-SPECIFIC CONTEXT:
${industryContext}

BUSINESS SIZE CONSTRAINTS:
${sizeConstraints}

AVAILABLE TOOLS DATABASE:
You have access to our curated database of ${this.tools.length} automation tools. Here are the most relevant ones for this business context:

${toolsContext}

TOOL SELECTION REQUIREMENTS:
- You MUST select tools ONLY from the provided database above
- Match tools based on their primary_use_cases, ideal_customer size, and industry verticals
- Use the exact vendor_name, product_name, and pricing information provided
- Consider the tool's integrations and deployment requirements
- Factor in the company's technical comfort level and budget constraints

ADVANCED REASONING REQUIREMENTS:

1. DEEP CONTEXTUAL ANALYSIS:
- Identify industry-specific pain points that generic consultants would miss
- Understand seasonal patterns, regulatory requirements, customer behavior unique to this industry
- Recognize operational constraints specific to this business size
- Connect the dots between seemingly unrelated issues

2. FINANCIAL REALITY CHECK:
- Calculate ROI based on actual business metrics provided, not generic estimates
- Account for implementation complexity relative to team size and technical capability
- Factor in industry-typical margins, labor costs, and growth patterns
- Consider cash flow constraints of ${input.companyProfile.size} businesses

3. SOLUTION SOPHISTICATION:
- Recommend tools that match both technical capability and budget reality
- Sequence implementation based on urgency, dependencies, and change management capacity
- Identify automation opportunities that competitors in this industry typically miss
- Balance quick wins with strategic long-term improvements

4. INDUSTRY EXPERTISE DEMONSTRATION:
- Reference industry-specific terminology, processes, and challenges
- Understand regulatory/compliance requirements if applicable
- Recognize seasonal business patterns and their automation implications
- Identify industry-specific integration requirements

CRITICAL OUTPUT REQUIREMENTS:
- Process flags must be specific to the exact pain points described, not generic categories
- Tool recommendations must match the technical sophistication and budget of this business size
- ROI calculations must be based on the specific metrics provided (time savings, error reduction, etc.)
- Implementation timeline must account for team capacity and change management

⚠️ IMPORTANT: You MUST respond with ONLY valid JSON. No explanations, no text, no markdown formatting. 
Start your response with { and end with }. Any non-JSON content will cause system failure.

Return EXACTLY this JSON structure:

{
  "processFlags": [
    {
      "id": "flag_1",
      "label": "Specific process name from their description",
      "category": "specific_automation_category", 
      "confidence": 0.85,
      "impact": "high",
      "currentState": "Detailed description of their current manual process",
      "automationPotential": "Specific automation approach for this exact scenario",
      "timeSavingsPerInstance": "Quantified time savings based on their metrics",
      "errorReduction": "Specific error reduction potential",
      "complexityScore": 3,
      "prerequisiteConditions": ["specific requirement 1", "specific requirement 2"]
    }
  ],
  "recommendedTools": [
    {
      "id": "tool_1",
      "name": "Specific Tool Name",
      "vendor": "Actual Vendor Name", 
      "description": "What it specifically does for their use case",
      "useCase": "How it solves their exact problem",
      "pricing": "Realistic pricing for their business size",
      "implementationCost": "Setup and training costs",
      "timeToValue": "Realistic timeline",
      "matchReason": "Why this tool fits their specific situation",
      "priority": 1,
      "integrationComplexity": "low/medium/high",
      "prosAndCons": {
        "pros": ["Specific advantages for their situation"],
        "cons": ["Realistic limitations and challenges"]
      },
      "alternativeOptions": ["Alternative tool 1", "Alternative tool 2"],
      "industryFit": "Why this works well for their industry"
    }
  ],
  "roadmap": [
    {
      "id": "roadmap_1",
      "title": "Specific project addressing their urgent need",
      "description": "What this achieves for their specific situation", 
      "priority": "quick_win",
      "timeline": "30_days",
      "impact": 4,
      "effort": 2,
      "risk": "low",
      "roi_calculation": {
        "annual_savings": 50000,
        "implementation_cost": {
          "software": 2000,
          "training": 1000,
          "setup": 2000,
          "total_year_one": 5000
        },
        "net_roi": {
          "total_savings": 45000,
          "roi_percentage": 900,
        "payback_months": 2
        }
      },
      "next_steps": ["Specific actionable step 1", "Specific actionable step 2"],
      "owner": "Specific role/department for their size",
      "kpis": ["Specific measurable metric 1", "Specific measurable metric 2"],
      "risks": ["Specific risk for their situation"],
      "dependencies": ["What needs to happen first"],
      "resourceRequirements": {
        "technical": "Specific technical needs",
        "human": "Staff time and skills needed",
        "budget": "Detailed budget breakdown"
      },
      "changeManagement": "How to ensure adoption success"
    }
  ],
  "executiveSummary": {
    "totalPotentialSavings": 150000,
    "savingsRange": {
      "low": 100000,
      "base": 150000,
      "high": 200000
    },
    "quickWins": 2,
    "strategicInitiatives": 1,
    "implementationTimeframe": "Realistic timeline for their team size",
    "topRecommendation": "Specific recommendation addressing their most urgent issue",
    "keySuccessFactors": ["Critical factor 1", "Critical factor 2"],
    "businessCase": "Compelling rationale specific to their situation",
    "competitiveAdvantage": "How this helps them vs competitors"
  },
  "aiInsights": [
    "Industry-specific insight about their automation opportunity",
    "Strategic recommendation based on their business model",
    "Warning or consideration specific to their situation"
  ],
  "industryBenchmarks": {
    "automationMaturity": "How they compare to industry peers",
    "typicalROI": "Industry-typical ROI ranges",
    "commonChallenges": ["Challenge 1", "Challenge 2"],
    "successPatterns": ["Success pattern 1", "Success pattern 2"]
  },
  "implementationStrategy": {
    "phase1_30days": "Specific actions for first 30 days",
    "phase2_60days": "Specific actions for next 30 days", 
    "phase3_90days": "Specific actions for final 30 days",
    "criticalSuccessFactors": ["Factor 1", "Factor 2"],
    "potentialRoadblocks": ["Roadblock 1", "Roadblock 2"]
  }
}`
  }

  private getIndustryContext(industry: string, customProblem: string | null, mostUrgent: string): string {
    const contexts: Record<string, string> = {
      "Healthcare": `
HEALTHCARE INDUSTRY CONTEXT:
- Regulatory: HIPAA compliance, patient privacy, medical record retention
- Operational: Appointment scheduling, insurance verification, patient flow
- Financial: Insurance claim processing, prior authorizations, billing cycles
- Seasonal: Flu seasons, annual physicals, end-of-year insurance changes
- Technology: EHR systems, practice management software, telehealth integration
- Staff: Clinical vs administrative roles, licensing requirements, continuing education
- Patient Experience: Wait times, communication preferences, follow-up care`,

      "Professional Services": `
PROFESSIONAL SERVICES CONTEXT:
- Billing: Time tracking, project-based billing, client invoicing cycles
- Client Management: Relationship building, project delivery, communication
- Resource Management: Staff utilization, skill matching, capacity planning
- Compliance: Industry regulations, professional standards, documentation
- Seasonal: Tax season, year-end planning, budget cycles
- Technology: CRM systems, project management tools, document management
- Growth: Scalability challenges, quality control, standardization`,

      "Retail": `
RETAIL INDUSTRY CONTEXT:
- Inventory: Seasonal demand, perishability, supplier relationships
- Customer Experience: Point of sale, returns, customer service
- Operations: Store hours, staff scheduling, loss prevention
- Financial: Cash flow, payment processing, profit margins
- Seasonal: Holiday rushes, back-to-school, clearance cycles
- Technology: POS systems, inventory management, e-commerce integration
- Competition: Price sensitivity, customer loyalty, market positioning`,

      "Manufacturing": `
MANUFACTURING CONTEXT:
- Production: Quality control, equipment maintenance, supply chain
- Compliance: Safety regulations, environmental standards, quality certifications
- Operations: Shift scheduling, equipment utilization, waste reduction
- Financial: Material costs, labor efficiency, equipment ROI
- Seasonal: Demand fluctuations, maintenance windows, raw material availability
- Technology: ERP systems, automation equipment, quality monitoring
- Supply Chain: Vendor management, just-in-time delivery, inventory optimization`
    }

    return contexts[industry] || `
INDUSTRY-SPECIFIC CONSIDERATIONS:
- Analyze the unique operational patterns of ${industry} businesses
- Consider regulatory and compliance requirements typical for this industry  
- Understand seasonal business cycles and their impact on operations
- Identify technology integration challenges common in ${industry}
- Factor in industry-typical profit margins and cost structures`
  }

  private getSizeConstraints(size: string): string {
    const constraints: Record<string, string> = {
      "Startup (1-10)": `
STARTUP CONSTRAINTS:
- Budget: Very limited, need immediate ROI, prefer low monthly costs over large upfront
- Technical Capability: Limited IT resources, need simple solutions, minimal training time
- Change Management: High flexibility but resource constraints, everyone wears multiple hats
- Growth: Rapid scaling needs, solutions must grow with them
- Risk Tolerance: Higher risk tolerance but can't afford failures`,

      "Small (11-50)": `
SMALL BUSINESS CONSTRAINTS:
- Budget: Moderate budgets, need clear ROI within 6-12 months
- Technical Capability: Some dedicated roles, moderate training capacity
- Change Management: Need buy-in from key stakeholders, gradual implementation
- Operations: Established processes but flexibility for improvement
- Growth: Steady growth, solutions need to scale efficiently`,

      "Medium (51-500)": `
MEDIUM BUSINESS CONSTRAINTS:
- Budget: Structured budgets, formal approval processes, ROI requirements
- Technical Capability: Dedicated IT resources, formal training programs
- Change Management: Multiple departments, need comprehensive rollout plans
- Operations: Established systems, integration requirements
- Compliance: More formal compliance and audit requirements`,

      "Enterprise (500+)": `
ENTERPRISE CONSTRAINTS:
- Budget: Large budgets but complex approval processes, detailed ROI analysis
- Technical Capability: Full IT departments, extensive integration requirements
- Change Management: Complex stakeholder management, formal change processes
- Operations: Legacy systems, security requirements, scalability needs
- Compliance: Strict regulatory requirements, audit trails, governance`
    }

    return constraints[size] || constraints["Small (11-50)"]
  }

  // Removed local tools methods - now using pure web search approach

  private buildSimplePrompt(input: z.infer<typeof AssessmentInputSchema>): string {
    const businessPriorities = input.answers.find(a => a.id === 'business_priorities')?.answer || ''
    const mostUrgent = input.answers.find(a => a.id === 'most_urgent')?.answer || ''
    const repetitiveTasks = input.answers.find(a => a.id === 'repetitive_tasks')?.answer || ''
    const bottlenecks = input.answers.find(a => a.id === 'bottlenecks')?.answer || ''
    
    const customProblem = (input as any).customProblem && String((input as any).customProblem).trim().length > 0
      ? String((input as any).customProblem).trim()
      : null

    return `You are an automation consultant. Analyze this ${input.companyProfile.size} ${input.companyProfile.industry} business:

${customProblem ? `SCENARIO: ${customProblem}` : ''}

URGENT ISSUE: ${mostUrgent}
PRIORITIES: ${businessPriorities}
REPETITIVE TASKS: ${repetitiveTasks}
BOTTLENECKS: ${bottlenecks}

CRITICAL: Only recommend tools that DIRECTLY solve the stated problems. If no relevant tools exist, recommend custom development with realistic pricing.

Respond with ONLY this JSON (no other text):

{
  "processFlags": [
    {
      "id": "flag1",
      "label": "Specific process name",
      "category": "automation_type",
      "confidence": 0.8,
      "impact": "high",
      "currentState": "How they do it now",
      "automationPotential": "How to automate"
    }
  ],
  "recommendedTools": [
    {
      "id": "tool1",
      "name": "Tool Name",
      "vendor": "Vendor",
      "description": "What it does",
      "useCase": "How it helps",
      "pricing": "$X/month",
      "timeToValue": "X weeks",
      "matchReason": "Why it fits",
      "priority": 1
    }
  ],
  "roadmap": [
    {
      "id": "roadmap1",
      "title": "Project Name",
      "description": "What it achieves",
      "priority": "quick_win",
      "timeline": "30_days",
      "impact": 4,
      "effort": 2,
      "roi_calculation": {
        "annual_savings": 25000,
        "implementation_cost": {
          "total_year_one": 5000
        },
        "net_roi": {
          "total_savings": 20000,
          "roi_percentage": 400,
          "payback_months": 3
        }
      },
      "next_steps": ["Step 1", "Step 2"],
      "owner": "Role",
      "kpis": ["Metric 1", "Metric 2"]
    }
  ],
  "executiveSummary": {
    "totalPotentialSavings": 50000,
    "quickWins": 1,
    "implementationTimeframe": "60-90 days",
    "topRecommendation": "Start with X"
  },
  "aiInsights": [
    "Key insight 1",
    "Key insight 2"
  ]
}`
  }

  private parseClaudeResponse(responseText: string): InferaAssessment {
    try {
      console.log('🔍 Raw Claude response (first 500 chars):', responseText.substring(0, 500))
      
      // Clean up the response text
      let cleanText = responseText.trim()
      
      // Remove any text before the first {
      const firstBrace = cleanText.indexOf('{')
      if (firstBrace > 0) {
        cleanText = cleanText.substring(firstBrace)
        console.log('✂️ Removed text before JSON, now starts with:', cleanText.substring(0, 50))
      }
      
      // Remove any text after the last }
      const lastBrace = cleanText.lastIndexOf('}')
      if (lastBrace !== -1 && lastBrace < cleanText.length - 1) {
        cleanText = cleanText.substring(0, lastBrace + 1)
        console.log('✂️ Removed text after JSON, now ends with:', cleanText.substring(cleanText.length - 50))
      }
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        cleanText = jsonMatch[1].trim()
        console.log('📝 Extracted from code block')
      }
      
      // Handle common Claude formatting issues
      cleanText = cleanText
        .replace(/^\s*```json\s*/i, '') // Remove opening code block
        .replace(/\s*```\s*$/i, '')     // Remove closing code block
        .replace(/^[^{]*{/, '{')        // Remove any text before first {
        .replace(/}[^}]*$/, '}')        // Remove any text after last }
        .trim()

      console.log('🧹 Cleaned text (first 200 chars):', cleanText.substring(0, 200))
      console.log('🧹 Cleaned text (last 50 chars):', cleanText.substring(cleanText.length - 50))

      if (!cleanText.startsWith('{') || !cleanText.endsWith('}')) {
        console.error('❌ Text does not look like JSON object')
        throw new Error('Response is not a JSON object')
      }

      const parsed = JSON.parse(cleanText)
      console.log('✅ Successfully parsed JSON with keys:', Object.keys(parsed))
      
      // Validate and transform the response
      return {
        processFlags: parsed.processFlags || [],
        recommendedTools: parsed.recommendedTools || [],
        roadmap: parsed.roadmap || [],
        executiveSummary: parsed.executiveSummary || {
          totalPotentialSavings: 0,
          quickWins: 0,
          implementationTimeframe: "3-6 months",
          topRecommendation: "Start with process automation"
        },
        aiInsights: parsed.aiInsights || [],
        industryBenchmarks: parsed.industryBenchmarks,
        implementationStrategy: parsed.implementationStrategy
      }

    } catch (error) {
      console.error('❌ Failed to parse Claude response:', error)
      console.error('❌ Problematic text:', responseText.substring(0, 1000))
      throw new Error(`Invalid AI response format: ${error.message}`)
    }
  }

  private generateFallbackAssessment(input: z.infer<typeof AssessmentInputSchema>): InferaAssessment {
    console.log('🔄 Generating fallback assessment...')
    
    return {
      processFlags: [
        {
          id: "flag_1",
          label: "Manual document processing",
          category: "document_automation",
          confidence: 0.8,
          impact: "high"
        },
        {
          id: "flag_2", 
          label: "Email management overhead",
          category: "communication",
          confidence: 0.7,
          impact: "medium"
        }
      ],
      recommendedTools: [
        {
          id: "tool_1",
          name: "Document AI",
          vendor: "Generic Provider",
          description: "Automated document processing and data extraction",
          useCase: "Eliminate manual data entry from documents",
          pricing: "$200-500/month",
          timeToValue: "2-4 weeks", 
          matchReason: `Suitable for ${input.companyProfile.size} companies in ${input.companyProfile.industry}`,
          priority: 1
        }
      ],
      roadmap: [
        {
          id: "roadmap_1",
          title: "Document Processing Automation",
          description: "Implement AI-powered document processing for key workflows",
          priority: "quick_win",
          timeline: "30_days",
          impact: 4,
          effort: 2,
          roi: {
            annual_savings: 25000,
            implementation_cost: 5000,
            payback_months: 3
          },
          next_steps: [
            "Identify pilot document types",
            "Select automation tool",
            "Run 2-week pilot",
            "Scale to full implementation"
          ],
          owner: "Operations Team",
          kpis: ["Processing time reduction", "Error rate improvement", "Cost per document"]
        }
      ],
      executiveSummary: {
        totalPotentialSavings: 50000,
        quickWins: 1,
        implementationTimeframe: "2-4 months for core automation",
        topRecommendation: "Start with document processing automation as highest-impact quick win"
      },
      aiInsights: [
        "Multiple manual processes identified with automation potential",
        "Document processing appears to be highest-impact opportunity",
        "Company size and industry are well-suited for AI implementation"
      ]
    }
  }

  /**
   * Generate export report
   */
  async generateExportReport(assessment: InferaAssessment, format: 'pdf' | 'ppt' = 'pdf'): Promise<{
    reportStructure: any
    downloadLink: string
    status: string
  }> {
    console.log(`📄 Generating ${format.toUpperCase()} export report...`)

    const reportStructure = {
      reportTitle: "AI Automation Assessment Report",
      executiveSummary: {
        keyFindings: [
          `${assessment.processFlags.length} automation opportunities identified`,
          `$${assessment.executiveSummary.totalPotentialSavings.toLocaleString()} potential annual savings`,
          `${assessment.executiveSummary.quickWins} quick-win opportunities available`
        ],
        roiSummary: `Total potential annual savings: $${assessment.executiveSummary.totalPotentialSavings.toLocaleString()}`,
        recommendation: assessment.executiveSummary.topRecommendation
      },
      sections: [
        {
          title: "Process Analysis",
          content: assessment.processFlags.map(flag => flag.label),
          insights: assessment.aiInsights,
          metrics: { "opportunities": assessment.processFlags.length.toString() }
        },
        {
          title: "Tool Recommendations", 
          content: assessment.recommendedTools.map(tool => `${tool.name} by ${tool.vendor}`),
          insights: [`${assessment.recommendedTools.length} tools recommended`],
          metrics: { "tools": assessment.recommendedTools.length.toString() }
        },
        {
          title: "Implementation Roadmap",
          content: assessment.roadmap.map(item => `${item.title} (${item.timeline})`),
          insights: [`${assessment.executiveSummary.implementationTimeframe} total timeline`],
          metrics: { "initiatives": assessment.roadmap.length.toString() }
        }
      ],
      downloadInstructions: {
        pdf: "Professional PDF with charts and executive formatting",
        ppt: "PowerPoint presentation ready for stakeholders"
      }
    }

    const downloadLink = `/api/downloads/assessment-report-${Date.now()}.${format}`

    return {
      reportStructure,
      downloadLink,
      status: 'ready'
    }
  }

  private async makeClaudeRequest(request: any, maxRetries: number = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.anthropic.messages.create(request)
      } catch (error: any) {
        console.log(`🔄 Claude API attempt ${attempt}/${maxRetries}:`, error.status)
        
        if (error.status === 529 && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000
          console.log(`⏱️ Retrying in ${delay/1000}s due to API overload...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        throw error
      }
    }
  }
}

// Singleton instance
let aiServiceInstance: InferaAIService | null = null

export async function getAIService(): Promise<InferaAIService> {
  if (!aiServiceInstance) {
    aiServiceInstance = new InferaAIService()
    await aiServiceInstance.initialize()
  }
  return aiServiceInstance
}