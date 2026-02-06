import { NextRequest, NextResponse } from 'next/server'
import { getAdminStats } from '@/app/actions/events'
import { getAdvancedStats } from '@/app/actions/admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const period = searchParams.get('period') as '7d' | '30d' | '90d' | 'all' | null
        const detailed = searchParams.get('detailed') === 'true'

        // If detailed stats requested, use the advanced stats function
        if (detailed) {
            const stats = await getAdvancedStats({ period: period || '30d' })

            if (!stats) {
                return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
            }

            return NextResponse.json(stats)
        }

        // Otherwise use basic stats (for backward compatibility)
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
