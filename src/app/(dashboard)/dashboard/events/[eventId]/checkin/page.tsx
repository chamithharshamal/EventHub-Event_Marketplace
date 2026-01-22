import { createClient } from '@/lib/supabase/server'
import { type Event } from '@/types/database'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Users,
    Ticket,
    CheckCircle,
    Clock,
    TrendingUp,
    RefreshCw,
    Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QRScanner } from '@/components/checkin/qr-scanner'
import { formatDateTime } from '@/lib/utils'

// Force dynamic rendering to ensure stats are fresh
export const dynamic = 'force-dynamic'

interface CheckinPageProps {
    params: Promise<{ eventId: string }>
}

export default async function CheckinPage({ params }: CheckinPageProps) {
    const { eventId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch event details
    const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

    const event = eventData as Event | null

    if (!event) {
        notFound()
    }

    // Verify ownership (or admin/staff role later)
    if (event.organizer_id !== user.id) {
        // TODO: Check for staff/admin role
        redirect('/dashboard/events')
    }

    // Fetch Stats
    // 1. Total tickets sold (valid tickets)
    const { count: totalTickets } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .neq('status', 'cancelled')

    // 2. Checked in count
    const { count: checkedInCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'used')

    // 3. Last Hour Check-ins
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: lastHourCount } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .gt('scanned_at', oneHourAgo)

    // 4. Recent Check-ins
    const { data: recentLogs } = await supabase
        .from('check_ins')
        .select(`
            id,
            scanned_at,
            tickets (
                id,
                status,
                ticket_types (name),
                profiles:user_id (
                    full_name,
                    email
                )
            )
        `)
        .eq('event_id', eventId)
        .order('scanned_at', { ascending: false })
        .limit(10)

    const stats = {
        totalTickets: totalTickets || 0,
        checkedIn: checkedInCount || 0,
        pendingCheckin: (totalTickets || 0) - (checkedInCount || 0),
        checkinsLastHour: lastHourCount || 0
    }

    const checkinProgress = stats.totalTickets > 0
        ? (stats.checkedIn / stats.totalTickets) * 100
        : 0

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href={`/dashboard/events`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="text-center">
                            <h1 className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                                {event.title}
                            </h1>
                            <p className="text-xs text-slate-500">{event.venue_name || 'Online Event'}</p>
                        </div>
                        <Badge variant={event.status === 'published' ? 'success' : 'secondary'}>
                            {event.status === 'published' ? 'Live' : event.status}
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Note: I'm removing the Client-side Tabs for simplicity in Server Component
                Using a stacked layout or client wrapper if needed. 
                For now, Scanner on top, stats below is fine for mobile-first check-in app.
            */}

            <main className="mx-auto max-w-lg px-4 py-6 space-y-6">

                {/* Scanner Section */}
                <div className="space-y-4">
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Scanner</h2>
                    <QRScanner eventId={eventId} />
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-600">{stats.checkedIn}</div>
                            <div className="text-xs text-slate-500">Checked In</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-slate-600">{stats.pendingCheckin}</div>
                            <div className="text-xs text-slate-500">Pending</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Stats */}
                <div className="space-y-4">
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Statistics</h2>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-slate-500">{Math.round(checkinProgress)}%</span>
                            </div>
                            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                                    style={{ width: `${checkinProgress}%` }}
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Ticket className="w-4 h-4" />
                                    <span>{stats.totalTickets} Total Tickets</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>{stats.checkinsLastHour}/hr Rate</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Check-ins */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Recent Activity</h2>
                        <Button variant="ghost" size="sm" asChild>
                            <a href={`/dashboard/events/${eventId}/checkin`}>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Refresh
                            </a>
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {!recentLogs || recentLogs.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No recent check-ins</div>
                                ) : (
                                    recentLogs.map((logItem) => {
                                        // Explicitly define the expected shape of the log item with joins
                                        type CheckInLog = {
                                            id: string
                                            scanned_at: string
                                            tickets: {
                                                id: string
                                                status: string
                                                ticket_types: { name: string } | null
                                                profiles: { full_name: string | null; email: string } | null
                                            } | null
                                        }

                                        const log = logItem as unknown as CheckInLog
                                        const ticket = log.tickets
                                        const profile = ticket?.profiles
                                        const ticketType = ticket?.ticket_types?.name

                                        return (
                                            <div key={log.id} className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                            {profile?.full_name || 'Guest User'}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{ticketType}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </main>
        </div>
    )
}
