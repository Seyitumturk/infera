'use client'

import { useState, useEffect } from 'react'

interface NavbarProps {
  isVisible: boolean
  lightIntensity: number
}

export default function Navbar({ isVisible, lightIntensity }: NavbarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
          { name: 'Mizar', href: '#mizar' }
  ]

  return (
    <nav 
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-1500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
      }`}
      style={{
        filter: `brightness(${1 + lightIntensity * 0.4})`,
        boxSizing: 'border-box',
      }}
    >
             {/* Modern glassmorphic container - compact spacing */}
       <div 
         className="relative px-8 py-2 rounded-2xl border-l border-r border-b border-white/15 backdrop-blur-xl bg-gradient-to-r from-white/8 to-white/12 shadow-2xl"
                 style={{
           boxShadow: `
             0 12px 40px rgba(0, 0, 0, 0.4),
             inset 0 -1px 0 rgba(0, 0, 0, 0.15)
           `,
           boxSizing: 'border-box',
           minWidth: '400px',
         }}
      >
                 {/* Enhanced light glow effect */}
         <div 
           className={`absolute inset-0 rounded-2xl transition-all duration-1000 ${
             lightIntensity > 0.1 ? 'opacity-100' : 'opacity-0'
           }`}
           style={{
             background: `rgba(255, 255, 255, ${lightIntensity * 0.15})`,
             filter: 'blur(1px)',
           }}
         />
        
                 {/* Navigation items with generous spacing */}
         <ul className="flex justify-between items-center w-full relative z-10" style={{ boxSizing: 'border-box' }}>
           {navItems.map((item, index) => (
             <li key={item.name} className="flex-1 text-center">
                               <a
                  href={item.href}
                  className="relative text-sm font-semibold tracking-wide transition-all duration-300 group cursor-pointer inline-block py-1 px-4"
                  style={{
                    color: lightIntensity > 0.2 ? 'var(--text)' : 'var(--muted)',
                    textShadow: lightIntensity > 0.2 ? `0 0 12px rgba(255, 255, 255, ${lightIntensity * 0.5})` : 'none',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = lightIntensity > 0.2 ? 'var(--text)' : 'var(--muted)'
                  }}
               >
                {item.name}
                
                {/* Modern hover underline effect */}
                <span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-white/60 to-white/90 transition-all duration-300 group-hover:w-full rounded-full"
                  style={{
                    filter: `brightness(${1 + lightIntensity * 0.6})`,
                  }}
                />
                
                                 {/* Subtle hover glow */}
                 <span 
                   className={`absolute inset-0 -mx-2 -my-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                     lightIntensity > 0.2 ? 'bg-white/8' : 'bg-white/5'
                   }`}
                   style={{ boxSizing: 'border-box' }}
                 />
               </a>
             </li>
           ))}
                 </ul>
       </div>
     </nav>
  )
} 