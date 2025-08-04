import { NextResponse } from 'next/server'
import solutionsData from '../../../solutions.json'

export async function GET() {
  try {
    return NextResponse.json(solutionsData)
  } catch (error) {
    console.error('Error loading solutions:', error)
    return NextResponse.json(
      { error: 'Failed to load solutions data' },
      { status: 500 }
    )
  }
}