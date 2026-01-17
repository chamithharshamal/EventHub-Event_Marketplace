import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startOfDay, subDays, format } from 'date-fns'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        // Parse query params
        const searchParams = request.nextUrl.searchParams
        const range = searchParams.get('range') || '7d' // 7d, 30d, 90d
        const eventId = searchParams.get('eventId')

        // Determine date range
        let startDate = new Date()
        switch (range) {
            case '30d':
                startDate = subDays(new Date(), 30)
                break
            case '90d':
                startDate = subDays(new Date(), 90)
                break
            case '7d':
            default:
                startDate = subDays(new Date(), 7)
        }

        // Fetch orders
        let query = supabase
            .from('orders')
            .select('created_at, total, status, event_id, events(title)')
            .eq('status', 'completed')
            .gte('created_at', startOfDay(startDate).toISOString())

        // Filter by user (organizer) through events
        // This part is tricky with Supabase basic queries if we want orders for ALL events owned by user
        // easier to first get all event IDs owned by user
        const { data: userEvents } = await supabase
            .from('events')
            .select('id')
            .eq('organizer_id', user.id)

        if (!userEvents || userEvents.length === 0) {
            return NextResponse.json({
                totalRevenue: 0,
                totalOrders: 0,
                totalTickets: 0,
                salesData: [],
                topEvents: []
            })
        }

        const userEventIds = (userEvents || []).map((e: { id: string }) => e.id)

        if (eventId) {
            if (!userEventIds.includes(eventId)) {
                return NextResponse.json({ error: 'Unauthorized event access' }, { status: 403 })
            }
            query = query.eq('event_id', eventId)
        } else {
            query = query.in('event_id', userEventIds)
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: orders, error } = await (query as any)

        if (error) throw error

        // Aggregate Data
        const salesMap = new Map<string, number>()
        let totalRevenue = 0
        let totalOrders = 0

        // Initialize map with 0s for all days in range
        const days = range === '90d' ? 90 : range === '30d' ? 30 : 7
        for (let i = 0; i <= days; i++) {
            const dateStr = format(subDays(new Date(), i), 'MMM dd')
            salesMap.set(dateStr, 0)
        }

        orders.forEach((order: any) => {
            const dateStr = format(new Date(order.created_at), 'MMM dd')
            // Only valid if within our pre-generated map (which it should be due to query)
            if (salesMap.has(dateStr)) {
                salesMap.set(dateStr, (salesMap.get(dateStr) || 0) + order.total)
            } else {
                // Handle edge cases or timezone offsets slightly outside
                // Just ignore or add to closest? For simple charts, exact day matching matches chart labels
            }
            totalRevenue += order.total
            totalOrders++
        })

        // Convert map to array and reverse (oldest to newest)
        const salesData = Array.from(salesMap.entries())
            .map(([name, value]) => ({ name, value }))
            .reverse()


        // Top selling events
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eventSalesMap = new Map<string, { name: string, value: number }>()

        orders.forEach((order: any) => {
            const eventTitle = order.events?.title || 'Unknown Event'
            if (!eventSalesMap.has(eventTitle)) {
                eventSalesMap.set(eventTitle, { name: eventTitle, value: 0 })
            }
            const current = eventSalesMap.get(eventTitle)!
            current.value += order.total
            eventSalesMap.set(eventTitle, current)
        })

        const topEvents = Array.from(eventSalesMap.values())
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)

        return NextResponse.json({
            totalRevenue,
            totalOrders,
            salesData,
            topEvents
        })

    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
