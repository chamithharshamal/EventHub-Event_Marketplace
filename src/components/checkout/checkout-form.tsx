'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Loader2, ShoppingCart, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface TicketType {
    id: string
    name: string
    description?: string
    price: number
    currency: string
    quantity_total: number
    quantity_sold: number
    max_per_order: number
    perks?: string[]
}

interface CheckoutFormProps {
    eventId: string
    eventSlug: string
    ticketTypes: TicketType[]
}

export function CheckoutForm({ eventId, eventSlug, ticketTypes }: CheckoutFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [quantities, setQuantities] = useState<Record<string, number>>(
        ticketTypes.reduce((acc, t) => ({ ...acc, [t.id]: 0 }), {})
    )

    const updateQuantity = (ticketTypeId: string, delta: number) => {
        const ticketType = ticketTypes.find(t => t.id === ticketTypeId)
        if (!ticketType) return

        const available = ticketType.quantity_total - ticketType.quantity_sold
        const maxAllowed = Math.min(available, ticketType.max_per_order)

        setQuantities(prev => {
            const newQty = Math.max(0, Math.min(maxAllowed, (prev[ticketTypeId] || 0) + delta))
            return { ...prev, [ticketTypeId]: newQty }
        })
    }

    const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
    const subtotal = ticketTypes.reduce((sum, t) => sum + (t.price * (quantities[t.id] || 0)), 0)
    const serviceFee = Math.round(subtotal * 0.05 * 100) / 100
    const total = subtotal + serviceFee

    const handleCheckout = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const items = Object.entries(quantities)
                .filter(([_, qty]) => qty > 0)
                .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }))

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, items }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Checkout failed')
            }

            if (data.free) {
                // Free order - redirect to confirmation
                router.push(data.redirectUrl)
            } else if (data.checkoutUrl) {
                // Redirect to Stripe Checkout
                window.location.href = data.checkoutUrl
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card variant="elevated">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Select Tickets
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                        {error}
                    </div>
                )}

                {ticketTypes.map((ticketType) => {
                    const available = ticketType.quantity_total - ticketType.quantity_sold
                    const soldOut = available === 0
                    const qty = quantities[ticketType.id] || 0

                    return (
                        <div
                            key={ticketType.id}
                            className={`rounded-lg border p-4 transition-colors ${soldOut
                                    ? 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900'
                                    : qty > 0
                                        ? 'border-violet-300 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/30'
                                        : 'border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-slate-900 dark:text-white">
                                            {ticketType.name}
                                        </h4>
                                        {soldOut && <Badge variant="secondary">Sold out</Badge>}
                                    </div>
                                    {ticketType.description && (
                                        <p className="text-sm text-slate-500 mt-1">
                                            {ticketType.description}
                                        </p>
                                    )}
                                    <p className="text-lg font-bold mt-2">
                                        {ticketType.price === 0 ? 'Free' : formatCurrency(ticketType.price)}
                                    </p>
                                    {!soldOut && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {available} available • Max {ticketType.max_per_order} per order
                                        </p>
                                    )}
                                </div>

                                {!soldOut && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(ticketType.id, -1)}
                                            disabled={qty === 0}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-8 text-center font-medium">{qty}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(ticketType.id, 1)}
                                            disabled={qty >= Math.min(available, ticketType.max_per_order)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {/* Order Summary */}
                {totalItems > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">
                                Subtotal ({totalItems} ticket{totalItems > 1 ? 's' : ''})
                            </span>
                            <span className="text-slate-900 dark:text-white">
                                {formatCurrency(subtotal)}
                            </span>
                        </div>
                        {serviceFee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Service Fee</span>
                                <span className="text-slate-900 dark:text-white">
                                    {formatCurrency(serviceFee)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                )}

                <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={totalItems === 0 || isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : totalItems === 0 ? (
                        'Select Tickets'
                    ) : (
                        <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {total === 0 ? 'Get Free Tickets' : `Checkout ${formatCurrency(total)}`}
                        </>
                    )}
                </Button>

                <p className="text-xs text-center text-slate-500">
                    Secure checkout powered by Stripe
                </p>
            </CardContent>
        </Card>
    )
}
