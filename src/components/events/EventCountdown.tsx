'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface EventCountdownProps {
    startDate: string
    className?: string
}

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

export function EventCountdown({ startDate, className = '' }: EventCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
    const [isExpired, setIsExpired] = useState(false)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const eventDate = new Date(startDate).getTime()
            const now = new Date().getTime()
            const difference = eventDate - now

            if (difference <= 0) {
                setIsExpired(true)
                return null
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            }
        }

        // Initial calculation
        setTimeLeft(calculateTimeLeft())

        // Update every second
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft()
            if (newTimeLeft === null) {
                clearInterval(timer)
            }
            setTimeLeft(newTimeLeft)
        }, 1000)

        return () => clearInterval(timer)
    }, [startDate])

    if (isExpired) {
        return (
            <div className={`flex items-center gap-2 text-emerald-600 dark:text-emerald-400 ${className}`}>
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Event is live!</span>
            </div>
        )
    }

    if (!timeLeft) {
        return null
    }

    // Show different formats based on time remaining
    if (timeLeft.days > 7) {
        return (
            <div className={`flex items-center gap-2 text-violet-600 dark:text-violet-400 ${className}`}>
                <Clock className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">
                    Starting in {timeLeft.days} days
                </span>
            </div>
        )
    }

    return (
        <div className={`${className}`}>
            <div className="flex items-center gap-2 mb-2 text-violet-600 dark:text-violet-400">
                <Clock className="h-5 w-5 animate-pulse" />
                <span className="font-semibold text-sm uppercase tracking-wide">Event starts in</span>
            </div>
            <div className="flex gap-3">
                <TimeUnit value={timeLeft.days} label="Days" />
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <TimeUnit value={timeLeft.minutes} label="Mins" />
                <TimeUnit value={timeLeft.seconds} label="Secs" />
            </div>
        </div>
    )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-xl sm:text-2xl rounded-lg w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg">
                {value.toString().padStart(2, '0')}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">
                {label}
            </span>
        </div>
    )
}
