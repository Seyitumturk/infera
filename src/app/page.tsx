'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import Button from '@/components/ui/Button'
import InlineAIAudit from '@/components/InlineAIAudit'
import ThemeToggle from '@/components/ui/ThemeToggle'


export default function HomePage() {
  const [showAIAudit, setShowAIAudit] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <ThemeToggle />
      <Hero onStartAudit={() => setShowAIAudit(true)} />
      
      {/* Modern CTA Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/3 left-1/5 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-accent2/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/20" style={{ backgroundColor: 'var(--bg)', opacity: 0.1 }}></div>
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8 py-24 text-center">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl mb-12" style={{ 
            backgroundColor: 'var(--surface)', 
            border: `1px solid var(--border)` 
          }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }}></div>
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>AI-Powered Automation Platform</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] drop-shadow-2xl" style={{marginBottom: '4rem', color: 'var(--text)'}}>
            Transform Your<br />
            Business Processes
          </h1>
          
          {/* Subtitle */}
          <div className="max-w-4xl mx-auto" style={{marginBottom: '5rem'}}>
            <p className="text-xl lg:text-2xl leading-relaxed drop-shadow-lg" style={{ color: 'var(--muted)' }}>
              Get a comprehensive automation assessment with ROI projections, tool recommendations, and implementation roadmaps—delivered in minutes, not weeks.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <Button 
              size="xl" 
              className="group relative overflow-hidden bg-gradient-to-r from-accent to-accent2 hover:from-accent/90 hover:to-accent2/90 text-white font-bold px-16 py-5 text-xl shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all duration-300 hover:scale-105 border-0 rounded-2xl"
              onClick={() => setShowAIAudit(true)}
            >
              <span className="relative z-10">Start Assessment - $99</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            
            <button className="group flex items-center gap-4 px-10 py-5 text-xl font-medium transition-colors duration-300 rounded-2xl" 
                    style={{ 
                      color: 'var(--muted)', 
                      backgroundColor: 'transparent' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text)'
                      e.currentTarget.style.backgroundColor = 'var(--surface)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--muted)'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm" 
                   style={{ 
                     backgroundColor: 'var(--surface)', 
                     border: `1px solid var(--border)` 
                   }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-current ml-1">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              </div>
              <span>Watch Demo</span>
            </button>
          </div>
          
          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-12" style={{ color: 'var(--muted)' }}>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent2 border-2" style={{ borderColor: 'var(--border)' }}></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent2 to-accent border-2" style={{ borderColor: 'var(--border)' }}></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent2 border-2" style={{ borderColor: 'var(--border)' }}></div>
              </div>
              <span className="font-medium">500+ companies automated</span>
            </div>
            <div className="w-px h-6" style={{ backgroundColor: 'var(--border)' }}></div>
            <div className="flex items-center gap-2">
              <div style={{ color: 'var(--accent-2)' }}>★★★★★</div>
              <span className="font-medium">4.9/5 rating</span>
            </div>
            <div className="w-px h-6" style={{ backgroundColor: 'var(--border)' }}></div>
            <span className="font-medium">$2.3M+ saved collectively</span>
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Features Grid */}
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                number: "01",
                title: "Process Analysis",
                description: "AI identifies automation opportunities across your workflow with 95% accuracy and detailed impact analysis."
              },
              {
                number: "02", 
                title: "ROI Projections",
                description: "Detailed cost-benefit analysis with conservative, realistic, and optimistic scenarios for informed decision-making."
              },
              {
                number: "03",
                title: "Implementation Plan",
                description: "Phased execution roadmap with timelines, milestones, resource requirements, and success metrics."
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                     style={{ background: 'linear-gradient(to bottom right, var(--surface), transparent)' }}></div>
                <div className="relative h-full backdrop-blur-sm rounded-3xl p-10 transition-all duration-500 hover:-translate-y-2" 
                     style={{ 
                       backgroundColor: 'var(--surface)', 
                       border: `1px solid var(--border)` 
                     }}>
                  <div className="text-6xl font-bold mb-6 transition-colors duration-300" 
                       style={{ 
                         color: 'var(--accent)', 
                         opacity: 0.3 
                       }}>
                    {feature.number}
                  </div>
                  <h3 className="text-2xl font-bold" style={{marginBottom: '1.5rem', color: 'var(--text)'}}>{feature.title}</h3>
                  <p className="leading-relaxed text-lg" style={{ color: 'var(--muted)' }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-32 pt-20" style={{ borderTop: `1px solid var(--border)` }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { value: "95%", label: "Process Accuracy", colorVar: "--accent" },
                { value: "3-6x", label: "ROI Multiplier", colorVar: "--accent-2" },
                { value: "< 5min", label: "Assessment Time", colorVar: "--accent" },
                { value: "500+", label: "Companies Served", colorVar: "--accent-2" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl lg:text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300" 
                       style={{ color: `var(${stat.colorVar})` }}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-medium" style={{ color: 'var(--muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Start Assessment Section - Always visible at bottom */}
      <section className="relative py-24" style={{ borderTop: `1px solid var(--border)` }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" 
                 style={{ backgroundColor: 'var(--accent)', opacity: 0.2 }}></div>
          </div>
          
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl mb-8" 
                 style={{ 
                   backgroundColor: 'var(--surface)', 
                   border: `1px solid var(--border)` 
                 }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }}></div>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Ready to Transform?</span>
            </div>
            
            {/* Headline */}
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text)' }}>
              Start Your AI Assessment
            </h2>
            
            {/* Description */}
            <p className="text-xl mb-12 leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
              Get personalized automation recommendations, ROI projections, and implementation roadmaps tailored to your business in just 5 minutes.
            </p>
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                size="xl" 
                className="group relative overflow-hidden bg-gradient-to-r from-accent to-accent2 hover:from-accent/90 hover:to-accent2/90 text-white font-bold px-12 py-4 text-lg shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all duration-300 hover:scale-105 border-0 rounded-xl"
                onClick={() => setShowAIAudit(true)}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Start Assessment - $99
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              {/* Value Props */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: 'var(--muted)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: 'var(--accent)', opacity: 0.4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>5-minute assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: 'var(--accent)', opacity: 0.4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Instant ROI projections</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: 'var(--accent)', opacity: 0.4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Implementation roadmap</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inline AI Audit Section - Only show when triggered */}
      <InlineAIAudit 
        isVisible={showAIAudit}
        onClose={() => setShowAIAudit(false)}
        initialCustomProblem=""
      />
    </div>
  )
}
