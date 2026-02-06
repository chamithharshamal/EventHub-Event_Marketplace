import { NextRequest, NextResponse } from 'next/server'
import { getPendingEvents, approveEvent, rejectEvent } from '@/app/actions/events'
import { getAllEvents } from '@/app/actions/admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status') as 'pending_approval' | 'published' | 'rejected' | 'draft' | 'all' | null
        const search = searchParams.get('search') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')

        // If status filter is provided (or 'all'), use the new getAllEvents function
        if (status) {
            const result = await getAllEvents({ status, search, page, limit })
            if (result.error) {
                return NextResponse.json({ error: result.error }, { status: 403 })
            }
            return NextResponse.json(result)
        }

        // Default: get pending events only (backward compatibility)
        const events = await getPendingEvents()
        return NextResponse.json({ events })
    } catch (error) {
        console.error('Admin events error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, eventId, reason } = body

        if (!eventId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        let result

        if (action === 'approve') {
            result = await approveEvent(eventId)
        } else if (action === 'reject') {
            if (!reason) {
                return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
            }
            result = await rejectEvent(eventId, reason)
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json({ success: true, event: result.data })
    } catch (error) {
        console.error('Admin action error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
