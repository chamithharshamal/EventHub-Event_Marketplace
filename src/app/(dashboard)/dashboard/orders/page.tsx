import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Order {
    id: string
    total: number
    status: string
    created_at: string
    event: {
        title: string
        slug: string
    }
    order_items: {
        quantity: number
        unit_price: number
        ticket_type: {
            name: string
        }
    }[]
}

async function getOrders() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get user's events first
    const { data: userEvents } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', user.id) as { data: { id: string }[] | null }

    if (!userEvents || userEvents.length === 0) return []

    const eventIds = userEvents.map(e => e.id)

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            total,
            status,
            created_at,
            event:events (
                title,
                slug
            ),
            order_items (
                quantity,
                unit_price,
                ticket_type:ticket_types (
                    name
                )
            )
        `)
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching orders:', error)
        return []
    }

    return orders as unknown as Order[]
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'completed':
            return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
        case 'pending':
            return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
        case 'failed':
            return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
        case 'refunded':
            return <Badge variant="outline">Refunded</Badge>
        default:
            return <Badge>{status}</Badge>
    }
}

export default async function OrdersPage() {
    const orders = await getOrders()
    const hasOrders = orders.length > 0

    const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0)

    const completedOrders = orders.filter(o => o.status === 'completed').length
    const pendingOrders = orders.filter(o => o.status === 'pending').length

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    View and manage ticket orders for your events
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <ShoppingCart className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                <CheckCircle className="h-6 w-6 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedOrders}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Completed Orders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingOrders}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Orders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {!hasOrders ? (
                        <div className="py-12 text-center">
                            <ShoppingCart className="h-12 w-12 mx-auto text-slate-400" />
                            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No orders yet</h3>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">Orders will appear here when customers purchase tickets</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Order ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Event</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Items</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Total</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 dark:text-slate-400">
                                            <td className="px-4 py-4 text-sm font-mono">
                                                {order.id.slice(0, 8)}...
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium">
                                                {order.event?.title || 'Unknown Event'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} tickets
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                {formatDate(order.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
