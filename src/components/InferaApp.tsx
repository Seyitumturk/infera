"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IntakeInterface from './IntakeInterface'
import RoadmapGenerator from './RoadmapGenerator'
import { 
  ProcessFlag, 
  SafeMetric, 
  CompanyProfile, 
  ProcessQuestion 
} from '@/lib/types'

type AppState = 'intake' | 'processing' | 'roadmap'

export default function InferaApp() {
  const [appState, setAppState] = useState<AppState>('intake')
  const [sessionData, setSessionData] = useState<{
    processFlags: ProcessFlag[]
    safeMetrics: SafeMetric[]
    companyProfile: CompanyProfile
    answers: ProcessQuestion[]
  } | null>(null)

  const handleIntakeComplete = async (data: {
    processFlags: ProcessFlag[]
    safeMetrics: SafeMetric[]
    companyProfile: CompanyProfile
    answers: ProcessQuestion[]
  }) => {
    setSessionData(data)
    setAppState('processing')
    
    // Simulate processing time for better UX
    setTimeout(() => {
      setAppState('roadmap')
    }, 2000)
  }

  const handleRestart = () => {
    setSessionData(null)
    setAppState('intake')
  }

  return (
    <div className="min-h-screen bg-bg">
      <AnimatePresence mode="wait">
        {appState === 'intake' && (
          <motion.div
            key="intake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <IntakeInterface onComplete={handleIntakeComplete} />
          </motion.div>
        )}

        {appState === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
            transition={{ duration: 0.5 }}
          >
            <RoadmapGenerator 
              processFlags={sessionData.processFlags}
              safeMetrics={sessionData.safeMetrics}
              companyProfile={sessionData.companyProfile}
              answers={sessionData.answers}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating restart button when in roadmap */}
      {appState === 'roadmap' && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          onClick={handleRestart}
          className="fixed bottom-8 left-8 p-3 bg-accent text-white rounded-full shadow-elevation2 hover:shadow-elevation3 hover:scale-110 transition-all duration-smooth"
          title="Start New Assessment"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      )}
    </div>
  )
}

function ProcessingState() {
  const steps = [
    { label: 'Analyzing business processes', delay: 0 },
    { label: 'Matching AI solutions', delay: 500 },
    { label: 'Calculating ROI potential', delay: 1000 },
    { label: 'Generating roadmap', delay: 1500 }
  ]

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-24 h-24 mx-auto mb-8 relative"
        >
          {/* Spinning outer ring */}
          <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          
          {/* Inner brain icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-accent">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 4.33 13.92 4.64 13.78 4.92C15.66 5.53 17.13 7.18 17.5 9.25C17.81 9.09 18.15 9 18.5 9C19.88 9 21 10.12 21 11.5C21 12.88 19.88 14 18.5 14C18.12 14 17.76 13.9 17.43 13.72C16.97 15.55 15.38 16.94 13.41 17.31C13.2 17.76 12.65 18.05 12 18.05C11.35 18.05 10.8 17.76 10.59 17.31C8.62 16.94 7.03 15.55 6.57 13.72C6.24 13.9 5.88 14 5.5 14C4.12 14 3 12.88 3 11.5C3 10.12 4.12 9 5.5 9C5.85 9 6.19 9.09 6.5 9.25C6.87 7.18 8.34 5.53 10.22 4.92C10.08 4.64 10 4.33 10 4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
            </svg>
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold text-text mb-6">
          AI Analysis in Progress
        </h2>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay / 1000 }}
              className="flex items-center gap-3 text-left"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: step.delay / 1000 + 0.2 }}
                className="w-2 h-2 bg-accent rounded-full flex-shrink-0"
              />
              <span className="text-muted">{step.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded-lg"
        >
          <p className="text-sm text-accent">
            We're analyzing your responses against our database of 65+ proven AI solutions and 50+ tools to create your personalized roadmap.
          </p>
        </motion.div>
      </div>
    </div>
  )
}