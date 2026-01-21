import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Lazy initialization to avoid build-time errors
function getStripe(): Stripe {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set')
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        typescript: true,
    })
}

function getWebhookSecret(): string {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }
    return process.env.STRIPE_WEBHOOK_SECRET
}

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret())
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 }
        )
    }

    const supabase = await createClient()

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                const orderId = session.metadata?.order_id
                const eventId = session.metadata?.event_id
                const userId = session.metadata?.user_id
                const customerEmail = session.customer_details?.email || session.customer_email

                if (!orderId || !eventId || !userId) {
                    console.error('Missing metadata in checkout session')
                    break
                }

                // Update order status
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any)
                    .from('orders')
                    .update({
                        status: 'completed',
                        stripe_payment_intent_id: session.payment_intent as string,
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', orderId)

                // Get order items
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: orderItems } = await (supabase as any)
                    .from('order_items')
                    .select('ticket_type_id, quantity')
                    .eq('order_id', orderId)

                if (orderItems && orderItems.length > 0) {
                    // Generate tickets and send emails
                    await generateTickets(supabase, orderId, eventId, userId, orderItems, customerEmail)

                    // Update ticket sold counts
                    for (const item of orderItems) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (supabase as any).rpc('increment_tickets_sold', {
                            p_ticket_type_id: item.ticket_type_id,
                            p_quantity: item.quantity,
                        })
                    }
                }

                console.log(`Order ${orderId} completed successfully`)
                break
            }

            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session
                const orderId = session.metadata?.order_id

                if (orderId) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase as any)
                        .from('orders')
                        .update({ status: 'failed' })
                        .eq('id', orderId)
                }
                break
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                console.log(`Payment failed for intent ${paymentIntent.id}`)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook handler error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}

// Helper function to generate tickets and send emails
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateTickets(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any,
    orderId: string,
    eventId: string,
    userId: string,
    orderItems: Array<{
        ticket_type_id: string
        quantity: number
    }>,
    customerEmail?: string | null
) {
    const { generateQRCodeData, signQRCode, generateQRCodeImage } = await import('@/lib/qr')
    const { sendEmail, generateTicketEmailHtml } = await import('@/lib/email')

    // Get event details
    const { data: event } = await supabase
        .from('events')
        .select('title')
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
        ticketTypes?.map((t: any) => [t.id, t.name]) || []
    )

    for (const item of orderItems) {
        const ticketTypeName = ticketTypeMap.get(item.ticket_type_id) || 'Ticket'

        for (let i = 0; i < item.quantity; i++) {
            const ticketId = crypto.randomUUID()
            const qrData = generateQRCodeData(ticketId, eventId)
            const qrSignature = signQRCode(qrData)

            tickets.push({
                id: ticketId,
                event_id: eventId,
                ticket_type_id: item.ticket_type_id,
                order_id: orderId,
                user_id: userId,
                status: 'valid',
                qr_code_data: qrData,
                qr_signature: qrSignature,
            })

            // Queue email sending
            if (customerEmail) {
                emailPromises.push(async () => {
                    try {
                        const qrImage = await generateQRCodeImage(qrData)
                        const html = generateTicketEmailHtml(
                            event.title,
                            ticketTypeName,
                            qrImage,
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

    // Insert tickets first
    await supabase.from('tickets').insert(tickets)

    // Send emails in background (wait for them but catch errors so webhook succeeds)
    if (emailPromises.length > 0) {
        await Promise.all(emailPromises.map(fn => fn()))
    }
}
