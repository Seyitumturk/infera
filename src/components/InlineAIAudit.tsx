"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'

interface InlineAIAuditProps {
  isVisible: boolean
  onClose: () => void
  initialCustomProblem?: string
}

const CHAT_QUESTIONS = [
  {
    id: 'intro',
    type: 'ai_message' as const,
    message: "Thank you for exploring AI opportunities with us. This questionnaire will identify key areas where AI-driven automation could benefit your business. Your responses will help us craft a tailored 30-60-90 day AI roadmap focusing on quick wins and sustainable solutions.",
    followUp: 'business_priorities'
  },
  // Business Goals
  {
    id: 'business_priorities',
    type: 'question' as const,
    message: "What are the top business priorities for your company in the next 6–12 months?",
    inputType: 'text',
    placeholder: "e.g., Grow sales, reduce costs, improve customer satisfaction, expand operations...",
    followUp: 'most_urgent'
  },
  {
    id: 'most_urgent',
    type: 'question' as const,
    message: "Of those priorities, which one is the most urgent or would you tackle first?",
    inputType: 'text',
    placeholder: "e.g., Reducing operational costs is our immediate focus...",
    followUp: 'repetitive_tasks'
  },
  // Process Challenges
  {
    id: 'repetitive_tasks',
    type: 'question' as const,
    message: "Which routine or repetitive tasks currently take up a lot of your team's time or resources?",
    inputType: 'text',
    placeholder: "e.g., Manually handling customer support tickets, data entry, report generation...",
    followUp: 'task_frequency'
  },
  {
    id: 'task_frequency',
    type: 'question' as const,
    message: "Can you estimate how often that task occurs and roughly how long each instance takes?",
    inputType: 'text',
    placeholder: "e.g., 500 tickets per day, 10 minutes each on average...",
    followUp: 'bottlenecks'
  },
  {
    id: 'bottlenecks',
    type: 'question' as const,
    message: "Where do you experience the biggest bottlenecks or delays in your operations?",
    inputType: 'text',
    placeholder: "e.g., Waiting for approvals, re-entering data in multiple places, fixing frequent errors...",
    followUp: 'bottleneck_impact'
  },
  {
    id: 'bottleneck_impact',
    type: 'question' as const,
    message: "What's the main cause of that bottleneck, and how is it impacting your business?",
    inputType: 'text',
    placeholder: "e.g., Manual approval process causes customer complaints and missed deadlines...",
    followUp: 'data_types'
  },
  // Data & Technology
  {
    id: 'data_types',
    type: 'question' as const,
    message: "What types of data or records does your business generate or use regularly?",
    inputType: 'multi_choice',
    options: [
      "Customer contact information",
      "Sales transactions",
      "Inventory levels",
      "Support request logs",
      "Financial records",
      "Employee data",
      "Product/service data",
      "Other business records"
    ],
    followUp: 'data_storage'
  },
  {
    id: 'data_storage',
    type: 'question' as const,
    message: "How do you store and manage this data currently?",
    inputType: 'choice',
    options: [
      "Digital systems (CRM/ERP/databases)",
      "Spreadsheets and shared files",
      "Mix of digital and paper",
      "Mainly paper/offline",
      "Cloud-based platforms",
      "Custom software solutions"
    ],
    followUp: 'data_accessibility'
  },
  {
    id: 'data_accessibility',
    type: 'question' as const,
    message: "Is your data generally complete and easy to access when you need it for analysis or reporting?",
    inputType: 'choice',
    options: [
      "Yes, very accessible and complete",
      "Mostly accessible but some gaps",
      "Somewhat difficult to access",
      "Very difficult to access or incomplete",
      "Would need significant cleanup"
    ],
    followUp: 'automation_experience'
  },
  {
    id: 'automation_experience',
    type: 'question' as const,
    message: "Have you already tried any automation or AI tools in your workflows?",
    inputType: 'text',
    placeholder: "e.g., Chatbots, RPA bots, predictive analytics, or 'No, haven't tried any yet'...",
    followUp: 'automation_results'
  },
  {
    id: 'automation_results',
    type: 'question' as const,
    message: "If yes, what was the biggest benefit or challenge? If no, what's held you back?",
    inputType: 'text',
    placeholder: "e.g., Saved time but hard to maintain, or 'Not sure where to start, budget concerns'...",
    followUp: 'team_comfort'
  },
  // Readiness
  {
    id: 'team_comfort',
    type: 'question' as const,
    message: "How comfortable is your team with adopting new technology?",
    inputType: 'choice',
    options: [
      "Very tech-savvy, quick to adopt",
      "Comfortable with training",
      "Need moderate support",
      "Require significant training",
      "Resistant to change"
    ],
    followUp: 'training_investment'
  },
  {
    id: 'training_investment',
    type: 'question' as const,
    message: "Would you be willing to invest in training or support to help the team get up to speed with AI tools?",
    inputType: 'choice',
    options: [
      "Yes, whatever it takes",
      "Yes, within reason",
      "Limited budget for training",
      "Prefer minimal training needed",
      "No additional training budget"
    ],
    followUp: 'ready_analyze'
  },
  {
    id: 'ready_analyze',
    type: 'ai_message' as const,
    message: "Perfect. I have everything needed to analyze your situation and create a tailored AI automation roadmap. This will take just a moment...",
    followUp: null
  }
]

type AppState = 'intake' | 'processing' | 'results'

interface CompanyProfile {
  industry: string
  size: string
  budget_range?: string
}

