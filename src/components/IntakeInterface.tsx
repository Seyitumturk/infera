"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ProcessFlag, SafeMetric, CompanyProfile, ProcessQuestion } from '@/lib/types'
import { AIClient } from '@/lib/ai-client'
import { loadSolutions, loadTools } from '@/lib/utils'
import { 
  CpuChipIcon as Brain,
  BuildingOfficeIcon as Building,
  ClockIcon as Clock,
  CurrencyDollarIcon as DollarSign,
  FlagIcon as Target,
  BoltIcon as Zap
} from '@heroicons/react/24/outline'

interface IntakeInterfaceProps {
  onComplete: (data: {
    processFlags: ProcessFlag[]
    safeMetrics: SafeMetric[]
    companyProfile: CompanyProfile
    answers: ProcessQuestion[]
  }) => void
}

const PROCESS_QUESTIONS = [
  {
    id: 'invoice_processing',
    category: 'Finance',
    question: 'How do invoices arrive at your company?',
    type: 'multiple_choice' as const,
    options: ['Email inbox', 'Vendor portal', 'Paper mail', 'EDI/API', 'Mixed channels'],
    followUp: {
      condition: (answer: any) => answer.includes('Email inbox') || answer.includes('Paper mail'),
      question: 'Do you manually review each invoice?',
      type: 'boolean' as const
    }
  },
  {
    id: 'customer_support',
    category: 'Customer Service',
    question: 'What channels do customers use to contact support?',
    type: 'multiple_choice' as const,
    options: ['Email', 'Live chat', 'Phone', 'Social media', 'Help center'],
    followUp: {
      condition: (answer: any) => answer.length > 0,
      question: 'Are Tier-1 support replies mostly templated?',
      type: 'boolean' as const
    }
  },
  {
    id: 'sales_leads',
    category: 'Sales',
    question: 'How do you currently handle new sales leads?',
    type: 'multiple_choice' as const,
    options: ['Manual review', 'Basic CRM routing', 'No systematic process', 'Automated qualification'],
    followUp: {
      condition: (answer: any) => answer.includes('Manual review'),
      question: 'How long does it typically take to follow up with a new lead?',
      type: 'text' as const
    }
  },
  {
    id: 'document_processing',
    category: 'Operations',
    question: 'What types of documents does your team process regularly?',
    type: 'multiple_choice' as const,
    options: ['Contracts', 'Forms', 'Receipts', 'Resumes', 'Reports', 'Other'],
    followUp: {
      condition: (answer: any) => answer.length > 0,
      question: 'Is most of this processing done manually?',
      type: 'boolean' as const
    }
  },
  {
    id: 'data_entry',
    category: 'Operations',
    question: 'How much time does your team spend on repetitive data entry?',
    type: 'single_choice' as const,
    options: ['Less than 1 hour/day', '1-3 hours/day', '3-6 hours/day', 'More than 6 hours/day'],
    followUp: {
      condition: (answer: any) => answer !== 'Less than 1 hour/day',
      question: 'What is the approximate hourly cost for this work?',
      type: 'text' as const
    }
  }
]

