import { NextResponse } from 'next/server'
import { getAdminStats } from '@/app/actions/events'

export async function GET() {
    try {
        const stats = await getAdminStats()

        if (!stats) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
