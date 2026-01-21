import Link from 'next/link'
import { Search, MapPin, Calendar, Filter, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

const categories = [
    { name: 'All Events', slug: 'all', count: 0 },
    { name: 'Conferences', slug: 'conference', count: 0 },
    { name: 'Concerts', slug: 'concert', count: 0 },
    { name: 'Workshops', slug: 'workshop', count: 0 },
    { name: 'Networking', slug: 'networking', count: 0 },
    { name: 'Sports', slug: 'sports', count: 0 },
]

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
}

async function getEvents() {
    const supabase = await createClient()

    const { data: events, error } = await supabase
        .from('events')
        .select(`
            id,
            title,
            slug,
            description,
            banner_url,
            category,
            city,
            country,
            start_date,
            status,
            ticket_types (
                price
            )
        `)
        .eq('status', 'published')
        .order('start_date', { ascending: true })
        .limit(12)

    if (error) {
        console.error('Error fetching events:', error)
        return []
    }

    return events as Event[]
}

export default async function EventsPage() {
    const events = await getEvents()
    const hasEvents = events.length > 0

    return (
        <div className="min-h-screen">
            {/* Hero Search Section */}
            <section className="bg-gradient-to-br from-violet-600 to-indigo-700 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white sm:text-4xl">
                            Discover Amazing Events
                        </h1>
                        <p className="mt-2 text-lg text-violet-200">
                            Find and book tickets for events near you
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-8 mx-auto max-w-3xl">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search events, artists, or venues..."
                                    className="h-14 w-full rounded-xl border-0 bg-white pl-12 pr-4 text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                            </div>
                            <div className="relative sm:w-48">
                                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    className="h-14 w-full rounded-xl border-0 bg-white pl-12 pr-4 text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                            </div>
                            <Button size="lg" className="h-14 px-8 bg-slate-900 hover:bg-slate-800 shadow-lg">
                                <Search className="h-5 w-5" />
                                Search
                            </Button>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {categories.slice(0, 5).map((category) => (
                            <button
                                key={category.slug}
                                className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-8 lg:flex-row">
                        {/* Filters Sidebar */}
                        <aside className="lg:w-64 shrink-0">
                            <div className="sticky top-20 space-y-6">
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                        <Filter className="h-4 w-4" />
                                        Categories
                                    </h3>
                                    <div className="mt-3 space-y-1">
                                        {categories.map((category) => (
                                            <button
                                                key={category.slug}
                                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                            >
                                                <span>{category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                        <Calendar className="h-4 w-4" />
                                        Date
                                    </h3>
                                    <div className="mt-3 space-y-1">
                                        {['Today', 'This Week', 'This Weekend', 'This Month'].map((date) => (
                                            <button
                                                key={date}
                                                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                            >
                                                {date}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Price Range
                                    </h3>
                                    <div className="mt-3 space-y-1">
                                        {['Free', 'Under $50', '$50 - $100', '$100+'].map((price) => (
                                            <button
                                                key={price}
                                                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                            >
                                                {price}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Events Grid */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {hasEvents ? 'Upcoming Events' : 'No Events Yet'}
                                </h2>
                                {hasEvents && (
                                    <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                                        <option>Most Popular</option>
                                        <option>Date: Upcoming</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                    </select>
                                )}
                            </div>

                            {!hasEvents ? (
                                <div className="text-center py-16">
                                    <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <Calendar className="h-12 w-12 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        No events available
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                                        There are no published events yet. Check back later or create your own!
                                    </p>
                                    <Link href="/dashboard/events/new">
                                        <Button>Create Event</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {events.map((event) => {
                                        const lowestPrice = event.ticket_types?.length
                                            ? Math.min(...event.ticket_types.map((t) => t.price))
                                            : 0

                                        return (
                                            <Link key={event.id} href={`/events/${event.slug}`}>
                                                <Card className="group overflow-hidden hover-lift cursor-pointer h-full">
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
                                                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                                            <Badge variant="default">
                                                                {event.category || 'Event'}
                                                            </Badge>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-white">
                                                                    {lowestPrice === 0 ? 'Free' : formatCurrency(lowestPrice)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <CardContent className="p-4">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-violet-600 transition-colors">
                                                            {event.title}
                                                        </h3>
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
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Load More */}
                            {hasEvents && (
                                <div className="mt-8 text-center">
                                    <Button variant="outline">
                                        Load More Events
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
