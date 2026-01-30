import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Download,
    Share2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Ticket
} from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { TicketQRCode } from './ticket-qr-code'

interface TicketWithDetails {
    id: string
    status: string
    qr_code_data: string | null
    attendee_name: string | null
    attendee_email: string | null
    checked_in_at: string | null
    ticket_types: {
        name: string
        description: string | null
        price: number
        perks: string[] | null
    } | null
    events: {
        id: string
        title: string
        slug: string
        start_date: string
        end_date: string
        venue_name: string | null
        address: string | null
        city: string | null
        country: string | null
        banner_url: string | null
    } | null
    orders: {
        id: string
        created_at: string
    } | null
}

async function getTicketById(ticketId: string, userId: string): Promise<TicketWithDetails | null> {
    const supabase = await createClient()

    const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
            id,
            status,
            qr_code_data,
            attendee_name,
            attendee_email,
            checked_in_at,
            ticket_types (
                name,
                description,
                price,
                perks
            ),
            events (
                id,
                title,
                slug,
                start_date,
                end_date,
                venue_name,
                address,
                city,
                country,
                banner_url
            ),
            orders (
                id,
                created_at
            )
        `)
        .eq('id', ticketId)
        .eq('user_id', userId)
        .single()

    if (error || !ticket) {
        console.error('Error fetching ticket:', error)
        return null
    }

    return ticket as unknown as TicketWithDetails
}

function getStatusInfo(status: string) {
    switch (status) {
        case 'valid':
            return {
                badge: <Badge variant="success" className="text-sm">Valid</Badge>,
                icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
                message: 'Ready for check-in',
            }
        case 'used':
            return {
                badge: <Badge variant="secondary" className="text-sm">Used</Badge>,
                icon: <CheckCircle className="h-5 w-5 text-slate-400" />,
                message: 'Already checked in',
            }
        case 'cancelled':
            return {
                badge: <Badge variant="destructive" className="text-sm">Cancelled</Badge>,
                icon: <XCircle className="h-5 w-5 text-red-500" />,
                message: 'This ticket has been cancelled',
            }
        default:
            return {
                badge: <Badge className="text-sm">{status}</Badge>,
                icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
                message: '',
            }
    }
}

interface TicketDetailPageProps {
    params: Promise<{ ticketId: string }>
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
    const { ticketId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const ticket = await getTicketById(ticketId, user.id)

    if (!ticket) {
        notFound()
    }

    const event = ticket.events
    const ticketType = ticket.ticket_types
    const order = ticket.orders
    const statusInfo = getStatusInfo(ticket.status)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <main className="mx-auto max-w-lg px-4 py-8">
                {/* Back Button */}
                <Link href="/my-tickets" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Tickets
                </Link>

                {/* Main Ticket Card */}
                <Card className="overflow-hidden">
                    {/* Event Banner */}
                    <div className="relative h-40">
                        {event?.banner_url ? (
                            <img
                                src={event.banner_url}
                                alt={event.title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <Ticket className="h-12 w-12 text-white/50" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                            <h1 className="text-xl font-bold text-white">
                                {event?.title || 'Event'}
                            </h1>
                        </div>
                    </div>

                    <CardContent className="p-6">
                        {/* Status */}
                        <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                                {statusInfo.icon}
                                <div>
                                    {statusInfo.badge}
                                    <p className="text-sm text-slate-500 mt-1">{statusInfo.message}</p>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-white rounded-xl shadow-sm border">
                                {ticket.qr_code_data ? (
                                    <TicketQRCode qrCodeData={ticket.qr_code_data} />
                                ) : (
                                    <div className="w-56 h-56 bg-slate-100 flex items-center justify-center rounded">
                                        <span className="text-slate-400 text-sm">No QR Code</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-sm text-slate-500 mb-6">
                            Show this QR code at the event entrance
                        </p>

                        {/* Ticket Type */}
                        {ticketType && (
                            <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-6 mb-6">
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    {ticketType.name}
                                </h3>
                                {ticketType.description && (
                                    <p className="text-sm text-slate-500 mt-1">
                                        {ticketType.description}
                                    </p>
                                )}

                                {ticketType.perks && ticketType.perks.length > 0 && (
                                    <ul className="mt-4 space-y-2">
                                        {ticketType.perks.map((perk, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                {perk}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Event Details */}
                        {event && (
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {formatDate(event.start_date)}
                                        </p>
                                        <p className="text-slate-500">
                                            {formatDateTime(event.start_date).split(',').pop()} - {formatDateTime(event.end_date).split(',').pop()}
                                        </p>
                                    </div>
                                </div>

                                {(event.venue_name || event.city) && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                                        <div>
                                            {event.venue_name && (
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {event.venue_name}
                                                </p>
                                            )}
                                            <p className="text-slate-500">
                                                {[event.address, event.city].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <Button variant="outline" className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                            <Button variant="outline" className="flex-1">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>

                        {/* Order Info */}
                        <p className="text-center text-xs text-slate-400 mt-6">
                            Order #{order?.id?.slice(0, 8) || 'N/A'} • Ticket #{ticket.id.slice(0, 8)}
                        </p>
                    </CardContent>
                </Card>

                {/* Add to Wallet */}
                <div className="mt-6 text-center">
                    <Button variant="ghost" className="text-sm">
                        Add to Apple Wallet
                    </Button>
                </div>
            </main>
        </div>
    )
}
