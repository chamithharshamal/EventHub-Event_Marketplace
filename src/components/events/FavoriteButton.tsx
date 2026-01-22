'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavorite } from '@/app/actions/favorites'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
    eventId: string
    initialFavorited?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'overlay' | 'outline'
    className?: string
    showText?: boolean
}

export function FavoriteButton({
    eventId,
    initialFavorited = false,
    size = 'md',
    variant = 'default',
    className,
    showText = false,
}: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialFavorited)
    const [isPending, startTransition] = useTransition()

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Optimistic update
        setIsFavorited(!isFavorited)

        startTransition(async () => {
            const result = await toggleFavorite(eventId)

            if (!result.success) {
                // Revert on error
                setIsFavorited(isFavorited)
                console.error('Failed to toggle favorite:', result.error)
            }
        })
    }

    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
    }

    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    }

    const variantClasses = {
        default: cn(
            'bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800',
            'text-slate-600 dark:text-slate-400',
            'shadow-sm'
        ),
        overlay: cn(
            'bg-black/30 hover:bg-black/50 backdrop-blur-sm',
            'text-white'
        ),
        outline: cn(
            'border border-slate-200 dark:border-slate-700',
            'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
            'text-slate-600 dark:text-slate-400'
        ),
    }

    if (showText) {
        return (
            <button
                onClick={handleToggle}
                disabled={isPending}
                className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variant === 'outline'
                        ? 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'bg-white dark:bg-slate-800 shadow-sm hover:shadow',
                    isFavorited && 'text-red-500',
                    className
                )}
            >
                <Heart
                    className={cn(
                        iconSizes[size],
                        isFavorited && 'fill-current',
                        isPending && 'animate-pulse'
                    )}
                />
                <span>
                    {isFavorited ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </span>
            </button>
        )
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                'inline-flex items-center justify-center rounded-full transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                sizeClasses[size],
                variantClasses[variant],
                isFavorited && 'text-red-500',
                className
            )}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart
                className={cn(
                    iconSizes[size],
                    isFavorited && 'fill-current',
                    isPending && 'animate-pulse'
                )}
            />
        </button>
    )
}

// Wrapper to fetch initial state server-side
export function FavoriteButtonWithState({
    eventId,
    favoriteIds,
    ...props
}: Omit<FavoriteButtonProps, 'initialFavorited'> & {
    favoriteIds: string[]
}) {
    const initialFavorited = favoriteIds.includes(eventId)
    return <FavoriteButton eventId={eventId} initialFavorited={initialFavorited} {...props} />
}
