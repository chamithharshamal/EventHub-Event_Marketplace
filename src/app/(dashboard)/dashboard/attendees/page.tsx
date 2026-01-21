import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { Users, Search, Ticket, CheckCircle, XCircle } from 'lucide-react'

interface Attendee {
    id: string
    status: string
    checked_in_at: string | null
    attendee_name: string | null
    attendee_email: string | null
    event: {
        title: string
    }
    ticket_type: {
        name: string
    }
    user: {
        email: string
        full_name: string | null
    }
}

async function getAttendees() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get user's events first
    const { data: userEvents } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', user.id) as { data: { id: string }[] | null }

    if (!userEvents || userEvents.length === 0) return []

    const eventIds = userEvents.map(e => e.id)

    const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
            id,
            status,
            checked_in_at,
            attendee_name,
            attendee_email,
            event:events (
                title
            ),
            ticket_type:ticket_types (
                name
            ),
            user:profiles (
                email,
                full_name
            )
        `)
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error('Error fetching attendees:', error)
        return []
    }

    return tickets as unknown as Attendee[]
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'valid':
            return <Badge variant="success">Valid</Badge>
        case 'used':
            return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Checked In</Badge>
        case 'cancelled':
            return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
        case 'transferred':
            return <Badge variant="outline">Transferred</Badge>
        default:
            return <Badge>{status}</Badge>
    }
}

export default async function AttendeesPage() {
    const attendees = await getAttendees()
    const hasAttendees = attendees.length > 0

    const totalAttendees = attendees.length
    const checkedIn = attendees.filter(a => a.status === 'used').length
    const pending = attendees.filter(a => a.status === 'valid').length

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendees</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    View and manage attendees across all your events
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                <Users className="h-6 w-6 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalAttendees}</p>
                                <p className="text-sm text-slate-500">Total Attendees</p>
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
                                <p className="text-2xl font-bold">{checkedIn}</p>
                                <p className="text-sm text-slate-500">Checked In</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Ticket className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pending}</p>
                                <p className="text-sm text-slate-500">Pending Check-in</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search attendees by name or email..." className="pl-10" />
            </div>

            {/* Attendees List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Attendees</CardTitle>
                </CardHeader>
                <CardContent>
                    {!hasAttendees ? (
                        <div className="py-12 text-center">
                            <Users className="h-12 w-12 mx-auto text-slate-400" />
                            <h3 className="mt-4 text-lg font-semibold">No attendees yet</h3>
                            <p className="mt-2 text-slate-500">Attendees will appear here when customers purchase tickets</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Event</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Ticket</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Check-in</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendees.map((attendee) => (
                                        <tr key={attendee.id} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className="px-4 py-4 text-sm font-medium">
                                                {attendee.attendee_name || attendee.user?.full_name || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-500">
                                                {attendee.attendee_email || attendee.user?.email || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                {attendee.event?.title || 'Unknown Event'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-500">
                                                {attendee.ticket_type?.name || '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(attendee.status)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-500">
                                                {attendee.checked_in_at ? formatDate(attendee.checked_in_at) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
