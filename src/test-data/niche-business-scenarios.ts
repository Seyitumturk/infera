/**
 * Niche Small Business Test Scenarios for AI Roadmap Generation
 * These are very specific, realistic test cases designed to test the AI's ability
 * to identify automation opportunities in specialized small business contexts.
 */

export interface TestScenario {
  id: string
  businessName: string
  companyProfile: {
    industry: string
    size: string
    budget_range?: string
  }
  scenario: string
  answers: Record<string, any>
  expectedOutcomes: {
    processFlags: string[]
    toolCategories: string[]
    roiRange: {
      min: number
      max: number
    }
    timeToValue: string
    priorityItems: string[]
  }
}

export const nicheBusinessScenarios: TestScenario[] = [
  {
    id: "specialty_coffee_roastery",
    businessName: "Mountain Peak Coffee Roasters",
    companyProfile: {
      industry: "Retail",
      size: "Startup (1-10)",
      budget_range: "5K-25K"
    },
    scenario: "Small-batch coffee roastery with manual roasting logs, inconsistent batch tracking, and wholesale order chaos",
    answers: {
      business_priorities: "Maintain roasting consistency, track batch quality, automate wholesale order management",
      most_urgent: "Our roasting profiles are inconsistent because we track everything on paper - customers notice quality variations",
      repetitive_tasks: "Recording roast temperatures every 30 seconds, calculating wholesale pricing for each customer, tracking bean inventory across 15 origins",
      task_frequency: "Roast logging: 3 hours daily. Pricing calculations: 2 hours weekly. Inventory tracking: 1 hour daily",
      bottlenecks: "Paper roast logs get lost, wholesale customers have different pricing tiers, running out of popular beans mid-week",
      bottleneck_impact: "Inconsistent product quality hurts brand reputation, pricing errors lose money, stockouts disappoint wholesale clients",
      data_types: ["Inventory levels", "Sales transactions", "Product/service data"],
      data_storage: "Mainly paper/offline",
      data_accessibility: "Very difficult to access or incomplete",
      automation_experience: "Only use Square for retail sales",
      automation_results: "Square handles retail well but we have no visibility into wholesale or production data",
      team_comfort: "Comfortable with training",
      training_investment: "Limited budget for training"
    },
    expectedOutcomes: {
      processFlags: ["roasting_profile_tracking", "inventory_management", "wholesale_pricing"],
      toolCategories: ["production_tracking", "inventory_management", "pricing_automation"],
      roiRange: { min: 15000, max: 35000 },
      timeToValue: "30-60 days",
      priorityItems: ["Digital roasting logs", "Automated inventory tracking"]
    }
  },
  {
    id: "pet_grooming_mobile",
    businessName: "Pampered Paws Mobile Grooming",
    companyProfile: {
      industry: "Professional Services",
      size: "Startup (1-10)",
      budget_range: "10K-50K"
    },
    scenario: "Mobile pet grooming service struggling with route optimization, appointment scheduling conflicts, and customer communication",
    answers: {
      business_priorities: "Optimize daily routes, eliminate scheduling conflicts, improve customer communication about arrival times",
      most_urgent: "We're driving 150+ miles daily between appointments - fuel costs are eating our profits alive",
      repetitive_tasks: "Planning routes each morning, calling customers with arrival updates, rescheduling when appointments run long",
      task_frequency: "Route planning: 45 minutes daily. Customer update calls: 1.5 hours daily. Rescheduling calls: 30 minutes when needed",
      bottlenecks: "Appointments run over time, customers not ready when we arrive, traffic delays mess up entire day's schedule",
      bottleneck_impact: "High fuel costs, overtime pay, stressed pets from long waits, angry customers about late arrivals",
      data_types: ["Customer contact information", "Sales transactions"],
      data_storage: "Spreadsheets and shared files",
      data_accessibility: "Mostly accessible but some gaps",
      automation_experience: "Use basic scheduling app but route planning is manual",
      automation_results: "Scheduling app helps book appointments but we still waste hours driving inefficient routes",
      team_comfort: "Comfortable with training",
      training_investment: "Yes, within reason"
    },
    expectedOutcomes: {
      processFlags: ["route_optimization", "appointment_scheduling", "customer_communication"],
      toolCategories: ["route_optimization", "scheduling_automation", "customer_notifications"],
      roiRange: { min: 8000, max: 18000 },
      timeToValue: "30-45 days",
      priorityItems: ["Route optimization", "Automated customer notifications"]
    }
  },
  {
    id: "escape_room_business",
    businessName: "Mystery Manor Escape Rooms",
    companyProfile: {
      industry: "Entertainment",
      size: "Small (11-50)",
      budget_range: "10K-50K"
    },
    scenario: "Escape room business with manual game reset procedures, booking conflicts, and no customer experience tracking",
    answers: {
      business_priorities: "Automate room reset checklists, eliminate double bookings, track customer satisfaction by room",
      most_urgent: "Room resets between groups are inconsistent - we've had groups start games with missing clues or broken props",
      repetitive_tasks: "Manual room reset checklists, calling customers about booking changes, tracking which rooms have technical issues",
      task_frequency: "Room resets: 15 minutes per session x 40 sessions daily. Customer calls: 1 hour daily. Issue tracking: 30 minutes daily",
      bottlenecks: "Staff forget reset steps under pressure, booking system allows double bookings, no way to track room performance",
      bottleneck_impact: "Ruined customer experiences from incomplete resets, lost revenue from booking conflicts, rooms out of service too long",
      data_types: ["Customer contact information", "Sales transactions", "Other business records"],
      data_storage: "Digital systems (CRM/ERP/databases)",
      data_accessibility: "Somewhat difficult to access",
      automation_experience: "Use online booking system but room management is all manual",
      automation_results: "Booking system works for reservations but we have no operational controls or tracking",
      team_comfort: "Very tech-savvy, quick to adopt",
      training_investment: "Yes, whatever it takes"
    },
    expectedOutcomes: {
      processFlags: ["room_reset_automation", "booking_management", "performance_tracking"],
      toolCategories: ["checklist_automation", "booking_systems", "analytics_tracking"],
      roiRange: { min: 12000, max: 25000 },
      timeToValue: "45-60 days",
      priorityItems: ["Digital reset checklists", "Booking conflict prevention"]
    }
  },
  {
    id: "craft_brewery_taproom",
    businessName: "Hoppy Trails Craft Brewery",
    companyProfile: {
      industry: "Retail",
      size: "Small (11-50)",
      budget_range: "25K-100K"
    },
    scenario: "Craft brewery with complex inventory (kegs, cans, growlers), manual production planning, and compliance reporting headaches",
    answers: {
      business_priorities: "Track multi-format inventory, optimize brewing schedules, automate TTB compliance reporting",
      most_urgent: "Our inventory is a nightmare - same beer in kegs, cans, and growlers with different costs and we can't track profitability by format",
      repetitive_tasks: "Manual inventory counts across all formats, calculating brewing schedules based on sales, preparing monthly TTB reports",
      task_frequency: "Inventory: 3 hours weekly. Production planning: 2 hours weekly. TTB reporting: 8 hours monthly",
      bottlenecks: "Inventory counts don't match sales, brewing schedules conflict with equipment availability, TTB reports are error-prone",
      bottleneck_impact: "Can't price products accurately, run out of popular beers, compliance issues could shut us down",
      data_types: ["Inventory levels", "Sales transactions", "Financial records", "Other business records"],
      data_storage: "Mix of digital and paper",
      data_accessibility: "Somewhat difficult to access",
      automation_experience: "Use POS system but production and compliance are manual",
      automation_results: "POS tracks sales but we can't connect it to production costs or compliance needs",
      team_comfort: "Need moderate support",
      training_investment: "Yes, within reason"
    },
    expectedOutcomes: {
      processFlags: ["multi_format_inventory", "production_scheduling", "compliance_automation"],
      toolCategories: ["inventory_management", "production_planning", "compliance_tools"],
      roiRange: { min: 25000, max: 55000 },
      timeToValue: "60-90 days",
      priorityItems: ["Unified inventory tracking", "Automated compliance reporting"]
    }
  },
  {
    id: "wedding_photography",
    businessName: "Eternal Moments Photography",
    companyProfile: {
      industry: "Professional Services",
      size: "Startup (1-10)",
      budget_range: "5K-25K"
    },
    scenario: "Wedding photographer drowning in post-processing, manual client communication, and contract management",
    answers: {
      business_priorities: "Speed up photo editing workflow, automate client communication timelines, streamline contract and payment processes",
      most_urgent: "I'm spending 40+ hours editing each wedding - I can only book 2 weddings per month because of editing bottleneck",
      repetitive_tasks: "Culling and editing 3000+ photos per wedding, sending timeline updates to clients, chasing contract signatures and payments",
      task_frequency: "Photo editing: 40 hours per wedding. Client updates: 2 hours per wedding. Contract follow-ups: 1 hour per client",
      bottlenecks: "Manual photo culling takes forever, clients don't respond to emails, contracts get lost in email chains",
      bottleneck_impact: "Can only book 24 weddings/year instead of 50+, clients frustrated by slow delivery, cash flow issues from late payments",
      data_types: ["Customer contact information", "Financial records", "Other business records"],
      data_storage: "Mix of digital and paper",
      data_accessibility: "Mostly accessible but some gaps",
      automation_experience: "Use Lightroom for editing but everything else is manual",
      automation_results: "Lightroom helps with editing but client management and contracts are still a mess",
      team_comfort: "Comfortable with training",
      training_investment: "Limited budget for training"
    },
    expectedOutcomes: {
      processFlags: ["photo_editing_workflow", "client_communication", "contract_management"],
      toolCategories: ["photo_editing_ai", "client_management", "contract_automation"],
      roiRange: { min: 35000, max: 75000 },
      timeToValue: "30-45 days",
      priorityItems: ["AI-assisted photo culling", "Automated client communication"]
    }
  },
  {
    id: "specialty_pharmacy",
    businessName: "CareFirst Specialty Pharmacy",
    companyProfile: {
      industry: "Healthcare",
      size: "Small (11-50)",
      budget_range: "50K-200K"
    },
    scenario: "Specialty pharmacy with complex prior authorization process, patient adherence tracking, and insurance maze",
    answers: {
      business_priorities: "Streamline prior authorization workflow, improve patient adherence monitoring, automate insurance verification",
      most_urgent: "Prior authorizations take 3-5 days and patients can't start critical medications - some give up and go elsewhere",
      repetitive_tasks: "Submitting prior auth paperwork, calling patients about missed doses, verifying insurance coverage changes",
      task_frequency: "Prior auths: 20 per day at 45 minutes each = 15 hours. Patient adherence calls: 2 hours daily. Insurance verification: 3 hours daily",
      bottlenecks: "Prior auth forms differ by insurer, patients don't understand adherence importance, insurance changes mid-treatment",
      bottleneck_impact: "Delayed treatments affect patient outcomes, poor adherence leads to hospitalizations, insurance denials cost $3000+ per case",
      data_types: ["Customer contact information", "Financial records", "Other business records"],
      data_storage: "Digital systems (CRM/ERP/databases)",
      data_accessibility: "Somewhat difficult to access",
      automation_experience: "Use pharmacy management system but prior auths and patient outreach are manual",
      automation_results: "Pharmacy system handles dispensing but we're drowning in paperwork and patient management",
      team_comfort: "Need moderate support",
      training_investment: "Yes, whatever it takes"
    },
    expectedOutcomes: {
      processFlags: ["prior_authorization", "patient_adherence", "insurance_verification"],
      toolCategories: ["healthcare_automation", "patient_engagement", "insurance_tools"],
      roiRange: { min: 45000, max: 95000 },
      timeToValue: "90-120 days",
      priorityItems: ["Prior auth automation", "Patient adherence monitoring"]
    }
  }
]

