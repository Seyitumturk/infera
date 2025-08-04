import Hero from '@/components/Hero'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div>
      <Hero />
      
      {/* Infera CTA Section */}
      <section className="relative bg-bg py-section">
        <div className="container mx-auto px-layout max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-text mb-4">
            Ready to Discover Your AI Opportunities?
          </h2>
          <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">
            Get a personalized AI roadmap with quantified ROI in minutes. 
            No more guessing - know exactly which AI tools will save your business time and money.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/infera">
              <Button size="lg" className="min-w-[200px]">
                Start Free Assessment
              </Button>
            </Link>
            <p className="text-sm text-muted">
              ✓ 5-minute assessment &nbsp;&nbsp; ✓ Instant roadmap &nbsp;&nbsp; ✓ No signup required
            </p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent">
                  <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h3 className="font-semibold text-text mb-2">Process Analysis</h3>
              <p className="text-sm text-muted">
                AI analyzes your workflows to identify automation opportunities you might have missed.
              </p>
            </div>
            
            <div className="p-4">
              <div className="w-8 h-8 bg-accent2/20 rounded-lg flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent2">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h3 className="font-semibold text-text mb-2">ROI Calculator</h3>
              <p className="text-sm text-muted">
                Get precise cost savings estimates and payback periods for each recommendation.
              </p>
            </div>
            
            <div className="p-4">
              <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-yellow-400">
                  <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V16.5C21 17.9001 21 18.6002 20.7275 19.135C20.4878 19.6054 20.1054 19.9878 19.635 20.2275C19.1002 20.5 18.4001 20.5 17 20.5H7C5.59987 20.5 4.8998 20.5 4.36502 20.2275C3.89462 19.9878 3.51217 19.6054 3.27248 19.135C3 18.6002 3 17.9001 3 16.5V8.5C3 7.09987 3 6.3998 3.27248 5.86502C3.51217 5.39462 3.89462 5.01217 4.36502 4.77248C4.8998 4.5 5.59987 4.5 7 4.5H17C18.4001 4.5 19.1002 4.5 19.635 4.77248C20.1054 5.01217 20.4878 5.39462 20.7275 5.86502C21 6.3998 21 7.09987 21 8.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h3 className="font-semibold text-text mb-2">Implementation Roadmap</h3>
              <p className="text-sm text-muted">
                Get a prioritized 30/60/90-day plan with specific tools and next steps.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
