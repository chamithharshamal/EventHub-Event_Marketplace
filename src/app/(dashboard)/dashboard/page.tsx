'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/components/dashboard/overview'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, CreditCard, Activity, Users, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { downloadSalesCSV } from '@/lib/export'

interface AnalyticsData {
    totalRevenue: number
    totalOrders: number
    totalTickets: number
    salesData: { name: string; value: number }[]
    topEvents: { name: string; value: number }[]
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
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    {/* Date Range Picker Placeholder - effectively just buttons for now */}
                    <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md dark:bg-slate-800">
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
                    <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
                    <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Revenue
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loading ? '...' : formatCurrency(data?.totalRevenue || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    +20.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Sales
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loading ? '...' : `+${data?.totalOrders || 0}`}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    +180.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+573</div>
                                <p className="text-xs text-muted-foreground">
                                    +201 since last hour
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Tickets
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loading && '...'}
                                    {/* Placeholder for total tickets */}
                                    {!loading && '843'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    +19% from last month
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
                                    <div className="flex h-[350px] items-center justify-center">
                                        Loading...
                                    </div>
                                ) : (
                                    <Overview data={data?.salesData || []} />
                                )}
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Sales</CardTitle>
                                <CardDescription>
                                    You made {data?.totalOrders || 0} sales this month.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Mock data for now as RecentSales expects user details which we didn't fully plumb yet on API */}
                                <RecentSales sales={[
                                    {
                                        name: "Olivia Martin",
                                        email: "olivia.martin@email.com",
                                        amount: 199.00,
                                    },
                                    {
                                        name: "Jackson Lee",
                                        email: "jackson.lee@email.com",
                                        amount: 39.00,
                                    },
                                    {
                                        name: "Isabella Nguyen",
                                        email: "isabella.nguyen@email.com",
                                        amount: 299.00,
                                    },
                                    {
                                        name: "William Kim",
                                        email: "will@email.com",
                                        amount: 99.00,
                                    },
                                ]} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                {/* Placeholder for other tabs */}
            </Tabs>
        </div>
    )
}
