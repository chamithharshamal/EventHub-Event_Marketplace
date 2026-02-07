'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/components/dashboard/overview'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, CreditCard, Activity, Users, Download, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { downloadSalesCSV } from '@/lib/export'
import { SkeletonChart, SkeletonSalesList } from '@/components/ui/skeleton'

interface AnalyticsData {
    totalRevenue: number
    totalOrders: number
    totalTickets: number
    salesData: { name: string; value: number }[]
    topEvents: { name: string; value: number }[]
    recentSales: { name: string; email: string; amount: number }[]
}

export default function DashboardPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [range, setRange] = useState('7d')

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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight dark:text-white">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md dark:bg-slate-800">
                        <Button
                            variant={range === '7d' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setRange('7d')}
                            className="dark:text-white"
                        >
                            7 Days
                        </Button>
                        <Button
                            variant={range === '30d' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setRange('30d')}
                            className="dark:text-white"
                        >
                            30 Days
                        </Button>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => data?.salesData && downloadSalesCSV(data.salesData)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">
                        <Link href="/dashboard/analytics">Analytics</Link>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Revenue
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold dark:text-white">
                                    {loading ? '...' : formatCurrency(data?.totalRevenue || 0)}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Last {range === '7d' ? '7 days' : '30 days'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Orders
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
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
                                <Activity className="h-4 w-4 text-slate-500 dark:text-slate-400" />
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>
                                    Revenue for the last {range === '7d' ? '7 days' : '30 days'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                {loading ? (
                                    <SkeletonChart />
                                ) : (
                                    <Overview data={data?.salesData || []} />
                                )}
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 dark:text-slate-400">
                            <CardHeader>
                                <CardTitle>Recent Sales</CardTitle>
                                <CardDescription>
                                    {data?.totalOrders || 0} orders in selected period
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <SkeletonSalesList />
                                ) : data?.recentSales && data.recentSales.length > 0 ? (
                                    <RecentSales sales={data.recentSales} />
                                ) : (
                                    <div className="flex h-[300px] items-center justify-center text-slate-500">
                                        No recent sales
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Links */}
                    <div className="grid gap-4 md:grid-cols-3 dark:text-white">
                        <Link href="/dashboard/events">
                            <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">Manage Events</h3>
                                        <p className="text-sm text-slate-500">Create and edit your events</p>
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/dashboard/orders">
                            <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">View Orders</h3>
                                        <p className="text-sm text-slate-500">Track ticket purchases</p>
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/dashboard/attendees">
                            <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">Attendees</h3>
                                        <p className="text-sm text-slate-500">Manage your attendees</p>
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
