'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateTicketPDF } from '@/lib/pdf'
import { generateQRCodeImage } from '@/lib/qr'

interface DownloadTicketButtonProps {
    ticketId: string
    eventTitle: string
    eventDate: string
    eventLocation: string
    ticketType: string
    qrCodeData: string | null
}

export function DownloadTicketButton({
    ticketId,
    eventTitle,
    eventDate,
    eventLocation,
    ticketType,
    qrCodeData
}: DownloadTicketButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDownload = async () => {
        setIsLoading(true)
        try {
            // Generate QR code image if we have data
            let qrCodeDataUrl: string | null = null
            if (qrCodeData) {
                qrCodeDataUrl = await generateQRCodeImage(qrCodeData)
            }

            await generateTicketPDF({
                ticketId,
                eventTitle,
                eventDate,
                eventLocation,
                ticketType,
                qrCodeDataUrl
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
            {isLoading ? 'Generating...' : 'Download'}
        </Button>
    )
}
