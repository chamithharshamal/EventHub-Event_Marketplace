'use client'

import { useState, useEffect } from 'react'
import { generateQRCodeImage } from '@/lib/qr'

interface TicketQRCodeProps {
    qrCodeData: string
}

export function TicketQRCode({ qrCodeData }: TicketQRCodeProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

    useEffect(() => {
        generateQRCodeImage(qrCodeData).then(setQrCodeUrl)
    }, [qrCodeData])

    if (!qrCodeUrl) {
        return <div className="w-56 h-56 bg-slate-100 animate-pulse rounded" />
    }

    return (
        <img
            src={qrCodeUrl}
            alt="Ticket QR Code"
            className="w-56 h-56"
        />
    )
}
