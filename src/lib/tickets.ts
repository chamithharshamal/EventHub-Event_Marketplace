
import { SupabaseClient } from '@supabase/supabase-js'

export async function generateTickets(
    supabase: SupabaseClient,
    orderId: string,
    eventId: string,
    userId: string,
    orderItems: Array<{
        ticket_type_id: string
        quantity: number
    }>,
    customerEmail?: string | null
) {
    const { generateTicketQR } = await import('@/lib/qr')
    const { sendEmail, generateTicketEmailHtml } = await import('@/lib/email')

    // Get event details
    const { data: event } = await supabase
        .from('events')
        .select('title, tenant_id, end_date')
        .eq('id', eventId)
        .single()

    if (!event) return

    const tickets = []
    const emailPromises = []

    // Get ticket types for names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ticketTypes } = await (supabase as any)
        .from('ticket_types')
        .select('id, name')
        .in('id', orderItems.map(i => i.ticket_type_id))

    const ticketTypeMap = new Map<string, string>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ticketTypes?.map((t: any) => [t.id, t.name] as [string, string]) || []
    )

    for (const item of orderItems) {
        const ticketTypeName = ticketTypeMap.get(item.ticket_type_id) || 'Ticket'

        for (let i = 0; i < item.quantity; i++) {
            const ticketId = crypto.randomUUID()

            // Generate secure QR code
            const { qrCodeData, qrSignature, qrImageDataUrl } = await generateTicketQR(
                ticketId,
                eventId,
                event.tenant_id,
                new Date(event.end_date)
            )

            tickets.push({
                id: ticketId,
                event_id: eventId,
                ticket_type_id: item.ticket_type_id,
                order_id: orderId,
                user_id: userId,
                status: 'valid',
                qr_code_data: qrCodeData, // Now storing the full securely signed JSON payload
                qr_signature: qrSignature,
                tenant_id: event.tenant_id // Ensure tenant_id is included
            })

            // Queue email sending
            if (customerEmail) {
                emailPromises.push(async () => {
                    try {
                        const html = generateTicketEmailHtml(
                            event.title,
                            ticketTypeName,
                            qrImageDataUrl,
                            orderId
                        )
                        await sendEmail({
                            to: customerEmail,
                            subject: `Your Ticket for ${event.title}`,
                            html,
                        })
                    } catch (error) {
                        console.error('Failed to send email for ticket:', ticketId, error)
                    }
                })
            }
        }
    }

    // Insert tickets
    if (tickets.length > 0) {
        const { error } = await supabase.from('tickets').insert(tickets)
        if (error) throw error
    }

    // Send emails in background (wait for them but catch errors)
    if (emailPromises.length > 0) {
        await Promise.all(emailPromises.map(fn => fn()))
    }
}
