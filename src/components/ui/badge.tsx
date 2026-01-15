import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
        secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        destructive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        outline: 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                variants[variant],
                className
            )}
            {...props}
        />
    )
}
