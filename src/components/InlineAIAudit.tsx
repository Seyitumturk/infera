"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'

interface InlineAIAuditProps {
  isVisible: boolean
  onClose: () => void
}

const PROCESS_QUESTIONS = [
  // Part 1: Universal Qualifying Questions
  {
    id: 'workflow_description',
    category: 'Universal Qualifying Questions',
    question: 'Describe the exact workflow or process you want to automate/improve (e.g., "Invoice processing", "Customer onboarding", "Email handling")',
    type: 'text' as const,
    placeholder: 'e.g., Invoice processing from receipt to payment approval'
  },
  {
    id: 'process_owner',
    category: 'Universal Qualifying Questions',
    question: 'Who currently owns or manages this process? (Name, role)',
    type: 'text' as const,
    placeholder: 'e.g., Sarah Johnson, Accounts Payable Manager'
  },
  {
    id: 'urgency_value',
    category: 'Universal Qualifying Questions',
    question: 'Why is improving this workflow urgent or valuable? What happens if nothing changes?',
    type: 'text' as const,
    placeholder: 'e.g., We lose 2 hours daily to manual data entry, causing payment delays'
  },
  {
    id: 'time_cost',
    category: 'Universal Qualifying Questions',
    question: 'Roughly how many hours per week does your team spend on this process today?',
    type: 'single_choice' as const,
    options: [
      'Less than 5 hours per week',
      '5-15 hours per week',
      '15-30 hours per week', 
      '30-50 hours per week',
      'More than 50 hours per week'
    ]
  },
  {
    id: 'monetary_cost',
    category: 'Universal Qualifying Questions',
    question: 'Can you estimate monthly or yearly monetary costs (labor, errors, delays) of this process?',
    type: 'single_choice' as const,
    options: [
      'Under $5,000 per month',
      '$5,000-$15,000 per month',
      '$15,000-$50,000 per month',
      '$50,000-$100,000 per month',
      'Over $100,000 per month',
      'No idea, but it\'s significant'
    ]
  },

  // Part 2: Contextual Workflow-Mapping Questions
  {
    id: 'workflow_start',
    category: 'Contextual Workflow-Mapping',
    question: 'Where does this workflow start, and what triggers it?',
    type: 'text' as const,
    placeholder: 'e.g., Receiving email from client, Incoming invoice via email'
  },
  {
    id: 'workflow_end',
    category: 'Contextual Workflow-Mapping',
    question: 'Where does this workflow end, or what\'s the final output/outcome?',
    type: 'text' as const,
    placeholder: 'e.g., Invoice paid, Customer onboarded, Report generated'
  },
  {
    id: 'workflow_steps',
    category: 'Contextual Workflow-Mapping',
    question: 'List every major step involved in this workflow (brief bullet points)',
    type: 'text' as const,
    placeholder: 'e.g., • Receive invoice\n• Extract data\n• Verify against PO\n• Route for approval\n• Process payment'
  },
  {
    id: 'workflow_roles',
    category: 'Contextual Workflow-Mapping',
    question: 'Who (roles/people) is involved at each step?',
    type: 'text' as const,
    placeholder: 'e.g., Admin assistant receives, AP clerk processes, Manager approves'
  },
  {
    id: 'pain_points',
    category: 'Contextual Workflow-Mapping',
    question: 'Which step(s) currently cause the most delay, frustration, or errors?',
    type: 'text' as const,
    placeholder: 'e.g., Manual data extraction takes 30 mins per invoice and has 15% error rate'
  },

  // Part 3: Technical Context
  {
    id: 'current_software',
    category: 'Technical Context',
    question: 'What software or platforms do you currently use to manage this process?',
    type: 'multiple_choice' as const,
    options: [
      'Microsoft Excel/Google Sheets',
      'Email (Outlook, Gmail)',
      'CRM (Salesforce, HubSpot, etc.)',
      'Accounting software (QuickBooks, Xero, etc.)',
      'ERP system (SAP, Oracle, etc.)',
      'Document management (SharePoint, Google Drive)',
      'Project management (Asana, Monday, etc.)',
      'Custom database/software',
      'Mostly manual/paper-based'
    ]
  },
  {
    id: 'manual_tasks',
    category: 'Technical Context',
    question: 'Are there parts of the process done manually (e.g., copying data, spreadsheets, emails)? Describe briefly.',
    type: 'text' as const,
    placeholder: 'e.g., Manually copying invoice data from PDFs into Excel, then emailing for approval'
  },
  {
    id: 'existing_automation',
    category: 'Technical Context',
    question: 'Do you have existing automations or integrations in place for this process? If so, which ones?',
    type: 'text' as const,
    placeholder: 'e.g., Zapier integration between email and spreadsheet, or None currently'
  },

  // Part 4: Pain-Quantification Questions
  {
    id: 'people_count',
    category: 'Pain-Quantification',
    question: 'How many people perform this task regularly?',
    type: 'single_choice' as const,
    options: [
      '1 person',
      '2-3 people',
      '4-10 people',
      '11-25 people',
      'More than 25 people'
    ]
  },
  {
    id: 'step_duration',
    category: 'Pain-Quantification',
    question: 'How long does each step roughly take per occurrence?',
    type: 'text' as const,
    placeholder: 'e.g., Data entry: 15 mins, Approval routing: 30 mins, Payment processing: 10 mins'
  },
  {
    id: 'frequency',
    category: 'Pain-Quantification',
    question: 'How frequently does this workflow happen?',
    type: 'single_choice' as const,
    options: [
      'Multiple times per day',
      'Daily',
      'Multiple times per week',
      'Weekly',
      'Monthly',
      'Quarterly or less frequent'
    ]
  },
  {
    id: 'error_rate',
    category: 'Pain-Quantification',
    question: 'How often do mistakes/errors happen? (If applicable)',
    type: 'single_choice' as const,
    options: [
      'Rarely (less than 1%)',
      'Occasionally (1-5%)',
      'Sometimes (5-15%)',
      'Frequently (15-30%)',
      'Very often (more than 30%)',
      'Not applicable/No errors tracked'
    ]
  },
  {
    id: 'error_cost',
    category: 'Pain-Quantification',
    question: 'What\'s the direct or indirect cost per error?',
    type: 'single_choice' as const,
    options: [
      'Under $50 per error',
      '$50-$200 per error',
      '$200-$1,000 per error',
      '$1,000-$5,000 per error',
      'Over $5,000 per error',
      'Hard to quantify'
    ]
  },

  // Part 5: Open-ended Insight Questions
  {
    id: 'why_not_solved',
    category: 'Open-ended Insights',
    question: 'In your own words, why hasn\'t this problem been solved yet?',
    type: 'text' as const,
    placeholder: 'e.g., Too complex, lack of technical expertise, budget constraints, other priorities'
  },
  {
    id: 'successful_solution',
    category: 'Open-ended Insights',
    question: 'What would a successful solution look like to you?',
    type: 'text' as const,
    placeholder: 'e.g., Automated data extraction with 99% accuracy, 80% time savings, seamless integration'
  },
  {
    id: 'previous_attempts',
    category: 'Open-ended Insights',
    question: 'Is there something you\'ve tried in the past that didn\'t work? Why?',
    type: 'text' as const,
    placeholder: 'e.g., Tried basic Excel macros but they broke frequently, evaluated software X but it was too expensive'
  }
]

