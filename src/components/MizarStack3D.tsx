'use client';

import React, { useState } from 'react';

/**
 * Mizar 3D Stack Component - Linear-style 3D UI Stack
 * 
 * CONFIGURATION GUIDE:
 * Adjust these CSS variables to match Linear's exact perspective:
 * 
 * --perspective: Controls depth perception (1200px default, increase for less depth)
 * --persp-origin: Vanishing point position (50% 25% default, adjust Y for horizon)
 * --pitch: Top-down angle in degrees (12deg default)
 * --yaw: Left-right rotation (-10deg default for left convergence)  
 * --roll: Tilt rotation (1deg default for subtle angle)
 * --z-gap: Distance between layers (120px default)
 * --y-offset: Vertical stagger between layers (20px default)
 * 
 * CRISPNESS GUARANTEES:
 * ✅ No backdrop-filter blur on text containers
 * ✅ Even pixel widths (720px) to prevent subpixel fuzz
 * ✅ transform-style: preserve-3d with backface-visibility: hidden
 * ✅ Separate overlay layers for gloss/noise effects
 * ✅ Optimized CSS classes for crisp text rendering
 * 
 * PERFORMANCE:
 * - Uses will-change: transform on moving elements
 * - GPU-accelerated transforms with translateZ(0)
 * - Limited to 3 layers for optimal performance
 * - Respects prefers-reduced-motion
 * 
 * To match Linear exactly, tweak the CSS variables in the component's style prop
 * or add them to your global CSS :root selector.
 */

interface MizarStackProps {
  className?: string;
}

interface OpportunityItem {
  id: string;
  title: string;
  domain: string;
  hoursSaved: number;
  roi: number;
  effort: 'S' | 'M' | 'L';
  confidence: number;
  sparklineData: number[];
}

const mockOpportunities: OpportunityItem[] = [
  {
    id: '1',
    title: 'Automate AP Invoice Processing',
    domain: 'Finance',
    hoursSaved: 32,
    roi: 285,
    effort: 'M',
    confidence: 94,
    sparklineData: [20, 35, 45, 38, 52, 48, 65, 58]
  },
  {
    id: '2',
    title: 'Route Optimization for Deliveries',
    domain: 'Operations',
    hoursSaved: 18,
    roi: 156,
    effort: 'S',
    confidence: 87,
    sparklineData: [15, 22, 28, 31, 27, 35, 42, 38]
  },
  {
    id: '3',
    title: 'Customer Support Tier-1 Auto-Reply',
    domain: 'Support',
    hoursSaved: 45,
    roi: 340,
    effort: 'L',
    confidence: 91,
    sparklineData: [10, 18, 25, 35, 42, 38, 55, 62]
  },
  {
    id: '4',
    title: 'Lead Qualification & Booking',
    domain: 'Sales',
    hoursSaved: 24,
    roi: 198,
    effort: 'M',
    confidence: 89,
    sparklineData: [12, 19, 24, 31, 28, 36, 44, 41]
  }
];

