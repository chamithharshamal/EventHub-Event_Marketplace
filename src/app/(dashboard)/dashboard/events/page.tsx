import Link from 'next/link'
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    MoreVertical,
    Calendar,
    Users,
    Ticket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

interface TicketType {
    quantity_total: number
    quantity_sold: number
}

interface Event {
    id: string
    title: string
    slug: string
    status: string
    start_date: string
    city: string | null
    banner_url: string | null
    ticket_types: TicketType[]
}

async function getMyEvents() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: events, error } = await supabase
        .from('events')
        .select(`
            id,
            title,
            slug,
            status,
            start_date,
            city,
            banner_url,
            ticket_types (
                quantity_total,
                quantity_sold
            )
        `)
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching events:', error)
        return []
    }

    return events as Event[]
}

async function getEventRevenue(eventId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('orders')
        .select('total')
        .eq('event_id', eventId)
        .eq('status', 'completed') as { data: { total: number }[] | null; error: unknown }

    if (error) return 0
    return data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'published':
            return <Badge variant="success">Published</Badge>
        case 'draft':
            return <Badge variant="secondary">Draft</Badge>
        case 'cancelled':
            return <Badge variant="destructive">Cancelled</Badge>
        case 'completed':
            return <Badge variant="outline">Completed</Badge>
        default:
            return <Badge>{status}</Badge>
    }
}

export default async function EventsManagementPage() {
    const events = await getMyEvents()
    const hasEvents = events.length > 0

    const totalTicketsSold = events.reduce((sum, event) => {
        return sum + (event.ticket_types?.reduce((t, tt) => t + tt.quantity_sold, 0) || 0)
    }, 0)

    const totalTickets = events.reduce((sum, event) => {
        return sum + (event.ticket_types?.reduce((t, tt) => t + tt.quantity_total, 0) || 0)
    }, 0)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Events</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Manage your events and track their performance
                    </p>
                </div>
                <Link href="/dashboard/events/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        Create Event
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                <Calendar className="h-6 w-6 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold dark:text-white">{events.length}</p>
                                <p className="text-sm text-slate-500">Total Events</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <Ticket className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div> 
                                <p className="text-2xl font-bold dark:text-white">{totalTicketsSold}</p>
                                <p className="text-sm text-slate-500">Tickets Sold</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Users className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold dark:text-white">{totalTickets}</p>
                                <p className="text-sm text-slate-500">Total Capacity</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search events..." className="pl-10" />
                </div>
                <div className="flex gap-2">
                    <select className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm dark:text-white dark:border-slate-700 dark:bg-slate-900">
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        More Filters
                    </Button>
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
                {!hasEvents ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Calendar className="h-12 w-12 mx-auto text-slate-400" />
                            <h3 className="mt-4 text-lg font-semibold dark:text-white">No events yet</h3>
                            <p className="mt-2 text-slate-500">Create your first event to get started</p>
                            <Link href="/dashboard/events/new" className="mt-4 inline-block">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Event
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    events.map((event) => {
                        const totalEventTickets = event.ticket_types?.reduce((t, tt) => t + tt.quantity_total, 0) || 0
                        const soldEventTickets = event.ticket_types?.reduce((t, tt) => t + tt.quantity_sold, 0) || 0
                        const percentSold = totalEventTickets > 0 ? Math.round((soldEventTickets / totalEventTickets) * 100) : 0

                        return (
                            <Card key={event.id} className="overflow-hidden">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Event Image */}
                                    <div className="relative w-full sm:w-48 h-32 sm:h-auto shrink-0 bg-slate-200 dark:bg-slate-800">
                                        {event.banner_url ? (
                                            <img
                                                src={event.banner_url}
                                                alt={event.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Calendar className="h-8 w-8 text-slate-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Info */}
                                    <CardContent className="flex-1 p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getStatusBadge(event.status)}
                                                    <span className="text-sm text-slate-500">
                                                        {formatDate(event.start_date)}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                    {event.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1">{event.city || 'Online'}</p>

                                                {/* Progress */}
                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="text-slate-500">Tickets sold</span>
                                                        <span className="font-medium">{soldEventTickets}/{totalEventTickets}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                                                            style={{ width: `${percentSold}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/events/${event.slug}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/dashboard/events/${event.id}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
