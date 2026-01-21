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

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { eventId, items } = body as {
            eventId: string
            items: Array<{ ticketTypeId: string; quantity: number }>
        }

        if (!eventId || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Fetch event and ticket types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: event, error: eventError } = await (supabase as any)
            .from('events')
            .select('*, ticket_types(*), tenants(name, stripe_account_id)')
            .eq('id', eventId)
            .single()

        if (eventError || !event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            )
        }

        // Validate ticket availability and calculate totals
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
        let subtotal = 0
        const orderItems: Array<{
            ticket_type_id: string
            quantity: number
            unit_price: number
            total: number
        }> = []

        for (const item of items) {
            const ticketType = event.ticket_types.find(
                (t: { id: string }) => t.id === item.ticketTypeId
            )

            if (!ticketType) {
                return NextResponse.json(
                    { error: `Ticket type ${item.ticketTypeId} not found` },
                    { status: 400 }
                )
            }

            const available = ticketType.quantity_total - ticketType.quantity_sold
            if (item.quantity > available) {
                return NextResponse.json(
                    { error: `Not enough tickets available for ${ticketType.name}` },
                    { status: 400 }
                )
            }

            if (item.quantity > ticketType.max_per_order) {
                return NextResponse.json(
                    { error: `Maximum ${ticketType.max_per_order} tickets per order for ${ticketType.name}` },
                    { status: 400 }
                )
            }

            const itemTotal = ticketType.price * item.quantity
            subtotal += itemTotal

            orderItems.push({
                ticket_type_id: ticketType.id,
                quantity: item.quantity,
                unit_price: ticketType.price,
                total: itemTotal,
            })

            // Only add to Stripe if price > 0
            if (ticketType.price > 0) {
                lineItems.push({
                    price_data: {
                        currency: ticketType.currency.toLowerCase(),
                        product_data: {
                            name: `${event.title} - ${ticketType.name}`,
                            description: ticketType.description || undefined,
                        },
                        unit_amount: Math.round(ticketType.price * 100), // Stripe uses cents
                    },
                    quantity: item.quantity,
                })
            }
        }

        // Calculate service fee (5%)
        const serviceFee = Math.round(subtotal * 0.05 * 100) / 100
        const total = subtotal + serviceFee

        // Create order in database
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: order, error: orderError } = await (supabase as any)
            .from('orders')
            .insert({
                user_id: user.id,
                event_id: eventId,
                subtotal,
                service_fee: serviceFee,
                total,
                currency: 'USD',
                status: 'pending',
            })
            .select()
            .single()

        if (orderError) {
            console.error('Error creating order:', orderError)
            return NextResponse.json(
                { error: 'Failed to create order' },
                { status: 500 }
            )
        }

        // Create order items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('order_items')
            .insert(
                orderItems.map((item) => ({
                    order_id: order.id,
                    ...item,
                }))
            )

        // Handle free orders
        if (total === 0) {
            // Update order to completed
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('orders')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', order.id)

            // Generate tickets immediately for free orders
            await generateTickets(supabase, order.id, eventId, user.id, orderItems)

            return NextResponse.json({
                success: true,
                orderId: order.id,
                free: true,
                redirectUrl: `/orders/${order.id}/confirmation`,
            })
        }

        // Add service fee as line item
        if (serviceFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Service Fee',
                        description: 'Platform service fee',
                    },
                    unit_amount: Math.round(serviceFee * 100),
                },
                quantity: 1,
            })
        }

        // Get Stripe instance (lazy initialization)
        const stripe = getStripe()

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}?canceled=true`,
            customer_email: user.email || undefined,
            metadata: {
                order_id: order.id,
                event_id: eventId,
                user_id: user.id,
            },
            // If the organizer has a Stripe Connect account, use it
            ...(event.tenants?.stripe_account_id && {
                payment_intent_data: {
                    application_fee_amount: Math.round(serviceFee * 100),
                    transfer_data: {
                        destination: event.tenants.stripe_account_id,
                    },
                },
            }),
        })

        // Update order with Stripe session ID
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('orders')
            .update({
                stripe_checkout_session_id: session.id,
            })
            .eq('id', order.id)

        return NextResponse.json({
            success: true,
            orderId: order.id,
            checkoutUrl: session.url,
        })
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
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

    const tickets = []

    for (const item of orderItems) {
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
        }
    }

    await supabase.from('tickets').insert(tickets)
}
