"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { CompanyProfile } from '@/lib/types'
// Simplified inline implementation - no heavy external dependencies needed

interface InlineAIAuditProps {
  isVisible: boolean
  onClose: () => void
}

const PROCESS_QUESTIONS = [
  {
    id: 'biggest_frustration',
    category: 'What\'s Driving You Crazy?',
    question: 'What\'s the most frustrating or time-consuming thing your team deals with daily?',
    type: 'single_choice' as const,
    options: [
      'Too many emails to manage', 
      'Manually entering data from documents', 
      'Chasing approvals and getting things signed',
      'Customer support taking forever',
      'Tracking down invoices and payments',
      'Something else entirely'
    ]
  },
  {
    id: 'time_drain',
    category: 'How Bad Is It?',
    question: 'Roughly how much time does your team spend on this frustrating stuff each week?',
    type: 'single_choice' as const,
    options: [
      'A few hours here and there',
      'About half a day (3-4 hours)', 
      'A full day or more (8+ hours)',
      'It feels like all we do sometimes (20+ hours)',
      'Honestly, no idea - but it\'s a lot'
    ]
  },
  {
    id: 'current_setup',
    category: 'How You Handle Things Now',
    question: 'How do you currently manage most of your daily business tasks?',
    type: 'multiple_choice' as const,
    options: [
      'Lots of Excel/Google Sheets',
      'Email for pretty much everything', 
      'Some business software (CRM, accounting, etc.)',
      'Mostly pen, paper, and memory',
      'A mix of random tools that don\'t talk to each other'
    ]
  }
]

type AppState = 'intake' | 'processing' | 'roadmap'

