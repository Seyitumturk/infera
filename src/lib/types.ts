import { z } from 'zod'

// Core types for solutions and tools
export interface Solution {
  solution_id: string
  name: string
  category: string
  description: string
  pain_points: string[]
  tools_used: string[]
  implementation: {
    timeline_weeks: { min: number; max: number }
    setup_cost_usd: { low: number; high: number }
    monthly_cost_usd: { low: number; high: number }
    technical_complexity: 'low' | 'medium' | 'high'
    team_hours_required: number
  }
  results: {
    roi_percentage?: number | null
    time_saved_hours_weekly?: number | null
    cost_reduction_percentage?: number | null
    other_metrics?: string
  }
  real_example: {
    agency_name: string
    client_industry: string
    specific_outcome: string
  }
}

export interface Tool {
  vendor_name: string
  product_name: string
  homepage_url: string
  one_liner: string
  primary_use_cases: string[]
  ideal_customer: {
    company_size: string[]
    verticals: string[]
  }
  capabilities: string[]
  integrations: string[]
  security_compliance: string[]
  deployment: string[]
  data_residency: string[]
  pricing_model: string
  pricing_band_usd_per_month: { low: number | null; high: number | null }
  time_to_value_weeks: { low: number; high: number }
  limitations: string[]
  roi_evidence: Array<{ claim: string; source_url?: string }>
  regions_languages: string[]
  confidence: 'Low' | 'Medium' | 'High'
}

// User input schemas
export const CompanyProfileSchema = z.object({
  industry: z.string().min(1),
  size: z.enum(['startup', 'smb', 'midmarket', 'enterprise']),
  systems: z.array(z.string()).optional(),
  budget_range: z.enum(['<10k', '10k-50k', '50k-200k', '200k+']).optional(),
})

export const ProcessQuestionSchema = z.object({
  category: z.string(),
  question: z.string(),
  answer: z.union([z.string(), z.array(z.string()), z.boolean()]),
  metrics: z.record(z.union([z.number(), z.string()])).optional(),
})

export const IntakeSessionSchema = z.object({
  company_profile: CompanyProfileSchema,
  process_answers: z.array(ProcessQuestionSchema),
  custom_problem: z.string().optional(),
})

// Output types
export interface ProcessFlag {
  id: string
  label: string
  category: string
  confidence: number
  editable: boolean
}

export interface SafeMetric {
  id: string
  label: string
  value: string
  unit?: string
  editable: boolean
}

export interface MatchedUseCase {
  solution_id: string
  match_score: number
  reasoning: string
  solution: Solution
  recommended_tools: Tool[]
}

export interface ROICalculation {
  labor_savings: {
    items_per_month: number
    minutes_per_item: number
    automation_percentage: number
    loaded_cost_per_hour: number
    annual_savings: number
  }
  error_reduction: {
    current_error_cost: number
    reduction_percentage: number
    annual_savings: number
  }
  revenue_impact?: {
    uplift_percentage: number
    affected_revenue: number
    margin: number
    annual_impact: number
  }
  implementation_cost: {
    tool_cost_annual: number
    setup_cost: number
    ongoing_cost: number
    total_year_one: number
  }
  net_roi: {
    total_savings: number
    total_cost: number
    net_benefit: number
    roi_percentage: number
    payback_months: number
  }
}

export interface RoadmapItem {
  id: string
  title: string
  description: string
  priority: 'quick_win' | 'high' | 'medium' | 'low'
  impact: 1 | 2 | 3 | 4 | 5
  effort: 1 | 2 | 3 | 4 | 5
  risk: 1 | 2 | 3 | 4 | 5
  timeline: '30_days' | '60_days' | '90_days' | 'future'
  roi_calculation: ROICalculation
  solution: Solution
  recommended_approach: 'tool' | 'build' | 'hybrid'
  next_steps: string[]
  owner: string
  kpis: string[]
}

export interface InferenceSession {
  id: string
  created_at: string
  company_profile: z.infer<typeof CompanyProfileSchema>
  process_flags: ProcessFlag[]
  safe_metrics: SafeMetric[]
  matched_use_cases: MatchedUseCase[]
  roadmap: RoadmapItem[]
  status: 'intake' | 'processing' | 'complete'
}

export type CompanyProfile = z.infer<typeof CompanyProfileSchema>
export type ProcessQuestion = z.infer<typeof ProcessQuestionSchema>
export type IntakeSession = z.infer<typeof IntakeSessionSchema>