import * as React from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-[#1A1D27] border border-[#2A2D3A] rounded-lg px-3 py-2.5',
            'text-[#F1F5F9] placeholder:text-[#94A3B8] text-sm',
            'focus:outline-none focus:border-emerald-500 transition-colors resize-none',
            error ? 'border-rose-500' : '',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
export { Textarea }
