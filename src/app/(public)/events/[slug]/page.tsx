import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    Calendar,
    MapPin,
    Clock,
    Share2,
    Ticket,
    ArrowLeft,
    Video,
    User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { CheckoutButton } from '@/components/checkout/checkout-button'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import { WaitlistButton } from '@/components/events/WaitlistButton'
import { FavoriteButton } from '@/components/events/FavoriteButton'
import { isFavorited } from '@/app/actions/favorites'

interface EventPageProps {
    params: Promise<{ slug: string }>
}

interface TicketType {
    id: string
    name: string
    description: string | null
    price: number
    currency: string
    quantity_total: number
    quantity_sold: number
    perks: string[] | null
}

interface Event {
    id: string
    title: string
    slug: string
    description: string | null
    category: string | null
    status: string
    venue_name: string | null
    address: string | null
    city: string | null
    country: string | null
    is_online: boolean
    start_date: string
    end_date: string
    timezone: string | null
    banner_url: string | null
    max_capacity: number | null
    organizer_id: string
    ticket_types: TicketType[]
}

async function getEventBySlug(slug: string) {
    const supabase = await createClient()

    const { data: event, error } = await supabase
        .from('events')
        .select(`
            id,
            title,
            slug,
            description,
            category,
            status,
            venue_name,
            address,
            city,
            country,
            is_online,
            start_date,
            end_date,
            timezone,
            banner_url,
            max_capacity,
            organizer_id,
            ticket_types (
                id,
                name,
                description,
                price,
                currency,
                quantity_total,
                quantity_sold,
                perks
            )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

    if (error || !event) {
        return null
    }

    return event as Event
}

async function getOrganizer(organizerId: string) {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, avatar_url, is_verified')
        .eq('id', organizerId)
        .single()

    return data
}

export default async function EventPage({ params }: EventPageProps) {
    const { slug } = await params
    const event = await getEventBySlug(slug)

    if (!event) {
        notFound()
    }

    const availableTickets = event.ticket_types?.filter(
        (t) => t.quantity_sold < t.quantity_total
    ) || []
    const lowestPrice = event.ticket_types?.length
        ? Math.min(...event.ticket_types.map((t) => t.price))
        : 0
    const isSoldOut = availableTickets.length === 0

    // Fetch organizer info
    const organizer = await getOrganizer(event.organizer_id)
    const isFav = await isFavorited(event.id)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Banner */}
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] bg-slate-200 dark:bg-slate-800">
                {event.banner_url ? (
                    <img
                        src={event.banner_url}
                        alt={event.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <Calendar className="h-24 w-24 text-slate-400" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-4 left-4">
                    <Link href="/events">
                        <Button variant="ghost" className="text-white hover:bg-white/20">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Events
                        </Button>
                    </Link>
                </div>

                {/* Event Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="mx-auto max-w-7xl">
                        <Badge className="mb-4">{event.category || 'Event'}</Badge>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/90">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {formatDate(event.start_date)}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                {formatDateTime(event.start_date).split(',').pop()}
                            </div>
                            {event.is_online ? (
                                <div className="flex items-center gap-2">
                                    <Video className="h-5 w-5" />
                                    Online Event
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    {event.city}, {event.country}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Event Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>About This Event</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    {event.description ? (
                                        event.description.split('\n\n').map((paragraph, index) => {
                                            if (paragraph.startsWith('## ')) {
                                                return (
                                                    <h2 key={index} className="text-xl font-semibold mt-6 mb-3">
                                                        {paragraph.replace('## ', '')}
                                                    </h2>
                                                )
                                            }
                                            if (paragraph.startsWith('- ')) {
                                                return (
                                                    <ul key={index} className="list-disc list-inside space-y-1">
                                                        {paragraph.split('\n').map((item, i) => (
                                                            <li key={i}>{item.replace('- ', '')}</li>
                                                        ))}
                                                    </ul>
                                                )
                                            }
                                            return <p key={index}>{paragraph}</p>
                                        })
                                    ) : (
                                        <p className="text-slate-500">No description available for this event.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location */}
                        {!event.is_online && event.venue_name && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Location
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="font-medium text-lg">{event.venue_name}</p>
                                        {event.address && (
                                            <p className="text-slate-600 dark:text-slate-400">
                                                {event.address}
                                            </p>
                                        )}
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {event.city}, {event.country}
                                        </p>
                                    </div>
                                    <div className="mt-4 h-48 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                        <span className="text-slate-500">Map placeholder</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Ticket Selection */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-4">
                            <Card variant="elevated">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Tickets</span>
                                        {isSoldOut ? (
                                            <Badge variant="destructive">Sold Out</Badge>
                                        ) : (
                                            <span className="text-sm font-normal text-slate-500">
                                                From {formatCurrency(lowestPrice)}
                                            </span>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {event.ticket_types?.map((ticket) => {
                                        const available = ticket.quantity_total - ticket.quantity_sold
                                        const soldOut = available === 0

                                        return (
                                            <div
                                                key={ticket.id}
                                                className={`rounded-lg border p-4 transition-colors ${soldOut
                                                    ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                                                    : 'border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/30'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold">{ticket.name}</h4>
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            {ticket.description}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg">
                                                            {ticket.price === 0 ? 'Free' : formatCurrency(ticket.price)}
                                                        </p>
                                                        {soldOut ? (
                                                            <Badge variant="secondary" className="mt-1">Sold out</Badge>
                                                        ) : (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {available} left
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {ticket.perks && ticket.perks.length > 0 && (
                                                    <ul className="mt-3 space-y-1">
                                                        {(ticket.perks as string[]).map((perk, i) => (
                                                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                <Ticket className="h-3 w-3 text-violet-500" />
                                                                {perk}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )
                                    })}

                                    {event.ticket_types?.length > 0 ? (
                                        isSoldOut ? (
                                            <WaitlistButton
                                                eventId={event.id}
                                                eventTitle={event.title}
                                                variant="large"
                                            />
                                        ) : (
                                            <CheckoutButton
                                                eventId={event.id}
                                                eventSlug={event.slug}
                                                ticketTypes={event.ticket_types}
                                                disabled={isSoldOut}
                                            />
                                        )
                                    ) : (
                                        <p className="text-center text-slate-500 py-4">
                                            No tickets available for this event yet.
                                        </p>
                                    )}

                                    {/* Organizer */}
                                    {organizer && (
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-xs text-slate-500 mb-2">Organized by</p>
                                            <div className="flex items-center gap-3">
                                                {organizer.avatar_url ? (
                                                    <img
                                                        src={organizer.avatar_url}
                                                        alt={organizer.full_name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-violet-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm flex items-center gap-1">
                                                        {organizer.full_name || 'Event Organizer'}
                                                        {organizer.is_verified && <VerifiedBadge size="sm" />}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                                <FavoriteButton
                                    eventId={event.id}
                                    initialFavorited={isFav}
                                    showText
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