export default function IntakeInterface({ onComplete }: IntakeInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [companyProfile, setCompanyProfile] = useState<Partial<CompanyProfile>>({})
  const [answers, setAnswers] = useState<ProcessQuestion[]>([])
  const [processFlags, setProcessFlags] = useState<ProcessFlag[]>([])
  const [safeMetrics, setSafeMetrics] = useState<SafeMetric[]>([])
  const [customProblem, setCustomProblem] = useState('')
  const [aiClient, setAIClient] = useState<AIClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize AI Client system
  useEffect(() => {
    const initializeAIClient = async () => {
      try {
        const [solutions, tools] = await Promise.all([
          loadSolutions(),
          loadTools()
        ])
        const aiInstance = new AIClient(solutions, tools)
        // Note: We don't initialize here, we do it when needed to avoid API calls on page load
        setAIClient(aiInstance)
      } catch (error) {
        console.error('Failed to initialize AI Client:', error)
      } finally {
        setIsLoading(false)
      }
    }
    initializeAIClient()
  }, [])

  // Real-time process flag and metric extraction (simplified for AI version)
  useEffect(() => {
    if (aiClient && answers.length > 0) {
      // Simple flag extraction for real-time preview
      const flags: ProcessFlag[] = []
      const metrics: SafeMetric[] = []
      
      answers.forEach((answer, index) => {
        if (typeof answer.answer === 'boolean' && answer.answer) {
          flags.push({
            id: `flag_${index}`,
            label: `Manual ${answer.category} process`,
            category: answer.category,
            confidence: 0.8,
            editable: true
          })
        }
      })
      
      setProcessFlags(flags)
      setSafeMetrics(metrics)
    }
  }, [answers, aiClient])

  const handleCompanyProfileSubmit = (profile: Partial<CompanyProfile>) => {
    setCompanyProfile(profile)
    setCurrentStep(1)
  }

  const handleQuestionAnswer = (questionId: string, answer: any, metrics?: Record<string, any>) => {
    const question = PROCESS_QUESTIONS.find(q => q.id === questionId)
    if (!question) return

    const processAnswer: ProcessQuestion = {
      category: question.category,
      question: question.question,
      answer,
      metrics
    }

    setAnswers(prev => {
      const existing = prev.findIndex(a => a.question === question.question)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = processAnswer
        return updated
      }
      return [...prev, processAnswer]
    })
  }

  const handleComplete = () => {
    if (!aiClient || !companyProfile.industry || !companyProfile.size) return

    onComplete({
      processFlags,
      safeMetrics,
      companyProfile: companyProfile as CompanyProfile,
      answers
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted">Initializing AI analysis system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-layout py-section max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text mb-2">
                AI Opportunity Assessment
              </h1>
              <p className="text-muted">
                Tell us about your business processes and we'll identify AI automation opportunities with quantified savings.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <CompanyProfileForm
                  key="profile"
                  onSubmit={handleCompanyProfileSubmit}
                  initialData={companyProfile}
                />
              )}
              {currentStep === 1 && (
                <ProcessQuestionsForm
                  key="questions"
                  questions={PROCESS_QUESTIONS}
                  onAnswer={handleQuestionAnswer}
                  onNext={() => setCurrentStep(2)}
                  answers={answers}
                />
              )}
              {currentStep === 2 && (
                <CustomProblemForm
                  key="custom"
                  value={customProblem}
                  onChange={setCustomProblem}
                  onComplete={handleComplete}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Real-time Pool */}
          <div className="lg:col-span-1">
            <RealTimePool
              processFlags={processFlags}
              safeMetrics={safeMetrics}
              companyProfile={companyProfile}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function CompanyProfileForm({ 
  onSubmit, 
  initialData 
}: {
  onSubmit: (profile: Partial<CompanyProfile>) => void
  initialData: Partial<CompanyProfile>
}) {
  const [profile, setProfile] = useState(initialData)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (profile.industry && profile.size) {
      onSubmit(profile)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            Help us understand your business context for better recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Industry
              </label>
              <select
                value={profile.industry || ''}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                className="w-full p-3 bg-surface border border-border rounded-lg text-text focus:ring-2 focus:ring-accent focus:border-accent"
                required
              >
                <option value="">Select your industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="professional_services">Professional Services</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Company Size
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'startup', label: 'Startup (1-10)' },
                  { value: 'smb', label: 'Small (11-50)' },
                  { value: 'midmarket', label: 'Medium (51-500)' },
                  { value: 'enterprise', label: 'Enterprise (500+)' }
                ].map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setProfile({ ...profile, size: size.value as any })}
                    className={`p-3 rounded-lg border transition-all ${
                      profile.size === size.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-surface text-text hover:border-accent/50'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Annual Budget for AI/Automation (Optional)
              </label>
              <select
                value={profile.budget_range || ''}
                onChange={(e) => setProfile({ ...profile, budget_range: e.target.value as any })}
                className="w-full p-3 bg-surface border border-border rounded-lg text-text focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="">Prefer not to say</option>
                <option value="<10k">Less than $10,000</option>
                <option value="10k-50k">$10,000 - $50,000</option>
                <option value="50k-200k">$50,000 - $200,000</option>
                <option value="200k+">$200,000+</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={!profile.industry || !profile.size}>
              Continue to Process Questions
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ProcessQuestionsForm({
  questions,
  onAnswer,
  onNext,
  answers
}: {
  questions: typeof PROCESS_QUESTIONS
  onAnswer: (questionId: string, answer: any, metrics?: Record<string, any>) => void
  onNext: () => void
  answers: ProcessQuestion[]
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState<any>(null)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpAnswer, setFollowUpAnswer] = useState<any>(null)

  const question = questions[currentQuestion]
  const hasAnswered = answers.some(a => a.question === question.question)

  const handleAnswerSubmit = () => {
    if (!currentAnswer) return

    let metrics: Record<string, any> | undefined
    
    // Extract metrics from follow-up answers
    if (followUpAnswer && typeof followUpAnswer === 'string' && followUpAnswer.match(/\d+/)) {
      const numValue = parseFloat(followUpAnswer.replace(/[^0-9.-]/g, ''))
      if (!isNaN(numValue)) {
        metrics = { extracted_value: numValue }
      }
    }

    onAnswer(question.id, currentAnswer, metrics)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(curr => curr + 1)
      setCurrentAnswer(null)
      setShowFollowUp(false)
      setFollowUpAnswer(null)
    } else {
      onNext()
    }
  }

  useEffect(() => {
    if (currentAnswer && question.followUp?.condition(currentAnswer)) {
      setShowFollowUp(true)
    } else {
      setShowFollowUp(false)
      setFollowUpAnswer(null)
    }
  }, [currentAnswer, question])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{question.category} Processes</CardTitle>
            <span className="text-sm text-muted">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <CardDescription>{question.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Main question */}
            <div>
              {question.type === 'multiple_choice' && (
                <div className="grid gap-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={(currentAnswer || []).includes(option)}
                        onChange={(e) => {
                          const current = currentAnswer || []
                          if (e.target.checked) {
                            setCurrentAnswer([...current, option])
                          } else {
                            setCurrentAnswer(current.filter((item: string) => item !== option))
                          }
                        }}
                        className="w-4 h-4 text-accent bg-surface border-border rounded focus:ring-accent"
                      />
                      <span className="text-text">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'single_choice' && (
                <div className="grid gap-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={question.id}
                        checked={currentAnswer === option}
                        onChange={() => setCurrentAnswer(option)}
                        className="w-4 h-4 text-accent bg-surface border-border focus:ring-accent"
                      />
                      <span className="text-text">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'boolean' && (
                <div className="flex gap-4">
                  <Button
                    variant={currentAnswer === true ? 'primary' : 'ghost'}
                    onClick={() => setCurrentAnswer(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={currentAnswer === false ? 'primary' : 'ghost'}
                    onClick={() => setCurrentAnswer(false)}
                  >
                    No
                  </Button>
                </div>
              )}
            </div>

            {/* Follow-up question */}
            <AnimatePresence>
              {showFollowUp && question.followUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border pt-4"
                >
                  <label className="block text-sm font-medium text-text mb-2">
                    {question.followUp.question}
                  </label>
                  
                  {question.followUp.type === 'boolean' && (
                    <div className="flex gap-4">
                      <Button
                        variant={followUpAnswer === true ? 'primary' : 'ghost'}
                        onClick={() => setFollowUpAnswer(true)}
                        size="sm"
                      >
                        Yes
                      </Button>
                      <Button
                        variant={followUpAnswer === false ? 'primary' : 'ghost'}
                        onClick={() => setFollowUpAnswer(false)}
                        size="sm"
                      >
                        No
                      </Button>
                    </div>
                  )}

                  {question.followUp.type === 'text' && (
                    <input
                      type="text"
                      value={followUpAnswer || ''}
                      onChange={(e) => setFollowUpAnswer(e.target.value)}
                      placeholder="e.g., 2-3 hours, $45/hour, etc."
                      className="w-full p-3 bg-surface border border-border rounded-lg text-text focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleAnswerSubmit}
                disabled={!currentAnswer}
              >
                {currentQuestion === questions.length - 1 ? 'Continue' : 'Next Question'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CustomProblemForm({
  value,
  onChange,
  onComplete
}: {
  value: string
  onChange: (value: string) => void
  onComplete: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Custom Problem (Optional)</CardTitle>
          <CardDescription>
            Describe any specific workflow challenges you'd like AI recommendations for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g., Our sales team spends too much time manually qualifying leads from trade shows..."
              rows={4}
              className="w-full p-4 bg-surface border border-border rounded-lg text-text focus:ring-2 focus:ring-accent focus:border-accent resize-none"
            />
            <Button onClick={onComplete} className="w-full">
              Generate AI Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function RealTimePool({
  processFlags,
  safeMetrics,
  companyProfile
}: {
  processFlags: ProcessFlag[]
  safeMetrics: SafeMetric[]
  companyProfile: Partial<CompanyProfile>
}) {
  return (
    <Card glass className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent" />
          Real-Time Analysis
        </CardTitle>
        <CardDescription>
          AI-identified opportunities appear here as you answer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Context */}
        {companyProfile.industry && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company Context
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded border border-accent/30">
                {companyProfile.industry}
              </span>
              <span className="px-2 py-1 bg-accent2/20 text-accent2 text-xs rounded border border-accent2/30">
                {companyProfile.size}
              </span>
            </div>
          </div>
        )}

        {/* Process Flags */}
        {processFlags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text flex items-center gap-2">
              <Target className="w-4 h-4" />
              Process Flags ({processFlags.length})
            </h4>
            <div className="space-y-2">
              {processFlags.map((flag) => (
                <motion.div
                  key={flag.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 bg-surface/50 rounded border border-border"
                >
                  <span className="text-xs text-text">{flag.label}</span>
                  <span className="text-xs text-muted">
                    {Math.round(flag.confidence * 100)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Safe Metrics */}
        {safeMetrics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Key Metrics ({safeMetrics.length})
            </h4>
            <div className="space-y-2">
              {safeMetrics.map((metric) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 bg-surface/50 rounded border border-border"
                >
                  <span className="text-xs text-text">{metric.label}</span>
                  <span className="text-xs text-accent">{metric.value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {processFlags.length === 0 && safeMetrics.length === 0 && (
          <div className="text-center py-8 text-muted">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Answer questions to see AI analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}