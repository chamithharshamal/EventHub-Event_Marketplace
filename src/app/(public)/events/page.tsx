import Link from 'next/link'
import { Search, MapPin, Calendar, Filter, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'

// Mock data for demo purposes
const categories = [
    { name: 'All Events', slug: 'all', count: 245 },
    { name: 'Conferences', slug: 'conference', count: 42 },
    { name: 'Concerts', slug: 'concert', count: 78 },
    { name: 'Workshops', slug: 'workshop', count: 56 },
    { name: 'Networking', slug: 'networking', count: 34 },
    { name: 'Sports', slug: 'sports', count: 35 },
]

const featuredEvents = [
    {
        id: '1',
        title: 'Tech Innovation Summit 2026',
        slug: 'tech-innovation-summit-2026',
        description: 'Join industry leaders and innovators for a day of insights on the future of technology.',
        bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
        category: 'Conference',
        city: 'San Francisco',
        country: 'USA',
        startDate: '2026-02-15T09:00:00Z',
        price: 299,
        soldOut: false,
    },
    {
        id: '2',
        title: 'Electronic Music Festival',
        slug: 'electronic-music-festival',
        description: 'Experience the best electronic music artists from around the world.',
        bannerUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop',
        category: 'Concert',
        city: 'Miami',
        country: 'USA',
        startDate: '2026-03-20T18:00:00Z',
        price: 150,
        soldOut: false,
    },
    {
        id: '3',
        title: 'AI & Machine Learning Workshop',
        slug: 'ai-ml-workshop',
        description: 'Hands-on workshop covering the latest in AI and ML technologies.',
        bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop',
        category: 'Workshop',
        city: 'New York',
        country: 'USA',
        startDate: '2026-02-28T10:00:00Z',
        price: 0,
        soldOut: false,
    },
    {
        id: '4',
        title: 'Startup Networking Night',
        slug: 'startup-networking-night',
        description: 'Connect with fellow entrepreneurs and investors in an evening of networking.',
        bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop',
        category: 'Networking',
        city: 'Austin',
        country: 'USA',
        startDate: '2026-02-10T18:30:00Z',
        price: 25,
        soldOut: true,
    },
    {
        id: '5',
        title: 'Design Systems Conference',
        slug: 'design-systems-conf',
        description: 'Learn how top companies build and scale their design systems.',
        bannerUrl: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop',
        category: 'Conference',
        city: 'Los Angeles',
        country: 'USA',
        startDate: '2026-04-05T09:00:00Z',
        price: 199,
        soldOut: false,
    },
    {
        id: '6',
        title: 'Marathon Championship',
        slug: 'marathon-championship',
        description: 'Annual marathon event with professional and amateur categories.',
        bannerUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop',
        category: 'Sports',
        city: 'Boston',
        country: 'USA',
        startDate: '2026-05-10T06:00:00Z',
        price: 75,
        soldOut: false,
    },
]

export default function EventsPage() {
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
                                                <span className="text-xs text-slate-400">{category.count}</span>
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
                                    Featured Events
                                </h2>
                                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                                    <option>Most Popular</option>
                                    <option>Date: Upcoming</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {featuredEvents.map((event) => (
                                    <Link key={event.id} href={`/events/${event.slug}`}>
                                        <Card className="group overflow-hidden hover-lift cursor-pointer h-full">
                                            {/* Event Image */}
                                            <div className="relative aspect-[16/10] overflow-hidden">
                                                <img
                                                    src={event.bannerUrl}
                                                    alt={event.title}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                                    <Badge variant={event.soldOut ? 'destructive' : 'default'}>
                                                        {event.soldOut ? 'Sold Out' : event.category}
                                                    </Badge>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-white">
                                                            {event.price === 0 ? 'Free' : formatCurrency(event.price)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-violet-600 transition-colors">
                                                    {event.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {event.description}
                                                </p>
                                                <div className="mt-3 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(event.startDate, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {event.city}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* Load More */}
                            <div className="mt-8 text-center">
                                <Button variant="outline">
                                    Load More Events
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
