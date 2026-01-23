import Link from 'next/link'
import { Suspense } from 'react'
import { Calendar, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { EventFilters, EventFiltersSidebar, EventSortDropdown, ActiveFilters } from '@/components/events/EventFilters'
import { MOCK_EVENTS } from '@/lib/mock-data'

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

interface SearchParams {
    q?: string
    category?: string
    date?: string
    location?: string
    price?: string
    sort?: string
    page?: string
}

const EVENTS_PER_PAGE = 12

// Helper function to get date range based on filter
function getDateRange(dateFilter: string): { start: Date; end: Date } | null {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (dateFilter) {
        case 'today':
            return {
                start: today,
                end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
            }
        case 'this-week': {
            const endOfWeek = new Date(today)
            endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
            return { start: today, end: endOfWeek }
        }
        case 'this-weekend': {
            const saturday = new Date(today)
            saturday.setDate(today.getDate() + (6 - today.getDay()))
            const sunday = new Date(saturday)
            sunday.setDate(saturday.getDate() + 1)
            sunday.setHours(23, 59, 59, 999)
            return { start: saturday, end: sunday }
        }
        case 'this-month': {
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
            return { start: today, end: endOfMonth }
        }
        case 'next-month': {
            const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
            const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59, 999)
            return { start: startOfNextMonth, end: endOfNextMonth }
        }
        default:
            return null
    }
}

// Helper function to get price range
function getPriceRange(priceFilter: string): { min: number; max: number } | null {
    switch (priceFilter) {
        case 'free':
            return { min: 0, max: 0 }
        case 'under-50':
            return { min: 0.01, max: 50 }
        case '50-100':
            return { min: 50, max: 100 }
        case 'over-100':
            return { min: 100, max: 999999 }
        default:
            return null
    }
}

async function getEvents(searchParams: SearchParams) {
    const supabase = await createClient()

    const page = parseInt(searchParams.page || '1', 10)
    const offset = (page - 1) * EVENTS_PER_PAGE

    // Start building the query
    let query = supabase
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
        `, { count: 'exact' })
        .eq('status', 'published')

    // Apply text search filter
    if (searchParams.q) {
        const searchTerm = `%${searchParams.q}%`
        query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},venue_name.ilike.${searchTerm}`)
    }

    // Apply category filter
    if (searchParams.category && searchParams.category !== 'all') {
        query = query.eq('category', searchParams.category)
    }

    // Apply date filter
    if (searchParams.date && searchParams.date !== 'all') {
        const dateRange = getDateRange(searchParams.date)
        if (dateRange) {
            query = query
                .gte('start_date', dateRange.start.toISOString())
                .lte('start_date', dateRange.end.toISOString())
        }
    } else {
        // By default, only show upcoming events
        query = query.gte('start_date', new Date().toISOString())
    }

    // Apply location filter
    if (searchParams.location) {
        const locationTerm = `%${searchParams.location}%`
        query = query.or(`city.ilike.${locationTerm},country.ilike.${locationTerm}`)
    }

    // Apply sorting
    const sortOption = searchParams.sort || 'date-asc'
    switch (sortOption) {
        case 'date-desc':
            query = query.order('start_date', { ascending: false })
            break
        case 'price-asc':
            query = query.order('start_date', { ascending: true }) // Fallback, can't sort by joined table
            break
        case 'price-desc':
            query = query.order('start_date', { ascending: true })
            break
        case 'date-asc':
        default:
            query = query.order('start_date', { ascending: true })
    }

    // Apply pagination
    query = query.range(offset, offset + EVENTS_PER_PAGE - 1)

    const { data: events, error, count } = await query

    if (error) {
        console.error('Error fetching events:', error)
    }

    let filteredEvents = (events || []) as Event[]

    // Use mock data if (no events found OR error) and no specific filters are applied
    const hasActiveFilters = searchParams.q ||
        (searchParams.category && searchParams.category !== 'all') ||
        (searchParams.date && searchParams.date !== 'all') ||
        searchParams.location ||
        (searchParams.price && searchParams.price !== 'all')

    let usedMockData = false
    if ((filteredEvents.length === 0 || error) && !hasActiveFilters && page === 1) {
        // Cast mock data to compatible Event type (mock data might be simpler)
        filteredEvents = MOCK_EVENTS as unknown as Event[]
        usedMockData = true
    } else if (error) {
        // If error and we didn't use mock data (e.g. filters active), return empty now
        return { events: [], totalCount: 0, totalPages: 0 }
    }

    // Apply price filter (post-query since it depends on ticket_types)
    if (searchParams.price && searchParams.price !== 'all') {
        const priceRange = getPriceRange(searchParams.price)
        if (priceRange) {
            filteredEvents = filteredEvents.filter(event => {
                if (!event.ticket_types || event.ticket_types.length === 0) {
                    return priceRange.min === 0 // Include events with no tickets if filtering for free
                }
                const lowestPrice = Math.min(...event.ticket_types.map(t => t.price))
                if (priceRange.min === 0 && priceRange.max === 0) {
                    return lowestPrice === 0
                }
                return lowestPrice >= priceRange.min && lowestPrice <= priceRange.max
            })
        }
    }

    // Sort by price if needed (post-query)
    if (sortOption === 'price-asc' || sortOption === 'price-desc') {
        filteredEvents.sort((a, b) => {
            const priceA = a.ticket_types?.length ? Math.min(...a.ticket_types.map(t => t.price)) : 0
            const priceB = b.ticket_types?.length ? Math.min(...b.ticket_types.map(t => t.price)) : 0
            return sortOption === 'price-asc' ? priceA - priceB : priceB - priceA
        })
    }

    const totalCount = usedMockData ? MOCK_EVENTS.length : (count || 0)
    const totalPages = Math.ceil(totalCount / EVENTS_PER_PAGE)

    return { events: filteredEvents, totalCount, totalPages, currentPage: page }
}

