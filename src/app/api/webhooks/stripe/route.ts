import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
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
                    // Generate tickets
                    await generateTickets(supabase, orderId, eventId, userId, orderItems)

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

// Helper function to generate tickets
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
    }>
) {
    const { generateQRCodeData, signQRCode } = await import('@/lib/qr')

    // Get event tenant_id
    const { data: event } = await supabase
        .from('events')
        .select('tenant_id')
        .eq('id', eventId)
        .single()

    if (!event) return

    const tickets = []

    for (const item of orderItems) {
        for (let i = 0; i < item.quantity; i++) {
            const ticketId = crypto.randomUUID()
            const qrData = generateQRCodeData(ticketId, eventId)
            const qrSignature = signQRCode(qrData)

            tickets.push({
                id: ticketId,
                tenant_id: event.tenant_id,
                event_id: eventId,
                ticket_type_id: item.ticket_type_id,
                order_id: orderId,
                user_id: userId,
                status: 'valid',
                qr_code_data: qrData,
                qr_signature: qrSignature,
            })
        }
    }

    await supabase.from('tickets').insert(tickets)
}
