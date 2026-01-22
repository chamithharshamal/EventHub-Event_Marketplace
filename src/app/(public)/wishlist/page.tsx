import Link from 'next/link'
import { Heart, Calendar, MapPin, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getFavorites } from '@/app/actions/favorites'
import { FavoriteButton } from '@/components/events/FavoriteButton'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
    status: string
    ticket_types: { price: number }[]
    favoriteId: string
    favoritedAt: string
}

export default async function WishlistPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect=/wishlist')
    }

    const { events, error } = await getFavorites()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <section className="bg-gradient-to-br from-violet-600 to-indigo-700 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-white/10 p-3">
                            <Heart className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                My Wishlist
                            </h1>
                            <p className="mt-1 text-violet-200">
                                {events.length} {events.length === 1 ? 'event' : 'events'} saved
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {events.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Heart className="h-12 w-12 text-slate-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                Your wishlist is empty
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                Start exploring events and save the ones you&apos;re interested in to find them easily later.
                            </p>
                            <Link href="/events">
                                <Button size="lg">
                                    Discover Events
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {(events as Event[]).map((event) => {
                                const lowestPrice = event.ticket_types?.length
                                    ? Math.min(...event.ticket_types.map((t) => t.price))
                                    : 0

                                const eventDate = new Date(event.start_date)
                                const isPast = eventDate < new Date()

                                return (
                                    <Card
                                        key={event.id}
                                        className={`group overflow-hidden h-full ${isPast ? 'opacity-60' : ''}`}
                                    >
                                        <Link href={`/events/${event.slug}`}>
                                            {/* Event Image */}
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

                                                {/* Favorite Button Overlay */}
                                                <div className="absolute top-3 right-3">
                                                    <FavoriteButton
                                                        eventId={event.id}
                                                        initialFavorited={true}
                                                        variant="overlay"
                                                        size="sm"
                                                    />
                                                </div>

                                                {/* Status & Price */}
                                                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                                    <div className="flex gap-2">
                                                        <Badge variant="default">
                                                            {event.category || 'Event'}
                                                        </Badge>
                                                        {isPast && (
                                                            <Badge variant="secondary">
                                                                Past Event
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-lg font-bold text-white">
                                                        {lowestPrice === 0 ? 'Free' : formatCurrency(lowestPrice)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        <CardContent className="p-4">
                                            <Link href={`/events/${event.slug}`}>
                                                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-violet-600 transition-colors">
                                                    {event.title}
                                                </h3>
                                            </Link>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {event.description || 'No description available.'}
                                            </p>
                                            <div className="mt-3 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(event.start_date, { month: 'short', day: 'numeric' })}
                                                </div>
                                                {event.city && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {event.city}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                                                Saved {formatDate(event.favoritedAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
