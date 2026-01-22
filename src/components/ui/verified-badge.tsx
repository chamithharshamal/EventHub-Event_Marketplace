import { cn } from '@/lib/utils'
import { BadgeCheck } from 'lucide-react'

interface VerifiedBadgeProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
    showTooltip?: boolean
}

const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
}

export function VerifiedBadge({
    size = 'md',
    className,
    showTooltip = true
}: VerifiedBadgeProps) {
    const badge = (
        <BadgeCheck
            className={cn(
                'text-blue-500 fill-blue-500 shrink-0',
                sizeClasses[size],
                className
            )}
        />
    )

    if (showTooltip) {
        return (
            <span
                className="inline-flex items-center"
                title="Verified Organizer"
            >
                {badge}
            </span>
        )
    }

    return badge
}

interface VerifiedOrganizerNameProps {
    name: string
    isVerified: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function VerifiedOrganizerName({
    name,
    isVerified,
    size = 'md',
    className
}: VerifiedOrganizerNameProps) {
    return (
        <span className={cn('inline-flex items-center gap-1', className)}>
            <span>{name}</span>
            {isVerified && <VerifiedBadge size={size} />}
        </span>
    )
}