export default function InlineAIAudit({ isVisible, onClose }: InlineAIAuditProps) {
  const [appState, setAppState] = useState<AppState>('intake')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [companyProfile, setCompanyProfile] = useState<Partial<CompanyProfile>>({})
  const [sessionData, setSessionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    
    try {
      // Prepare data for backend
      const requestData = {
        companyProfile,
        answers: Object.entries(answers).map(([id, answer]) => ({
          id,
          category: PROCESS_QUESTIONS.find(q => q.id === id)?.category || '',
          question: PROCESS_QUESTIONS.find(q => q.id === id)?.question || '',
          answer
        })),
        customProblem: ''
      }

      // Call the actual AI analysis endpoint
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const results = await response.json()
      
      setSessionData({
        ...results,
        companyProfile: companyProfile as CompanyProfile,
        answers: requestData.answers
      })
      
      setAppState('roadmap')
    } catch (error) {
      console.error('Analysis failed:', error)
      // Fallback to mock data if backend fails
      const mockResults = {
        processFlags: [],
        safeMetrics: [],
        aiInsights: ['Analysis completed with available data'],
        recommendedTools: [],
        companyProfile: companyProfile as CompanyProfile,
        answers: Object.entries(answers).map(([id, answer]) => ({
          id,
          category: PROCESS_QUESTIONS.find(q => q.id === id)?.category || '',
          question: PROCESS_QUESTIONS.find(q => q.id === id)?.question || '',
          answer
        }))
      }
      setSessionData(mockResults)
      setAppState('roadmap')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    setAppState('intake')
    setCurrentQuestion(0)
    setAnswers({})
    setCompanyProfile({})
    setSessionData(null)
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
        {/* Header with close button */}
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

          {/* Progress labels */}
          <div className="flex justify-center gap-6 text-sm text-gray-400 mt-8">
            <span className={appState === 'intake' ? 'text-accent' : ''}>Assessment</span>
            <span className={appState === 'processing' ? 'text-accent' : ''}>Analysis</span>
            <span className={appState === 'roadmap' ? 'text-accent' : ''}>Roadmap</span>
          </div>
        </div>

        {/* Main content area - using same glassmorphism as Tool Pool */}
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
                      onSubmit={(profile) => {
                        setCompanyProfile(profile)
                      }}
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

              {appState === 'roadmap' && sessionData && (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full space-y-8"
                >
                  <AIResultsDisplay results={sessionData} onRestart={handleRestart} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function CompanyProfileForm({ onSubmit }: { onSubmit: (profile: Partial<CompanyProfile>) => void }) {
  const [profile, setProfile] = useState<Partial<CompanyProfile>>({})

  const handleSubmit = () => {
    if (profile.industry && profile.size) {
      onSubmit(profile)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-2xl font-bold text-white mb-6">Tell Us About Your Business</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-white mb-2">What kind of business are you in?</label>
          <select
            value={profile.industry || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-accent"
          >
            <option value="">Select industry</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Other">Other</option>
          </select>
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

      <div className="space-y-3 mb-8">
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

      <Button
        onClick={onNext}
        disabled={!answer || (Array.isArray(answer) && answer.length === 0)}
        className="w-full"
      >
        {questionNumber === totalQuestions ? 'Generate My AI Roadmap' : 'Next Question'}
      </Button>
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

function AIResultsDisplay({ results, onRestart }: { results: any, onRestart: () => void }) {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-3xl font-bold text-white mb-4">Your AI Analysis Results</h3>
        <p className="text-gray-300 max-w-2xl mx-auto mb-6">
          Our AI has analyzed your business and identified specific automation opportunities tailored to your needs.
        </p>
        <Button onClick={onRestart} variant="outline" size="sm">
          Start New Assessment
        </Button>
      </div>

      {/* AI Insights Section */}
      {results.aiInsights && results.aiInsights.length > 0 && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 4.33 13.92 4.64 13.78 4.92C15.66 5.53 17.13 7.18 17.5 9.25C17.81 9.09 18.15 9 18.5 9C19.88 9 21 10.12 21 11.5C21 12.88 19.88 14 18.5 14C18.12 14 17.76 13.9 17.43 13.72C16.97 15.55 15.38 16.94 13.41 17.31C13.2 17.76 12.65 18.05 12 18.05C11.35 18.05 10.8 17.76 10.59 17.31C8.62 16.94 7.03 15.55 6.57 13.72C6.24 13.9 5.88 14 5.5 14C4.12 14 3 12.88 3 11.5C3 10.12 4.12 9 5.5 9C5.85 9 6.19 9.09 6.5 9.25C6.87 7.18 8.34 5.53 10.22 4.92C10.08 4.64 10 4.33 10 4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">AI Insights</h4>
            <p className="text-gray-300">Key findings from your business analysis</p>
          </div>
          <div className="grid gap-4 max-w-3xl mx-auto">
            {results.aiInsights.map((insight: string, index: number) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                <p className="text-gray-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process Flags Section */}
      {results.processFlags && results.processFlags.length > 0 && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent2/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent2">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Automation Opportunities</h4>
            <p className="text-gray-300">Specific processes identified for AI automation</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {results.processFlags.map((flag: any, index: number) => (
              <div key={flag.id} className="p-6 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-lg font-semibold text-white">{flag.label}</h5>
                  <span className="text-sm text-accent2 bg-accent2/20 px-2 py-1 rounded">
                    {Math.round(flag.confidence * 100)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-400 capitalize">{flag.category} automation</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Tools Section */}
      {results.recommendedTools && results.recommendedTools.length > 0 && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-yellow-400">
                <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" fill="currentColor"/>
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Recommended Tools</h4>
            <p className="text-gray-300">AI-matched solutions for your specific needs</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {results.recommendedTools.slice(0, 6).map((tool: any, index: number) => (
              <div key={tool.id} className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-semibold text-white mb-1">{tool.product_name}</h5>
                    <p className="text-sm text-gray-400">{tool.vendor_name}</p>
                  </div>
                  {tool.pricing_band_usd_per_month && (
                    <span className="text-xs text-accent2 bg-accent2/20 px-2 py-1 rounded">
                      ${tool.pricing_band_usd_per_month.low}-{tool.pricing_band_usd_per_month.high}/mo
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-4">{tool.one_liner}</p>
                {tool.match_reasoning && (
                  <p className="text-xs text-gray-400 italic">{tool.match_reasoning}</p>
                )}
                {tool.time_to_value_weeks && (
                  <div className="mt-3 text-xs text-yellow-400">
                    Time to value: {tool.time_to_value_weeks.low}-{tool.time_to_value_weeks.high} weeks
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Metrics Section */}
      {results.safeMetrics && results.safeMetrics.length > 0 && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                <path d="M7 14L9 12L13 16L17 8M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Key Business Metrics</h4>
            <p className="text-gray-300">Important data points identified from your input</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {results.safeMetrics.map((metric: any, index: number) => (
              <div key={metric.id} className="p-6 bg-white/5 rounded-lg text-center">
                <h5 className="text-lg font-semibold text-white mb-2">{metric.label}</h5>
                <p className="text-2xl font-bold text-blue-400 mb-1">{metric.value}</p>
                <p className="text-sm text-gray-400">{metric.unit}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="text-center">
        <h4 className="text-xl font-bold text-white mb-4">Ready to Implement?</h4>
        <p className="text-gray-300 mb-6">
          Get detailed implementation guides and ROI calculations for your selected tools.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">Download Full Report</Button>
          <Button variant="outline" size="lg">Schedule Consultation</Button>
        </div>
      </div>
    </div>
  )
}