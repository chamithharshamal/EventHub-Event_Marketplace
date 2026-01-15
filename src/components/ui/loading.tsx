import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
    size?: 'sm' | 'default' | 'lg'
    className?: string
}

export function LoadingSpinner({ size = 'default', className }: LoadingSpinnerProps) {
    const sizes = {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
    }

    return (
        <Loader2 className={cn('animate-spin text-violet-600', sizes[size], className)} />
    )
}

interface LoadingPageProps {
    message?: string
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </div>
    )
}
