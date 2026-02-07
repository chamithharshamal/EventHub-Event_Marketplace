'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
    className?: string
    style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700',
                className
            )}
            style={style}
        />
    )
}

// Pre-built skeleton components for common patterns
export function SkeletonCard() {
    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="mt-2 h-3 w-32" />
            </div>
        </div>
    )
}

export function SkeletonChart() {
    return (
        <div className="flex h-[350px] items-end justify-between gap-2 px-6 pb-6">
            {[...Array(12)].map((_, i) => (
                <Skeleton
                    key={i}
                    className="w-full"
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                />
            ))}
        </div>
    )
}

export function SkeletonSalesList() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                </div>
            ))}
        </div>
    )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            {/* Rows */}
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex gap-4 py-3">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            ))}
        </div>
    )
}

export function SkeletonEventCard() {
    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>
        </div>
    )
}
