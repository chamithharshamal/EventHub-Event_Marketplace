import { NextRequest, NextResponse } from 'next/server'
import { getUsers, updateUserRole, toggleUserSuspension } from '@/app/actions/admin'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get('search') || undefined
        const role = searchParams.get('role') as 'admin' | 'organizer' | 'staff' | 'attendee' | 'all' | undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        const result = await getUsers({ search, role, page, limit })

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 403 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Admin users GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, action, role, suspend } = body

        if (!userId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        let result

        if (action === 'updateRole') {
            if (!role) {
                return NextResponse.json({ error: 'Role is required' }, { status: 400 })
            }
            result = await updateUserRole(userId, role)
        } else if (action === 'toggleSuspension') {
            result = await toggleUserSuspension(userId, suspend)
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json({ success: true, data: result.data, message: (result as { message?: string }).message })
    } catch (error) {
        console.error('Admin users PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
