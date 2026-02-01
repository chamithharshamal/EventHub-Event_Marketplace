import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Ticket, Calendar, MapPin, QrCode, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

interface TicketWithDetails {
    id: string
    status: string
    qr_code_data: string | null
    ticket_types: {
        name: string
        price: number
    } | null
    events: {
        id: string
        title: string
        slug: string
        start_date: string
        venue_name: string | null
        city: string | null
        banner_url: string | null
    } | null
}

async function getMyTickets(): Promise<TicketWithDetails[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return []
    }

    const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
            id,
            status,
            qr_code_data,
            ticket_types (
                name,
                price
            ),
            events (
                id,
                title,
                slug,
                start_date,
                venue_name,
                city,
                banner_url
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tickets:', error)
        return []
    }

    return (tickets || []) as unknown as TicketWithDetails[]
}

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const tickets = await getMyTickets()

    const upcomingTickets = tickets.filter(t =>
        t.status === 'valid' && t.events && new Date(t.events.start_date) > new Date()
    )
    const pastTickets = tickets.filter(t =>
        t.status !== 'valid' || !t.events || new Date(t.events.start_date) <= new Date()
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

function TicketCard({ ticket }: { ticket: TicketWithDetails }) {
    const event = ticket.events
    const ticketType = ticket.ticket_types

    if (!event) return null

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
                {/* Event Image */}
                <div className="relative w-full sm:w-40 h-32 sm:h-auto shrink-0">
                    {event.banner_url ? (
                        <img
                            src={event.banner_url}
                            alt={event.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                            <Ticket className="h-8 w-8 text-slate-400" />
                        </div>
                    )}
                </div>

                {/* Ticket Info */}
                <CardContent className="flex-1 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {getStatusBadge(ticket.status)}
                                <span className="text-sm text-slate-500">
                                    {ticketType?.name || 'Ticket'}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {event.title}
                            </h3>
                            <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(event.start_date)}
                                </div>
                                {(event.venue_name || event.city) && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {[event.venue_name, event.city].filter(Boolean).join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* QR Code Preview & Actions */}
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-lg bg-white border border-slate-200 flex items-center justify-center dark:bg-slate-800 dark:border-slate-700">
                                <QrCode className="h-12 w-12 text-slate-400" />
                            </div>
                            <Link href={`/my-tickets/${ticket.id}`}>
                                <Button variant="ghost" size="icon">
                                    <ChevronRight className="h-5 w-5 text-slate-400" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}
