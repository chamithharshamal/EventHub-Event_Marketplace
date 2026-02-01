import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { generateTickets } from '@/lib/tickets'

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

    const supabase = createAdminClient()

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



                // ... existing code ...

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

// Helper function removed - imported from @/lib/tickets
