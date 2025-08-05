import { NextRequest, NextResponse } from 'next/server'
import { getAIService } from '@/lib/ai-service'

/**
 * Unified Infera API Endpoint
 * Handles all AI assessment operations through one clean interface
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    console.log(`🚀 Infera API called with action: ${action}`)

    const aiService = await getAIService()

    switch (action) {
      case 'assessment':
        return await handleAssessment(aiService, data)
      
      case 'export':
        return await handleExport(aiService, data)
      
      case 'chat':
        return await handleChat(aiService, data)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: assessment, export, or chat' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Infera API error:', error)
    return NextResponse.json(
      { 
        error: 'Service temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleAssessment(aiService: any, data: any) {
  try {
    const { companyProfile, answers, customProblem } = data

    if (!companyProfile || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: companyProfile, answers' },
        { status: 400 }
      )
    }

    const assessment = await aiService.generateAssessment({
      companyProfile,
      answers,
      customProblem
    })

    console.log('✅ Assessment generated successfully')
    return NextResponse.json({
      success: true,
      data: assessment
    })

  } catch (error) {
    console.error('❌ Assessment generation failed:', error)
    return NextResponse.json(
      { error: 'Assessment generation failed', details: error.message },
      { status: 500 }
    )
  }
}

async function handleExport(aiService: any, data: any) {
  try {
    const { assessment, format = 'pdf' } = data

    if (!assessment) {
      return NextResponse.json(
        { error: 'Missing assessment data' },
        { status: 400 }
      )
    }

    const exportResult = await aiService.generateExportReport(assessment, format)

    console.log(`✅ ${format.toUpperCase()} export generated successfully`)
    return NextResponse.json({
      success: true,
      data: exportResult
    })

  } catch (error) {
    console.error('❌ Export generation failed:', error)
    return NextResponse.json(
      { error: 'Export generation failed', details: error.message },
      { status: 500 }
    )
  }
}

async function handleChat(aiService: any, data: any) {
  try {
    const { messages, extractBusinessProfile = false } = data

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Simple chat functionality - can be enhanced later
    const anthropic = aiService.anthropic

    const systemPrompt = extractBusinessProfile ? 
      `You are a focused AI business consultant. Your goal is FAST data collection with skip options.

STYLE: Conversational, concise, efficient. Always offer skip options.

COLLECT THESE ESSENTIALS (in order):
1. Industry & business type
2. Company size (employees)
3. Biggest daily frustration/time drain
4. Monthly volume (if relevant)
5. Current tools/systems

CONVERSATION RULES:
- Keep responses SHORT (2-3 sentences max)
- Always offer "skip" or "I'll handle this later" options
- Ask ONE thing at a time
- Use bullet points for options when helpful
- When you have enough basic info, offer to "generate your AI roadmap now"

NEVER dump multiple questions at once. Keep it snappy and user-friendly.` :
      `You are a helpful AI assistant for business automation. Keep responses brief and actionable.`

    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\nConversation history:\n${messages.map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`).join('\n')}`
        }
      ],
      temperature: 0.7,
    })

    const assistantMessage = completion.content[0]?.text || 'I apologize, but I could not generate a response. Please try again.'

    // Extract business profile if requested
    let extractedProfile = null
    if (extractBusinessProfile) {
      try {
        const extractionCompletion = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `Extract comprehensive business profile information from this conversation. Return ONLY a valid JSON object with this structure:
{
  "industry": "Technology" | "Healthcare" | "Finance" | "Retail" | "Manufacturing" | "Professional Services" | "Education" | "Other" | null,
  "size": "Startup (1-10)" | "Small (11-50)" | "Medium (51-500)" | "Enterprise (500+)" | null,
  "revenue": "<1M" | "1M-10M" | "10M-100M" | "100M+" | null,
  "geography": "Local" | "Regional" | "National" | "Global" | null,
  "challenges": ["challenge1", "challenge2"] or null,
  "painPoints": ["pain1", "pain2"] or null,
  "currentTools": ["tool1", "tool2"] or null,
  "processes": ["process1", "process2"] or null,
  "volumes": {"type": "volume_description"} or null,
  "confidence": 0.0 to 1.0,
  "readiness": "low" | "medium" | "high" | null
}

Conversation:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\nAssistant: ${assistantMessage}\n\nExtract only explicitly mentioned information. Set confidence based on completeness.`
            }
          ],
          temperature: 0,
        })

        const extractionResult = extractionCompletion.content[0]?.text
        if (extractionResult) {
          try {
            extractedProfile = JSON.parse(extractionResult)
          } catch (e) {
            console.log('Failed to parse extraction result:', extractionResult)
          }
        }
      } catch (error) {
        console.error('Profile extraction failed:', error)
      }
    }

    console.log('✅ Chat response generated')
    return NextResponse.json({
      success: true,
      data: {
        message: assistantMessage,
        extractedProfile
      }
    })

  } catch (error) {
    console.error('❌ Chat failed:', error)
    return NextResponse.json(
      { 
        error: 'Chat processing failed',
        message: 'I apologize, but I encountered an error. Please try again in a moment.'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Infera AI Assessment API',
    version: '2.0',
    endpoints: {
      'POST /api/infera': {
        'assessment': 'Generate complete AI assessment',
        'export': 'Generate PDF/PPT export',
        'chat': 'Interactive business consultation'
      }
    }
  })
}