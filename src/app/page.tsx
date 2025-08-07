'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import Button from '@/components/ui/Button'
import InlineAIAudit from '@/components/InlineAIAudit'

export default function HomePage() {
  const [showAIAudit, setShowAIAudit] = useState(false)

  return (
    <div>
      <Hero />
      
      {/* Section Separator */}
      <div className="relative bg-brandNight">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full">
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-brandNight px-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infera CTA Section */}
      <section className="relative bg-brandNight overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
          <div className="py-32 lg:py-40 text-center relative">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent2 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              {/* Header Section */}
              <div className="mb-16">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-10 leading-tight">
                  Ready to Discover Your AI Opportunities?
                </h2>
                <div className="max-w-3xl mx-auto">
                  <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed mb-12">
                    Get a personalized AI roadmap with quantified ROI in minutes. 
                    No more guessing - know exactly which AI tools will save your business time and money.
                  </p>
                </div>
              </div>
            
              {/* CTA Section */}
              <div className="mb-20">
                <Button 
                  size="xl" 
                  className="min-w-[280px] text-xl px-10 py-5 shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-105 mb-8"
                  onClick={() => setShowAIAudit(true)}
                >
                  Start Free Assessment
                </Button>
                
                {/* Feature badges */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-300 font-medium">5-minute assessment</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-sm text-gray-300 font-medium">Instant roadmap</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-accent2 rounded-full"></div>
                    <span className="text-sm text-gray-300 font-medium">No signup required</span>
                  </div>
                </div>
              </div>
              
              {/* Features Grid */}
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Process Analysis */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-2">
                      <div className="w-20 h-20 bg-gradient-to-br from-accent/30 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-accent">
                          <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">Process Analysis</h3>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        AI analyzes your workflows to identify automation opportunities you might have missed.
                      </p>
                    </div>
                  </div>
                  
                  {/* ROI Calculator */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent2/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:border-accent2/30 hover:shadow-lg hover:shadow-accent2/10 hover:-translate-y-2">
                      <div className="w-20 h-20 bg-gradient-to-br from-accent2/30 to-accent2/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-accent2">
                          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">ROI Calculator</h3>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        Get precise cost savings estimates and payback periods for each recommendation.
                      </p>
                    </div>
                  </div>
                  
                  {/* Implementation Roadmap */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-2">
                      <div className="w-20 h-20 bg-gradient-to-br from-accent/30 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-accent">
                          <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V16.5C21 17.9001 21 18.6002 20.7275 19.135C20.4878 19.6054 20.1054 19.9878 19.635 20.2275C19.1002 20.5 18.4001 20.5 17 20.5H7C5.59987 20.5 4.8998 20.5 4.36502 20.2275C3.89462 19.9878 3.51217 19.6054 3.27248 19.135C3 18.6002 3 17.9001 3 16.5V8.5C3 7.09987 3 6.3998 3.27248 5.86502C3.51217 5.39462 3.89462 5.01217 4.36502 4.77248C4.8998 4.5 5.59987 4.5 7 4.5H17C18.4001 4.5 19.1002 4.5 19.635 4.77248C20.1054 5.01217 20.4878 5.39462 20.7275 5.86502C21 6.3998 21 7.09987 21 8.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">Implementation Roadmap</h3>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        Get a prioritized 30/60/90-day plan with specific tools and next steps for successful implementation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div className="relative bg-brandNight">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full">
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-brandNight px-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline AI Audit Section */}
      <InlineAIAudit 
        isVisible={showAIAudit}
        onClose={() => setShowAIAudit(false)}
      />
    </div>
  )
}
