'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TicketType {
    id: string
    name: string
    price: number
    quantity_total: number
    quantity_sold: number
}

interface CheckoutButtonProps {
    eventId: string
    eventSlug: string
    ticketTypes: TicketType[]
    disabled?: boolean
}

export function CheckoutButton({ eventId, eventSlug, ticketTypes, disabled }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState<string>(ticketTypes[0]?.id || '')
    const [quantity, setQuantity] = useState(1)

    const handleCheckout = async () => {
        if (!selectedTicket) return

        setLoading(true)
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    items: [{ ticketTypeId: selectedTicket, quantity }],
                }),
            })

            const data = await res.json()

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl
            } else {
                console.error('Checkout failed:', data.error)
                alert(data.error || 'Checkout failed. Please try again.')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const availableTicket = ticketTypes.find(t => t.id === selectedTicket)
    const maxQuantity = availableTicket
        ? Math.min(10, availableTicket.quantity_total - availableTicket.quantity_sold)
        : 1

    return (
        <div className="space-y-4">
            {ticketTypes.length > 1 && (
                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-white">Select Ticket</label>
                    <select
                        value={selectedTicket}
                        onChange={(e) => setSelectedTicket(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        {ticketTypes.map((ticket) => {
                            const available = ticket.quantity_total - ticket.quantity_sold
                            return (
                                <option key={ticket.id} value={ticket.id} disabled={available === 0}>
                                    {ticket.name} - ${ticket.price} {available === 0 ? '(Sold Out)' : `(${available} left)`}
                                </option>
                            )
                        })}
                    </select>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-white">Quantity</label>
                <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                    {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
            </div>

            <Button
                className="w-full"
                size="lg"
                disabled={disabled || loading || !selectedTicket}
                onClick={handleCheckout}
            >
                {loading ? 'Processing...' : disabled ? 'Sold Out' : 'Get Tickets'}
            </Button>
        </div>
    )
}
