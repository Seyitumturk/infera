import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors
        brandInk: '#02193b',
        brandNight: '#06080a',
        ink80: '#102846',
        // New design system colors
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        accent2: 'var(--accent-2)',
        danger: 'var(--danger)',
        border: 'var(--border)',
        glass: 'var(--glass-bg)',
        glassBorder: 'var(--glass-border)',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      borderRadius: {
        lg: 'var(--radius)',
      },
      boxShadow: {
        ambient: 'var(--shadow-ambient)',
        elevation1: 'var(--shadow-elevation-1)',
        elevation2: 'var(--shadow-elevation-2)',
        elevation3: 'var(--shadow-elevation-3)',
      },
      backdropBlur: {
        glass: 'var(--backdrop-blur)',
      },
      backdropSaturate: {
        glass: 'var(--backdrop-saturate)',
      },
      fontSize: {
        xs: 'var(--step--1)',
        sm: 'var(--step--1)',
        base: 'var(--step-0)',
        lg: 'var(--step-1)',
        xl: 'var(--step-2)',
        '2xl': 'var(--step-3)',
      },
      spacing: {
        layout: 'var(--space-layout)',
        section: 'var(--space-section)',
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        smooth: 'var(--transition-smooth)',
        slow: 'var(--transition-slow)',
      },
    },
  },
  plugins: [],
}

export default config 