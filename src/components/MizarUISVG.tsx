'use client'

import React from 'react'

export default function MizarUISVG({ width = 720, height = 480 }: { width?: number; height?: number }) {
  const radius = 16
  const headerH = 48
  const navW = 160
  const rightW = 180
  const contentPadding = 12

  // Scale text relative to base 720x480
  const sx = width / 720
  const sy = height / 480
  const scale = Math.min(sx, sy)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#0b0d10" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="rgba(0,0,0,0.6)"/>
        </filter>
      </defs>

      {/* Card */}
      <g filter="url(#shadow)">
        <rect x={0.5} y={0.5} width={width-1} height={height-1} rx={radius} fill="url(#g1)" stroke="rgba(255,255,255,0.08)" />

        {/* Header */}
        <rect x={0.5} y={0.5} width={width-1} height={headerH} rx={radius} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
        <g transform={`translate(${16}, ${headerH/2 + 4}) scale(${scale})`}>
          <rect x={0} y={-10} width={20} height={20} rx={4} fill="url(#g1)" />
          <text x={28} y={0} fontSize={12} fill="rgba(255,255,255,0.9)" dominantBaseline="middle">Mizar</text>
          <text x={80} y={0} fontSize={12} fill="rgba(255,255,255,0.6)" dominantBaseline="middle">• ACME Corp · AI Audit</text>
        </g>

        {/* Left Nav */}
        <g transform={`translate(${contentPadding}, ${headerH + contentPadding})`}>
          <rect width={navW} height={height - headerH - contentPadding*2} rx={10} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={8} y={8 + i*34} width={navW - 16} height={24} rx={8} fill={i===2? 'rgba(255,255,255,0.08)': 'rgba(255,255,255,0.03)'} />
          ))}
        </g>

        {/* Center List */}
        <g transform={`translate(${navW + contentPadding*2}, ${headerH + contentPadding})`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <rect key={i} x={0} y={i*70} width={width - navW - rightW - contentPadding*4} height={60} rx={12} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" />
          ))}
          <g transform={`translate(${12}, ${16}) scale(${scale})`}>
            <text x={0} y={0} fontSize={14} fill="rgba(255,255,255,0.9)" dominantBaseline="hanging">Opportunities Inbox</text>
            <text x={0} y={20} fontSize={12} fill="rgba(255,255,255,0.6)" dominantBaseline="hanging">Automation opportunities ranked by business impact</text>
          </g>
        </g>

        {/* Right Panel */}
        <g transform={`translate(${width - rightW - contentPadding}, ${headerH + contentPadding})`}>
          <rect width={rightW} height={height - headerH - contentPadding*2} rx={10} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={8} y={8 + i*32} width={rightW - 16} height={22} rx={6} fill="rgba(255,255,255,0.06)" />
          ))}
        </g>
      </g>
    </svg>
  )
}


