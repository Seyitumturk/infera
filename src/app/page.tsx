'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import Button from '@/components/ui/Button'
import InlineAIAudit from '@/components/InlineAIAudit'
import EnhancedAICapabilities from '@/components/EnhancedAICapabilities'

export default function HomePage() {
  const [showAIAudit, setShowAIAudit] = useState(false)

  return (
    <div className="bg-gradient-to-b from-[#06080a] via-[#0a0c10] to-[#06080a]">
      <Hero onStartAudit={() => setShowAIAudit(true)} />
      
      {/* Modern CTA Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/3 left-1/5 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-accent2/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8 py-24 text-center">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black/40 border border-white/20 backdrop-blur-xl mb-12">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-white">AI-Powered Automation Platform</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] text-white drop-shadow-2xl" style={{marginBottom: '4rem'}}>
            Transform Your<br />
            Business Processes
          </h1>
          
          {/* Subtitle */}
          <div className="max-w-4xl mx-auto" style={{marginBottom: '5rem'}}>
            <p className="text-xl lg:text-2xl text-white/90 leading-relaxed drop-shadow-lg">
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
            
            <button className="group flex items-center gap-4 px-10 py-5 text-xl font-medium text-white/80 hover:text-white transition-colors duration-300 rounded-2xl hover:bg-white/5">
              <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-current ml-1">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              </div>
              <span>Watch Demo</span>
            </button>
          </div>
          
          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-12 text-white/60">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent2 border-2 border-white/20"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent2 to-accent border-2 border-white/20"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent2 border-2 border-white/20"></div>
              </div>
              <span className="font-medium">500+ companies automated</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <div className="text-accent2">★★★★★</div>
              <span className="font-medium">4.9/5 rating</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
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
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-3xl p-10 hover:bg-black/30 hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
                  <div className="text-6xl font-bold text-accent/30 mb-6 group-hover:text-accent/50 transition-colors duration-300">
                    {feature.number}
                  </div>
                  <h3 className="text-2xl font-bold text-white" style={{marginBottom: '1.5rem'}}>{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed text-lg">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-32 pt-20 border-t border-white/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { value: "95%", label: "Process Accuracy", color: "text-accent" },
                { value: "3-6x", label: "ROI Multiplier", color: "text-accent2" },
                { value: "< 5min", label: "Assessment Time", color: "text-accent" },
                { value: "500+", label: "Companies Served", color: "text-accent2" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`text-4xl lg:text-5xl font-bold mb-3 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-lg font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced AI Capabilities Section */}
      <section className="relative py-24 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <EnhancedAICapabilities />
        </div>
      </section>

      {/* Inline AI Audit Section - Always visible at bottom */}
      <InlineAIAudit 
        isVisible={true}
        onClose={() => setShowAIAudit(false)}
        initialCustomProblem=""
      />
    </div>
  )
}
