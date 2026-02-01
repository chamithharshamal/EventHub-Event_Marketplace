'use client'

import { useState, useEffect } from 'react'
import { generateQRCodeImage } from '@/lib/qr'

interface TicketQRCodeProps {
    qrCodeData: string
}

export function TicketQRCode({ qrCodeData }: TicketQRCodeProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

    useEffect(() => {
        // DEV ONLY: Log QR data for testing
        console.log('🎟️ TICKET QR DATA:', qrCodeData)

        generateQRCodeImage(qrCodeData).then(setQrCodeUrl)
    }, [qrCodeData])

    if (!qrCodeUrl) {
        return <div className="w-56 h-56 bg-slate-100 animate-pulse rounded" />
    }

    return (
        <div className="flex flex-col items-center">
            <img
                src={qrCodeUrl}
                alt="Ticket QR Code"
                className="w-56 h-56"
            />
            {/* Hidden element for E2E testing to read the QR data */}
            <div id="debug-qr-data" style={{ opacity: 0, height: 0, width: 0, overflow: 'hidden' }}>
                {qrCodeData}
            </div>
        </div>
    )
}
