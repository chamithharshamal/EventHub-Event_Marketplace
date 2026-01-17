import QRCode from 'qrcode'
import { createHmac } from 'crypto'

export interface QRPayload {
    tid: string  // Ticket ID
    eid: string  // Event ID
    tnt: string  // Tenant ID
    iat: number  // Issued at (Unix timestamp)
    exp: number  // Expiry (Unix timestamp)
}

export interface SignedQRPayload extends QRPayload {
    sig: string  // HMAC signature
}

const QR_SECRET_KEY = process.env.QR_SECRET_KEY || 'default-dev-secret-key'

/**
 * Create HMAC-SHA256 signature for QR payload
 */
export function signPayload(payload: QRPayload): string {
    const payloadString = JSON.stringify(payload)
    return createHmac('sha256', QR_SECRET_KEY)
        .update(payloadString)
        .digest('hex')
}

/**
 * Verify QR payload signature
 */
export function verifySignature(payload: SignedQRPayload): boolean {
    const { sig, ...payloadWithoutSig } = payload
    const expectedSig = signPayload(payloadWithoutSig)
    return sig === expectedSig
}

/**
 * Generate QR code data and image for a ticket
 */
export async function generateTicketQR(
    ticketId: string,
    eventId: string,
    tenantId: string,
    eventEndDate: Date
): Promise<{
    qrCodeData: string
    qrSignature: string
    qrImageDataUrl: string
}> {
    const payload: QRPayload = {
        tid: ticketId,
        eid: eventId,
        tnt: tenantId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(eventEndDate.getTime() / 1000) + 7200, // +2 hours buffer
    }

    const signature = signPayload(payload)

    const signedPayload: SignedQRPayload = {
        ...payload,
        sig: signature,
    }

    const qrCodeData = JSON.stringify(signedPayload)

    // Generate QR code image as data URL
    const qrImageDataUrl = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: 'M',
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
    })

    return {
        qrCodeData,
        qrSignature: signature,
        qrImageDataUrl,
    }
}

/**
 * Parse and validate QR code data
 */
export function parseQRData(qrData: string): SignedQRPayload | null {
    try {
        return JSON.parse(qrData) as SignedQRPayload
    } catch {
        return null
    }
}

/**
 * Check if QR payload has expired
 */
export function isExpired(payload: QRPayload): boolean {
    return Date.now() / 1000 > payload.exp
}

export interface ValidationResult {
    valid: boolean
    status: 'SUCCESS' | 'INVALID_SIGNATURE' | 'TICKET_EXPIRED' | 'WRONG_EVENT' | 'PARSE_ERROR' | 'TICKET_USED' | 'TICKET_CANCELLED' | 'TICKET_NOT_FOUND' | 'ALREADY_USED'
    attendee?: {
        name: string | null
        email: string | null
    }
    ticketType?: string
}

/**
 * Validate QR code (client-side preliminary check)
 */
export function validateQRClientSide(
    qrData: string,
    expectedEventId: string
): ValidationResult {
    const payload = parseQRData(qrData)

    if (!payload) {
        return { valid: false, status: 'PARSE_ERROR' }
    }

    if (!verifySignature(payload)) {
        return { valid: false, status: 'INVALID_SIGNATURE' }
    }

    if (isExpired(payload)) {
        return { valid: false, status: 'TICKET_EXPIRED' }
    }

    if (payload.eid !== expectedEventId) {
        return { valid: false, status: 'WRONG_EVENT' }
    }

    // Client-side checks passed, needs server verification
    return { valid: true, status: 'SUCCESS' }
}

/**
 * Simple helper to generate QR code data string
 */
export function generateQRCodeData(ticketId: string, eventId: string): string {
    return `${eventId}_${ticketId}_${Date.now()}`
}

/**
 * Simple helper to sign QR code data
 */
export function signQRCode(qrData: string): string {
    return createHmac('sha256', QR_SECRET_KEY)
        .update(qrData)
        .digest('hex')
}

/**
 * Generate QR code image as data URL
 */
export async function generateQRCodeImage(qrData: string): Promise<string> {
    const qrImageDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
    })
    return qrImageDataUrl
}
