import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'

        const variants = {
            default: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 focus-visible:ring-violet-500',
            destructive: 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/25 focus-visible:ring-red-500',
            outline: 'border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-900 focus-visible:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800',
            secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
            ghost: 'hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-500 dark:hover:bg-slate-800 dark:hover:text-white',
            link: 'text-violet-600 underline-offset-4 hover:underline focus-visible:ring-violet-500 dark:text-violet-400',
        }

        const sizes = {
            default: 'h-11 px-6 py-2 text-sm',
            sm: 'h-9 px-4 text-xs',
            lg: 'h-12 px-8 text-base',
            icon: 'h-10 w-10',
        }

        return (
            <Comp
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'

export { Button }
