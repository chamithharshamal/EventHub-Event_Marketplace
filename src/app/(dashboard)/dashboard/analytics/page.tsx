'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/components/dashboard/overview'
import { Button } from '@/components/ui/button'
import { DollarSign, ShoppingCart, Users, TrendingUp, Download, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { downloadSalesCSV } from '@/lib/export'

interface AnalyticsData {
    totalRevenue: number
    totalOrders: number
    totalTickets: number
    salesData: { name: string; value: number }[]
    topEvents: { name: string; value: number }[]
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [range, setRange] = useState('30d')

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/analytics?range=${range}`)
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error('Failed to fetch analytics', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [range])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Detailed insights into your event performance
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md dark:bg-slate-800 dark:text-white">
                        <Button
                            variant={range === '7d' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setRange('7d')}
                        >
                            7 Days
                        </Button>
                        <Button
                            variant={range === '30d' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setRange('30d')}
                        >
                            30 Days
                        </Button>
                        <Button
                            variant={range === '90d' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setRange('90d')}
                        >
                            90 Days
                        </Button>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => data?.salesData && downloadSalesCSV(data.salesData)}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-white">
                            {loading ? '...' : formatCurrency(data?.totalRevenue || 0)}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Last {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-white">
                            {loading ? '...' : data?.totalOrders || 0}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Completed orders
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                        <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-white">
                            {loading ? '...' : data?.totalTickets || 0}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Total tickets
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-white">
                            {loading ? '...' : formatCurrency(
                                data?.totalOrders ? (data.totalRevenue / data.totalOrders) : 0
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Per transaction
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Over Time</CardTitle>
                        <CardDescription>
                            Daily revenue for the selected period
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {loading ? (
                            <div className="flex h-[350px] items-center justify-center dark:text-white">
                                Loading...
                            </div>
                        ) : (
                            <Overview data={data?.salesData || []} />
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Events</CardTitle>
                        <CardDescription>
                            Events by revenue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex h-[350px] items-center justify-center dark:text-white">
                                Loading...
                            </div>
                        ) : data?.topEvents && data.topEvents.length > 0 ? (
                            <div className="space-y-4">
                                {data.topEvents.map((event, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                            <Calendar className="h-4 w-4 text-violet-600" />
                                        </div>
                                        <div className="ml-4 space-y-1 flex-1">
                                            <p className="text-sm font-medium leading-none truncate">
                                                {event.name}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {formatCurrency(event.value)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-[350px] items-center justify-center text-slate-500">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
