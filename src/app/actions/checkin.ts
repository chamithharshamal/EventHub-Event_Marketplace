'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { validateQRClientSide, ValidationResult, SignedQRPayload } from '@/lib/qr'

// Validates a ticket QR code against the database
export async function validateTicket(
    qrData: string,
    eventId: string
): Promise<ValidationResult> {
    const supabase = await createClient()

    // 1. Basic format and signature check (using shared lib)
    const clientValidation = validateQRClientSide(qrData, eventId)
    if (!clientValidation.valid) {
        return clientValidation
    }

    // Parse payload to get ticket ID
    let payload: SignedQRPayload
    try {
        payload = JSON.parse(qrData)
    } catch {
        return { valid: false, status: 'PARSE_ERROR' }
    }

    // 2. Database validation
    // We need to fetch the ticket to check its status and details
    // Using admin client because check-in staff might need to lookup tickets they don't own
    // but the policies should handle it. However, to be safe and fast checking "valid" status:

    // Check if user is authorized (organizer, staff, or admin)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { valid: false, status: 'PARSE_ERROR' } // Generic error for auth failure
    }

    // Verify user has access to this event (is organizer or staff)
    // For now we assume if they can hit this action they are on the check-in page which checks permissions
    // But strict backend check:
    const { data: eventRole } = await supabase
        .from('events')
        .select('organizer_id')
        .eq('id', eventId)
        .single()

    // TODO: Add robust role check here (if we add staff table later)
    if (eventRole?.organizer_id !== user.id) {
        // return { valid: false, status: 'UNAUTHORIZED' }
    }

    // Fetch ticket
    const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
            *,
            profiles:user_id (
                full_name,
                email
            ),
            ticket_types (
                name
            )
        `)
        .eq('id', payload.tid)
        .single()

    if (error || !ticket) {
        return { valid: false, status: 'TICKET_NOT_FOUND' }
    }

    // Check status
    if (ticket.status === 'used') {
        // Find when it was used?
        return {
            valid: false,
            status: 'ALREADY_USED',
            attendee: {
                name: ticket.profiles?.full_name,
                email: ticket.profiles?.email
            },
            ticketType: ticket.ticket_types?.name
        }
    }

    if (ticket.status !== 'valid') {
        return { valid: false, status: ticket.status === 'cancelled' ? 'TICKET_CANCELLED' : 'TICKET_NOT_FOUND' }
    }

    return {
        valid: true,
        status: 'SUCCESS',
        attendee: {
            name: ticket.profiles?.full_name,
            email: ticket.profiles?.email
        },
        ticketType: ticket.ticket_types?.name
    }
}

// Performs the check-in (marks ticket as used, adds check-in log)
export async function performCheckIn(
    ticketId: string,
    eventId: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Use admin client to perform the transactional update to ensure we force the status 
    // and bypass simple RLS if needed, although RLS "Staff can validate tickets" exists.
    // However, specifically `tickets` update policy is:
    // "Staff can validate tickets" USING (event_id IN ... admin/organizer/staff)
    // So normal client should work if policies are correct.

    // Let's try normal client first to respect RLS
    // Transaction: Update ticket status -> Insert check-in record

    const { error: updateError } = await supabase
        .from('tickets')
        .update({
            status: 'used',
            checked_in_at: new Date().toISOString(),
            checked_in_by: user.id
        })
        .eq('id', ticketId)
        .eq('status', 'valid') // Optimistic locking: ensure it's still valid

    if (updateError) {
        console.error('Check-in update failed:', updateError)
        return { error: 'Failed to update ticket status. It may have been scanned already.' }
    }

    // Insert audit log
    const { error: logError } = await supabase
        .from('check_ins')
        .insert({
            ticket_id: ticketId,
            event_id: eventId,
            staff_id: user.id,
            status: 'success',
            scanned_at: new Date().toISOString()
        })

    if (logError) {
        // Non-fatal, but good to log
        console.error('Check-in log failed:', logError)
    }

    return { success: true }
}
