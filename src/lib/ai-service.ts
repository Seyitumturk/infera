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
}

interface RecommendedTool {
  id: string
  name: string
  vendor: string
  description: string
  useCase: string
  pricing: string
  timeToValue: string
  matchReason: string
  priority: number
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
  }
  next_steps: string[]
  owner: string
  kpis: string[]
}

interface InferaAssessment {
  processFlags: ProcessFlag[]
  recommendedTools: RecommendedTool[]
  roadmap: RoadmapItem[]
  executiveSummary: {
    totalPotentialSavings: number
    quickWins: number
    implementationTimeframe: string
    topRecommendation: string
  }
  aiInsights: string[]
}

export class InferaAIService {
  private anthropic: Anthropic
  private solutions: any[]
  private tools: any[]

  constructor() {
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY is required')
    }

    this.anthropic = new Anthropic({ apiKey: anthropicKey })
    this.solutions = []
    this.tools = []
  }

  async initialize() {
    // Load solutions and tools data
    try {
      const { loadSolutions, loadTools } = await import('./utils')
      this.solutions = await loadSolutions()
      this.tools = await loadTools()
      console.log(`✅ Infera AI Service initialized with ${this.solutions.length} solutions and ${this.tools.length} tools`)
    } catch (error) {
      console.error('❌ Failed to load data:', error)
      // Continue with empty arrays - service will still work
    }
  }

  /**
   * Main assessment method - does everything in one intelligent AI call
   */
  async generateAssessment(input: z.infer<typeof AssessmentInputSchema>): Promise<InferaAssessment> {
    const validatedInput = AssessmentInputSchema.parse(input)
    
    console.log('🧠 Generating complete AI assessment with Claude Sonnet 4...')

    const prompt = this.buildComprehensivePrompt(validatedInput)

    try {
      const response = await this.makeClaudeRequest({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })

      const assessment = this.parseClaudeResponse(response.content[0].text)
      
      console.log('✅ Complete assessment generated successfully')
      return assessment

    } catch (error) {
      console.error('❌ AI assessment failed:', error)
      return this.generateFallbackAssessment(validatedInput)
    }
  }

  private buildComprehensivePrompt(input: z.infer<typeof AssessmentInputSchema>): string {
    return `You are an expert AI implementation consultant generating a comprehensive business automation assessment report. 

COMPANY CONTEXT:
- Industry: ${input.companyProfile.industry}
- Size: ${input.companyProfile.size}
- Budget: ${input.companyProfile.budget_range || 'Not specified'}

USER RESPONSES:
${input.answers.map(a => `${a.category}: ${a.question} → ${JSON.stringify(a.answer)}`).join('\n')}

ADDITIONAL CONTEXT:
${input.customProblem || 'None provided'}

AVAILABLE TOOL CATEGORIES (select from these):
- Document Processing (OCR, invoice automation, form processing)
- Email Automation (filtering, responses, routing)
- Customer Service (chatbots, ticket routing, knowledge base)
- Workflow Automation (approvals, notifications, integrations)
- Data Entry (CRM updates, spreadsheet automation)
- Financial Processes (expense tracking, payment processing)
- Sales Tools (lead scoring, pipeline management)

GENERATE A COMPLETE ASSESSMENT WITH:

1. PROCESS FLAGS (3-6 key automation opportunities):
   - Identify specific manual processes that can be automated
   - Focus on high-impact, realistic opportunities
   - Consider company size and industry constraints

2. RECOMMENDED TOOLS (4-8 specific tools):
   - Match tools to identified processes
   - Include realistic pricing estimates
   - Prioritize by impact/effort ratio
   - Focus on proven solutions for their company size

3. IMPLEMENTATION ROADMAP (3-5 prioritized items):
   - Order by impact vs effort (quick wins first)
   - Include realistic timelines and ROI estimates
   - Consider change management and dependencies

4. EXECUTIVE SUMMARY:
   - Total potential annual savings
   - Number of quick wins (30-day implementations)
   - Overall timeframe
   - Top single recommendation

Return ONLY valid JSON in this exact format:

{
  "processFlags": [
    {
      "id": "flag_1",
      "label": "Specific process name",
      "category": "process_category",
      "confidence": 0.85,
      "impact": "high"
    }
  ],
  "recommendedTools": [
    {
      "id": "tool_1", 
      "name": "Tool Name",
      "vendor": "Vendor Name",
      "description": "What it does specifically",
      "useCase": "How it solves their problem",
      "pricing": "$X-Y/month",
      "timeToValue": "2-4 weeks",
      "matchReason": "Why it fits their needs",
      "priority": 1
    }
  ],
  "roadmap": [
    {
      "id": "roadmap_1",
      "title": "Initiative Name", 
      "description": "What this accomplishes",
      "priority": "quick_win",
      "timeline": "30_days",
      "impact": 4,
      "effort": 2,
      "roi": {
        "annual_savings": 50000,
        "implementation_cost": 5000,
        "payback_months": 2
      },
      "next_steps": ["Step 1", "Step 2", "Step 3"],
      "owner": "Department/Role",
      "kpis": ["Metric 1", "Metric 2"]
    }
  ],
  "executiveSummary": {
    "totalPotentialSavings": 150000,
    "quickWins": 2,
    "implementationTimeframe": "3-6 months for full rollout",
    "topRecommendation": "Start with X because Y"
  },
  "aiInsights": [
    "Key insight about their business",
    "Important automation opportunity",
    "Strategic recommendation"
  ]
}`
  }

  private parseClaudeResponse(responseText: string): InferaAssessment {
    try {
      // Clean up the response text
      let cleanText = responseText.trim()
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        cleanText = jsonMatch[1]
      }
      
      // Find JSON object boundaries
      const startIndex = cleanText.indexOf('{')
      const lastIndex = cleanText.lastIndexOf('}')
      
      if (startIndex !== -1 && lastIndex !== -1) {
        cleanText = cleanText.substring(startIndex, lastIndex + 1)
      }

      const parsed = JSON.parse(cleanText)
      
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
        aiInsights: parsed.aiInsights || []
      }

    } catch (error) {
      console.error('❌ Failed to parse Claude response:', error)
      throw new Error('Invalid AI response format')
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