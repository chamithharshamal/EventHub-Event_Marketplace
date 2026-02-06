'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
    Loader2,
    Search,
    AlertTriangle,
    CheckSquare,
    Square,
    Trash2
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

type EventStatus = 'pending_approval' | 'published' | 'rejected' | 'draft' | 'all'

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
    rejection_reason?: string
    created_at: string
    banner_url: string
    profiles: {
        full_name: string
        email: string
        avatar_url: string
    }
}

const statusTabs: { value: EventStatus; label: string; icon: typeof Clock }[] = [
    { value: 'pending_approval', label: 'Pending', icon: Clock },
    { value: 'published', label: 'Published', icon: CheckCircle },
    { value: 'rejected', label: 'Rejected', icon: XCircle },
    { value: 'all', label: 'All', icon: Calendar }
]

const statusBadges: Record<string, string> = {
    pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [statusFilter, setStatusFilter] = useState<EventStatus>('pending_approval')
    const [search, setSearch] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [bulkRejecting, setBulkRejecting] = useState(false)
    const [bulkRejectReason, setBulkRejectReason] = useState('')
    const [bulkLoading, setBulkLoading] = useState(false)

    const fetchEvents = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.set('status', statusFilter)
            if (search) params.set('search', search)

            const res = await fetch(`/api/admin/events?${params}`)
            const data = await res.json()
            setEvents(data.events || [])
            setSelectedIds(new Set())
        } catch {
            console.error('Failed to fetch events')
        } finally {
            setLoading(false)
        }
    }, [statusFilter, search])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(fetchEvents, 300)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search])

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
                if (statusFilter === 'pending_approval') {
                    setEvents(events.filter(e => e.id !== eventId))
                } else {
                    fetchEvents()
                }
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
                if (statusFilter === 'pending_approval') {
                    setEvents(events.filter(e => e.id !== eventId))
                } else {
                    fetchEvents()
                }
                setRejectingId(null)
                setRejectReason('')
            }
        } catch {
            console.error('Failed to reject event')
        } finally {
            setActionLoading(null)
        }
    }

    const handleBulkApprove = async () => {
        if (selectedIds.size === 0) return
        setBulkLoading(true)
        try {
            const res = await fetch('/api/admin/events/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve', eventIds: Array.from(selectedIds) })
            })
            const data = await res.json()
            if (!data.error) {
                fetchEvents()
            }
        } catch {
            console.error('Failed to bulk approve')
        } finally {
            setBulkLoading(false)
        }
    }

    const handleBulkReject = async () => {
        if (selectedIds.size === 0 || !bulkRejectReason.trim()) return
        setBulkLoading(true)
        try {
            const res = await fetch('/api/admin/events/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reject',
                    eventIds: Array.from(selectedIds),
                    reason: bulkRejectReason
                })
            })
            const data = await res.json()
            if (!data.error) {
                fetchEvents()
                setBulkRejecting(false)
                setBulkRejectReason('')
            }
        } catch {
            console.error('Failed to bulk reject')
        } finally {
            setBulkLoading(false)
        }
    }

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === events.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(events.map(e => e.id)))
        }
    }

    const pendingEvents = events.filter(e => e.status === 'pending_approval')

    return (
        <div className="space-y-6">
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
                        Review and manage all events
                    </p>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
                {statusTabs.map(tab => {
                    const Icon = tab.icon
                    const isActive = statusFilter === tab.value
                    return (
                        <Button
                            key={tab.value}
                            variant={isActive ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setStatusFilter(tab.value)}
                            className={isActive ? '' : 'text-slate-500'}
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            {tab.label}
                            {tab.value === 'pending_approval' && pendingEvents.length > 0 && (
                                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700">
                                    {pendingEvents.length}
                                </Badge>
                            )}
                        </Button>
                    )
                })}
            </div>

            {/* Search & Bulk Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Bulk Actions */}
                {selectedIds.size > 0 && statusFilter === 'pending_approval' && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">
                            {selectedIds.size} selected
                        </span>
                        {bulkRejecting ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Rejection reason..."
                                    value={bulkRejectReason}
                                    onChange={(e) => setBulkRejectReason(e.target.value)}
                                    className="w-48"
                                />
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleBulkReject}
                                    disabled={!bulkRejectReason.trim() || bulkLoading}
                                >
                                    {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setBulkRejecting(false)
                                        setBulkRejectReason('')
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button
                                    size="sm"
                                    onClick={handleBulkApprove}
                                    disabled={bulkLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve All
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200"
                                    onClick={() => setBulkRejecting(true)}
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject All
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>{events.length} events</span>
            </div>

            {/* Select All (for pending) */}
            {statusFilter === 'pending_approval' && events.length > 0 && (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSelectAll}
                        className="text-slate-500"
                    >
                        {selectedIds.size === events.length ? (
                            <CheckSquare className="h-4 w-4 mr-2" />
                        ) : (
                            <Square className="h-4 w-4 mr-2" />
                        )}
                        {selectedIds.size === events.length ? 'Deselect All' : 'Select All'}
                    </Button>
                </div>
            )}

            {/* Events List */}
            {loading ? (
                <div className="flex h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto" />
                        <p className="mt-4 text-slate-500 dark:text-slate-400">Loading events...</p>
                    </div>
                </div>
            ) : events.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        {statusFilter === 'pending_approval' ? (
                            <>
                                <CheckCircle className="h-12 w-12 mx-auto text-emerald-500" />
                                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">All caught up!</h3>
                                <p className="mt-2 text-slate-500 dark:text-slate-400">
                                    No events pending approval
                                </p>
                            </>
                        ) : (
                            <>
                                <Calendar className="h-12 w-12 mx-auto text-slate-400" />
                                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No events found</h3>
                                <p className="mt-2 text-slate-500 dark:text-slate-400">
                                    {search ? 'Try a different search term' : `No ${statusFilter === 'all' ? '' : statusFilter} events`}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => (
                        <Card key={event.id} className={selectedIds.has(event.id) ? 'ring-2 ring-violet-500' : ''}>
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                    {/* Checkbox for pending */}
                                    {statusFilter === 'pending_approval' && (
                                        <div className="flex-shrink-0 flex items-start pt-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => toggleSelect(event.id)}
                                            >
                                                {selectedIds.has(event.id) ? (
                                                    <CheckSquare className="h-5 w-5 text-violet-600" />
                                                ) : (
                                                    <Square className="h-5 w-5 text-slate-400" />
                                                )}
                                            </Button>
                                        </div>
                                    )}

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
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                        {event.title}
                                                    </h3>
                                                    <Badge className={statusBadges[event.status] || 'bg-slate-100'}>
                                                        {event.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
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

                                        {/* Rejection Reason */}
                                        {event.status === 'rejected' && event.rejection_reason && (
                                            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                                                <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                                                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                    <span><strong>Rejection reason:</strong> {event.rejection_reason}</span>
                                                </p>
                                            </div>
                                        )}

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

                                            {event.status === 'pending_approval' && (
                                                <>
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
                                                </>
                                            )}

                                            {event.status === 'rejected' && (
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
                                                            Re-approve
                                                        </>
                                                    )}
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
