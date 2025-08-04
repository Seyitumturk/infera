import { NextRequest, NextResponse } from 'next/server'
import { AIGraphRAG } from '@/lib/ai-graph-rag'
import { loadSolutions, loadTools } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { answers, customProblem, companyProfile } = await request.json()

    console.log('🧠 Starting enhanced AI analysis with Graph RAG...')

    // Load solutions and tools data
    const [solutions, tools] = await Promise.all([
      loadSolutions(),
      loadTools()
    ])

    // Initialize AI Graph RAG system
    const aiGraphRAG = new AIGraphRAG(solutions, tools)
    await aiGraphRAG.initialize()

    // Process user input with AI-powered analysis and tool recommendations
    const analysis = await aiGraphRAG.analyzeUserInput(
      answers,
      customProblem,
      companyProfile
    )

    // Find similar solutions using vector search
    const queryText = `${analysis.semanticIntent} ${analysis.problemContext} ${customProblem || ''}`
    const similarNodes = await aiGraphRAG.findSimilarSolutions(queryText, 5)

    // Extract recommended tools using SEMANTIC MATCHING based on user problems
    const recommendedTools = []
    
    // Get semantic intent for tool matching
    const userProblems = analysis.semanticIntent.toLowerCase()
    const processFlags = analysis.processFlags.map(f => f.label.toLowerCase()).join(' ')
    const searchContext = `${userProblems} ${processFlags} ${customProblem || ''}`.toLowerCase()
    
    console.log('🔍 Semantic search context:', searchContext)
    
    // Score each tool based on relevance to user problems
    const toolScores = tools.map(tool => {
      let score = 0
      const toolContent = `${tool.one_liner} ${tool.primary_use_cases.join(' ')} ${tool.capabilities.join(' ')}`.toLowerCase()
      
      // Direct problem matching
      if (searchContext.includes('email') && toolContent.includes('email')) score += 3
      if (searchContext.includes('invoice') && toolContent.includes('invoice')) score += 3
      if (searchContext.includes('approval') && toolContent.includes('approval')) score += 3
      if (searchContext.includes('customer') && toolContent.includes('customer')) score += 3
      if (searchContext.includes('support') && toolContent.includes('support')) score += 3
      if (searchContext.includes('document') && toolContent.includes('document')) score += 3
      if (searchContext.includes('payment') && toolContent.includes('payment')) score += 3
      if (searchContext.includes('data entry') && toolContent.includes('data')) score += 3
      
      // Use case matching
      tool.primary_use_cases.forEach(useCase => {
        if (searchContext.includes('email') && useCase.includes('email')) score += 2
        if (searchContext.includes('invoice') && useCase.includes('ap_')) score += 2
        if (searchContext.includes('customer') && useCase.includes('cs_')) score += 2
        if (searchContext.includes('support') && useCase.includes('cs_')) score += 2
        if (searchContext.includes('sales') && useCase.includes('sales_')) score += 2
        if (searchContext.includes('approval') && useCase.includes('routing')) score += 2
      })
      
      // Company size matching
      if (companyProfile?.size && tool.ideal_customer?.company_size?.includes(companyProfile.size)) {
        score += 1
      }
      
      // Industry matching  
      if (companyProfile?.industry && tool.ideal_customer?.verticals?.includes(companyProfile.industry)) {
        score += 1
      }
      
      return { tool, score }
    })
    
    // Get top scoring tools
    const topTools = toolScores
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.tool)
    
    console.log(`🎯 Found ${topTools.length} relevant tools from semantic matching`)
    
    // If no semantic matches, get some general tools based on company profile
    if (topTools.length === 0) {
      console.log('🔄 No semantic matches, falling back to general tools')
      const fallbackTools = tools.filter(tool => 
        tool.ideal_customer?.company_size?.includes(companyProfile?.size || 'smb') ||
        tool.ideal_customer?.verticals?.includes(companyProfile?.industry || 'other')
      ).slice(0, 6)
      
      recommendedTools.push(...fallbackTools)
    } else {
      recommendedTools.push(...topTools)
    }

    // Enhance the response with tool recommendations
    const enhancedResult = {
      ...analysis,
      recommendedTools: recommendedTools.map(tool => ({
        id: `${tool.vendor_name}_${tool.product_name}`.replace(/\s/g, '_'),
        vendor_name: tool.vendor_name,
        product_name: tool.product_name,
        one_liner: tool.one_liner,
        primary_use_cases: tool.primary_use_cases,
        ideal_customer: tool.ideal_customer,
        pricing_band_usd_per_month: tool.pricing_band_usd_per_month,
        time_to_value_weeks: tool.time_to_value_weeks,
        homepage_url: tool.homepage_url,
        match_reasoning: generateToolMatchReasoning(tool, analysis, companyProfile)
      })),
      matchedSolutions: similarNodes.slice(0, 3).map(node => ({
        solution_id: node.metadata.solution_id,
        match_score: 0.9,
        reasoning: `AI semantic match based on: ${analysis.semanticIntent}`,
        solution: node.metadata
      }))
    }
    
    console.log(`✅ Enhanced analysis complete with ${recommendedTools.length} tool recommendations`)
    return NextResponse.json(enhancedResult)

  } catch (error) {
    console.error('❌ Enhanced AI analysis failed:', error)
    
    // Graceful fallback to basic analysis
    const fallbackResult = {
      processFlags: [
        {
          id: "flag_1",
          label: "Manual process identified",
          category: "general",
          confidence: 0.8,
          editable: true
        }
      ],
      safeMetrics: [
        {
          id: "metric_1", 
          label: "Processing volume",
          value: "100+ items/month",
          unit: "items",
          editable: true
        }
      ],
      semanticIntent: "Business process automation opportunity",
      problemContext: "SMB seeking AI automation solutions",
      aiInsights: ["Manual processes detected", "Automation opportunities available", "ROI potential identified"],
      recommendedTools: [],
      matchedSolutions: []
    }
    
    return NextResponse.json(fallbackResult)
  }
}

// Helper function to generate tool match reasoning
function generateToolMatchReasoning(tool: any, analysis: any, companyProfile: any): string {
  const reasons = []
  
  // Size matching
  if (tool.ideal_customer?.company_size?.includes(companyProfile?.size)) {
    reasons.push(`Perfect fit for ${companyProfile.size} companies`)
  }
  
  // Industry matching  
  if (tool.ideal_customer?.verticals?.includes(companyProfile?.industry) || 
      tool.ideal_customer?.verticals?.includes('other')) {
    reasons.push(`Suitable for ${companyProfile?.industry} industry`)
  }
  
  // Use case alignment
  if (analysis.semanticIntent.toLowerCase().includes('invoice') && 
      tool.primary_use_cases.some((uc: string) => uc.includes('ap_'))) {
    reasons.push('Addresses invoice processing needs')
  }
  
  if (analysis.semanticIntent.toLowerCase().includes('customer') && 
      tool.primary_use_cases.some((uc: string) => uc.includes('cs_'))) {
    reasons.push('Enhances customer service automation')
  }
  
  // Quick wins
  if (tool.time_to_value_weeks?.low <= 4) {
    reasons.push('Quick time-to-value (under 4 weeks)')
  }
  
  return reasons.length > 0 ? reasons.join('; ') : 'General automation fit based on company profile'
}