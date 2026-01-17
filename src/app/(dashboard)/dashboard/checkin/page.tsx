import Link from 'next/link'
import {
    QrCode,
    Users,
    CheckCircle,
    Clock,
    Calendar,
    MapPin,
    ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

// Mock events data
const mockEvents = [
    {
        id: 'evt_001',
        title: 'Tech Innovation Summit 2026',
        start_date: '2026-02-15T09:00:00Z',
        venue_name: 'Moscone Center',
        city: 'San Francisco',
        status: 'published',
        totalTickets: 380,
        checkedIn: 127,
    },
    {
        id: 'evt_002',
        title: 'AI Workshop Series',
        start_date: '2026-03-10T10:00:00Z',
        venue_name: 'Tech Hub',
        city: 'New York',
        status: 'published',
        totalTickets: 50,
        checkedIn: 0,
    },
    {
        id: 'evt_003',
        title: 'Startup Networking Night',
        start_date: '2026-02-20T18:30:00Z',
        venue_name: 'Innovation Center',
        city: 'Austin',
        status: 'published',
        totalTickets: 67,
        checkedIn: 0,
    },
]

export default function CheckinEventsPage() {
    const events = mockEvents

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check-in</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Select an event to start checking in attendees
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                <Calendar className="h-6 w-6 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{events.length}</p>
                                <p className="text-sm text-slate-500">Active Events</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {events.reduce((sum, e) => sum + e.checkedIn, 0)}
                                </p>
                                <p className="text-sm text-slate-500">Total Checked In</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {events.reduce((sum, e) => sum + (e.totalTickets - e.checkedIn), 0)}
                                </p>
                                <p className="text-sm text-slate-500">Pending Check-ins</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Events List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {events.length === 0 ? (
                            <div className="text-center py-12">
                                <QrCode className="h-12 w-12 mx-auto text-slate-400" />
                                <h3 className="mt-4 text-lg font-semibold">No events</h3>
                                <p className="mt-2 text-slate-500">
                                    Create an event to start using check-in
                                </p>
                            </div>
                        ) : (
                            events.map((event) => {
                                const progress = (event.checkedIn / event.totalTickets) * 100
                                const isLive = new Date(event.start_date) <= new Date()

                                return (
                                    <Link
                                        key={event.id}
                                        href={`/dashboard/events/${event.id}/checkin`}
                                    >
                                        <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                            {/* Event Icon */}
                                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shrink-0">
                                                <QrCode className="h-7 w-7" />
                                            </div>

                                            {/* Event Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                                        {event.title}
                                                    </h3>
                                                    {isLive && (
                                                        <Badge variant="success" className="animate-pulse shrink-0">
                                                            Live
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {formatDate(event.start_date)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {event.city}
                                                    </span>
                                                </div>

                                                {/* Progress */}
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-slate-500">
                                                            {event.checkedIn}/{event.totalTickets} checked in
                                                        </span>
                                                        <span className="font-medium">{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                                                        <div
                                                            className="h-full rounded-full bg-emerald-500"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <ArrowRight className="h-5 w-5 text-slate-400 shrink-0" />
                                        </div>
                                    </Link>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Mobile App Promo */}
            <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                            <QrCode className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">Download the Check-in App</h3>
                            <p className="text-sm text-white/80 mt-1">
                                Use our mobile app for faster check-ins with offline support
                            </p>
                        </div>
                        <Button variant="secondary" className="shrink-0">
                            Get App
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
