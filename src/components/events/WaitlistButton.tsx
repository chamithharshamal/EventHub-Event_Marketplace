'use client'

import { useState, useTransition, useEffect } from 'react'
import { Bell, BellOff, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { joinWaitlist, leaveWaitlist, getWaitlistStatus } from '@/app/actions/waitlist'
import { cn } from '@/lib/utils'

interface WaitlistButtonProps {
    eventId: string
    eventTitle?: string
    className?: string
    variant?: 'default' | 'large'
}

export function WaitlistButton({
    eventId,
    eventTitle,
    className,
    variant = 'default',
}: WaitlistButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [isOnWaitlist, setIsOnWaitlist] = useState(false)
    const [position, setPosition] = useState<number | null>(null)
    const [totalWaiting, setTotalWaiting] = useState<number>(0)
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkStatus() {
            const status = await getWaitlistStatus(eventId)
            setIsOnWaitlist(status.isOnWaitlist)
            setPosition(status.position)
            setTotalWaiting(status.totalWaiting || 0)
            setLoading(false)
        }
        checkStatus()
    }, [eventId])

    const handleToggle = () => {
        setMessage(null)

        startTransition(async () => {
            if (isOnWaitlist) {
                const result = await leaveWaitlist(eventId)
                if (result.success) {
                    setIsOnWaitlist(false)
                    setPosition(null)
                    setMessage('You have been removed from the waitlist')
                } else {
                    setMessage(result.error || 'Failed to leave waitlist')
                }
            } else {
                const result = await joinWaitlist(eventId)
                if (result.success) {
                    setIsOnWaitlist(true)
                    setPosition(result.position || null)
                    setMessage(`You are #${result.position} on the waitlist`)
                } else {
                    setMessage(result.error || 'Failed to join waitlist')
                }
            }
        })
    }

    if (loading) {
        return (
            <Button variant="outline" disabled className={className}>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Loading...
            </Button>
        )
    }

    if (variant === 'large') {
        return (
            <div className={cn('space-y-3', className)}>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <Bell className="h-5 w-5" />
                        <span className="font-medium">This event is sold out</span>
                    </div>
                    <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">
                        Join the waitlist to be notified if tickets become available.
                    </p>
                    {totalWaiting > 0 && (
                        <p className="mt-2 text-xs text-amber-500 dark:text-amber-600">
                            <Users className="inline h-3 w-3 mr-1" />
                            {totalWaiting} {totalWaiting === 1 ? 'person' : 'people'} waiting
                        </p>
                    )}
                </div>

                {isOnWaitlist ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg bg-violet-50 p-3 dark:bg-violet-900/20">
                            <div>
                                <p className="font-medium text-violet-700 dark:text-violet-400">
                                    You&apos;re on the waitlist!
                                </p>
                                <p className="text-sm text-violet-600 dark:text-violet-500">
                                    Position: #{position}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleToggle}
                                disabled={isPending}
                                className="text-violet-600 hover:text-violet-700"
                            >
                                <BellOff className="h-4 w-4 mr-1" />
                                Leave
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={handleToggle}
                        disabled={isPending}
                        className="w-full"
                        size="lg"
                    >
                        <Bell className="h-4 w-4 mr-2" />
                        {isPending ? 'Joining...' : 'Join Waitlist'}
                    </Button>
                )}

                {message && !isOnWaitlist && (
                    <p className="text-sm text-center text-slate-500">{message}</p>
                )}
            </div>
        )
    }

    // Default compact variant
    return (
        <Button
            variant={isOnWaitlist ? 'outline' : 'default'}
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                isOnWaitlist && 'border-violet-200 text-violet-700 dark:border-violet-800 dark:text-violet-400',
                className
            )}
        >
            {isOnWaitlist ? (
                <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Leave Waitlist (#{position})
                </>
            ) : (
                <>
                    <Bell className="h-4 w-4 mr-2" />
                    {isPending ? 'Joining...' : 'Join Waitlist'}
                </>
            )}
        </Button>
    )
}

// Simple badge showing waitlist count
export function WaitlistBadge({ count, className }: { count: number; className?: string }) {
    if (count === 0) return null

    return (
        <span className={cn(
            'inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            className
        )}>
            <Users className="h-3 w-3" />
            {count} waiting
        </span>
    )
}
