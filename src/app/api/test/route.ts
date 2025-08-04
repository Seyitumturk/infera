import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'OK',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    apiKeys: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY
    }
  })
}