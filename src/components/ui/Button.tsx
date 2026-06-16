import { type ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'outline', size = 'sm', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      primary: 'bg-[var(--accent)] text-white hover:opacity-90 shadow-sm',
      outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    }
    
    const sizes = {
      sm: 'h-8 px-3 text-[13px]',
      md: 'h-9 px-4 text-sm',
    }

    const classes = [baseStyles, variants[variant], sizes[size], className].filter(Boolean).join(' ')

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