export default function InlineAIAudit({ isVisible, onClose, initialCustomProblem }: InlineAIAuditProps) {
  const [appState, setAppState] = useState<AppState>('intake')
  const [currentQuestionId, setCurrentQuestionId] = useState('intro')
  const [chatHistory, setChatHistory] = useState<Array<{id: string, type: 'ai' | 'user', message: string, timestamp: Date}>>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [companyProfile, setCompanyProfile] = useState<Partial<CompanyProfile>>({})
  const [assessment, setAssessment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customProblem, setCustomProblem] = useState<string>(initialCustomProblem ?? '')
  const [isTyping, setIsTyping] = useState(false)
  const [currentInput, setCurrentInput] = useState('')

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    
    // Add user message to chat history
    setChatHistory(prev => [...prev, {
      id: questionId + '_answer',
      type: 'user',
      message: Array.isArray(answer) ? answer.join(', ') : answer,
      timestamp: new Date()
    }])
    
    // Find current question and move to next
    const currentQuestion = CHAT_QUESTIONS.find(q => q.id === questionId)
    if (currentQuestion?.followUp) {
      // Simulate AI typing
      setIsTyping(true)
      setTimeout(() => {
        const nextQuestion = CHAT_QUESTIONS.find(q => q.id === currentQuestion.followUp)
        if (nextQuestion) {
          setChatHistory(prev => [...prev, {
            id: nextQuestion.id,
            type: 'ai',
            message: nextQuestion.message,
            timestamp: new Date()
          }])
          setCurrentQuestionId(nextQuestion.id)
          
          // If this is the final ai_message (ready_analyze), auto-trigger analysis
          if (nextQuestion.id === 'ready_analyze') {
            setTimeout(() => {
              console.log('🎯 Final AI message shown, starting analysis...')
              startAnalysis()
            }, 2000) // Give user time to read the message
          }
        }
        setIsTyping(false)
      }, 1000 + Math.random() * 1000) // Random delay between 1-2 seconds
    } else {
      // End of questions, start analysis
      console.log('🎯 Chat completed, starting analysis...')
      startAnalysis()
    }
    
    setCurrentInput('')
  }

  // Initialize chat with first message
  useEffect(() => {
    if (chatHistory.length === 0) {
      const firstQuestion = CHAT_QUESTIONS.find(q => q.id === 'intro')
      if (firstQuestion) {
        setTimeout(() => {
          setChatHistory([{
            id: firstQuestion.id,
            type: 'ai',
            message: firstQuestion.message,
            timestamp: new Date()
          }])
          // Show the actual question immediately
          setTimeout(() => {
            const businessPrioritiesQuestion = CHAT_QUESTIONS.find(q => q.id === 'business_priorities')
            if (businessPrioritiesQuestion) {
              setChatHistory(prev => [...prev, {
                id: businessPrioritiesQuestion.id,
                type: 'ai',
                message: businessPrioritiesQuestion.message,
                timestamp: new Date()
              }])
              setCurrentQuestionId('business_priorities')
            }
          }, 1500)
        }, 500)
      }
    }
  }, [])

  const startAnalysis = async () => {
    setAppState('processing')
    setIsLoading(true)
    setError(null)
    
    try {
      // Ensure company profile has required fields
      const safeCompanyProfile = {
        industry: companyProfile.industry || "Professional Services",
        size: companyProfile.size || "Medium (51-500)",
        budget_range: companyProfile.budget_range || "10K-50K"
      }
      
      console.log('📊 Company Profile:', safeCompanyProfile)
      console.log('📝 Answers:', Object.keys(answers))
      
      const requestData = {
        action: 'assessment',
        companyProfile: safeCompanyProfile,
        answers: Object.entries(answers).map(([id, answer]) => ({
          id,
          category: CHAT_QUESTIONS.find(q => q.id === id)?.type || '',
          question: CHAT_QUESTIONS.find(q => q.id === id)?.message || '',
          answer
        })),
        customProblem
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

  const handleTestCase = (caseName: string) => {
    console.log('🧪 Loading test case and starting analysis...', caseName)
    
    let testAnswers: any = {}
    let testProfile: any = {}
    let testMessage = ""
    
    switch (caseName) {
      case 'mckinsey':
        // Original McKinsey-style test case
        testAnswers = {
          business_priorities: "Reduce operational costs, improve customer satisfaction, scale operations",
          most_urgent: "Reducing operational costs is our immediate focus",
          repetitive_tasks: "Manual data entry from customer emails, generating weekly reports, processing invoices",
          task_frequency: "200 customer emails per day, 2 hours of manual data entry each",
          bottlenecks: "Waiting for manager approvals, re-entering data across multiple systems",
          bottleneck_impact: "Approval delays cause customer complaints and missed SLA deadlines",
          data_types: ["Customer contact information", "Sales transactions", "Support request logs"],
          data_storage: "Mix of digital and paper",
          data_accessibility: "Somewhat difficult to access",
          automation_experience: "Tried basic Excel macros but they kept breaking",
          automation_results: "Saved some time initially but hard to maintain, broke frequently",
          team_comfort: "Need moderate support",
          training_investment: "Yes, within reason"
        }
        testProfile = {
          industry: "Professional Services",
          size: "Medium (51-500)",
          budget_range: "10K-50K"
        }
        testMessage = "Test case loaded with McKinsey-style responses!"
        break

      case 'veterinary':
        // Veterinary clinic with appointment no-shows
        testAnswers = {
          business_priorities: "Reduce no-shows, eliminate manual reminder calls, digitize patient records",
          most_urgent: "Reducing appointment no-shows - we lose $3,600 per month from empty slots",
          repetitive_tasks: "Making 40-60 reminder calls daily, manually checking insurance eligibility, updating paper charts after each visit",
          task_frequency: "60 reminder calls per day at 2 minutes each = 2 hours. Insurance checks: 25 per day at 3 minutes = 75 minutes",
          bottlenecks: "Phone tag with clients for confirmations, waiting for insurance pre-approvals, finding paper records during emergencies",
          bottleneck_impact: "15% no-show rate, delayed treatments while searching files, frustrated clients waiting for callbacks",
          data_types: ["Customer contact information", "Employee data", "Financial records", "Other business records"],
          data_storage: "Mix of digital and paper",
          data_accessibility: "Somewhat difficult to access",
          automation_experience: "Tried online scheduling but clients still prefer calling",
          automation_results: "Scheduling software helped but most clients (70%) still call instead of booking online",
          team_comfort: "Need moderate support",
          training_investment: "Yes, within reason"
        }
        testProfile = {
          industry: "Healthcare", 
          size: "Small (11-50)",
          budget_range: "5K-25K"
        }
        testMessage = "Veterinary clinic test case loaded - high no-show rates and manual processes!"
        break

      case 'food_truck':
        // Food truck with inventory waste
        testAnswers = {
          business_priorities: "Reduce food waste, predict daily demand, automate inventory ordering",
          most_urgent: "Food waste is killing our margins - throwing away $800-1200 worth of ingredients monthly",
          repetitive_tasks: "Daily inventory counts, manual calculation of prep quantities, tracking sales by item on paper",
          task_frequency: "Inventory count: 45 minutes daily. Prep calculations: 30 minutes. Sales tracking: 20 minutes end of day",
          bottlenecks: "Guessing how much to prep, running out of popular items early, over-ordering perishables",
          bottleneck_impact: "Lost sales when popular items sell out, $1000+ monthly waste, stressed staff during rush",
          data_types: ["Inventory levels", "Sales transactions", "Financial records"],
          data_storage: "Spreadsheets and shared files",
          data_accessibility: "Mostly accessible but some gaps",
          automation_experience: "Use Square for payments but track everything else manually",
          automation_results: "Square helps with payments but we have no visibility into what's selling when",
          team_comfort: "Comfortable with training",
          training_investment: "Limited budget for training"
        }
        testProfile = {
          industry: "Retail",
          size: "Startup (1-10)",
          budget_range: "1K-10K"
        }
        testMessage = "Food truck test case loaded - high waste and manual inventory tracking!"
        break

      case 'hvac_dispatch':
        // HVAC with inefficient dispatching
        testAnswers = {
          business_priorities: "Optimize technician routes, reduce emergency response time, improve customer communication",
          most_urgent: "Our technicians waste 3-4 hours daily driving between jobs - fuel and labor costs are crushing us",
          repetitive_tasks: "Manual route planning each morning, calling customers with arrival updates, rescheduling when emergencies arise",
          task_frequency: "Route planning: 1 hour daily for dispatcher. Customer update calls: 2 hours daily. Rescheduling: 45 minutes when emergencies hit",
          bottlenecks: "No real-time visibility of technician locations, customers angry about vague time windows, emergency calls chaos",
          bottleneck_impact: "High fuel costs, overtime pay, 1-star reviews about poor communication, lost repeat customers",
          data_types: ["Customer contact information", "Employee data", "Sales transactions"],
          data_storage: "Digital systems (CRM/ERP/databases)",
          data_accessibility: "Mostly accessible but some gaps",
          automation_experience: "Use basic CRM but dispatch is all manual phone calls and paper schedules",
          automation_results: "CRM helps track customers but scheduling is still chaos - no integration",
          team_comfort: "Need moderate support",
          training_investment: "Yes, within reason"
        }
        testProfile = {
          industry: "Professional Services",
          size: "Small (11-50)",
          budget_range: "10K-50K"
        }
        testMessage = "HVAC dispatch test case loaded - route optimization and scheduling chaos!"
        break

      case 'wedding_photography':
        // Wedding photographer with editing bottleneck
        testAnswers = {
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
        }
        testProfile = {
          industry: "Professional Services",
          size: "Startup (1-10)",
          budget_range: "5K-25K"
        }
        testMessage = "Wedding photography test case loaded - editing bottleneck limiting bookings!"
        break

      case 'auto_repair':
        // Auto repair with parts chaos
        testAnswers = {
          business_priorities: "Speed up parts ordering, automate repair estimates, improve customer communication",
          most_urgent: "Creating estimates takes forever and we lose customers who go elsewhere while waiting 2 days for a quote",
          repetitive_tasks: "Looking up part numbers across multiple catalogs, calling suppliers for availability, manually calculating labor hours",
          task_frequency: "Parts lookup: 3 hours daily across all estimates. Supplier calls: 1 hour daily. Estimate creation: 2 hours per estimate",
          bottlenecks: "Parts catalogs don't match, suppliers have different part numbers, labor time estimates are inconsistent",
          bottleneck_impact: "Slow estimates lose customers, wrong parts delay repairs, customers angry about lack of communication",
          data_types: ["Inventory levels", "Customer contact information", "Financial records"],
          data_storage: "Mix of digital and paper",
          data_accessibility: "Somewhat difficult to access",
          automation_experience: "Use basic shop management software but parts ordering is manual",
          automation_results: "Shop software tracks jobs but parts ordering and estimates still take forever",
          team_comfort: "Need moderate support",
          training_investment: "Yes, within reason"
        }
        testProfile = {
          industry: "Professional Services", 
          size: "Small (11-50)",
          budget_range: "10K-50K"
        }
        testMessage = "Auto repair test case loaded - parts lookup chaos and slow estimates!"
        break

      default:
        // Fallback to original McKinsey case
        return handleTestCase('mckinsey')
    }
    
    // Set test data
    setAnswers(testAnswers)
    setCompanyProfile(testProfile)
    
    // Simulate completed chat
    setChatHistory([
      {id: 'test', type: 'ai', message: testMessage, timestamp: new Date()},
      {id: 'test2', type: 'user', message: testAnswers.business_priorities, timestamp: new Date()},
      {id: 'ready_analyze', type: 'ai', message: "Perfect. I have everything needed to analyze your situation and create a tailored AI automation roadmap. This will take just a moment...", timestamp: new Date()}
    ])
    
    // Immediately start analysis
    setTimeout(() => {
      console.log('🚀 Starting test case analysis...')
      startAnalysis()
    }, 1000)
  }

  if (!isVisible) return null

  // Derive a lightweight Real-Time Pool from current answers
  const pool = {
    processFlags: [
      answers.business_priorities ? 'Business priorities identified' : null,
      answers.repetitive_tasks ? 'Repetitive tasks noted' : null,
      answers.bottlenecks ? 'Bottlenecks identified' : null,
      answers.automation_experience ? 'Automation experience captured' : null,
    ].filter(Boolean) as string[],
    safeMetrics: [
      answers.most_urgent ? `Priority: ${answers.most_urgent}` : null,
      answers.task_frequency ? `Frequency: ${answers.task_frequency}` : null,
      answers.bottleneck_impact ? `Impact: ${answers.bottleneck_impact}` : null,
      answers.team_comfort ? `Team readiness: ${answers.team_comfort}` : null,
      answers.data_accessibility ? `Data quality: ${answers.data_accessibility}` : null,
    ].filter(Boolean) as string[],
    systems: (Array.isArray(answers.data_types) ? answers.data_types : []) as string[],
  }

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
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white" style={{marginBottom: '2rem'}}>
            AI Opportunity Assessment
          </h2>
          <div className="max-w-3xl mx-auto mt-6">
            <p className="text-xl text-gray-300 text-center">
              Skip $1,500 agency audits — Infera is $99. Describe your problem or answer a few questions.
            </p>
          </div>

          {/* Test Cases - DEV ONLY */}
          {appState === 'intake' && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-w-6xl mx-auto">
              <h3 className="text-lg font-semibold text-red-300 mb-3">🧪 Test Cases (DEV ONLY - Remove in Production)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                  onClick={() => handleTestCase('mckinsey')}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 rounded-lg text-sm transition-all"
                >
                  📊 McKinsey-style Business
                </button>
                <button
                  onClick={() => handleTestCase('veterinary')}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-200 rounded-lg text-sm transition-all"
                >
                  🐕 Veterinary Clinic (No-shows)
                </button>
                <button
                  onClick={() => handleTestCase('food_truck')}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 rounded-lg text-sm transition-all"
                >
                  🚚 Food Truck (Waste)
                </button>
                <button
                  onClick={() => handleTestCase('hvac_dispatch')}
                  className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-200 rounded-lg text-sm transition-all"
                >
                  🔧 HVAC Dispatch (Routes)
                </button>
                <button
                  onClick={() => handleTestCase('wedding_photography')}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-200 rounded-lg text-sm transition-all"
                >
                  📸 Wedding Photo (Editing)
                </button>
                <button
                  onClick={() => handleTestCase('auto_repair')}
                  className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-200 rounded-lg text-sm transition-all"
                >
                  🔩 Auto Repair (Parts)
                </button>
              </div>
              <p className="text-red-300/70 text-xs mt-3 text-center">
                Each test case represents a real small business with specific pain points and realistic metrics
              </p>
            </div>
          )}

          {/* Modern Progress Indicator */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                appState === 'intake' 
                  ? 'bg-accent text-white shadow-lg shadow-accent/30' 
                  : 'bg-white/10 text-gray-400'
              }`}>
                <span className="text-sm font-semibold">1</span>
              </div>
              <div className="text-center">
                <div className={`text-sm font-medium transition-colors ${
                  appState === 'intake' ? 'text-accent' : 'text-gray-400'
                }`}>Assessment</div>
              </div>
            </div>
            
            <div className={`w-12 h-0.5 transition-colors ${
              appState === 'processing' || appState === 'results' ? 'bg-accent' : 'bg-white/20'
            }`}></div>
            
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                appState === 'processing' 
                  ? 'bg-accent text-white shadow-lg shadow-accent/30' 
                  : appState === 'results'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white/10 text-gray-400'
              }`}>
                {appState === 'processing' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">2</span>
                )}
              </div>
              <div className="text-center">
                <div className={`text-sm font-medium transition-colors ${
                  appState === 'processing' ? 'text-accent' : appState === 'results' ? 'text-green-400' : 'text-gray-400'
                }`}>Analysis</div>
              </div>
            </div>
            
            <div className={`w-12 h-0.5 transition-colors ${
              appState === 'results' ? 'bg-accent' : 'bg-white/20'
            }`}></div>
            
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                appState === 'results' 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-white/10 text-gray-400'
              }`}>
                {appState === 'results' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">3</span>
                )}
              </div>
              <div className="text-center">
                <div className={`text-sm font-medium transition-colors ${
                  appState === 'results' ? 'text-green-400' : 'text-gray-400'
                }`}>Results</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative">
          <div className={`${appState === 'results' ? 'flex justify-center' : 'grid lg:grid-cols-3 gap-8 items-start'}`}>
            {/* Left: Intake/Results */}
            <div className={`${appState === 'results' ? 'w-full max-w-6xl' : 'lg:col-span-2'} rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12`}>
            <AnimatePresence mode="wait">
              {appState === 'intake' && (
                <motion.div
                  key="intake"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <ChatInterface 
                    chatHistory={chatHistory}
                    currentQuestionId={currentQuestionId}
                    isTyping={isTyping}
                    currentInput={currentInput}
                    setCurrentInput={setCurrentInput}
                    onAnswer={handleAnswer}
                    companyProfile={companyProfile}
                    setCompanyProfile={setCompanyProfile}
                  />
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

            {/* Right: Real-Time Pool */}
            {appState === 'intake' && (
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Real‑Time Pool</h3>
                <div className="space-y-5">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Process Flags</div>
                    <div className="flex flex-wrap gap-2">
                      {pool.processFlags.length === 0 && (
                        <span className="tp-badge text-gray-400">Answer questions to see flags</span>
                      )}
                      {pool.processFlags.map((f, i) => (
                        <span key={i} className="tp-badge">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Safe Metrics</div>
                    <div className="flex flex-wrap gap-2">
                      {pool.safeMetrics.length === 0 && (
                        <span className="tp-badge text-gray-400">We’ll use benchmarks if you skip</span>
                      )}
                      {pool.safeMetrics.map((m, i) => (
                        <span key={i} className="tp-badge">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Systems</div>
                    <div className="flex flex-wrap gap-2">
                      {pool.systems.length === 0 && (
                        <span className="tp-badge text-gray-400">Add your tools (e.g., QuickBooks, Zendesk)</span>
                      )}
                      {pool.systems.map((s, i) => (
                        <span key={i} className="tp-badge">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white" style={{marginBottom: '0.75rem'}}>Tell Us About Your Business</h3>
        <p className="text-gray-400">Help us understand your company to provide better recommendations</p>
      </div>
      
      <div className="space-y-8">
        <div>
          <label className="block text-white mb-3 text-lg font-medium">What kind of business are you in?</label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsIndustryOpen(!isIndustryOpen)}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300 flex items-center justify-between hover:bg-white/10"
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
          <label className="block text-white mb-3 text-lg font-medium">How big is your team?</label>
          <div className="grid grid-cols-2 gap-4">
            {['Startup (1-10)', 'Small (11-50)', 'Medium (51-500)', 'Enterprise (500+)'].map((size) => (
              <button
                key={size}
                onClick={() => setProfile(prev => ({ ...prev, size }))}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                  profile.size === size
                    ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-accent/20'
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{size}</span>
                  {profile.size === size && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!profile.industry || !profile.size}
          className="w-full py-4 text-lg font-medium"
          size="lg"
        >
          Continue to Assessment
        </Button>
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

      <h3 className="text-2xl font-bold text-white" style={{marginBottom: '1.5rem'}}>AI Analysis in Progress</h3>
      
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

function ChatInterface({ 
  chatHistory, 
  currentQuestionId, 
  isTyping, 
  currentInput, 
  setCurrentInput, 
  onAnswer, 
  companyProfile, 
  setCompanyProfile 
}: {
  chatHistory: Array<{id: string, type: 'ai' | 'user', message: string, timestamp: Date}>
  currentQuestionId: string
  isTyping: boolean
  currentInput: string
  setCurrentInput: (input: string) => void
  onAnswer: (questionId: string, answer: any) => void
  companyProfile: Partial<CompanyProfile>
  setCompanyProfile: (profile: Partial<CompanyProfile>) => void
}) {
  const chatEndRef = useRef<HTMLDivElement>(null)
  const currentQuestion = CHAT_QUESTIONS.find(q => q.id === currentQuestionId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isTyping])

  const handleSubmit = (answer: any) => {
    if (!answer || (typeof answer === 'string' && !answer.trim())) return
    onAnswer(currentQuestionId, answer)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(currentInput)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 max-h-[400px]">
        {chatHistory.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              message.type === 'user' 
                ? 'bg-accent text-white ml-4' 
                : 'bg-white/10 text-white mr-4'
            }`}>
              {message.type === 'ai' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-accent/20 text-accent rounded-full text-xs flex items-center justify-center">
                    AI
                  </div>
                  <span className="text-xs text-gray-400">Assistant</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{message.message}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white mr-4 p-4 rounded-2xl max-w-[80%]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-accent/20 text-accent rounded-full text-xs flex items-center justify-center">
                  AI
                </div>
                <span className="text-xs text-gray-400">Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area - Show for any question type */}
      {currentQuestion && currentQuestion.type === 'question' && (
        <div className="border-t border-white/10 pt-4">
          {currentQuestion.inputType === 'text' ? (
            <div className="flex gap-3">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentQuestion.placeholder}
                className="flex-1 p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-none"
                rows={2}
              />
              <button
                onClick={() => handleSubmit(currentInput)}
                disabled={!currentInput.trim()}
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(currentQuestion.inputType === 'multi_choice' ? [option] : option)}
                  className="w-full p-4 text-left bg-white/5 hover:bg-white/10 border border-white/20 hover:border-accent/50 rounded-xl text-white transition-all duration-200 hover:scale-[1.02]"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
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
        <h3 className="text-3xl font-bold text-white" style={{marginBottom: '1rem'}}>Your AI Assessment Results</h3>
        {error && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
            <p className="text-yellow-200 text-sm">{error}</p>
          </div>
        )}
        <div className="mt-8 mb-6 flex justify-center">
          <p className="text-gray-300 max-w-2xl text-center">
            Our AI has analyzed your business and identified specific automation opportunities.
          </p>
        </div>
        <Button onClick={onRestart} variant="outline" size="sm">
          Start New Assessment
        </Button>
      </div>

      {/* Dashboard Summary */}
      <div className="rounded-2xl border border-white/10 bg-transparent p-8 lg:p-12 mb-12">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white" style={{marginBottom: '1rem'}}>Assessment Overview</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Your personalized AI automation analysis with quantified impact and implementation roadmap
          </p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Savings */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-accent/30 text-center">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
                  <path d="M12 2V6M6.414 6.414L9.172 9.172M2 12H6M6.414 17.586L9.172 14.828M12 18V22M17.586 17.586L14.828 14.828M22 12H18M17.586 6.414L14.828 9.172" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-accent mb-2">
                ${assessment.executiveSummary?.totalPotentialSavings?.toLocaleString() || '0'}
              </div>
              <p className="text-gray-300 text-sm font-medium">Annual Savings Potential</p>
            </div>
          </div>

          {/* Process Opportunities */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-blue-500/30 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                  <path d="M9 12L11 14L15 10M7.5 21L17.5 21C18.9001 21 19.6002 21 20.135 20.7275C20.6054 20.4878 20.9878 20.1054 21.2275 19.635C21.5 19.1002 21.5 18.4001 21.5 17V7C21.5 5.59987 21.5 4.8998 21.2275 4.36502C20.9878 3.89462 20.6054 3.51217 20.135 3.27248C19.6002 3 18.9001 3 17.5 3L6.5 3C5.09987 3 4.3998 3 3.86502 3.27248C3.39462 3.51217 3.01217 3.89462 2.77248 4.36502C2.5 4.8998 2.5 5.59987 2.5 7V17C2.5 18.4001 2.5 19.1002 2.77248 19.635C3.01217 20.1054 3.39462 20.4878 3.86502 20.7275C4.3998 21 5.09987 21 6.5 21L7.5 21Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {assessment.processFlags?.length || 0}
              </div>
              <p className="text-gray-300 text-sm font-medium">Automation Opportunities</p>
            </div>
          </div>

          {/* Quick Wins */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-green-500/30 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-400">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-green-400 mb-2">
                {assessment.roadmap?.filter((item: any) => item.priority === 'quick_win').length || 0}
              </div>
              <p className="text-gray-300 text-sm font-medium">Quick Wins (30 days)</p>
            </div>
          </div>

          {/* Recommended Tools */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-purple-500/30 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                  <path d="M21 16V8C21 5.79086 19.2091 4 17 4H7C4.79086 4 3 5.79086 3 8V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 8H17M7 12H17M7 16H13" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {assessment.recommendedTools?.length || 0}
              </div>
              <p className="text-gray-300 text-sm font-medium">Solution Recommendations</p>
            </div>
          </div>
        </div>

        {/* Impact Breakdown */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* High Impact Opportunities */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-2xl p-6 border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <h4 className="text-lg font-semibold text-red-300">High Impact</h4>
            </div>
            <div className="text-3xl font-bold text-red-300 mb-2">
              {assessment.processFlags?.filter((flag: any) => flag.impact === 'high').length || 0}
            </div>
            <p className="text-gray-300 text-sm">Critical automation opportunities requiring immediate attention</p>
          </div>

          {/* Medium Impact Opportunities */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-2xl p-6 border border-yellow-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <h4 className="text-lg font-semibold text-yellow-300">Medium Impact</h4>
            </div>
            <div className="text-3xl font-bold text-yellow-300 mb-2">
              {assessment.processFlags?.filter((flag: any) => flag.impact === 'medium').length || 0}
            </div>
            <p className="text-gray-300 text-sm">Valuable improvements for operational efficiency</p>
          </div>

          {/* Implementation Timeline */}
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <h4 className="text-lg font-semibold text-accent">Timeline</h4>
            </div>
            <div className="text-2xl font-bold text-accent mb-2">
              {assessment.executiveSummary?.implementationTimeframe || '90 days'}
            </div>
            <p className="text-gray-300 text-sm">Complete transformation timeline with phased rollout</p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {assessment.executiveSummary && (
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 lg:p-12 text-center">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-white" style={{marginBottom: '0.75rem'}}>Executive Summary</h4>
            {assessment.executiveSummary.businessCase && (
              <div className="flex justify-center">
                <p className="text-gray-300 max-w-3xl text-center leading-relaxed" style={{textAlign: 'center'}}>{assessment.executiveSummary.businessCase}</p>
              </div>
            )}
          </div>
          
          {/* Key Metrics */}
          <div className="space-y-3 max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between py-4 px-6 bg-white/[0.02] border border-white/[0.05] rounded-full hover:bg-white/[0.04] transition-colors">
              <span className="text-sm text-gray-400 font-medium">Annual Savings Potential</span>
              <div className="text-right">
                <span className="text-lg font-semibold text-accent">${assessment.executiveSummary.totalPotentialSavings?.toLocaleString() || '0'}</span>
                {assessment.executiveSummary.savingsRange && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    ${assessment.executiveSummary.savingsRange.low?.toLocaleString()} - ${assessment.executiveSummary.savingsRange.high?.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-4 px-6 bg-white/[0.02] border border-white/[0.05] rounded-full hover:bg-white/[0.04] transition-colors">
              <span className="text-sm text-gray-400 font-medium">Quick Wins (30 days)</span>
              <span className="text-lg font-semibold text-accent2">{assessment.executiveSummary.quickWins || 0}</span>
            </div>
            <div className="flex items-center justify-between py-4 px-6 bg-white/[0.02] border border-white/[0.05] rounded-full hover:bg-white/[0.04] transition-colors">
              <span className="text-sm text-gray-400 font-medium">Strategic Initiatives</span>
              <span className="text-lg font-semibold text-white">{assessment.executiveSummary.strategicInitiatives || 0}</span>
            </div>
            <div className="flex items-center justify-between py-4 px-6 bg-white/[0.02] border border-white/[0.05] rounded-full hover:bg-white/[0.04] transition-colors">
              <span className="text-sm text-gray-400 font-medium">Implementation Timeline</span>
              <span className="text-base font-semibold text-white">{assessment.executiveSummary.implementationTimeframe || 'Contact us'}</span>
            </div>
          </div>

          {/* Top Recommendation */}
          {assessment.executiveSummary.topRecommendation && (
            <div className="bg-gradient-to-r from-accent/20 to-accent2/20 rounded-lg p-6 mb-6 text-center">
              <h5 className="text-lg font-semibold text-white mb-2">Top Recommendation</h5>
              <p className="text-gray-200">{assessment.executiveSummary.topRecommendation}</p>
            </div>
          )}

          {/* Success Factors & Competitive Advantage */}
          <div className="grid md:grid-cols-2 gap-6">
            {assessment.executiveSummary.keySuccessFactors && (
              <div className="bg-white/5 rounded-lg p-6">
                <h5 className="text-lg font-semibold text-white mb-3">Key Success Factors</h5>
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
              <div className="bg-white/5 rounded-lg p-6 text-center">
                <h5 className="text-lg font-semibold text-white mb-3">Competitive Advantage</h5>
                <p className="text-gray-300">{assessment.executiveSummary.competitiveAdvantage}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Process Flags */}
      {assessment.processFlags?.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 lg:p-12">
          <div className="text-center mb-12">
            <h4 className="text-2xl font-bold text-white" style={{marginBottom: '1rem'}}>Deep Process Analysis</h4>
            <div className="mt-6 flex justify-center">
              <p className="text-gray-300 max-w-2xl text-center">Detailed breakdown of automation opportunities identified in your workflow</p>
            </div>
          </div>
          <div className="grid gap-8 max-w-6xl mx-auto">
            {assessment.processFlags.map((flag: any, index: number) => (
              <div key={flag.id} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-accent2/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:border-accent/20 hover:shadow-lg hover:shadow-accent/10">
                  
                  {/* Header Section */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
                    <div className="flex-1">
                      <h5 className="text-2xl font-bold text-white" style={{marginBottom: '0.75rem'}}>{flag.label}</h5>
                      <p className="text-lg text-gray-400 capitalize mb-4 lg:mb-0">{flag.category?.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide ${
                        flag.impact === 'high' ? 'bg-white/10 text-gray-300' :
                        flag.impact === 'medium' ? 'bg-white/10 text-gray-300' :
                        'bg-white/10 text-gray-300'
                      }`}>
                        {flag.impact} impact
                      </div>
                    </div>
                  </div>

                  {/* Current State & Automation Approach */}
                  <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {flag.currentState && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h6 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          Current State
                        </h6>
                        <p className="text-gray-300 leading-relaxed">{flag.currentState}</p>
                      </div>
                    )}
                    {flag.automationPotential && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h6 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          Automation Approach
                        </h6>
                        <p className="text-gray-300 leading-relaxed">{flag.automationPotential}</p>
                      </div>
                    )}
                  </div>

                  {/* Metrics - Modern Horizontal Layout */}
                  <div className="space-y-3 mb-8">
                    {flag.timeSavingsPerInstance && (
                      <div className="flex items-center justify-between py-3 px-5 bg-white/[0.02] border border-white/[0.05] rounded-full hover:bg-white/[0.04] transition-colors">
                        <span className="text-sm text-gray-400 font-medium">Time Savings</span>
                        <span className="text-base font-semibold text-white">{flag.timeSavingsPerInstance}</span>
                      </div>
                    )}
                    {flag.errorReduction && (
                      <div className="flex items-center justify-between py-3 px-5 bg-white/[0.02] border border-white/[0.05] rounded-full hover:bg-white/[0.04] transition-colors">
                        <span className="text-sm text-gray-400 font-medium">Error Reduction</span>
                        <span className="text-base font-semibold text-white">{flag.errorReduction}</span>
                      </div>
                    )}
                    {flag.complexityScore && (
                      <div className="flex items-center justify-between py-3 px-5 bg-white/[0.02] border border-white/[0.05] rounded-full hover:bg-white/[0.04] transition-colors">
                        <span className="text-sm text-gray-400 font-medium">Implementation Complexity</span>
                        <span className="text-base font-semibold text-white">{flag.complexityScore}/5</span>
                      </div>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {flag.prerequisiteConditions && flag.prerequisiteConditions.length > 0 && (
                    <div className="bg-orange-500/5 rounded-xl p-6 border border-orange-500/20">
                      <h6 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        Prerequisites
                      </h6>
                      <div className="flex flex-wrap gap-3">
                        {flag.prerequisiteConditions.map((condition: string, i: number) => (
                          <span key={i} className="px-3 py-2 bg-orange-500/20 text-orange-300 rounded-lg border border-orange-500/30 text-sm font-medium">
                            {condition.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Tools for this Process */}
                  {assessment.recommendedTools && assessment.recommendedTools.length > 0 && (
                    <div className="bg-accent/5 rounded-xl p-6 border border-accent/20">
                      <h6 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        Recommended Solutions
                      </h6>
                      <div className="flex flex-wrap gap-4">
                        {assessment.recommendedTools.slice(0, 4).map((tool: any, i: number) => {
                          // Function to get company logo URL
                          const getLogoUrl = (toolName: string, vendor?: string) => {
                            const name = toolName.toLowerCase();
                            const vendorName = vendor?.toLowerCase() || '';
                            
                            // Map common tools to their logo URLs
                            const logoMap: Record<string, string> = {
                              // AP/Finance Tools
                              'stampli': 'https://logo.clearbit.com/stampli.com',
                              'tipalti': 'https://logo.clearbit.com/tipalti.com',
                              'bill.com': 'https://logo.clearbit.com/bill.com',
                              'bill': 'https://logo.clearbit.com/bill.com',
                              'quickbooks': 'https://logo.clearbit.com/intuit.com',
                              'xero': 'https://logo.clearbit.com/xero.com',
                              'netsuite': 'https://logo.clearbit.com/netsuite.com',
                              'appzen': 'https://logo.clearbit.com/appzen.com',
                              'vic.ai': 'https://logo.clearbit.com/vic.ai',
                              'mindbridge': 'https://logo.clearbit.com/mindbridge.ai',
                              
                              // Customer Support Tools
                              'zendesk': 'https://logo.clearbit.com/zendesk.com',
                              'intercom': 'https://logo.clearbit.com/intercom.com',
                              'freshdesk': 'https://logo.clearbit.com/freshworks.com',
                              'helpscout': 'https://logo.clearbit.com/helpscout.com',
                              'gorgias': 'https://logo.clearbit.com/gorgias.com',
                              'ada': 'https://logo.clearbit.com/ada.cx',
                              'ultimate.ai': 'https://logo.clearbit.com/ultimate.ai',
                              'cresta': 'https://logo.clearbit.com/cresta.com',
                              
                              // HR/Recruiting Tools
                              'greenhouse': 'https://logo.clearbit.com/greenhouse.io',
                              'lever': 'https://logo.clearbit.com/lever.co',
                              'workday': 'https://logo.clearbit.com/workday.com',
                              'bamboohr': 'https://logo.clearbit.com/bamboohr.com',
                              'hiretual': 'https://logo.clearbit.com/hiretual.com',
                              'textio': 'https://logo.clearbit.com/textio.com',
                              
                              // Sales/CRM Tools
                              'salesforce': 'https://logo.clearbit.com/salesforce.com',
                              'hubspot': 'https://logo.clearbit.com/hubspot.com',
                              'pipedrive': 'https://logo.clearbit.com/pipedrive.com',
                              'outreach': 'https://logo.clearbit.com/outreach.io',
                              'salesloft': 'https://logo.clearbit.com/salesloft.com',
                              'gong': 'https://logo.clearbit.com/gong.io',
                              'chorus': 'https://logo.clearbit.com/chorus.ai',
                              
                              // Workflow/Automation Tools
                              'zapier': 'https://logo.clearbit.com/zapier.com',
                              'microsoft power automate': 'https://logo.clearbit.com/microsoft.com',
                              'power automate': 'https://logo.clearbit.com/microsoft.com',
                              'uipath': 'https://logo.clearbit.com/uipath.com',
                              'automation anywhere': 'https://logo.clearbit.com/automationanywhere.com',
                              'blue prism': 'https://logo.clearbit.com/blueprism.com',
                              
                              // Document Processing
                              'docusign': 'https://logo.clearbit.com/docusign.com',
                              'adobe sign': 'https://logo.clearbit.com/adobe.com',
                              'pandadoc': 'https://logo.clearbit.com/pandadoc.com',
                              'rossum': 'https://logo.clearbit.com/rossum.ai',
                              'nanonets': 'https://logo.clearbit.com/nanonets.com',
                              
                              // Generic fallbacks
                              'microsoft': 'https://logo.clearbit.com/microsoft.com',
                              'google': 'https://logo.clearbit.com/google.com',
                              'amazon': 'https://logo.clearbit.com/amazon.com',
                              'oracle': 'https://logo.clearbit.com/oracle.com',
                              'sap': 'https://logo.clearbit.com/sap.com'
                            };
                            
                            // Try exact match first
                            if (logoMap[name]) return logoMap[name];
                            
                            // Try vendor name
                            if (vendorName && logoMap[vendorName]) return logoMap[vendorName];
                            
                            // Try partial matches
                            for (const [key, url] of Object.entries(logoMap)) {
                              if (name.includes(key) || key.includes(name)) {
                                return url;
                              }
                            }
                            
                            // Fallback to generic domain-based logo
                            const cleanName = name.replace(/[^a-z0-9]/g, '');
                            return `https://logo.clearbit.com/${cleanName}.com`;
                          };
                          
                          const logoUrl = getLogoUrl(tool.name, tool.vendor);
                          
                          return (
                            <div key={tool.id} className="group relative flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all duration-200">
                              {/* Tool Logo */}
                              <div className="w-10 h-10 bg-white rounded-lg border border-white/20 flex items-center justify-center flex-shrink-0 p-1.5 hover:scale-105 transition-transform duration-200">
                                <img 
                                  src={logoUrl}
                                  alt={`${tool.name} logo`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    // Fallback to initials if logo fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLDivElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                                {/* Fallback initials (hidden by default) */}
                                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent2/20 rounded flex items-center justify-center text-white font-bold text-xs" style={{display: 'none'}}>
                                  {tool.name.split(' ').map((word: string) => word[0]).join('').slice(0, 2)}
                                </div>
                              </div>
                              {/* Tool Info */}
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-medium text-sm">{tool.name}</div>
                                <div className="text-gray-400 text-xs">{tool.pricing}</div>
                              </div>
                              {/* Priority Badge */}
                              <div className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium">
                                #{tool.priority}
                              </div>
                              {/* Tooltip on hover */}
                              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                {tool.description?.slice(0, 80)}...
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {assessment.recommendedTools.length > 4 && (
                        <div className="mt-3 text-center">
                          <span className="text-xs text-gray-500">+{assessment.recommendedTools.length - 4} more tools recommended</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}





      {/* Industry Benchmarks */}
      {assessment.industryBenchmarks && (
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 lg:p-12">
          <div className="text-center mb-12">
            <h4 className="text-2xl font-bold text-white" style={{marginBottom: '1rem'}}>Industry Benchmarks & Context</h4>
            <div className="mt-6 flex justify-center">
              <p className="text-gray-300 max-w-2xl text-center">How your automation maturity compares to industry standards</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div>
                <h5 className="text-lg font-semibold text-white mb-3">Automation Maturity</h5>
                <p className="text-gray-300">{assessment.industryBenchmarks.automationMaturity}</p>
              </div>
              <div>
                <h5 className="text-lg font-semibold text-white mb-3">Typical ROI Range</h5>
                <p className="text-accent font-medium">{assessment.industryBenchmarks.typicalROI}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h5 className="text-lg font-semibold text-white mb-3">Common Challenges</h5>
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
                <h5 className="text-lg font-semibold text-white mb-3">Success Patterns</h5>
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
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 lg:p-12">
          <div className="text-center mb-12">
            <h4 className="text-2xl font-bold text-white" style={{marginBottom: '1rem'}}>Phased Implementation Strategy</h4>
            <div className="mt-6 flex justify-center">
              <p className="text-gray-300 max-w-2xl text-center">Phased approach to ensure successful deployment and adoption</p>
            </div>
          </div>
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Phase Breakdown */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
                <h5 className="text-xl font-semibold text-green-300 mb-3">Phase 1: 30 Days</h5>
                <p className="text-gray-300">{assessment.implementationStrategy.phase1_30days}</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
                <h5 className="text-xl font-semibold text-blue-300 mb-3">Phase 2: 60 Days</h5>
                <p className="text-gray-300">{assessment.implementationStrategy.phase2_60days}</p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/20">
                <h5 className="text-xl font-semibold text-purple-300 mb-3">Phase 3: 90 Days</h5>
                <p className="text-gray-300">{assessment.implementationStrategy.phase3_90days}</p>
              </div>
            </div>

            {/* Success Factors & Roadblocks */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-lg font-semibold text-white mb-4">Critical Success Factors</h5>
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
                <h5 className="text-lg font-semibold text-white mb-4">Potential Roadblocks</h5>
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
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 lg:p-12">
          <div className="text-center mb-12">
            <h4 className="text-2xl font-bold text-white" style={{marginBottom: '1rem'}}>Strategic AI Insights</h4>
            <div className="mt-6 flex justify-center">
              <p className="text-gray-300 max-w-2xl text-center">Deep analysis and strategic recommendations from our AI consultant</p>
            </div>
          </div>
          <div className="grid gap-6 max-w-4xl mx-auto">
            {assessment.aiInsights.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-gradient-to-r from-accent/10 to-accent2/10 rounded-lg border border-accent/20">
                <div className="w-8 h-8 bg-accent/20 text-accent rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1">
                  AI
                </div>
                <p className="text-gray-200 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Actions */}
      <div className="text-center">
        <h4 className="text-xl font-bold text-white" style={{marginBottom: '1rem'}}>Ready to Implement?</h4>
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