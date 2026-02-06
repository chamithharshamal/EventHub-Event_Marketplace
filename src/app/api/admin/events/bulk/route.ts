import { NextRequest, NextResponse } from 'next/server'
import { bulkApproveEvents, bulkRejectEvents } from '@/app/actions/admin'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, eventIds, reason } = body

        if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
            return NextResponse.json({ error: 'Event IDs are required' }, { status: 400 })
        }

        if (!action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 })
        }

        let result

        if (action === 'approve') {
            result = await bulkApproveEvents(eventIds)
        } else if (action === 'reject') {
            if (!reason || reason.trim() === '') {
                return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
            }
            result = await bulkRejectEvents(eventIds, reason)
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${result.count} events`
        })
    } catch (error) {
        console.error('Bulk admin action error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
