'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { generateTickets } from '@/lib/tickets'
import Stripe from 'stripe'

function getStripe(): Stripe {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set')
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        typescript: true,
    })
}

export async function verifyOrderAction(orderId: string) {
    console.log('[VerifyOrder] Checking order:', orderId)
    const supabase = createAdminClient()

    // 1. Fetch order
    const { data: order } = await (supabase
        .from('orders') as any)
        .select('*')
        .eq('id', orderId)
        .single()

    if (!order) return { success: false, error: 'Order not found' }

    // If already verified/completed
    if (order.status === 'completed') {
        // Check if tickets exist
        const { count } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', orderId)

        if (count && count > 0) return { success: true, message: 'Already verified' }
        // If status completed but no tickets, proceed to generation
    }

    if (!order.stripe_checkout_session_id) {
        return { success: false, error: 'No Stripe session found' }
    }

    // 2. Check Stripe
    try {
        const stripe = getStripe()
        const session = await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id)

        if (session.payment_status === 'paid') {
            console.log('[VerifyOrder] Payment confirmed. Generating tickets...')

            // 3. Update Order Status if needed
            if (order.status !== 'completed') {
                await (supabase
                    .from('orders') as any)
                    .update({
                        status: 'completed',
                        stripe_payment_intent_id: session.payment_intent as string,
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', orderId)
            }

            // 4. Generate Tickets
            const { data: orderItems } = await (supabase
                .from('order_items') as any)
                .select('ticket_type_id, quantity')
                .eq('order_id', orderId)

            if (orderItems && orderItems.length > 0) {
                await generateTickets(
                    supabase,
                    orderId,
                    order.event_id,
                    order.user_id,
                    orderItems,
                    session.customer_details?.email || session.customer_email
                )

                // Update ticket sold counts
                for (const item of orderItems) {
                    await (supabase.rpc as any)('increment_tickets_sold', {
                        p_ticket_type_id: item.ticket_type_id,
                        p_quantity: item.quantity,
                    })
                }
            }

            return { success: true, message: 'Tickets generated' }
        } else {
            console.log('[VerifyOrder] Payment not paid yet:', session.payment_status)
            return { success: false, error: 'Payment not completed' }
        }

    } catch (error) {
        console.error('[VerifyOrder] Error:', error)
        return { success: false, error: 'Verification failed' }
    }
}
