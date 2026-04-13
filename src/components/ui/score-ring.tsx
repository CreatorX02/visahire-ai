'use client'
import React, { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, showLabel = true }: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (displayScore / 100) * circumference

  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#F43F5E'

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    const timer = setTimeout(() => {
      let current = 0
      const increment = score / 30
      interval = setInterval(() => {
        current += increment
        if (current >= score) {
          setDisplayScore(score)
          clearInterval(interval)
        } else {
          setDisplayScore(Math.floor(current))
        }
      }, 20)
    }, 100)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [score])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#2A2D3A" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.05s ease' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
            {displayScore}
          </span>
          <span className="text-xs text-[#94A3B8]">score</span>
        </div>
      )}
    </div>
  )
}
