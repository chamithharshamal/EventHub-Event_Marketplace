'use client'

import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Event {
    id: string
    title: string
    slug: string
    description: string | null
    banner_url: string | null
    category: string | null
    city: string | null
    country: string | null
    start_date: string
    ticket_types: { price: number }[]
}

function EventCard({ event, isPast = false }: { event: Event; isPast?: boolean }) {
    const lowestPrice = event.ticket_types?.length
        ? Math.min(...event.ticket_types.map((t) => t.price))
        : 0

    return (
        <Link href={`/events/${event.slug}`}>
            <Card className={`group overflow-hidden hover-lift cursor-pointer h-full ${isPast ? 'opacity-75' : ''}`}>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-slate-700">
                    {event.banner_url ? (
                        <img
                            src={event.banner_url}
                            alt={event.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <Calendar className="h-12 w-12 text-slate-400" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div className="flex gap-2">
                            <Badge variant="default">
                                {event.category || 'Event'}
                            </Badge>
                            {isPast && (
                                <Badge variant="secondary">Attended</Badge>
                            )}
                        </div>
                        <div className="text-lg font-bold text-white">
                            {lowestPrice === 0 ? 'Free' : formatCurrency(lowestPrice)}
                        </div>
                    </div>
                </div>

                <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-violet-600 transition-colors">
                        {event.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(event.start_date, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {event.city && (
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.city}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

interface ProfileEventsTabsProps {
    upcoming: Event[]
    past: Event[]
}

export function ProfileEventsTabs({ upcoming, past }: ProfileEventsTabsProps) {
    return (
        <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-6">
                <TabsTrigger value="upcoming">
                    Upcoming ({upcoming.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                    Past Events ({past.length})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
                {upcoming.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            No upcoming events
                        </p>
                        <Link href="/events">
                            <Button variant="outline">Find Events</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {upcoming.map((event: Event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="past">
                {past.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 dark:text-slate-400">
                            No past events
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {past.map((event: Event) => (
                            <EventCard key={event.id} event={event} isPast />
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}

interface ProfileEventsGridProps {
    events: Event[]
    isPast?: boolean
}

export function ProfileEventsGrid({ events, isPast = false }: ProfileEventsGridProps) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event: Event) => (
                <EventCard key={event.id} event={event} isPast={isPast} />
            ))}
        </div>
    )
}
