import { NextResponse } from 'next/server'
import toolsData from '../../../tools.json'

export async function GET() {
  try {
    return NextResponse.json(toolsData)
  } catch (error) {
    console.error('Error loading tools:', error)
    return NextResponse.json(
      { error: 'Failed to load tools data' },
      { status: 500 }
    )
  }
}