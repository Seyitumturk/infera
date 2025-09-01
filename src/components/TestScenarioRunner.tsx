"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { nicheBusinessScenarios, validateAIResponse, type TestScenario } from '@/test-data/niche-business-scenarios'

interface TestResult {
  scenario: string
  businessName: string
  score: number
  feedback: string[]
  aiResponse?: any
  duration: number
}

export default function TestScenarioRunner() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null)
  const [currentTest, setCurrentTest] = useState<string>('')

  const runSingleTest = async (scenario: TestScenario) => {
    const startTime = Date.now()
    setCurrentTest(scenario.businessName)
    
    try {
      // Call the same API your app uses
      const response = await fetch('/api/infera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assessment',
          companyProfile: scenario.companyProfile,
          answers: Object.entries(scenario.answers).map(([id, answer]) => ({
            id,
            category: 'test',
            question: id.replace(/_/g, ' '),
            answer
          })),
          customProblem: scenario.scenario
        })
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }

      const result = await response.json()
      const aiResponse = result.success ? result.data : null
      const validation = validateAIResponse(scenario, aiResponse)
      const duration = Date.now() - startTime

      return {
        scenario: scenario.id,
        businessName: scenario.businessName,
        score: validation.score,
        feedback: validation.feedback,
        aiResponse,
        duration
      }
    } catch (error) {
      const duration = Date.now() - startTime
      return {
        scenario: scenario.id,
        businessName: scenario.businessName,
        score: 0,
        feedback: [`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        duration
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])
    
    const testResults: TestResult[] = []
    
    for (const scenario of nicheBusinessScenarios) {
      const result = await runSingleTest(scenario)
      testResults.push(result)
      setResults([...testResults]) // Update UI progressively
      
      // Small delay between tests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setIsRunning(false)
    setCurrentTest('')
  }

  const runSelectedTest = async () => {
    if (!selectedScenario) return
    
    setIsRunning(true)
    const result = await runSingleTest(selectedScenario)
    setResults([result])
    setIsRunning(false)
    setCurrentTest('')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const averageScore = results.length > 0 
    ? results.reduce((sum, r) => sum + r.score, 0) / results.length 
    : 0

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          AI Roadmap Test Suite
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Test your AI with realistic small business scenarios to validate automation recommendations and ROI calculations.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              size="lg"
              className="bg-accent hover:bg-accent/90"
            >
              {isRunning ? 'Running Tests...' : `Run All Tests (${nicheBusinessScenarios.length})`}
            </Button>
            
            <div className="flex gap-2">
              <select
                value={selectedScenario?.id || ''}
                onChange={(e) => setSelectedScenario(
                  nicheBusinessScenarios.find(s => s.id === e.target.value) || null
                )}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
                disabled={isRunning}
              >
                <option value="">Select specific test...</option>
                {nicheBusinessScenarios.map(scenario => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.businessName}
                  </option>
                ))}
              </select>
              
              <Button 
                onClick={runSelectedTest} 
                disabled={isRunning || !selectedScenario}
                variant="outline"
              >
                Run Selected
              </Button>
            </div>
          </div>
          
          {isRunning && (
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
              <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              <span className="text-blue-300">
                {currentTest ? `Testing: ${currentTest}` : 'Preparing tests...'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore.toFixed(1)}%
                </div>
                <p className="text-gray-400">Average Score</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {results.filter(r => r.score >= 80).length}
                </div>
                <p className="text-gray-400">Excellent (80+)</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {results.filter(r => r.score >= 60 && r.score < 80).length}
                </div>
                <p className="text-gray-400">Good (60-79)</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {results.filter(r => r.score < 60).length}
                </div>
                <p className="text-gray-400">Needs Work (&lt;60)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Detailed Results</h2>
          
          {results.map((result, index) => (
            <motion.div
              key={result.scenario}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{result.businessName}</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">
                        {nicheBusinessScenarios.find(s => s.id === result.scenario)?.scenario}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score.toFixed(1)}%
                      </div>
                      <p className="text-gray-400 text-sm">{result.duration}ms</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Feedback */}
                  {result.feedback.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Feedback:</h4>
                      <ul className="space-y-1">
                        {result.feedback.map((feedback, i) => (
                          <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            {feedback}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* AI Response Summary */}
                  {result.aiResponse && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-gray-400 text-xs">Process Flags</p>
                        <p className="text-white font-semibold">
                          {result.aiResponse.processFlags?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Recommended Tools</p>
                        <p className="text-white font-semibold">
                          {result.aiResponse.recommendedTools?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Potential Savings</p>
                        <p className="text-white font-semibold">
                          ${result.aiResponse.executiveSummary?.totalPotentialSavings?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Test Scenarios Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Test Scenarios ({nicheBusinessScenarios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nicheBusinessScenarios.map(scenario => (
              <div key={scenario.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="font-semibold text-white mb-2">{scenario.businessName}</h4>
                <p className="text-gray-400 text-sm mb-2">{scenario.companyProfile.industry} • {scenario.companyProfile.size}</p>
                <p className="text-gray-300 text-xs line-clamp-3">{scenario.scenario}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {scenario.expectedOutcomes.processFlags.slice(0, 2).map(flag => (
                    <span key={flag} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded">
                      {flag.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {scenario.expectedOutcomes.processFlags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                      +{scenario.expectedOutcomes.processFlags.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

