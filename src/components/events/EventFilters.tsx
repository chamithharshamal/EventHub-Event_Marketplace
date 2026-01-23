'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback, useTransition, useEffect } from 'react'
import { Search, MapPin, Calendar, Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const categories = [
    { name: 'All Events', slug: 'all' },
    { name: 'Conferences', slug: 'conference' },
    { name: 'Concerts', slug: 'concert' },
    { name: 'Workshops', slug: 'workshop' },
    { name: 'Networking', slug: 'networking' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Arts & Culture', slug: 'arts' },
    { name: 'Food & Drink', slug: 'food' },
    { name: 'Technology', slug: 'tech' },
]

const dateOptions = [
    { name: 'Any Date', value: 'all' },
    { name: 'Today', value: 'today' },
    { name: 'This Week', value: 'this-week' },
    { name: 'This Weekend', value: 'this-weekend' },
    { name: 'This Month', value: 'this-month' },
    { name: 'Next Month', value: 'next-month' },
]

const priceOptions = [
    { name: 'Any Price', value: 'all' },
    { name: 'Free', value: 'free' },
    { name: 'Under $50', value: 'under-50' },
    { name: '$50 - $100', value: '50-100' },
    { name: 'Over $100', value: 'over-100' },
]

const sortOptions = [
    { name: 'Date: Soonest', value: 'date-asc' },
    { name: 'Date: Latest', value: 'date-desc' },
    { name: 'Price: Low to High', value: 'price-asc' },
    { name: 'Price: High to Low', value: 'price-desc' },
]

interface EventFiltersProps {
    className?: string
}

export function EventFilters({ className }: EventFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    // Get current filter values from URL
    const currentSearch = searchParams.get('q') || ''
    const currentCategory = searchParams.get('category') || 'all'
    const currentDate = searchParams.get('date') || 'all'
    const currentLocation = searchParams.get('location') || ''
    const currentPrice = searchParams.get('price') || 'all'
    const currentSort = searchParams.get('sort') || 'date-asc'

    // Local state for inputs (for debouncing)
    const [searchInput, setSearchInput] = useState(currentSearch)
    const [locationInput, setLocationInput] = useState(currentLocation)

    // Update local state when URL params change
    useEffect(() => {
        setSearchInput(currentSearch)
        setLocationInput(currentLocation)
    }, [currentSearch, currentLocation])

    // Create updated URL with new params
    const createQueryString = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString())

            Object.entries(updates).forEach(([key, value]) => {
                if (value && value !== 'all' && value !== '') {
                    params.set(key, value)
                } else {
                    params.delete(key)
                }
            })

            // Reset to page 1 when filters change
            params.delete('page')

            return params.toString()
        },
        [searchParams]
    )

    // Apply filter changes
    const applyFilters = useCallback(
        (updates: Record<string, string>) => {
            startTransition(() => {
                const queryString = createQueryString(updates)
                router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
            })
        },
        [pathname, router, createQueryString]
    )

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== currentSearch) {
                applyFilters({ q: searchInput })
            }
        }, 400)
        return () => clearTimeout(timer)
    }, [searchInput, currentSearch, applyFilters])

    // Handle location with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (locationInput !== currentLocation) {
                applyFilters({ location: locationInput })
            }
        }, 400)
        return () => clearTimeout(timer)
    }, [locationInput, currentLocation, applyFilters])

    // Clear all filters
    const clearFilters = () => {
        setSearchInput('')
        setLocationInput('')
        startTransition(() => {
            router.push(pathname)
        })
    }

    // Check if any filters are active
    const hasActiveFilters =
        currentSearch ||
        (currentCategory && currentCategory !== 'all') ||
        (currentDate && currentDate !== 'all') ||
        currentLocation ||
        (currentPrice && currentPrice !== 'all')

    const activeFilterCount = [
        currentSearch,
        currentCategory !== 'all' && currentCategory,
        currentDate !== 'all' && currentDate,
        currentLocation,
        currentPrice !== 'all' && currentPrice,
    ].filter(Boolean).length

    return (
        <div className={cn('space-y-4', className)}>
            {/* Search Bar Section */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search events, artists, or venues..."
                        className="h-14 w-full rounded-xl border-0 bg-white pl-12 pr-4 text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    {searchInput && (
                        <button
                            onClick={() => setSearchInput('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="relative sm:w-48">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="Location"
                        className="h-14 w-full rounded-xl border-0 bg-white pl-12 pr-4 text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                </div>
                <Button
                    size="lg"
                    className="h-14 px-8 bg-slate-900 hover:bg-slate-800 shadow-lg sm:hidden"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                    <SlidersHorizontal className="h-5 w-5 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-2 bg-violet-500 text-white text-xs rounded-full px-2 py-0.5">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Quick Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
                {categories.slice(0, 6).map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => applyFilters({ category: category.slug })}
                        className={cn(
                            'rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors',
                            currentCategory === category.slug
                                ? 'bg-white text-violet-700'
                                : 'bg-white/10 text-white hover:bg-white/20'
                        )}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Mobile Filters Panel */}
            {mobileFiltersOpen && (
                <div className="sm:hidden bg-white/10 dark:text-white backdrop-blur-sm rounded-xl p-4 space-y-4">
                    <FilterSection
                        label="Date"
                        value={currentDate}
                        options={dateOptions}
                        onChange={(value) => applyFilters({ date: value })}
                    />
                    <FilterSection
                        label="Price"
                        value={currentPrice}
                        options={priceOptions}
                        onChange={(value) => applyFilters({ price: value })}
                    />
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="w-full text-white/80 hover:text-white"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear All Filters
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

// Sidebar Filters Component for Desktop
export function EventFiltersSidebar({ className }: { className?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const currentCategory = searchParams.get('category') || 'all'
    const currentDate = searchParams.get('date') || 'all'
    const currentPrice = searchParams.get('price') || 'all'

    const createQueryString = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString())

            Object.entries(updates).forEach(([key, value]) => {
                if (value && value !== 'all' && value !== '') {
                    params.set(key, value)
                } else {
                    params.delete(key)
                }
            })

            params.delete('page')
            return params.toString()
        },
        [searchParams]
    )

    const applyFilters = useCallback(
        (updates: Record<string, string>) => {
            startTransition(() => {
                const queryString = createQueryString(updates)
                router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
            })
        },
        [pathname, router, createQueryString]
    )

    const clearFilters = () => {
        startTransition(() => {
            router.push(pathname)
        })
    }

    const hasActiveFilters =
        searchParams.get('q') ||
        (currentCategory && currentCategory !== 'all') ||
        (currentDate && currentDate !== 'all') ||
        searchParams.get('location') ||
        (currentPrice && currentPrice !== 'all')

    return (
        <aside className={cn('lg:w-64 shrink-0', className)}>
            <div className="sticky top-20 space-y-6">
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400"
                    >
                        <X className="h-4 w-4" />
                        Clear all filters
                    </button>
                )}

                {/* Categories */}
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <Filter className="h-4 w-4" />
                        Categories
                    </h3>
                    <div className="mt-3 space-y-1">
                        {categories.map((category) => (
                            <button
                                key={category.slug}
                                onClick={() => applyFilters({ category: category.slug })}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                                    currentCategory === category.slug
                                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                )}
                            >
                                <span>{category.name}</span>
                                {currentCategory === category.slug && (
                                    <div className="h-2 w-2 rounded-full bg-violet-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date */}
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <Calendar className="h-4 w-4" />
                        Date
                    </h3>
                    <div className="mt-3 space-y-1">
                        {dateOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => applyFilters({ date: option.value })}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                                    currentDate === option.value
                                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                )}
                            >
                                <span>{option.name}</span>
                                {currentDate === option.value && (
                                    <div className="h-2 w-2 rounded-full bg-violet-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Price Range
                    </h3>
                    <div className="mt-3 space-y-1">
                        {priceOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => applyFilters({ price: option.value })}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                                    currentPrice === option.value
                                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                )}
                            >
                                <span>{option.name}</span>
                                {currentPrice === option.value && (
                                    <div className="h-2 w-2 rounded-full bg-violet-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    )
}

// Sort Dropdown Component
export function EventSortDropdown({ className }: { className?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const currentSort = searchParams.get('sort') || 'date-asc'

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'date-asc') {
            params.set('sort', value)
        } else {
            params.delete('sort')
        }
        startTransition(() => {
            router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`)
        })
    }

    return (
        <select
            value={currentSort}
            onChange={(e) => handleChange(e.target.value)}
            className={cn(
                'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white',
                className
            )}
        >
            {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.name}
                </option>
            ))}
        </select>
    )
}

// Active Filters Display
export function ActiveFilters({ className }: { className?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const filters: { key: string; value: string; label: string }[] = []

    const q = searchParams.get('q')
    if (q) filters.push({ key: 'q', value: q, label: `Search: "${q}"` })

    const category = searchParams.get('category')
    if (category && category !== 'all') {
        const cat = categories.find(c => c.slug === category)
        filters.push({ key: 'category', value: category, label: cat?.name || category })
    }

    const date = searchParams.get('date')
    if (date && date !== 'all') {
        const d = dateOptions.find(o => o.value === date)
        filters.push({ key: 'date', value: date, label: d?.name || date })
    }

    const location = searchParams.get('location')
    if (location) filters.push({ key: 'location', value: location, label: `Near: ${location}` })

    const price = searchParams.get('price')
    if (price && price !== 'all') {
        const p = priceOptions.find(o => o.value === price)
        filters.push({ key: 'price', value: price, label: p?.name || price })
    }

    if (filters.length === 0) return null

    const removeFilter = (key: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete(key)
        startTransition(() => {
            router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`)
        })
    }

    const clearAll = () => {
        startTransition(() => {
            router.push(pathname)
        })
    }

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {filters.map((filter) => (
                <span
                    key={filter.key}
                    className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                >
                    {filter.label}
                    <button
                        onClick={() => removeFilter(filter.key)}
                        className="ml-1 hover:text-violet-900 dark:hover:text-violet-200"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
            <button
                onClick={clearAll}
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
                Clear all
            </button>
        </div>
    )
}

// Helper component for filter sections
function FilterSection({
    label,
    value,
    options,
    onChange,
}: {
    label: string
    value: string
    options: { name: string; value: string }[]
    onChange: (value: string) => void
}) {
    return (
        <div>
            <label className="text-sm font-medium text-white/80">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full rounded-lg bg-white/10 border-0 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-white/50"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="text-slate-900">
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    )
}
