'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    Download,
    Share2,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime } from '@/lib/utils'
import { generateQRCodeImage } from '@/lib/qr'

// Mock ticket data
const mockTicket = {
    id: 'tkt_001',
    status: 'valid',
    qr_code_data: 'EVT_001_TKT_001_SIGNATURE',
    attendee_name: null,
    attendee_email: null,
    checked_in_at: null,
    ticket_type: {
        name: 'General Admission',
        description: 'Full access to all conference sessions',
        price: 299,
        perks: ['Full conference access', 'Lunch included', 'Swag bag'],
    },
    event: {
        id: 'evt_001',
        title: 'Tech Innovation Summit 2026',
        slug: 'tech-innovation-summit-2026',
        start_date: '2026-02-15T09:00:00Z',
        end_date: '2026-02-15T18:00:00Z',
        venue_name: 'Moscone Center',
        address: '747 Howard St',
        city: 'San Francisco',
        country: 'USA',
        banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
    },
    order: {
        id: 'ord_123456',
        created_at: '2026-01-17T10:00:00Z',
    },
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

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
    const [ticketId, setTicketId] = useState<string>('')
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

    useEffect(() => {
        params.then(({ ticketId }) => {
            setTicketId(ticketId)
        })
    }, [params])

    useEffect(() => {
        // Generate QR code image
        if (mockTicket.qr_code_data) {
            generateQRCodeImage(mockTicket.qr_code_data).then(setQrCodeUrl)
        }
    }, [])

    const ticket = { ...mockTicket, id: ticketId }
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
                        <img
                            src={ticket.event.banner_url}
                            alt={ticket.event.title}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                            <h1 className="text-xl font-bold text-white">
                                {ticket.event.title}
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
                                {qrCodeUrl ? (
                                    <img
                                        src={qrCodeUrl}
                                        alt="Ticket QR Code"
                                        className="w-56 h-56"
                                    />
                                ) : (
                                    <div className="w-56 h-56 bg-slate-100 animate-pulse rounded" />
                                )}
                            </div>
                        </div>

                        <p className="text-center text-sm text-slate-500 mb-6">
                            Show this QR code at the event entrance
                        </p>

                        {/* Ticket Type */}
                        <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-6 mb-6">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                {ticket.ticket_type.name}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {ticket.ticket_type.description}
                            </p>

                            {ticket.ticket_type.perks && ticket.ticket_type.perks.length > 0 && (
                                <ul className="mt-4 space-y-2">
                                    {(ticket.ticket_type.perks as string[]).map((perk, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            {perk}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Event Details */}
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {formatDate(ticket.event.start_date)}
                                    </p>
                                    <p className="text-slate-500">
                                        {formatDateTime(ticket.event.start_date).split(',').pop()} - {formatDateTime(ticket.event.end_date).split(',').pop()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {ticket.event.venue_name}
                                    </p>
                                    <p className="text-slate-500">
                                        {ticket.event.address}, {ticket.event.city}
                                    </p>
                                </div>
                            </div>
                        </div>

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
                            Order #{ticket.order.id} • Ticket #{ticket.id}
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
