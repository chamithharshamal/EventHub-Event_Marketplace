import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { CheckCircle, Ticket, Calendar, MapPin, Download, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { DownloadOrderButton } from './download-order-button'
import { AddToCalendar } from '@/components/events/AddToCalendar'

interface OrderWithDetails {
    id: string
    status: string
    total: number
    service_fee: number
    subtotal: number
    created_at: string
    events: {
        title: string
        slug: string
        start_date: string
        venue_name: string | null
        city: string | null
        country: string | null
        banner_url: string | null
    } | null
    tickets: Array<{
        id: string
        ticket_types: {
            name: string
        } | null
        qr_code_data: string | null
    }>
}

async function getOrder(orderId: string, userId: string): Promise<OrderWithDetails | null> {
    const supabase = await createClient()

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            id,
            status,
            total,
            service_fee,
            subtotal,
            created_at,
            events (
                title,
                slug,
                start_date,
                venue_name,
                city,
                country,
                banner_url
            ),
            tickets (
                id,
                qr_code_data,
                ticket_types (
                    name
                )
            )
        `)
        .eq('id', orderId)
        .eq('user_id', userId) // Ensure user owns this order
        .single()

    if (error || !order) {
        console.error('Error fetching order:', error)
        return null
    }

    return order as unknown as OrderWithDetails
}

interface OrderConfirmationPageProps {
    params: Promise<{ orderId: string }>
}

import { verifyOrderAction } from '@/app/orders/actions'

// ...

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
    const { orderId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    let order = await getOrder(orderId, user.id)

    // Fallback: If no tickets but order exists, try to verify payment and generate tickets
    if (order && order.tickets.length === 0 && order.status !== 'failed') {
        console.log('[ConfirmationPage] No tickets found, verifying order...', orderId)
        const result = await verifyOrderAction(orderId)
        console.log('[ConfirmationPage] Verification result:', result)

        if (result.success) {
            // Re-fetch order
            order = await getOrder(orderId, user.id)
        }
    }

    if (!order) {
        notFound()
    }

    const event = order.events

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
                {event && (
                    <Card className="mb-6 overflow-hidden">
                        <div className="relative h-32">
                            {event.banner_url ? (
                                <img
                                    src={event.banner_url}
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-slate-200 dark:bg-slate-800" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {event.title}
                            </h2>
                            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(event.start_date)}
                                </div>
                                {(event.venue_name || event.city) && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {[event.venue_name, event.city].filter(Boolean).join(', ')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                        {ticket.ticket_types?.name || 'Ticket'}
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
                    <DownloadOrderButton
                        orderId={order.id}
                        eventTitle={event?.title || 'Event'}
                        eventDate={event ? formatDate(event.start_date) : ''}
                        eventLocation={[event?.venue_name, event?.city].filter(Boolean).join(', ')}
                        tickets={order.tickets.map(t => ({
                            id: t.id,
                            ticketType: t.ticket_types?.name || 'Ticket',
                            qrCodeData: t.qr_code_data
                        }))}
                        subtotal={order.subtotal}
                        serviceFee={order.service_fee}
                        total={order.total}
                        orderDate={formatDate(order.created_at)}
                    />
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                    <Mail className="inline h-4 w-4 mr-1" />
                    A confirmation email has been sent to your email address
                </p>

                {/* Add to Calendar */}
                {event && (
                    <div className="flex justify-center mt-4">
                        <AddToCalendar
                            title={event.title}
                            location={[event.venue_name, event.city].filter(Boolean).join(', ')}
                            startDate={event.start_date}
                            endDate={event.start_date}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
