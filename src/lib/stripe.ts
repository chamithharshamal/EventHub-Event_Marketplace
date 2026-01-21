import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

// Lazy initialization to avoid build-time errors when env vars aren't set
export function getStripe(): Stripe {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not set')
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            typescript: true,
        })
    }
    return stripeInstance
}

// Keep the old export for backward compatibility (but it's now a getter)
export const stripe = {
    get instance() {
        return getStripe()
    }
}

export async function createCheckoutSession({
    eventId,
    items,
    customerEmail,
    successUrl,
    cancelUrl,
}: {
    eventId: string
    items: Array<{ ticketTypeId: string; name: string; price: number; quantity: number }>
    customerEmail: string
    successUrl: string
    cancelUrl: string
}) {
    const stripeClient = getStripe()

    const lineItems = items.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
    }))

    // Add service fee
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const serviceFee = Math.round(subtotal * 0.05 * 100) // 5% service fee in cents

    if (serviceFee > 0) {
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Service Fee',
                },
                unit_amount: serviceFee,
            },
            quantity: 1,
        })
    }

    const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: customerEmail,
        line_items: lineItems,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            eventId,
            items: JSON.stringify(items),
        },
    })

    return session
}

export async function constructWebhookEvent(
    payload: string | Buffer,
    signature: string
): Promise<Stripe.Event> {
    const stripeClient = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    return stripeClient.webhooks.constructEvent(payload, signature, webhookSecret)
}
