'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateOrderPDF } from '@/lib/pdf'
import { generateQRCodeImage } from '@/lib/qr'

interface OrderTicket {
    id: string
    ticketType: string
    qrCodeData: string | null
}

interface DownloadOrderButtonProps {
    orderId: string
    eventTitle: string
    eventDate: string
    eventLocation: string
    tickets: OrderTicket[]
    subtotal: number
    serviceFee: number
    total: number
    orderDate: string
}

export function DownloadOrderButton({
    orderId,
    eventTitle,
    eventDate,
    eventLocation,
    tickets,
    subtotal,
    serviceFee,
    total,
    orderDate
}: DownloadOrderButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDownload = async () => {
        setIsLoading(true)
        try {
            // Generate QR code images for all tickets
            const ticketsWithQR = await Promise.all(
                tickets.map(async (ticket) => ({
                    id: ticket.id,
                    ticketType: ticket.ticketType,
                    qrCodeDataUrl: ticket.qrCodeData
                        ? await generateQRCodeImage(ticket.qrCodeData)
                        : null
                }))
            )

            await generateOrderPDF({
                orderId,
                eventTitle,
                eventDate,
                eventLocation,
                tickets: ticketsWithQR,
                subtotal,
                serviceFee,
                total,
                orderDate
            })
        } catch (error) {
            console.error('Error generating PDF:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Download className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Generating...' : 'Download PDF'}
        </Button>
    )
}
