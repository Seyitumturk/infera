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
      <section className="relative bg-brandNight">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
          <div className="py-24 lg:py-40 text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">
              Ready to Discover Your AI Opportunities?
            </h2>
            <div className="max-w-3xl mx-auto mb-12 mt-6">
              <p className="text-xl text-gray-300 text-center leading-relaxed">
                Get a personalized AI roadmap with quantified ROI in minutes. 
                No more guessing - know exactly which AI tools will save your business time and money.
              </p>
            </div>
          
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="xl" 
                className="min-w-[250px] text-lg px-8 py-4"
                onClick={() => setShowAIAudit(true)}
              >
                Start Free Assessment
              </Button>
              <div className="text-center">
                <p className="text-lg text-gray-300">
                  ✓ 5-minute assessment &nbsp;&nbsp; ✓ Instant roadmap &nbsp;&nbsp; ✓ No signup required
                </p>
              </div>
            </div>
            
            {/* Glass morphism container like Tool Pool */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 lg:p-12 border border-white/10 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 text-center">Process Analysis</h3>
                  <p className="text-gray-300 leading-relaxed text-center">
                    AI analyzes your workflows to identify automation opportunities you might have missed.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 text-center">ROI Calculator</h3>
                  <p className="text-gray-300 leading-relaxed text-center">
                    Get precise cost savings estimates and payback periods for each recommendation.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V16.5C21 17.9001 21 18.6002 20.7275 19.135C20.4878 19.6054 20.1054 19.9878 19.635 20.2275C19.1002 20.5 18.4001 20.5 17 20.5H7C5.59987 20.5 4.8998 20.5 4.36502 20.2275C3.89462 19.9878 3.51217 19.6054 3.27248 19.135C3 18.6002 3 17.9001 3 16.5V8.5C3 7.09987 3 6.3998 3.27248 5.86502C3.51217 5.39462 3.89462 5.01217 4.36502 4.77248C4.8998 4.5 5.59987 4.5 7 4.5H17C18.4001 4.5 19.1002 4.5 19.635 4.77248C20.1054 5.01217 20.4878 5.39462 20.7275 5.86502C21 6.3998 21 7.09987 21 8.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 text-center">Implementation Roadmap</h3>
                  <p className="text-gray-300 leading-relaxed text-center">
                    Get a prioritized 30/60/90-day plan with specific tools and next steps.
                  </p>
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
