'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Shield,
    Calendar,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle,
    ArrowRight,
    DollarSign,
    Ticket,
    ShoppingCart,
    TrendingUp
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BasicStats {
    pendingEvents: number
    publishedEvents: number
    totalUsers: number
}

interface AdvancedStats {
    overview: {
        pendingEvents: number
        publishedEvents: number
        totalUsers: number
        totalOrders: number
        totalTickets: number
        totalRevenue: number
        newUsers: number
    }
    topEvents: Array<{
        id: string
        title: string
        ticketsSold: number
    }>
    recentOrders: Array<{
        id: string
        total: number
        status: string
        createdAt: string
        eventTitle: string
    }>
    period: string
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<BasicStats | null>(null)
    const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch basic stats
                const res = await fetch('/api/admin/stats')
                const data = await res.json()

                if (data.error) {
                    setIsAdmin(false)
                    return
                }

                setIsAdmin(true)
                setStats(data)

                // Fetch advanced stats
                const advancedRes = await fetch(`/api/admin/stats?detailed=true&period=${period}`)
                const advancedData = await advancedRes.json()
                if (!advancedData.error) {
                    setAdvancedStats(advancedData)
                }
            } catch {
                setIsAdmin(false)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [period])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        redirect('/dashboard')
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <Shield className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Platform overview and management
                        </p>
                    </div>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as typeof period)}
                    className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="all">All time</option>
                </select>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <DollarSign className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(advancedStats?.overview.totalRevenue || 0)}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {advancedStats?.overview.totalOrders || 0}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                <Ticket className="h-6 w-6 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {advancedStats?.overview.totalTickets || 0}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tickets Sold</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                <Users className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats?.totalUsers || 0}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Total Users
                                    {advancedStats?.overview.newUsers ? (
                                        <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                                            (+{advancedStats.overview.newUsers} new)
                                        </span>
                                    ) : null}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Events Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats?.pendingEvents || 0}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Approval</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats?.publishedEvents || 0}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Published Events</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                <Calendar className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {(stats?.pendingEvents || 0) + (stats?.publishedEvents || 0)}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Events</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Link href="/admin/events">
                    <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5 dark:text-white" />
                                Event Moderation
                            </CardTitle>
                            <CardDescription>
                                Review and approve pending events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                {stats?.pendingEvents && stats.pendingEvents > 0 ? (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        {stats.pendingEvents} pending
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        All reviewed
                                    </Badge>
                                )}
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/users">
                    <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5 dark:text-white" />
                                User Management
                            </CardTitle>
                            <CardDescription>
                                Manage user roles and permissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Users className="h-3 w-3 mr-1" />
                                    {stats?.totalUsers || 0} users
                                </Badge>
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Top Events & Recent Orders */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Events */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            Top Selling Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {advancedStats?.topEvents && advancedStats.topEvents.length > 0 ? (
                            <div className="space-y-3">
                                {advancedStats.topEvents.slice(0, 5).map((event, index) => (
                                    <div key={event.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                                                {event.title}
                                            </span>
                                        </div>
                                        <Badge variant="secondary">
                                            {event.ticketsSold} sold
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                No event data available
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                            Recent Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {advancedStats?.recentOrders && advancedStats.recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {advancedStats.recentOrders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                {order.eventTitle}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="text-sm font-semibold text-emerald-600">
                                            {formatCurrency(order.total)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                No orders yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
