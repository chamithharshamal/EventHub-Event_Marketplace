import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    Share2,
    Heart,
    Ticket,
    ArrowLeft,
    Globe,
    Video
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'

// Mock event data - will be replaced with real data fetch
const mockEvent = {
    id: '1',
    title: 'Tech Innovation Summit 2026',
    slug: 'tech-innovation-summit-2026',
    description: `Join industry leaders and innovators for an unforgettable day of insights, networking, and inspiration on the future of technology.

## What to Expect

- **Keynote Sessions**: Hear from CEOs and CTOs of leading tech companies
- **Panel Discussions**: Deep dives into AI, Web3, and sustainable tech
- **Networking Breaks**: Connect with 500+ attendees from around the world
- **Exhibition Hall**: Explore the latest innovations and startups
- **Workshop Sessions**: Hands-on learning experiences

## Who Should Attend

- Technology executives and decision-makers
- Startup founders and entrepreneurs
- Software engineers and developers
- Product managers and designers
- Investors and VCs

Don't miss this opportunity to be part of the conversation shaping the future of technology.`,
    category: 'Conference',
    status: 'published',
    venue_name: 'Moscone Center',
    address: '747 Howard St',
    city: 'San Francisco',
    country: 'USA',
    is_online: false,
    start_date: '2026-02-15T09:00:00Z',
    end_date: '2026-02-15T18:00:00Z',
    timezone: 'America/Los_Angeles',
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop',
    max_capacity: 500,
    organizer: {
        full_name: 'Tech Events Inc.',
        avatar_url: null,
    },
    ticket_types: [
        {
            id: '1',
            name: 'Early Bird',
            description: 'Limited early bird tickets at a special price',
            price: 199,
            currency: 'USD',
            quantity_total: 100,
            quantity_sold: 100,
            perks: ['Full conference access', 'Lunch included', 'Swag bag'],
        },
        {
            id: '2',
            name: 'General Admission',
            description: 'Standard conference ticket',
            price: 299,
            currency: 'USD',
            quantity_total: 300,
            quantity_sold: 245,
            perks: ['Full conference access', 'Lunch included', 'Swag bag'],
        },
        {
            id: '3',
            name: 'VIP',
            description: 'Premium experience with exclusive perks',
            price: 599,
            currency: 'USD',
            quantity_total: 50,
            quantity_sold: 35,
            perks: ['Full conference access', 'VIP lounge access', 'Meet & greet', 'Premium lunch', 'Exclusive swag'],
        },
    ],
}

interface EventPageProps {
    params: Promise<{ slug: string }>
}

export default async function EventPage({ params }: EventPageProps) {
    const { slug } = await params

    // TODO: Replace with real data fetch
    // const event = await getEventBySlug(tenantId, slug)
    const event = mockEvent

    if (!event) {
        notFound()
    }

    const availableTickets = event.ticket_types.filter(
        (t) => t.quantity_sold < t.quantity_total
    )
    const lowestPrice = Math.min(...event.ticket_types.map((t) => t.price))
    const isSoldOut = availableTickets.length === 0

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Banner */}
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
                <img
                    src={event.banner_url}
                    alt={event.title}
                    className="h-full w-full object-cover"
                />
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
                        <Badge className="mb-4">{event.category}</Badge>
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
                                    {event.description.split('\n\n').map((paragraph, index) => {
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
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location */}
                        {!event.is_online && (
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
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {event.address}
                                        </p>
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

                        {/* Organizer */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Organizer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-semibold text-white">
                                        {event.organizer.full_name?.[0] || 'O'}
                                    </div>
                                    <div>
                                        <p className="font-medium">{event.organizer.full_name}</p>
                                        <p className="text-sm text-slate-500">Event Organizer</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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
                                    {event.ticket_types.map((ticket) => {
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

                                    <Button className="w-full" size="lg" disabled={isSoldOut}>
                                        {isSoldOut ? 'Sold Out' : 'Get Tickets'}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Share & Save */}
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <Heart className="h-4 w-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
