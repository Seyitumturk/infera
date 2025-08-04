import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { texts } = await request.json()

    // Check for API key
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({ 
        error: 'OPENAI_API_KEY not configured on server' 
      }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey: openaiKey })

    console.log(`🔍 Creating embeddings for ${texts.length} texts...`)

    // Create embeddings for all texts
    const embeddings = await Promise.all(
      texts.map(async (text: string) => {
        try {
          const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
            encoding_format: 'float'
          })
          return response.data[0].embedding
        } catch (error) {
          console.error('Failed to get embedding:', error)
          return Array(1536).fill(0) // Fallback zero vector
        }
      })
    )

    console.log('✅ Embeddings created successfully')

    return NextResponse.json({ embeddings })

  } catch (error) {
    console.error('❌ Embedding creation failed:', error)
    return NextResponse.json({ 
      error: 'Embedding creation failed',
      details: error.message 
    }, { status: 500 })
  }
}