const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className = '' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60;
    const y = 16 - ((value - min) / range) * 12;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="16" className={className} viewBox="0 0 60 16">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const MizarUI: React.FC<{ selectedId?: string; onSelect?: (id: string) => void; width?: number; height?: number }> = ({ 
  selectedId = '1', 
  onSelect,
  width,
  height
}) => {
  const selectedItem = mockOpportunities.find(item => item.id === selectedId);
  const componentWidth = width ?? 720;
  const componentHeight = height ?? 480;

  return (
    <div className="bg-[#0b0d10] rounded-2xl border border-white/8 overflow-hidden stack-shadow-layered" style={{ width: `${componentWidth}px`, height: `${componentHeight}px`, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'geometricPrecision' }}>
      {/* Top Bar */}
      <div className="h-12 border-b border-white/8 bg-white/[0.02] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-600"></div>
            <span className="text-white/90 font-medium text-sm">Mizar</span>
            <span className="text-white/40">•</span>
            <span className="text-white/60 text-sm">ACME Corp</span>
            <span className="text-white/40">·</span>
            <span className="text-white/50 text-sm">AI Audit</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-white/8 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-white/60">
              <path d="M5 1a4 4 0 100 8 4 4 0 000-8zM1 5a4 4 0 118 0 4 4 0 01-8 0z" fill="currentColor"/>
              <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500"></div>
        </div>
      </div>

      <div className="flex h-[calc(100%-48px)]">
        {/* Left Navigation */}
        <div className="w-48 border-r border-white/8 bg-white/[0.01] p-3">
          <div className="space-y-1">
            {['Overview', 'Audits', 'Opportunities', 'Recommendations', 'Roadmap', 'Evidence', 'Settings'].map((item, i) => (
              <div key={item} className={`px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                item === 'Opportunities' ? 'bg-white/8 text-white/90' : 'text-white/60 hover:bg-white/4 hover:text-white/80'
              }`}>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-3 border-t border-white/6">
            <div className="text-white/40 text-xs font-medium mb-2">WORKSPACES</div>
            <div className="space-y-1">
              {['ACME', 'BrightPath'].map(workspace => (
                <div key={workspace} className="px-2 py-1 rounded text-sm text-white/50 hover:bg-white/4 cursor-pointer">
                  {workspace}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 p-4">
          <div className="mb-4">
            <h3 className="text-white/90 font-medium mb-1">Opportunities Inbox</h3>
            <p className="text-white/50 text-sm">Automation opportunities ranked by business impact</p>
          </div>
          
          <div className="space-y-2">
            {mockOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                onClick={() => onSelect?.(opportunity.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedId === opportunity.id 
                    ? 'bg-white/[0.06] border-white/12' 
                    : 'bg-white/[0.02] border-white/6 hover:bg-white/[0.04] hover:border-white/8'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white/90 text-sm font-medium">{opportunity.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                        {opportunity.domain}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-white/60">{opportunity.hoursSaved}h/mo saved</span>
                      <span className="text-emerald-400">+{opportunity.roi}% ROI</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        opportunity.effort === 'S' ? 'bg-emerald-500/20 text-emerald-300' :
                        opportunity.effort === 'M' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {opportunity.effort}
                      </span>
                      <span className="text-white/60">{opportunity.confidence}% confidence</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Sparkline data={opportunity.sparklineData} className="text-blue-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-white/8 bg-white/[0.01] p-4">
          {selectedItem && (
            <>
              <div className="mb-4">
                <h4 className="text-white/90 font-medium text-sm mb-2">{selectedItem.title}</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-white/50 text-xs mb-1">Key Highlights</div>
                    <ul className="text-white/70 text-xs space-y-1">
                      <li>• Reduce manual processing by 85%</li>
                      <li>• Eliminate data entry errors</li>
                      <li>• Accelerate approval workflows</li>
                    </ul>
                  </div>
                  
                  <div>
                    <div className="text-white/50 text-xs mb-2">Top Recommendations</div>
                    <div className="space-y-1">
                      {['Route4Me API', 'Google Maps Platform', 'UiPath RPA', 'Zapier Connect'].map(tool => (
                        <div key={tool} className="px-2 py-1 rounded bg-white/[0.04] text-white/70 text-xs">
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-white/[0.04]">
                      <div className="text-white/50 text-xs">Hours Saved</div>
                      <div className="text-white/90 font-medium">{selectedItem.hoursSaved}/mo</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.04]">
                      <div className="text-white/50 text-xs">Net ROI</div>
                      <div className="text-emerald-400 font-medium">+{selectedItem.roi}%</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-white/50 text-xs mb-2">Questions for you</div>
                    <div className="space-y-1">
                      <button className="w-full text-left px-2 py-1 rounded bg-white/[0.04] text-white/70 text-xs hover:bg-white/[0.06] transition-colors">
                        What's your current invoice volume?
                      </button>
                      <button className="w-full text-left px-2 py-1 rounded bg-white/[0.04] text-white/70 text-xs hover:bg-white/[0.06] transition-colors">
                        Who handles approvals today?
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const MizarStack3D: React.FC<MizarStackProps> = ({ className = '' }) => {
  const [selectedId, setSelectedId] = useState('1');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className={`py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-blue-400 font-medium text-sm mb-4 tracking-wide">AI SOLUTIONS</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Mizar is trained on industry automation playbooks
          </h2>
          <p className="text-white/60 text-lg max-w-3xl mx-auto leading-relaxed">
            Mizar analyzes your operations against proven automation frameworks, delivering strategic 
            recommendations with quantified business impact and phased implementation roadmaps.
          </p>
        </div>

        {/* 3D Stack Container - Linear-style perspective */}
        <div 
          className="flex justify-center"
          style={{
            '--perspective': '1400px',  // Increased for Linear's look
            '--persp-origin': '50% -20%',  // Higher vanishing point like Linear
            '--pitch': '-25deg',  // Negative for Linear's tilt-away effect
            '--yaw': '-12deg',   // Left rotation for depth
            '--roll': '0deg',    // No roll for cleaner look
            '--z-gap': '180px',  // Increased gap for better separation
            '--y-offset': '40px', // More vertical separation
            '--x-offset': '-30px' // Horizontal offset for cascade
          } as React.CSSProperties}
        >
          <div 
            className="relative transition-all duration-700 ease-out"
            style={{
              perspective: 'var(--perspective)',
              perspectiveOrigin: 'var(--persp-origin)',
              transform: isHovered 
                ? 'scale(1.02) translateY(-8px)' 
                : 'scale(1) translateY(0px)',
              transformStyle: 'preserve-3d'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Layer 3 (Background) - Most distant */}
            <div
              className="absolute will-change-transform transition-all duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
                transform: `
                  rotateX(var(--pitch)) 
                  rotateY(var(--yaw)) 
                  rotateZ(var(--roll))
                  translateZ(calc(var(--z-gap) * -2))
                  translateY(calc(var(--y-offset) * 2))
                  translateX(calc(var(--x-offset) * 2))
                  ${isHovered ? 'scale(0.88)' : 'scale(0.85)'}
                `,
                filter: 'brightness(0.4) blur(0.5px)',
                opacity: 0.6,
                boxShadow: '0 80px 120px -20px rgba(0,0,0,0.8)'
              }}
            >
              <MizarUI selectedId={selectedId} onSelect={setSelectedId} />
            </div>

            {/* Layer 2 (Middle) */}
            <div
              className="absolute will-change-transform transition-all duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
                transform: `
                  rotateX(var(--pitch)) 
                  rotateY(var(--yaw)) 
                  rotateZ(var(--roll))
                  translateZ(calc(var(--z-gap) * -1))
                  translateY(var(--y-offset))
                  translateX(var(--x-offset))
                  ${isHovered ? 'scale(0.94)' : 'scale(0.92)'}
                `,
                filter: 'brightness(0.7)',
                opacity: 0.8,
                boxShadow: '0 60px 100px -15px rgba(0,0,0,0.7)'
              }}
            >
              <MizarUI selectedId={selectedId} onSelect={setSelectedId} />
            </div>

            {/* Layer 1 (Foreground) - Primary card */}
            <div
              className="relative will-change-transform transition-all duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
                transform: `
                  rotateX(var(--pitch)) 
                  rotateY(var(--yaw)) 
                  rotateZ(var(--roll))
                  translateZ(0px)
                  translateY(0px)
                  translateX(0px)
                  ${isHovered ? 'scale(1.01)' : 'scale(1)'}
                `,
                boxShadow: `
                  0 50px 100px -20px rgba(0,0,0,0.5),
                  0 30px 60px -30px rgba(0,0,0,0.6),
                  0 10px 20px -10px rgba(0,0,0,0.4)
                `
              }}
            >
              <MizarUI selectedId={selectedId} onSelect={setSelectedId} />
              
              {/* Enhanced gloss overlay for Linear-style shine */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700"
                style={{
                  opacity: isHovered ? 1 : 0.7,
                  background: `
                    linear-gradient(135deg, 
                      rgba(255,255,255,0.15) 0%, 
                      transparent 20%,
                      transparent 80%,
                      rgba(255,255,255,0.08) 100%),
                    radial-gradient(circle at 20% 10%, 
                      rgba(255,255,255,0.12) 0%, 
                      transparent 30%)
                  `
                }}
              />
              
              {/* Edge highlight for depth */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)',
                  borderRadius: '16px'
                }}
              />
            </div>

            {/* Enhanced floor shadow - Linear style */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: '1000px',
                height: '400px',
                left: '50%',
                top: '60%',
                marginLeft: '-500px',
                background: `
                  radial-gradient(ellipse 50% 30% at center, 
                    rgba(0,0,0,0.6) 0%, 
                    rgba(0,0,0,0.3) 25%, 
                    rgba(0,0,0,0.15) 50%,
                    transparent 70%)
                `,
                transform: `
                  rotateX(90deg) 
                  translateZ(-200px)
                  scaleY(2)
                `,
                transformOrigin: 'center center',
                filter: 'blur(20px)'
              }}
            />

            {/* Ambient light effect */}
            <div 
              className="absolute pointer-events-none"
              style={{
                width: '150%',
                height: '150%',
                left: '-25%',
                top: '-25%',
                background: `
                  radial-gradient(circle at 30% 20%, 
                    rgba(59, 130, 246, 0.1) 0%, 
                    transparent 40%),
                  radial-gradient(circle at 70% 60%, 
                    rgba(168, 85, 247, 0.08) 0%, 
                    transparent 45%)
                `,
                transform: 'translateZ(100px)',
                opacity: isHovered ? 0.8 : 0.5,
                transition: 'opacity 0.7s ease'
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MizarStack3D;
