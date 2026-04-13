import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">{icon}</div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[#1A1D27] border border-[#2A2D3A] rounded-lg px-3 py-2.5',
              'text-[#F1F5F9] placeholder:text-[#94A3B8] text-sm',
              'focus:outline-none focus:border-emerald-500 transition-colors',
              icon ? 'pl-10' : '',
              error ? 'border-rose-500' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export { Input }
