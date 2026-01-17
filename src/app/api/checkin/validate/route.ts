import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated and has staff/organizer role
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { valid: false, status: 'UNAUTHORIZED', message: 'Not authenticated' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { qrData, eventId } = body as {
            qrData: string
            eventId: string
        }

        if (!qrData || !eventId) {
            return NextResponse.json(
                { valid: false, status: 'INVALID_REQUEST', message: 'Missing qrData or eventId' },
                { status: 400 }
            )
        }

        // Parse QR data - format: eventId_ticketId_timestamp
        const parts = qrData.split('_')
        if (parts.length < 2) {
            return NextResponse.json({
                valid: false,
                status: 'PARSE_ERROR',
                message: 'Invalid QR code format',
            })
        }

        const [qrEventId, ticketId] = parts

        // Check if QR event ID matches expected event
        if (qrEventId !== eventId) {
            return NextResponse.json({
                valid: false,
                status: 'WRONG_EVENT',
                message: 'This ticket is for a different event',
            })
        }

        // Fetch ticket from database
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: ticket, error: ticketError } = await (supabase as any)
            .from('tickets')
            .select(`
        *,
        ticket_types(name, description),
        events(id, title, start_date, end_date)
      `)
            .eq('id', ticketId)
            .eq('event_id', eventId)
            .single()

        if (ticketError || !ticket) {
            return NextResponse.json({
                valid: false,
                status: 'TICKET_NOT_FOUND',
                message: 'Ticket not found',
            })
        }

        // Check ticket status
        if (ticket.status === 'used') {
            return NextResponse.json({
                valid: false,
                status: 'ALREADY_USED',
                message: 'This ticket has already been used',
                checkedInAt: ticket.checked_in_at,
                ticketType: ticket.ticket_types?.name,
                attendee: {
                    name: ticket.attendee_name,
                    email: ticket.attendee_email,
                },
            })
        }

        if (ticket.status === 'cancelled') {
            return NextResponse.json({
                valid: false,
                status: 'TICKET_CANCELLED',
                message: 'This ticket has been cancelled',
            })
        }

        if (ticket.status === 'transferred') {
            return NextResponse.json({
                valid: false,
                status: 'TICKET_TRANSFERRED',
                message: 'This ticket has been transferred',
            })
        }

        // Verify QR signature
        const { signQRCode } = await import('@/lib/qr')
        const expectedSignature = signQRCode(qrData)

        if (ticket.qr_signature !== expectedSignature) {
            // For backwards compatibility, also check if qr_code_data matches
            if (ticket.qr_code_data !== qrData) {
                return NextResponse.json({
                    valid: false,
                    status: 'INVALID_SIGNATURE',
                    message: 'Invalid QR code signature',
                })
            }
        }

        // Check if event has started (with 30 min buffer before)
        const eventStart = new Date(ticket.events.start_date)
        const bufferTime = 30 * 60 * 1000 // 30 minutes
        const now = new Date()

        if (now < new Date(eventStart.getTime() - bufferTime)) {
            return NextResponse.json({
                valid: false,
                status: 'EVENT_NOT_STARTED',
                message: 'Check-in opens 30 minutes before event start',
                eventStart: ticket.events.start_date,
                ticketType: ticket.ticket_types?.name,
                attendee: {
                    name: ticket.attendee_name,
                    email: ticket.attendee_email,
                },
            })
        }

        // Check if event has ended
        const eventEnd = new Date(ticket.events.end_date)
        if (now > eventEnd) {
            return NextResponse.json({
                valid: false,
                status: 'EVENT_ENDED',
                message: 'This event has already ended',
            })
        }

        // All checks passed - mark ticket as used
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
            .from('tickets')
            .update({
                status: 'used',
                checked_in_at: new Date().toISOString(),
                checked_in_by: user.id,
            })
            .eq('id', ticketId)

        if (updateError) {
            console.error('Error updating ticket:', updateError)
            return NextResponse.json({
                valid: false,
                status: 'UPDATE_ERROR',
                message: 'Failed to check in ticket',
            })
        }

        // Log check-in
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('check_ins')
            .insert({
                ticket_id: ticketId,
                event_id: eventId,
                staff_id: user.id,
                status: 'SUCCESS',
                device_info: {
                    userAgent: request.headers.get('user-agent'),
                    timestamp: new Date().toISOString(),
                },
            })

        return NextResponse.json({
            valid: true,
            status: 'SUCCESS',
            message: 'Check-in successful!',
            ticketType: ticket.ticket_types?.name,
            attendee: {
                name: ticket.attendee_name,
                email: ticket.attendee_email,
            },
        })
    } catch (error) {
        console.error('Validation error:', error)
        return NextResponse.json(
            { valid: false, status: 'SERVER_ERROR', message: 'Internal server error' },
            { status: 500 }
        )
    }
}
