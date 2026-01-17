import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle, Ticket, Calendar, MapPin, Download, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/utils'

// Mock order data - will be replaced with real data fetch
const mockOrder = {
    id: 'ord_123456',
    status: 'completed',
    total: 299,
    service_fee: 14.95,
    subtotal: 284.05,
    created_at: '2026-01-17T10:00:00Z',
    event: {
        title: 'Tech Innovation Summit 2026',
        slug: 'tech-innovation-summit-2026',
        start_date: '2026-02-15T09:00:00Z',
        venue_name: 'Moscone Center',
        city: 'San Francisco',
        country: 'USA',
        banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
    },
    tickets: [
        {
            id: 'tkt_001',
            ticket_type: { name: 'General Admission' },
            qr_code_data: 'EVT_001_TKT_001',
        },
    ],
}

interface OrderConfirmationPageProps {
    params: Promise<{ orderId: string }>
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
    const { orderId } = await params

    // TODO: Fetch real order data
    // const order = await getOrder(orderId)
    const order = { ...mockOrder, id: orderId }

    if (!order) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-slate-950 dark:to-slate-900 py-12">
            <div className="mx-auto max-w-2xl px-4">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <CheckCircle className="h-10 w-10 text-emerald-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Order Confirmed!
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Your tickets have been sent to your email
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                        Order #{order.id}
                    </p>
                </div>

                {/* Event Card */}
                <Card className="mb-6 overflow-hidden">
                    <div className="relative h-32">
                        <img
                            src={order.event.banner_url}
                            alt={order.event.title}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <CardContent className="p-6">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {order.event.title}
                        </h2>
                        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formatDate(order.event.start_date)}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {order.event.venue_name}, {order.event.city}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tickets */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5" />
                            Your Tickets ({order.tickets.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.tickets.map((ticket, index) => (
                            <div
                                key={ticket.id}
                                className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                            >
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        Ticket #{index + 1}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {ticket.ticket_type.name}
                                    </p>
                                </div>
                                <div className="h-16 w-16 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <span className="text-xs text-slate-500">QR</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                <span className="text-slate-900 dark:text-white">
                                    {formatCurrency(order.subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Service Fee</span>
                                <span className="text-slate-900 dark:text-white">
                                    {formatCurrency(order.service_fee)}
                                </span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                <div className="flex justify-between font-semibold">
                                    <span className="text-slate-900 dark:text-white">Total</span>
                                    <span className="text-slate-900 dark:text-white">
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/my-tickets" className="flex-1">
                        <Button className="w-full">
                            <Ticket className="h-4 w-4 mr-2" />
                            View My Tickets
                        </Button>
                    </Link>
                    <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                    <Mail className="inline h-4 w-4 mr-1" />
                    A confirmation email has been sent to your email address
                </p>
            </div>
        </div>
    )
}
