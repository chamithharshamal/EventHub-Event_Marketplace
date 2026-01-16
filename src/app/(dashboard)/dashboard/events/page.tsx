import Link from 'next/link'
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Copy,
    Calendar,
    Users,
    Ticket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'

// Mock data - will be replaced with real data
const mockEvents = [
    {
        id: '1',
        title: 'Tech Innovation Summit 2026',
        slug: 'tech-innovation-summit-2026',
        status: 'published',
        start_date: '2026-02-15T09:00:00Z',
        city: 'San Francisco',
        banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop',
        ticket_types: [
            { quantity_total: 500, quantity_sold: 380 }
        ],
        revenue: 98450,
    },
    {
        id: '2',
        title: 'AI Workshop Series',
        slug: 'ai-workshop-series',
        status: 'draft',
        start_date: '2026-03-10T10:00:00Z',
        city: 'New York',
        banner_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop',
        ticket_types: [
            { quantity_total: 50, quantity_sold: 0 }
        ],
        revenue: 0,
    },
    {
        id: '3',
        title: 'Startup Networking Night',
        slug: 'startup-networking-night',
        status: 'published',
        start_date: '2026-02-20T18:30:00Z',
        city: 'Austin',
        banner_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&auto=format&fit=crop',
        ticket_types: [
            { quantity_total: 100, quantity_sold: 67 }
        ],
        revenue: 1675,
    },
    {
        id: '4',
        title: 'Music Festival 2026',
        slug: 'music-festival-2026',
        status: 'cancelled',
        start_date: '2026-04-15T14:00:00Z',
        city: 'Miami',
        banner_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&auto=format&fit=crop',
        ticket_types: [
            { quantity_total: 2000, quantity_sold: 450 }
        ],
        revenue: 67500,
    },
]

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
    // TODO: Replace with real data fetch
    // const events = await getMyEvents()
    const events = mockEvents

    const totalTicketsSold = events.reduce((sum, event) => {
        return sum + event.ticket_types.reduce((t, tt) => t + tt.quantity_sold, 0)
    }, 0)

    const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0)

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
                                <p className="text-2xl font-bold">{events.length}</p>
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
                                <p className="text-2xl font-bold">{totalTicketsSold}</p>
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
                                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                                <p className="text-sm text-slate-500">Total Revenue</p>
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
                    <select className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900">
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
                {events.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Calendar className="h-12 w-12 mx-auto text-slate-400" />
                            <h3 className="mt-4 text-lg font-semibold">No events yet</h3>
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
                        const totalTickets = event.ticket_types.reduce((t, tt) => t + tt.quantity_total, 0)
                        const soldTickets = event.ticket_types.reduce((t, tt) => t + tt.quantity_sold, 0)
                        const percentSold = totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0

                        return (
                            <Card key={event.id} className="overflow-hidden">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Event Image */}
                                    <div className="relative w-full sm:w-48 h-32 sm:h-auto shrink-0">
                                        <img
                                            src={event.banner_url}
                                            alt={event.title}
                                            className="h-full w-full object-cover"
                                        />
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
                                                <p className="text-sm text-slate-500 mt-1">{event.city}</p>

                                                {/* Progress */}
                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="text-slate-500">Tickets sold</span>
                                                        <span className="font-medium">{soldTickets}/{totalTickets}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                                                            style={{ width: `${percentSold}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Revenue & Actions */}
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                        {formatCurrency(event.revenue)}
                                                    </p>
                                                    <p className="text-xs text-slate-500">Revenue</p>
                                                </div>

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