type AppState = 'intake' | 'processing' | 'results'

interface CompanyProfile {
  industry: string
  size: string
  budget_range?: string
}

export default function InlineAIAudit({ isVisible, onClose }: InlineAIAuditProps) {
  const [appState, setAppState] = useState<AppState>('intake')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [companyProfile, setCompanyProfile] = useState<Partial<CompanyProfile>>({})
  const [assessment, setAssessment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < PROCESS_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      startAnalysis()
    }
  }

  const startAnalysis = async () => {
    setAppState('processing')
    setIsLoading(true)
    setError(null)
    
    try {
      const requestData = {
        action: 'assessment',
        companyProfile: companyProfile as CompanyProfile,
        answers: Object.entries(answers).map(([id, answer]) => ({
          id,
          category: PROCESS_QUESTIONS.find(q => q.id === id)?.category || '',
          question: PROCESS_QUESTIONS.find(q => q.id === id)?.question || '',
          answer
        })),
        customProblem: ''
      }

      console.log('🚀 Calling unified Infera API...')
      
      const response = await fetch('/api/infera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Assessment failed')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Assessment failed')
      }

      setAssessment(result.data)
      setAppState('results')
      
      console.log('✅ Assessment completed successfully')

    } catch (error) {
      console.error('❌ Assessment failed:', error)
      setError(error instanceof Error ? error.message : 'Assessment failed')
      // Still show results with fallback data
      setAssessment({
        processFlags: [],
        recommendedTools: [],
        roadmap: [],
        executiveSummary: {
          totalPotentialSavings: 0,
          quickWins: 0,
          implementationTimeframe: "Contact us for detailed analysis",
          topRecommendation: "Schedule a consultation to get started"
        },
        aiInsights: ['Analysis completed with available data', 'Please contact us for detailed recommendations']
      })
      setAppState('results')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'ppt' = 'pdf') => {
    if (!assessment) return

    try {
      const response = await fetch('/api/infera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          assessment,
          format
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const result = await response.json()
      
      if (result.success) {
        // In a real implementation, this would trigger a download
        alert(`${format.toUpperCase()} report generated! Download link: ${result.data.downloadLink}`)
      }

    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  const handleRestart = () => {
    setAppState('intake')
    setCurrentQuestion(0)
    setAnswers({})
    setCompanyProfile({})
    setAssessment(null)
    setError(null)
  }

  // Test data for different sectors
  const TEST_CASES = {
    'Invoice Processing (Professional Services)': {
      companyProfile: { industry: 'Professional Services', size: 'Small (11-50)' },
      answers: {
        workflow_description: 'Client invoice processing from receipt to payment - we receive invoices via email, manually extract data, match against contracts, get approvals, and process payments',
        process_owner: 'Maria Santos, Office Manager',
        urgency_value: 'We\'re drowning in paperwork. Takes 3+ days to process each invoice, clients complain about late payments, and we\'re making mistakes that cost us credibility and late fees',
        time_cost: '15-30 hours per week',
        monetary_cost: '$5,000-$15,000 per month',
        workflow_start: 'Client emails invoice as PDF attachment to our general inbox',
        workflow_end: 'Payment processed and recorded in QuickBooks, client receives payment confirmation',
        workflow_steps: '• Receive invoice email\n• Download PDF and print\n• Manually type data into Excel spreadsheet\n• Cross-check against original contract\n• Email to department head for approval\n• Wait for approval response\n• Enter approved invoices into QuickBooks\n• Generate and send payment\n• File paperwork',
        workflow_roles: 'Admin assistant receives and prints, Office manager enters data and sends for approval, Department head approves, Bookkeeper processes payment',
        pain_points: 'Manual data entry takes 20-30 minutes per invoice and has 10-15% error rate. Approval bottleneck when department head travels. Lost invoices, duplicate payments, missed early payment discounts',
        current_software: ['Microsoft Excel/Google Sheets', 'Email (Outlook, Gmail)', 'Accounting software (QuickBooks, Xero, etc.)'],
        manual_tasks: 'Manually typing all invoice data from PDFs into Excel, then re-entering into QuickBooks. Printing and filing physical copies. Chasing approvals via email and phone calls',
        existing_automation: 'None currently',
        people_count: '4-10 people',
        step_duration: 'Data entry: 25 mins, Approval chase: 15 mins, QuickBooks entry: 10 mins, Payment processing: 5 mins',
        frequency: 'Multiple times per day',
        error_rate: 'Sometimes (5-15%)',
        error_cost: '$200-$1,000 per error',
        why_not_solved: 'Too busy putting out fires to focus on solutions. Tried some basic Excel macros but they kept breaking. Don\'t have technical expertise in-house and worried about cost',
        successful_solution: 'Invoices automatically processed from email with 99% accuracy, approvals happen instantly via mobile, payments processed same day, zero manual data entry',
        previous_attempts: 'Tried using Excel templates and formulas but they were fragile and broke when people made changes. Looked at some software but seemed too complex and expensive for our size'
      }
    },
    'Customer Support (E-commerce)': {
      companyProfile: { industry: 'Retail', size: 'Medium (51-500)' },
      answers: {
        workflow_description: 'Customer support ticket handling from inquiry to resolution - customers contact us via email, chat, and phone with questions about orders, returns, and product issues',
        process_owner: 'Jennifer Kim, Customer Success Manager',
        urgency_value: 'Response times are terrible (24+ hours), customers are frustrated, negative reviews piling up, support team is burned out handling repetitive questions',
        time_cost: 'More than 50 hours per week',
        monetary_cost: 'Over $100,000 per month',
        workflow_start: 'Customer submits inquiry via email, chat widget, or phone call',
        workflow_end: 'Customer issue resolved and satisfaction survey completed',
        workflow_steps: '• Customer inquiry received\n• Ticket created in system\n• Agent reads and categorizes issue\n• Research customer order history\n• Craft personalized response\n• Send response to customer\n• Wait for customer reply\n• Continue back-and-forth until resolved\n• Close ticket and update records',
        workflow_roles: 'Tier 1 agents handle basic inquiries, Tier 2 for complex issues, Manager escalation for complaints, Returns team for RMA processing',
        pain_points: '70% of tickets are repetitive questions about order status, return policies, sizing. Average response time is 18 hours. Agents spend 40% of time looking up order info across 3 different systems',
        current_software: ['Email (Outlook, Gmail)', 'CRM (Salesforce, HubSpot, etc.)', 'Custom database/software'],
        manual_tasks: 'Manually copying order details from multiple systems, typing same responses over and over, categorizing tickets by hand, updating customer records in 3 places',
        existing_automation: 'Basic email templates and auto-responders, but they\'re generic and customers complain they\'re not helpful',
        people_count: '11-25 people',
        step_duration: 'Ticket review: 5 mins, Research: 10 mins, Response writing: 8 mins, System updates: 3 mins',
        frequency: 'Multiple times per day',
        error_rate: 'Occasionally (1-5%)',
        error_cost: '$50-$200 per error',
        why_not_solved: 'Tried a few chatbots but they were terrible and made customers angrier. Management thinks good customer service requires human touch. Budget constraints and integration complexity with existing systems',
        successful_solution: '80% of common questions auto-resolved instantly, complex issues routed to right specialist immediately, customers can track everything self-service, response time under 2 hours',
        previous_attempts: 'Deployed a basic chatbot 2 years ago but it couldn\'t handle anything beyond FAQ lookups and customers hated it. Tried better email templates but still too generic'
      }
    },
    'Hiring Process (Technology)': {
      companyProfile: { industry: 'Technology', size: 'Startup (1-10)' },
      answers: {
        workflow_description: 'Software engineer hiring process from job posting to offer acceptance - screening resumes, conducting technical interviews, reference checks, and making offers',
        process_owner: 'Alex Chen, Head of Engineering',
        urgency_value: 'Hiring is our biggest bottleneck for growth. Takes 3+ months to fill roles, losing great candidates to competitors, founders spending 60% of time on hiring instead of product development',
        time_cost: '30-50 hours per week',
        monetary_cost: '$15,000-$50,000 per month',
        workflow_start: 'Job posted on job boards and candidates apply via email or job portal',
        workflow_end: 'Candidate accepts offer and starts onboarding process',
        workflow_steps: '• Post job on multiple boards\n• Receive applications via email\n• Manually screen resumes\n• Send coding challenge to qualified candidates\n• Review code submissions\n• Schedule and conduct phone screens\n• Coordinate technical interviews with team\n• Check references manually\n• Prepare and send offer letters\n• Negotiate terms back and forth',
        workflow_roles: 'Founder does initial screening, Engineering team conducts technical interviews, Founder handles offers and negotiations',
        pain_points: 'Drowning in unqualified resumes (200+ per role), scheduling interviews is a nightmare across timezones, losing track of candidate status, great candidates drop out due to slow process',
        current_software: ['Email (Outlook, Gmail)', 'Mostly manual/paper-based'],
        manual_tasks: 'Reading every resume individually, copying candidate info into spreadsheets, manual email scheduling, tracking candidate status in various email threads and notes',
        existing_automation: 'None currently',
        people_count: '2-3 people',
        step_duration: 'Resume screening: 3 mins each, Phone screen: 45 mins, Technical interview: 90 mins, Reference calls: 20 mins each',
        frequency: 'Daily',
        error_rate: 'Sometimes (5-15%)',
        error_cost: '$1,000-$5,000 per error',
        why_not_solved: 'Early stage startup, no HR person, founders focused on product and customers. Looked at ATS systems but they seem overkill and expensive for our size. Need something simple and fast',
        successful_solution: 'Qualified candidates automatically identified and ranked, interviews scheduled seamlessly, candidate communication automated, hiring decision made within 2 weeks of application',
        previous_attempts: 'Used a simple spreadsheet to track candidates but it quickly became unwieldy. Tried a basic ATS trial but it was too complex and required too much setup time'
      }
    }
  }

  const handleTestCase = (caseName: string) => {
    const testCase = TEST_CASES[caseName as keyof typeof TEST_CASES]
    setCompanyProfile(testCase.companyProfile)
    setAnswers(testCase.answers)
    setCurrentQuestion(PROCESS_QUESTIONS.length - 1)
  }

  if (!isVisible) return null

  return (
    <motion.section
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative bg-brandNight py-20 lg:py-32 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-24 relative">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">
            AI Opportunity Assessment
          </h2>
          <div className="max-w-3xl mx-auto mt-6">
            <p className="text-xl text-gray-300 text-center">
              Get a personalized AI roadmap with quantified ROI in minutes
            </p>
          </div>

          {/* Test Cases - DEV ONLY */}
          {appState === 'intake' && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-red-300 mb-3">🧪 Test Cases (DEV ONLY - Remove in Production)</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {Object.keys(TEST_CASES).map((caseName) => (
                  <button
                    key={caseName}
                    onClick={() => handleTestCase(caseName)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 rounded-lg text-sm transition-all"
                  >
                    Auto-fill: {caseName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="flex justify-center gap-6 text-sm text-gray-400 mt-8">
            <span className={appState === 'intake' ? 'text-accent' : ''}>Assessment</span>
            <span className={appState === 'processing' ? 'text-accent' : ''}>Analysis</span>
            <span className={appState === 'results' ? 'text-accent' : ''}>Results</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative">
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
            <AnimatePresence mode="wait">
              {appState === 'intake' && (
                <motion.div
                  key="intake"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  {currentQuestion === 0 && !companyProfile.industry && (
                    <CompanyProfileForm 
                      onSubmit={(profile) => setCompanyProfile(profile)}
                    />
                  )}
                  
                  {(currentQuestion > 0 || companyProfile.industry) && (
                    <QuestionForm
                      question={PROCESS_QUESTIONS[currentQuestion]}
                      answer={answers[PROCESS_QUESTIONS[currentQuestion].id]}
                      onAnswer={(answer) => handleAnswer(PROCESS_QUESTIONS[currentQuestion].id, answer)}
                      onNext={handleNext}
                      questionNumber={currentQuestion + 1}
                      totalQuestions={PROCESS_QUESTIONS.length}
                    />
                  )}
                </motion.div>
              )}

              {appState === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <ProcessingState />
                </motion.div>
              )}

              {appState === 'results' && assessment && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full space-y-8"
                >
                  <AssessmentResults 
                    assessment={assessment} 
                    onExport={handleExport}
                    onRestart={handleRestart}
                    error={error}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function CompanyProfileForm({ onSubmit }: { onSubmit: (profile: CompanyProfile) => void }) {
  const [profile, setProfile] = useState<Partial<CompanyProfile>>({})
  const [isIndustryOpen, setIsIndustryOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSubmit = () => {
    if (profile.industry && profile.size) {
      onSubmit(profile as CompanyProfile)
    }
  }

  const industries = [
    'Technology',
    'Healthcare', 
    'Finance',
    'Retail',
    'Manufacturing',
    'Professional Services',
    'Education',
    'Other'
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsIndustryOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-2xl font-bold text-white mb-6">Tell Us About Your Business</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-white mb-2">What kind of business are you in?</label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsIndustryOpen(!isIndustryOpen)}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-0 focus:border-white/30 transition-colors flex items-center justify-between"
            >
              <span className={profile.industry ? 'text-white' : 'text-gray-400'}>
                {profile.industry || 'Select industry'}
              </span>
              <svg 
                className={`w-5 h-5 transition-transform ${isIndustryOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isIndustryOpen && (
              <div className="absolute z-50 w-full mt-1 border border-white/20 rounded-lg shadow-xl" style={{backgroundColor: '#06080a'}}>
                {industries.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => {
                      setProfile(prev => ({ ...prev, industry }))
                      setIsIndustryOpen(false)
                    }}
                    className="w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {industry}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-white mb-2">How big is your team?</label>
          <div className="grid grid-cols-2 gap-3">
            {['Startup (1-10)', 'Small (11-50)', 'Medium (51-500)', 'Enterprise (500+)'].map((size) => (
              <button
                key={size}
                onClick={() => setProfile(prev => ({ ...prev, size }))}
                className={`p-3 rounded-lg border transition-all ${
                  profile.size === size
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!profile.industry || !profile.size}
          className="w-full"
        >
          Continue to Assessment
        </Button>
      </div>
    </div>
  )
}

function QuestionForm({
  question,
  answer,
  onAnswer,
  onNext,
  questionNumber,
  totalQuestions
}: {
  question: any
  answer: any
  onAnswer: (answer: any) => void
  onNext: () => void
  questionNumber: number
  totalQuestions: number
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-accent font-medium">Question {questionNumber} of {totalQuestions}</span>
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < questionNumber ? 'bg-accent' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{question.category}</h3>
        <p className="text-gray-300">{question.question}</p>
      </div>

      <div className="mb-8">
        {question.type === 'text' ? (
          <textarea
            value={answer || ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-white/30 resize-none transition-colors"
            rows={4}
          />
        ) : (
          <div className="space-y-3">
            {question.options.map((option: string) => (
              <button
                key={option}
                onClick={() => onAnswer(question.type === 'multiple_choice' 
                  ? (answer || []).includes(option) 
                    ? (answer || []).filter((a: string) => a !== option)
                    : [...(answer || []), option]
                  : option
                )}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  (question.type === 'multiple_choice' ? (answer || []).includes(option) : answer === option)
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onNext}
          disabled={!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === 'string' && answer.trim().length === 0)}
          className="flex-1"
        >
          {questionNumber === totalQuestions ? 'Generate My AI Roadmap' : 'Next Question'}
        </Button>
        {question.type === 'text' && (
          <Button
            variant="outline"
            onClick={() => onAnswer('Prefer not to answer')}
            className="px-6"
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  )
}

function ProcessingState() {
  const steps = [
    'Analyzing business processes',
    'Matching AI solutions', 
    'Calculating ROI potential',
    'Generating roadmap'
  ]

  return (
    <div>
      <div className="w-24 h-24 mx-auto mb-8 relative">
        <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 4.33 13.92 4.64 13.78 4.92C15.66 5.53 17.13 7.18 17.5 9.25C17.81 9.09 18.15 9 18.5 9C19.88 9 21 10.12 21 11.5C21 12.88 19.88 14 18.5 14C18.12 14 17.76 13.9 17.43 13.72C16.97 15.55 15.38 16.94 13.41 17.31C13.2 17.76 12.65 18.05 12 18.05C11.35 18.05 10.8 17.76 10.59 17.31C8.62 16.94 7.03 15.55 6.57 13.72C6.24 13.9 5.88 14 5.5 14C4.12 14 3 12.88 3 11.5C3 10.12 4.12 9 5.5 9C5.85 9 6.19 9.09 6.5 9.25C6.87 7.18 8.34 5.53 10.22 4.92C10.08 4.64 10 4.33 10 4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
          </svg>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-6">AI Analysis in Progress</h3>
      
      <div className="space-y-4 max-w-md mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span className="text-gray-300">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function AssessmentResults({ 
  assessment, 
  onExport, 
  onRestart, 
  error 
}: { 
  assessment: any
  onExport: (format: 'pdf' | 'ppt') => void
  onRestart: () => void
  error: string | null
}) {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-3xl font-bold text-white mb-4">Your AI Assessment Results</h3>
        {error && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
            <p className="text-yellow-200 text-sm">{error}</p>
          </div>
        )}
        <p className="text-gray-300 max-w-2xl mx-auto mb-6">
          Our AI has analyzed your business and identified specific automation opportunities.
        </p>
        <Button onClick={onRestart} variant="outline" size="sm">
          Start New Assessment
        </Button>
      </div>

      {/* Executive Summary */}
      {assessment.executiveSummary && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-white mb-3">Executive Summary</h4>
            {assessment.executiveSummary.businessCase && (
              <p className="text-gray-300 max-w-3xl mx-auto">{assessment.executiveSummary.businessCase}</p>
            )}
          </div>
          
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto text-center mb-8">
            <div className="p-6 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-accent mb-2">
                ${assessment.executiveSummary.totalPotentialSavings?.toLocaleString() || '0'}
              </div>
              <p className="text-gray-300 text-sm">Base Annual Savings</p>
              {assessment.executiveSummary.savingsRange && (
                <p className="text-xs text-gray-400 mt-1">
                  ${assessment.executiveSummary.savingsRange.low?.toLocaleString()} - ${assessment.executiveSummary.savingsRange.high?.toLocaleString()}
                </p>
              )}
            </div>
            <div className="p-6 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-accent2 mb-2">
                {assessment.executiveSummary.quickWins || 0}
              </div>
              <p className="text-gray-300 text-sm">Quick Wins (30 days)</p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {assessment.executiveSummary.strategicInitiatives || 0}
              </div>
              <p className="text-gray-300 text-sm">Strategic Initiatives</p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg">
              <div className="text-lg font-semibold text-white mb-2">
                {assessment.executiveSummary.implementationTimeframe || 'Contact us'}
              </div>
              <p className="text-gray-300 text-sm">Total Timeline</p>
            </div>
          </div>

          {/* Top Recommendation */}
          {assessment.executiveSummary.topRecommendation && (
            <div className="bg-gradient-to-r from-accent/20 to-accent2/20 rounded-lg p-6 mb-6">
              <h5 className="text-lg font-semibold text-white mb-2">🎯 Top Recommendation</h5>
              <p className="text-gray-200">{assessment.executiveSummary.topRecommendation}</p>
            </div>
          )}

          {/* Success Factors & Competitive Advantage */}
          <div className="grid md:grid-cols-2 gap-6">
            {assessment.executiveSummary.keySuccessFactors && (
              <div className="bg-white/5 rounded-lg p-6">
                <h5 className="text-lg font-semibold text-white mb-3">🔑 Key Success Factors</h5>
                <ul className="space-y-2">
                  {assessment.executiveSummary.keySuccessFactors.map((factor, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {assessment.executiveSummary.competitiveAdvantage && (
              <div className="bg-white/5 rounded-lg p-6">
                <h5 className="text-lg font-semibold text-white mb-3">🚀 Competitive Advantage</h5>
                <p className="text-gray-300">{assessment.executiveSummary.competitiveAdvantage}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Process Flags */}
      {assessment.processFlags?.length > 0 && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-white mb-3">Deep Process Analysis</h4>
            <p className="text-gray-300 max-w-2xl mx-auto">Detailed breakdown of automation opportunities identified in your workflow</p>
          </div>
          <div className="space-y-6 max-w-5xl mx-auto">
            {assessment.processFlags.map((flag: any, index: number) => (
              <div key={flag.id} className="bg-white/5 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h5 className="text-xl font-semibold text-white mb-2">{flag.label}</h5>
                      <p className="text-sm text-gray-400 capitalize">{flag.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        flag.impact === 'high' ? 'bg-red-500/20 text-red-300' :
                        flag.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {flag.impact} impact
                      </span>
                      {flag.confidence && (
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                          {Math.round(flag.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Current State & Automation Potential */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {flag.currentState && (
                      <div>
                        <h6 className="font-medium text-white mb-2">Current State</h6>
                        <p className="text-sm text-gray-300">{flag.currentState}</p>
                      </div>
                    )}
                    {flag.automationPotential && (
                      <div>
                        <h6 className="font-medium text-white mb-2">Automation Approach</h6>
                        <p className="text-sm text-gray-300">{flag.automationPotential}</p>
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {flag.timeSavingsPerInstance && (
                      <div className="text-center p-3 bg-white/5 rounded">
                        <div className="font-semibold text-accent">{flag.timeSavingsPerInstance}</div>
                        <div className="text-xs text-gray-400">Time Savings</div>
                      </div>
                    )}
                    {flag.errorReduction && (
                      <div className="text-center p-3 bg-white/5 rounded">
                        <div className="font-semibold text-green-400">{flag.errorReduction}</div>
                        <div className="text-xs text-gray-400">Error Reduction</div>
                      </div>
                    )}
                    {flag.complexityScore && (
                      <div className="text-center p-3 bg-white/5 rounded">
                        <div className="font-semibold text-white">{flag.complexityScore}/5</div>
                        <div className="text-xs text-gray-400">Complexity</div>
                      </div>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {flag.prerequisiteConditions && flag.prerequisiteConditions.length > 0 && (
                    <div>
                      <h6 className="font-medium text-white mb-2">Prerequisites</h6>
                      <div className="flex flex-wrap gap-2">
                        {flag.prerequisiteConditions.map((condition: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Tools */}
      {assessment.recommendedTools?.length > 0 && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-white mb-3">Enterprise Solution Analysis</h4>
            <p className="text-gray-300 max-w-2xl mx-auto">Comprehensive vendor evaluation with pros, cons, and implementation guidance</p>
          </div>
          <div className="space-y-6 max-w-6xl mx-auto">
            {assessment.recommendedTools.map((tool: any, index: number) => (
              <div key={tool.id} className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h5 className="text-xl font-semibold text-white mb-1">{tool.name}</h5>
                      <p className="text-sm text-gray-400 mb-2">{tool.vendor}</p>
                      {tool.industryFit && (
                        <p className="text-sm text-blue-300">{tool.industryFit}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-accent2 bg-accent2/20 px-2 py-1 rounded">
                        Priority #{tool.priority}
                      </span>
                      {tool.integrationComplexity && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          tool.integrationComplexity === 'low' ? 'bg-green-500/20 text-green-300' :
                          tool.integrationComplexity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {tool.integrationComplexity} complexity
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">{tool.description}</p>
                  
                  {/* Key Details */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded">
                      <div className="font-semibold text-white">{tool.pricing}</div>
                      <div className="text-xs text-gray-400">Monthly Cost</div>
                    </div>
                    {tool.implementationCost && (
                      <div className="text-center p-3 bg-white/5 rounded">
                        <div className="font-semibold text-accent">{tool.implementationCost}</div>
                        <div className="text-xs text-gray-400">Setup Cost</div>
                      </div>
                    )}
                    <div className="text-center p-3 bg-white/5 rounded">
                      <div className="font-semibold text-green-400">{tool.timeToValue}</div>
                      <div className="text-xs text-gray-400">Time to Value</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded">
                      <div className="font-semibold text-blue-400">#{tool.priority}</div>
                      <div className="text-xs text-gray-400">Recommended Order</div>
                    </div>
                  </div>

                  {/* Use Case & Match Reason */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h6 className="font-medium text-white mb-2">Specific Use Case</h6>
                      <p className="text-sm text-gray-300">{tool.useCase}</p>
                    </div>
                    <div>
                      <h6 className="font-medium text-white mb-2">Why This Fits Your Needs</h6>
                      <p className="text-sm text-accent">{tool.matchReason}</p>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  {tool.prosAndCons && (
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h6 className="font-medium text-green-400 mb-2">✓ Advantages</h6>
                        <ul className="space-y-1">
                          {tool.prosAndCons.pros.map((pro: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                              <div className="w-1 h-1 bg-green-400 rounded-full flex-shrink-0"></div>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-red-400 mb-2">⚠ Considerations</h6>
                        <ul className="space-y-1">
                          {tool.prosAndCons.cons.map((con: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                              <div className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0"></div>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Alternative Options */}
                  {tool.alternativeOptions && tool.alternativeOptions.length > 0 && (
                    <div>
                      <h6 className="font-medium text-white mb-2">Alternative Options</h6>
                      <div className="flex flex-wrap gap-2">
                        {tool.alternativeOptions.map((alt: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Implementation Roadmap */}
      {assessment.roadmap?.length > 0 && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-white mb-3">Strategic Implementation Roadmap</h4>
            <p className="text-gray-300 max-w-2xl mx-auto">Detailed 30/60/90-day execution plan with ROI scenarios, risk analysis, and resource requirements</p>
          </div>
          <div className="space-y-8 max-w-6xl mx-auto">
            {assessment.roadmap.map((item: any, index: number) => (
              <div key={item.id} className="bg-white/5 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h5 className="text-2xl font-semibold text-white mb-2">{item.title}</h5>
                      <p className="text-gray-300 mb-4">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                        item.priority === 'quick_win' ? 'bg-green-500/20 text-green-300' :
                        item.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {item.priority === 'quick_win' ? 'Quick Win' : `${item.priority} priority`}
                      </span>
                      <p className="text-sm text-gray-400 mt-2">{item.timeline.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid md:grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-4 bg-white/5 rounded">
                      <div className="text-2xl font-bold text-white mb-1">{item.impact}/5</div>
                      <div className="text-xs text-gray-400">Business Impact</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded">
                      <div className="text-2xl font-bold text-white mb-1">{item.effort}/5</div>
                      <div className="text-xs text-gray-400">Implementation Effort</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded">
                      <div className="text-2xl font-bold text-accent mb-1">${item.roi?.annual_savings?.toLocaleString() || '0'}</div>
                      <div className="text-xs text-gray-400">Annual Savings</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded">
                      <div className="text-2xl font-bold text-orange-400 mb-1">${item.roi?.implementation_cost?.toLocaleString() || '0'}</div>
                      <div className="text-xs text-gray-400">Implementation Cost</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded">
                      <div className="text-2xl font-bold text-green-400 mb-1">{item.roi?.payback_months || 0}</div>
                      <div className="text-xs text-gray-400">Payback Months</div>
                    </div>
                  </div>

                  {/* ROI Scenarios */}
                  {item.roi && (item.roi.low_scenario || item.roi.high_scenario) && (
                    <div className="mb-6">
                      <h6 className="font-medium text-white mb-3">ROI Scenarios</h6>
                      <div className="grid md:grid-cols-3 gap-4">
                        {item.roi.low_scenario && (
                          <div className="text-center p-3 bg-red-500/10 rounded border border-red-500/20">
                            <div className="font-semibold text-red-300">${item.roi.low_scenario.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">Conservative Scenario</div>
                          </div>
                        )}
                        {item.roi.base_scenario && (
                          <div className="text-center p-3 bg-blue-500/10 rounded border border-blue-500/20">
                            <div className="font-semibold text-blue-300">${item.roi.base_scenario.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">Base Case</div>
                          </div>
                        )}
                        {item.roi.high_scenario && (
                          <div className="text-center p-3 bg-green-500/10 rounded border border-green-500/20">
                            <div className="font-semibold text-green-300">${item.roi.high_scenario.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">Optimistic Scenario</div>
                          </div>
                        )}
                      </div>
                      {item.roi.confidence_level && (
                        <p className="text-center text-sm text-gray-400 mt-2">
                          Confidence Level: {Math.round(item.roi.confidence_level * 100)}%
                        </p>
                      )}
                    </div>
                  )}

                  {/* Resource Requirements */}
                  {item.resourceRequirements && (
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <h6 className="font-medium text-white mb-2">👥 Human Resources</h6>
                        <p className="text-sm text-gray-300">{item.resourceRequirements.human}</p>
                      </div>
                      <div>
                        <h6 className="font-medium text-white mb-2">⚙️ Technical Requirements</h6>
                        <p className="text-sm text-gray-300">{item.resourceRequirements.technical}</p>
                      </div>
                      <div>
                        <h6 className="font-medium text-white mb-2">💰 Budget Allocation</h6>
                        <p className="text-sm text-gray-300">{item.resourceRequirements.budget}</p>
                      </div>
                    </div>
                  )}

                  {/* Risks & Dependencies */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {item.risks && item.risks.length > 0 && (
                      <div>
                        <h6 className="font-medium text-red-400 mb-2">⚠️ Key Risks</h6>
                        <ul className="space-y-1">
                          {item.risks.map((risk: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <div className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0 mt-2"></div>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.dependencies && item.dependencies.length > 0 && (
                      <div>
                        <h6 className="font-medium text-yellow-400 mb-2">🔗 Dependencies</h6>
                        <ul className="space-y-1">
                          {item.dependencies.map((dep: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <div className="w-1 h-1 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                              {dep}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Change Management */}
                  {item.changeManagement && (
                    <div className="mb-6">
                      <h6 className="font-medium text-white mb-2">📈 Change Management</h6>
                      <p className="text-sm text-gray-300">{item.changeManagement}</p>
                    </div>
                  )}

                  {/* Next Steps & KPIs */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {item.next_steps?.length > 0 && (
                      <div>
                        <h6 className="font-medium text-white mb-2">📋 Next Steps</h6>
                        <ul className="text-sm text-gray-300 space-y-2">
                          {item.next_steps.map((step: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-5 h-5 bg-accent/20 text-accent rounded text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.kpis?.length > 0 && (
                      <div>
                        <h6 className="font-medium text-white mb-2">📊 Success Metrics</h6>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {item.kpis.map((kpi: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                              {kpi}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Owner */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400">
                      <strong className="text-white">Project Owner:</strong> {item.owner}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry Benchmarks */}
      {assessment.industryBenchmarks && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-white mb-3">Industry Benchmarks & Context</h4>
            <p className="text-gray-300 max-w-2xl mx-auto">How your automation maturity compares to industry standards</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div>
                <h5 className="text-lg font-semibold text-white mb-3">📊 Automation Maturity</h5>
                <p className="text-gray-300">{assessment.industryBenchmarks.automationMaturity}</p>
              </div>
              <div>
                <h5 className="text-lg font-semibold text-white mb-3">💰 Typical ROI Range</h5>
                <p className="text-accent font-medium">{assessment.industryBenchmarks.typicalROI}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h5 className="text-lg font-semibold text-white mb-3">⚠️ Common Challenges</h5>
                <ul className="space-y-2">
                  {assessment.industryBenchmarks.commonChallenges.map((challenge: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0 mt-2"></div>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-lg font-semibold text-white mb-3">✅ Success Patterns</h5>
                <ul className="space-y-2">
                  {assessment.industryBenchmarks.successPatterns.map((pattern: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0 mt-2"></div>
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Implementation Strategy */}
      {assessment.implementationStrategy && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-white mb-3">30/60/90-Day Implementation Strategy</h4>
            <p className="text-gray-300 max-w-2xl mx-auto">Phased approach to ensure successful deployment and adoption</p>
          </div>
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Phase Breakdown */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
                <h5 className="text-xl font-semibold text-green-300 mb-3">📅 Phase 1: 30 Days</h5>
                <p className="text-gray-300">{assessment.implementationStrategy.phase1_30days}</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
                <h5 className="text-xl font-semibold text-blue-300 mb-3">📅 Phase 2: 60 Days</h5>
                <p className="text-gray-300">{assessment.implementationStrategy.phase2_60days}</p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/20">
                <h5 className="text-xl font-semibold text-purple-300 mb-3">📅 Phase 3: 90 Days</h5>
                <p className="text-gray-300">{assessment.implementationStrategy.phase3_90days}</p>
              </div>
            </div>

            {/* Success Factors & Roadblocks */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-lg font-semibold text-white mb-4">🎯 Critical Success Factors</h5>
                <ul className="space-y-3">
                  {assessment.implementationStrategy.criticalSuccessFactors.map((factor: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-green-500/10 rounded border border-green-500/20">
                      <div className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <span className="text-gray-300">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-lg font-semibold text-white mb-4">🚧 Potential Roadblocks</h5>
                <ul className="space-y-3">
                  {assessment.implementationStrategy.potentialRoadblocks.map((roadblock: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-red-500/10 rounded border border-red-500/20">
                      <div className="w-6 h-6 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                        !
                      </div>
                      <span className="text-gray-300">{roadblock}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {assessment.aiInsights?.length > 0 && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-white mb-3">Strategic AI Insights</h4>
            <p className="text-gray-300 max-w-2xl mx-auto">Deep analysis and strategic recommendations from our AI consultant</p>
          </div>
          <div className="grid gap-6 max-w-4xl mx-auto">
            {assessment.aiInsights.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-gradient-to-r from-accent/10 to-accent2/10 rounded-lg border border-accent/20">
                <div className="w-8 h-8 bg-accent/20 text-accent rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1">
                  🧠
                </div>
                <p className="text-gray-200 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Actions */}
      <div className="text-center">
        <h4 className="text-xl font-bold text-white mb-4">Ready to Implement?</h4>
        <p className="text-gray-300 mb-6">
          Export your detailed assessment report or schedule a consultation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => onExport('pdf')}>
            Download PDF Report
          </Button>
          <Button variant="outline" size="lg" onClick={() => onExport('ppt')}>
            Download PPT Slides
          </Button>
        </div>
      </div>
    </div>
  )
}