import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">{label}</label>}
      <div className="relative">
        <select
          className={cn(
            'w-full bg-[#1A1D27] border border-[#2A2D3A] rounded-lg px-3 py-2.5 pr-10',
            'text-[#F1F5F9] text-sm appearance-none',
            'focus:outline-none focus:border-emerald-500 transition-colors',
            error ? 'border-rose-500' : '',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  )
}
