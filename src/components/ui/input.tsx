import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string
    label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, id, ...props }, ref) => {
        const inputId = id || React.useId()

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    id={inputId}
                    className={cn(
                        'flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm transition-all duration-200',
                        'placeholder:text-slate-400',
                        'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500',
                        error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input }