function EventCard({ event }: { event: Event }) {
    const lowestPrice = event.ticket_types?.length
        ? Math.min(...event.ticket_types.map((t) => t.price))
        : 0

    return (
        <Link href={`/events/${event.slug}`}>
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
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {event.city}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

function Pagination({
    currentPage,
    totalPages,
    searchParams
}: {
    currentPage: number
    totalPages: number
    searchParams: SearchParams
}) {
    if (totalPages <= 1) return null

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams()
        if (searchParams.q) params.set('q', searchParams.q)
        if (searchParams.category && searchParams.category !== 'all') params.set('category', searchParams.category)
        if (searchParams.date && searchParams.date !== 'all') params.set('date', searchParams.date)
        if (searchParams.location) params.set('location', searchParams.location)
        if (searchParams.price && searchParams.price !== 'all') params.set('price', searchParams.price)
        if (searchParams.sort && searchParams.sort !== 'date-asc') params.set('sort', searchParams.sort)
        if (page > 1) params.set('page', page.toString())
        const queryString = params.toString()
        return `/events${queryString ? `?${queryString}` : ''}`
    }

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Link href={createPageUrl(currentPage - 1)}>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    className="gap-1"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
            </Link>

            <div className="flex items-center gap-1">
                {startPage > 1 && (
                    <>
                        <Link href={createPageUrl(1)}>
                            <Button variant="ghost" size="sm">1</Button>
                        </Link>
                        {startPage > 2 && <span className="px-2 text-slate-400">...</span>}
                    </>
                )}

                {pages.map((page) => (
                    <Link key={page} href={createPageUrl(page)}>
                        <Button
                            variant={page === currentPage ? 'default' : 'ghost'}
                            size="sm"
                        >
                            {page}
                        </Button>
                    </Link>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-2 text-slate-400">...</span>}
                        <Link href={createPageUrl(totalPages)}>
                            <Button variant="ghost" size="sm">{totalPages}</Button>
                        </Link>
                    </>
                )}
            </div>

            <Link href={createPageUrl(currentPage + 1)}>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    className="gap-1"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </Link>
        </div>
    )
}

export default async function EventsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const { events, totalCount, totalPages, currentPage } = await getEvents(params)
    const hasEvents = events.length > 0
    const hasFilters = params.q || params.category || params.date || params.location || params.price

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

                    {/* Search and Filters */}
                    <div className="mt-8 mx-auto max-w-4xl">
                        <Suspense fallback={<div className="h-14 bg-white/10 rounded-xl animate-pulse" />}>
                            <EventFilters />
                        </Suspense>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-8 lg:flex-row">
                        {/* Filters Sidebar */}
                        <Suspense fallback={<div className="lg:w-64 shrink-0" />}>
                            <EventFiltersSidebar className="hidden lg:block" />
                        </Suspense>

                        {/* Events Grid */}
                        <div className="flex-1">
                            {/* Results Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                        {hasFilters ? 'Search Results' : 'Upcoming Events'}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {totalCount} {totalCount === 1 ? 'event' : 'events'} found
                                    </p>
                                </div>
                                <Suspense fallback={null}>
                                    <EventSortDropdown />
                                </Suspense>
                            </div>

                            {/* Active Filters */}
                            <Suspense fallback={null}>
                                <ActiveFilters className="mb-6" />
                            </Suspense>

                            {!hasEvents ? (
                                <div className="text-center py-16">
                                    <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <Calendar className="h-12 w-12 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        {hasFilters ? 'No events match your filters' : 'No events available'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                                        {hasFilters
                                            ? 'Try adjusting your search criteria or clearing some filters.'
                                            : 'There are no published events yet. Check back later or create your own!'}
                                    </p>
                                    {hasFilters ? (
                                        <Link href="/events">
                                            <Button variant="outline">Clear Filters</Button>
                                        </Link>
                                    ) : (
                                        <Link href="/dashboard/events/new">
                                            <Button>Create Event</Button>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                        {events.map((event) => (
                                            <EventCard key={event.id} event={event} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <Pagination
                                        currentPage={currentPage || 1}
                                        totalPages={totalPages}
                                        searchParams={params}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
