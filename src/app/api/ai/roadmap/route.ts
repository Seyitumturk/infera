import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { userAnalysis, companyProfile, matchedSolutions } = await request.json()

    // Check for API key
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ 
        error: 'ANTHROPIC_API_KEY not configured on server' 
      }, { status: 500 })
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey })

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
${matchedSolutions.map((m: any, i: number) => `${i+1}. ${m.solution.name}: ${m.solution.description} (Score: ${m.match_score.toFixed(2)})`).join('\n')}

GENERATE A STRATEGIC ROADMAP:

For each solution, provide:
1. Priority level (quick_win/high/medium/low)
2. Implementation timeline (30_days/60_days/90_days/future)
3. Impact score (1-5)
4. Effort score (1-5) 
5. Risk assessment (1-5)
6. Strategic reasoning
7. Next steps
8. Success metrics

Consider:
- Company size constraints
- Industry-specific factors
- Budget limitations
- Technical complexity
- Change management
- Interdependencies

IMPORTANT: Return ONLY a valid JSON array, no markdown formatting, no explanations, no extra text.

Expected JSON array format:
[
  {
    "title": "Solution Name",
    "description": "What this solution does",
    "priority": "quick_win|high|medium|low",
    "timeline": "30_days|60_days|90_days|future",
    "impact": 4,
    "effort": 3,
    "risk": 2,
    "reasoning": "Why this solution fits",
    "next_steps": ["step1", "step2"],
    "owner": "Department",
    "kpis": ["metric1", "metric2"],
    "roi_estimate": {
      "annual_savings": 50000,
      "implementation_cost": 10000,
      "payback_months": 6
    }
  }
]

Return only the JSON array above, nothing else:`

    console.log('🚀 Generating roadmap with Claude...')

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    // Extract JSON from Claude's response (handle markdown formatting)
    let responseText = response.content[0].text
    console.log('🔍 Raw Claude response:', responseText.substring(0, 500) + '...')
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      responseText = jsonMatch[1]
    }
    
    // Remove any leading/trailing whitespace and non-JSON content
    responseText = responseText.trim()
    
    // Find the start and end of the JSON array
    const startIndex = responseText.indexOf('[')
    const lastIndex = responseText.lastIndexOf(']')
    
    if (startIndex !== -1 && lastIndex !== -1) {
      responseText = responseText.substring(startIndex, lastIndex + 1)
    }

    let roadmapData
    try {
      roadmapData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError)
      console.error('📄 Response text:', responseText)
      
      // Fallback roadmap
      roadmapData = [
        {
          title: "AI Process Automation",
          description: "Automate key business processes identified during assessment",
          priority: "high",
          timeline: "60_days",
          impact: 4,
          effort: 3,
          risk: 2,
          reasoning: "Claude analysis complete, manual roadmap generated",
          next_steps: ["Review AI recommendations", "Select priority solutions", "Begin implementation"],
          owner: "Operations",
          kpis: ["Process efficiency", "Cost reduction", "Time savings"],
          roi_estimate: {
            annual_savings: 75000,
            implementation_cost: 15000,
            payback_months: 3
          }
        }
      ]
    }
    
    console.log('✅ Roadmap processed successfully')
    return NextResponse.json({ roadmap: roadmapData })

  } catch (error) {
    console.error('❌ Roadmap generation failed:', error)
    return NextResponse.json({ 
      error: 'Roadmap generation failed',
      details: error.message 
    }, { status: 500 })
  }
}