/**
 * Test runner utility to validate AI responses against expected outcomes
 */
export const validateAIResponse = (scenario: TestScenario, aiResponse: any): {
  score: number
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0
  const maxScore = 100

  // Check if AI identified key process flags (25 points)
  const identifiedFlags = aiResponse.processFlags?.map((flag: any) => flag.category) || []
  const expectedFlags = scenario.expectedOutcomes.processFlags
  const flagMatches = expectedFlags.filter(flag => 
    identifiedFlags.some((identified: string) => identified.includes(flag) || flag.includes(identified))
  ).length
  const flagScore = (flagMatches / expectedFlags.length) * 25
  score += flagScore
  if (flagScore < 20) {
    feedback.push(`AI missed key process flags. Expected: ${expectedFlags.join(', ')}. Found: ${identifiedFlags.join(', ')}`)
  }

  // Check ROI range reasonableness (25 points)
  const totalSavings = aiResponse.executiveSummary?.totalPotentialSavings || 0
  const { min, max } = scenario.expectedOutcomes.roiRange
  const roiScore = (totalSavings >= min && totalSavings <= max) ? 25 : 
    (totalSavings > 0) ? 15 : 0
  score += roiScore
  if (roiScore < 20) {
    feedback.push(`ROI estimate seems off. Expected: $${min.toLocaleString()}-$${max.toLocaleString()}. Got: $${totalSavings.toLocaleString()}`)
  }

  // Check if recommended tools are appropriate for business size (25 points)
  const recommendedTools = aiResponse.recommendedTools || []
  const toolScore = recommendedTools.length > 0 ? 25 : 0
  score += toolScore
  if (toolScore < 20) {
    feedback.push('AI should recommend specific tools appropriate for small business budget and complexity')
  }

  // Check if priority items align with most urgent need (25 points)
  const roadmapItems = aiResponse.roadmap || []
  const quickWins = roadmapItems.filter((item: any) => item.priority === 'quick_win')
  const priorityScore = quickWins.length > 0 ? 25 : 15
  score += priorityScore
  if (priorityScore < 20) {
    feedback.push('AI should identify quick wins that address the most urgent business need')
  }

  return { score, feedback }
}

/**
 * Batch test runner for multiple scenarios
 */
export const runBatchTests = async (
  scenarios: TestScenario[], 
  aiFunction: (scenario: TestScenario) => Promise<any>
): Promise<{
  overallScore: number
  results: Array<{
    scenario: string
    score: number
    feedback: string[]
  }>
}> => {
  const results = []
  let totalScore = 0

  for (const scenario of scenarios) {
    try {
      const aiResponse = await aiFunction(scenario)
      const validation = validateAIResponse(scenario, aiResponse)
      
      results.push({
        scenario: scenario.businessName,
        score: validation.score,
        feedback: validation.feedback
      })
      
      totalScore += validation.score
    } catch (error) {
      results.push({
        scenario: scenario.businessName,
        score: 0,
        feedback: [`AI failed to process scenario: ${error.message}`]
      })
    }
  }

  return {
    overallScore: totalScore / scenarios.length,
    results
  }
}

