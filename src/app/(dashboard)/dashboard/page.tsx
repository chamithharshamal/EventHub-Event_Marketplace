import Link from 'next/link'
import {
    Plus,
    TrendingUp,
    Users,
    Ticket,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

// Mock data
const stats = [
    {
        title: 'Total Revenue',
        value: '$12,543',
        change: '+23.5%',
        trend: 'up',
        icon: DollarSign,
    },
    {
        title: 'Tickets Sold',
        value: '847',
        change: '+15.2%',
        trend: 'up',
        icon: Ticket,
    },
    {
        title: 'Active Events',
        value: '12',
        change: '+2',
        trend: 'up',
        icon: Calendar,
    },
    {
        title: 'Total Attendees',
        value: '2,341',
        change: '-5.1%',
        trend: 'down',
        icon: Users,
    },
]

const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', event: 'Tech Summit 2026', tickets: 2, total: 598, status: 'completed' },
    { id: 'ORD-002', customer: 'Jane Smith', event: 'Music Festival', tickets: 4, total: 600, status: 'completed' },
    { id: 'ORD-003', customer: 'Mike Johnson', event: 'AI Workshop', tickets: 1, total: 0, status: 'completed' },
    { id: 'ORD-004', customer: 'Sarah Wilson', event: 'Tech Summit 2026', tickets: 1, total: 299, status: 'pending' },
    { id: 'ORD-005', customer: 'Chris Brown', event: 'Networking Night', tickets: 2, total: 50, status: 'completed' },
]

const upcomingEvents = [
    { id: '1', title: 'Tech Summit 2026', date: '2026-02-15', soldTickets: 450, totalTickets: 500, revenue: 134550 },
    { id: '2', title: 'Music Festival', date: '2026-03-20', soldTickets: 1200, totalTickets: 2000, revenue: 180000 },
    { id: '3', title: 'AI Workshop', date: '2026-02-28', soldTickets: 45, totalTickets: 50, revenue: 0 },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Welcome back! Here&apos;s what&apos;s happening with your events.
                    </p>
                </div>
                <Link href="/dashboard/events/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        Create Event
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                    <stat.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                    {stat.trend === 'up' ? (
                                        <ArrowUpRight className="h-4 w-4" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4" />
                                    )}
                                    {stat.change}
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {stat.title}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Upcoming Events */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
                        <Link href="/dashboard/events" className="text-sm text-violet-600 hover:underline">
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingEvents.map((event) => {
                                const percentSold = Math.round((event.soldTickets / event.totalTickets) * 100)
                                return (
                                    <div key={event.id} className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-slate-900 dark:text-white truncate">
                                                {event.title}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {formatDate(event.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {event.soldTickets}/{event.totalTickets} tickets
                                            </div>
                                            <div className="mt-1 h-2 w-24 rounded-full bg-slate-200 dark:bg-slate-700">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                                                    style={{ width: `${percentSold}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 min-w-[80px]">
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(event.revenue)}
                                            </div>
                                            <div className="text-xs text-slate-500">Revenue</div>
                                        </div>
                                        <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
                        <Link href="/dashboard/orders" className="text-sm text-violet-600 hover:underline">
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.slice(0, 5).map((order) => (
                                <div key={order.id} className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {order.customer}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {order.event} • {order.tickets} ticket{order.tickets > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {order.total === 0 ? 'Free' : formatCurrency(order.total)}
                                        </p>
                                        <Badge
                                            variant={order.status === 'completed' ? 'success' : 'warning'}
                                            className="mt-1"
                                        >
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link href="/dashboard/events/new">
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                    <Plus className="h-5 w-5 text-violet-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Create Event</p>
                                    <p className="text-xs text-slate-500">Start a new event</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/dashboard/analytics">
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">View Analytics</p>
                                    <p className="text-xs text-slate-500">Check performance</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/dashboard/attendees">
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Manage Attendees</p>
                                    <p className="text-xs text-slate-500">View ticket holders</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/dashboard/settings">
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                    <Ticket className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Payout Settings</p>
                                    <p className="text-xs text-slate-500">Manage payments</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
