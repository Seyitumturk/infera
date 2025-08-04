import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Solution, Tool } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values with proper locale formatting
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Calculate time periods in human readable format
 */
export function formatTimeRange(minWeeks: number, maxWeeks: number): string {
  if (minWeeks === maxWeeks) {
    return `${minWeeks} week${minWeeks > 1 ? 's' : ''}`
  }
  return `${minWeeks}-${maxWeeks} weeks`
}

/**
 * Get color for priority levels
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'quick_win':
      return 'text-accent2 bg-accent2/10 border-accent2/20'
    case 'high':
      return 'text-accent bg-accent/10 border-accent/20'
    case 'medium':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    case 'low':
      return 'text-muted bg-muted/10 border-muted/20'
    default:
      return 'text-muted bg-muted/10 border-muted/20'
  }
}

/**
 * Get color for complexity levels
 */
export function getComplexityColor(complexity: string): string {
  switch (complexity) {
    case 'low':
      return 'text-accent2'
    case 'medium':
      return 'text-yellow-400'
    case 'high':
      return 'text-danger'
    default:
      return 'text-muted'
  }
}

/**
 * Get progress color based on score (0-1)
 */
export function getProgressColor(score: number): string {
  if (score >= 0.8) return 'bg-accent2'
  if (score >= 0.6) return 'bg-accent'
  if (score >= 0.4) return 'bg-yellow-400'
  return 'bg-danger'
}

/**
 * Load solutions data
 */
export async function loadSolutions(): Promise<Solution[]> {
  try {
    // Check if we're in a server environment (API route)
    if (typeof window === 'undefined') {
      // Server-side: import directly
      const solutionsModule = await import('../solutions.json')
      return solutionsModule.default as Solution[]
    } else {
      // Client-side: use fetch
      const response = await fetch('/api/solutions')
      if (!response.ok) {
        throw new Error(`Failed to fetch solutions: ${response.statusText}`)
      }
      return await response.json()
    }
  } catch (error) {
    console.error('Failed to load solutions:', error)
    // Fallback to local import
    try {
      const solutionsModule = await import('../solutions.json')
      return solutionsModule.default as Solution[]
    } catch (importError) {
      console.error('Failed to import solutions:', importError)
      return []
    }
  }
}

/**
 * Load tools data
 */
export async function loadTools(): Promise<Tool[]> {
  try {
    // Check if we're in a server environment (API route)
    if (typeof window === 'undefined') {
      // Server-side: import directly
      const toolsModule = await import('../tools.json')
      return toolsModule.default as Tool[]
    } else {
      // Client-side: use fetch
      const response = await fetch('/api/tools')
      if (!response.ok) {
        throw new Error(`Failed to fetch tools: ${response.statusText}`)
      }
      return await response.json()
    }
  } catch (error) {
    console.error('Failed to load tools:', error)
    // Fallback to local import
    try {
      const toolsModule = await import('../tools.json')
      return toolsModule.default as Tool[]
    } catch (importError) {
      console.error('Failed to import tools:', importError)
      return []
    }
  }
}

/**
 * Debounce function for search and input handling
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Generate unique IDs
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Calculate ROI badge color
 */
export function getROIBadgeColor(roiPercentage: number): string {
  if (roiPercentage >= 200) return 'bg-accent2/20 text-accent2 border-accent2/30'
  if (roiPercentage >= 100) return 'bg-accent/20 text-accent border-accent/30'
  if (roiPercentage >= 50) return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30'
  if (roiPercentage >= 0) return 'bg-orange-400/20 text-orange-400 border-orange-400/30'
  return 'bg-danger/20 text-danger border-danger/30'
}

/**
 * Calculate payback period badge color
 */
export function getPaybackBadgeColor(months: number): string {
  if (months <= 3) return 'bg-accent2/20 text-accent2 border-accent2/30'
  if (months <= 6) return 'bg-accent/20 text-accent border-accent/30'
  if (months <= 12) return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30'
  return 'bg-orange-400/20 text-orange-400 border-orange-400/30'
}

/**
 * Format timeline badge
 */
export function formatTimelineBadge(timeline: string): { label: string; color: string } {
  switch (timeline) {
    case '30_days':
      return { label: '30 Days', color: 'bg-accent2/20 text-accent2 border-accent2/30' }
    case '60_days':
      return { label: '60 Days', color: 'bg-accent/20 text-accent border-accent/30' }
    case '90_days':
      return { label: '90 Days', color: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' }
    case 'future':
      return { label: 'Future', color: 'bg-muted/20 text-muted border-muted/30' }
    default:
      return { label: timeline, color: 'bg-muted/20 text-muted border-muted/30' }
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength).trim() + '...'
}

/**
 * Calculate confidence color
 */
export function getConfidenceColor(confidence: string): string {
  switch (confidence.toLowerCase()) {
    case 'high':
      return 'text-accent2'
    case 'medium':
      return 'text-yellow-400'
    case 'low':
      return 'text-orange-400'
    default:
      return 'text-muted'
  }
}

/**
 * Format deployment badge
 */
export function formatDeploymentBadge(deployment: string[]): { label: string; color: string } {
  if (deployment.includes('saas')) {
    return { label: 'SaaS', color: 'bg-accent/20 text-accent border-accent/30' }
  }
  if (deployment.includes('on_prem')) {
    return { label: 'On-Premise', color: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' }
  }
  if (deployment.includes('hybrid')) {
    return { label: 'Hybrid', color: 'bg-accent2/20 text-accent2 border-accent2/30' }
  }
  return { label: 'Various', color: 'bg-muted/20 text-muted border-muted/30' }
}

/**
 * Parse pricing display
 */
export function formatPricingDisplay(
  pricingModel: string,
  pricingBand: { low: number | null; high: number | null }
): string {
  if (pricingModel === 'contact_sales') {
    return 'Contact Sales'
  }
  
  if (pricingBand.low === null && pricingBand.high === null) {
    return 'Custom Pricing'
  }
  
  if (pricingBand.low && pricingBand.high) {
    return `${formatCurrency(pricingBand.low)} - ${formatCurrency(pricingBand.high)}/month`
  }
  
  if (pricingBand.low) {
    return `From ${formatCurrency(pricingBand.low)}/month`
  }
  
  if (pricingBand.high) {
    return `Up to ${formatCurrency(pricingBand.high)}/month`
  }
  
  return 'Pricing Available'
}

/**
 * Calculate effort score display
 */
export function getEffortDisplay(effort: number): { label: string; color: string } {
  switch (effort) {
    case 1:
      return { label: 'Minimal', color: 'text-accent2' }
    case 2:
      return { label: 'Low', color: 'text-accent2' }
    case 3:
      return { label: 'Medium', color: 'text-yellow-400' }
    case 4:
      return { label: 'High', color: 'text-orange-400' }
    case 5:
      return { label: 'Very High', color: 'text-danger' }
    default:
      return { label: 'Unknown', color: 'text-muted' }
  }
}

/**
 * Calculate impact score display
 */
export function getImpactDisplay(impact: number): { label: string; color: string } {
  switch (impact) {
    case 5:
      return { label: 'Very High', color: 'text-accent2' }
    case 4:
      return { label: 'High', color: 'text-accent' }
    case 3:
      return { label: 'Medium', color: 'text-yellow-400' }
    case 2:
      return { label: 'Low', color: 'text-orange-400' }
    case 1:
      return { label: 'Minimal', color: 'text-muted' }
    default:
      return { label: 'Unknown', color: 'text-muted' }
  }
}