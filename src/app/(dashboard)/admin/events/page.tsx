'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    ArrowLeft,
    Calendar,
    MapPin,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Loader2
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Event {
    id: string
    title: string
    slug: string
    description: string
    category: string
    city: string
    country: string
    start_date: string
    end_date: string
    status: string
    created_at: string
    banner_url: string
    profiles: {
        full_name: string
        email: string
        avatar_url: string
    }
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/admin/events')
            const data = await res.json()
            setEvents(data.events || [])
        } catch {
            console.error('Failed to fetch events')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const handleApprove = async (eventId: string) => {
        setActionLoading(eventId)
        try {
            const res = await fetch('/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve', eventId })
            })
            const data = await res.json()
            if (!data.error) {
                setEvents(events.filter(e => e.id !== eventId))
            }
        } catch {
            console.error('Failed to approve event')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (eventId: string) => {
        if (!rejectReason.trim()) return

        setActionLoading(eventId)
        try {
            const res = await fetch('/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', eventId, reason: rejectReason })
            })
            const data = await res.json()
            if (!data.error) {
                setEvents(events.filter(e => e.id !== eventId))
                setRejectingId(null)
                setRejectReason('')
            }
        } catch {
            console.error('Failed to reject event')
        } finally {
            setActionLoading(null)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400">Loading pending events...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Event Moderation</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Review and approve pending events
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {events.length} pending
                </Badge>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto text-emerald-500" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">All caught up!</h3>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            No events pending approval
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => (
                        <Card key={event.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                    {/* Event Image */}
                                    <div className="w-full lg:w-48 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                        {event.banner_url ? (
                                            <img
                                                src={event.banner_url}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Calendar className="h-8 w-8 text-slate-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                    {event.title}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(event.start_date)}
                                                    </span>
                                                    {event.city && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {event.city}, {event.country}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge>{event.category}</Badge>
                                        </div>

                                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                                            {event.description || 'No description provided'}
                                        </p>

                                        {/* Organizer */}
                                        <div className="mt-4 flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4 text-slate-400" />
                                            <span className="text-slate-600 dark:text-slate-300">
                                                {event.profiles?.full_name || 'Unknown Organizer'}
                                            </span>
                                            <span className="text-slate-400">
                                                ({event.profiles?.email})
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <Link href={`/events/${event.slug}`} target="_blank">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Preview
                                                </Button>
                                            </Link>

                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(event.id)}
                                                disabled={actionLoading === event.id}
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                {actionLoading === event.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Approve
                                                    </>
                                                )}
                                            </Button>

                                            {rejectingId === event.id ? (
                                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                                    <Input
                                                        placeholder="Enter rejection reason..."
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleReject(event.id)}
                                                        disabled={!rejectReason.trim() || actionLoading === event.id}
                                                    >
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setRejectingId(null)
                                                            setRejectReason('')
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                                                    onClick={() => setRejectingId(event.id)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
