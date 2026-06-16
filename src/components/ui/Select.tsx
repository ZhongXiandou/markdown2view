import { type SelectHTMLAttributes, forwardRef } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', ...props }, ref) => {
    const baseStyles = 'h-8 rounded-md border border-slate-200 bg-white px-2 py-0 text-[13px] text-slate-700 outline-none transition-colors focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 disabled:bg-slate-50 disabled:opacity-50'
    const classes = [baseStyles, className].filter(Boolean).join(' ')
    
    return <select ref={ref} className={classes} {...props} />
  }
)
Select.displayName = 'Select'
