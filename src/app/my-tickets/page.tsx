import Link from 'next/link'
import { Ticket, Calendar, MapPin, QrCode, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

// Mock tickets data - will be replaced with real data fetch
const mockTickets = [
    {
        id: 'tkt_001',
        status: 'valid',
        ticket_type: { name: 'General Admission', price: 299 },
        event: {
            id: 'evt_001',
            title: 'Tech Innovation Summit 2026',
            slug: 'tech-innovation-summit-2026',
            start_date: '2026-02-15T09:00:00Z',
            venue_name: 'Moscone Center',
            city: 'San Francisco',
            banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop',
        },
        qr_code_data: 'EVT_001_TKT_001',
    },
    {
        id: 'tkt_002',
        status: 'valid',
        ticket_type: { name: 'VIP Pass', price: 150 },
        event: {
            id: 'evt_002',
            title: 'Electronic Music Festival',
            slug: 'electronic-music-festival',
            start_date: '2026-03-20T18:00:00Z',
            venue_name: 'Miami Beach Convention',
            city: 'Miami',
            banner_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&auto=format&fit=crop',
        },
        qr_code_data: 'EVT_002_TKT_002',
    },
    {
        id: 'tkt_003',
        status: 'used',
        ticket_type: { name: 'Workshop Ticket', price: 0 },
        event: {
            id: 'evt_003',
            title: 'AI & Machine Learning Workshop',
            slug: 'ai-ml-workshop',
            start_date: '2026-01-10T10:00:00Z',
            venue_name: 'Tech Hub NYC',
            city: 'New York',
            banner_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop',
        },
        qr_code_data: 'EVT_003_TKT_003',
    },
]

function getStatusBadge(status: string) {
    switch (status) {
        case 'valid':
            return <Badge variant="success">Valid</Badge>
        case 'used':
            return <Badge variant="secondary">Used</Badge>
        case 'cancelled':
            return <Badge variant="destructive">Cancelled</Badge>
        case 'transferred':
            return <Badge variant="warning">Transferred</Badge>
        default:
            return <Badge>{status}</Badge>
    }
}

export default async function MyTicketsPage() {
    // TODO: Fetch real tickets data
    // const tickets = await getMyTickets()
    const tickets = mockTickets

    const upcomingTickets = tickets.filter(t =>
        t.status === 'valid' && new Date(t.event.start_date) > new Date()
    )
    const pastTickets = tickets.filter(t =>
        t.status !== 'valid' || new Date(t.event.start_date) <= new Date()
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tickets</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        View and manage your event tickets
                    </p>
                </div>

                {tickets.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Ticket className="h-12 w-12 mx-auto text-slate-400" />
                            <h3 className="mt-4 text-lg font-semibold">No tickets yet</h3>
                            <p className="mt-2 text-slate-500">
                                Browse events and get your first ticket!
                            </p>
                            <Link href="/events" className="mt-4 inline-block">
                                <Button>Browse Events</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {/* Upcoming Tickets */}
                        {upcomingTickets.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Upcoming Events ({upcomingTickets.length})
                                </h2>
                                <div className="space-y-4">
                                    {upcomingTickets.map((ticket) => (
                                        <TicketCard key={ticket.id} ticket={ticket} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Past Tickets */}
                        {pastTickets.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Past Events ({pastTickets.length})
                                </h2>
                                <div className="space-y-4 opacity-75">
                                    {pastTickets.map((ticket) => (
                                        <TicketCard key={ticket.id} ticket={ticket} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

function TicketCard({ ticket }: { ticket: typeof mockTickets[0] }) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
                {/* Event Image */}
                <div className="relative w-full sm:w-40 h-32 sm:h-auto shrink-0">
                    <img
                        src={ticket.event.banner_url}
                        alt={ticket.event.title}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Ticket Info */}
                <CardContent className="flex-1 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {getStatusBadge(ticket.status)}
                                <span className="text-sm text-slate-500">
                                    {ticket.ticket_type.name}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {ticket.event.title}
                            </h3>
                            <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(ticket.event.start_date)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {ticket.event.venue_name}, {ticket.event.city}
                                </div>
                            </div>
                        </div>

                        {/* QR Code Preview & Actions */}
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-lg bg-white border border-slate-200 flex items-center justify-center dark:bg-slate-800 dark:border-slate-700">
                                <QrCode className="h-12 w-12 text-slate-400" />
                            </div>
                            <Link href={`/my-tickets/${ticket.id}`}>
                                <Button variant="ghost" size="icon">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}
