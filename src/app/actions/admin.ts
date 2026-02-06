'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any

// =============================================
// ADMIN AUTHENTICATION
// =============================================

export async function isAdmin() {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role === 'admin'
}

// =============================================
// USER MANAGEMENT
// =============================================

export interface UserFilters {
    search?: string
    role?: 'admin' | 'organizer' | 'staff' | 'attendee' | 'all'
    status?: 'active' | 'suspended' | 'all'
    page?: number
    limit?: number
}

export interface UserData {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: 'admin' | 'organizer' | 'staff' | 'attendee'
    created_at: string
    updated_at: string
    is_suspended?: boolean
    tenant_id: string | null
    _count?: {
        events: number
        orders: number
        tickets: number
    }
}

export async function getUsers(filters: UserFilters = {}) {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { users: [], total: 0 }

    // Verify admin status
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { users: [], total: 0, error: 'Not authorized' }
    }

    const { search, role, page = 1, limit = 20 } = filters
    const offset = (page - 1) * limit

    // Build query
    let query = adminClient
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (role && role !== 'all') {
        query = query.eq('role', role)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: users, count, error } = await query

    if (error) {
        console.error('Error fetching users:', error)
        return { users: [], total: 0, error: error.message }
    }

    // Fetch counts for each user (events, orders, tickets)
    const usersWithCounts = await Promise.all(
        (users || []).map(async (userData: UserData) => {
            const [eventsResult, ordersResult, ticketsResult] = await Promise.all([
                adminClient.from('events').select('id', { count: 'exact' }).eq('organizer_id', userData.id),
                adminClient.from('orders').select('id', { count: 'exact' }).eq('user_id', userData.id),
                adminClient.from('tickets').select('id', { count: 'exact' }).eq('user_id', userData.id)
            ])

            return {
                ...userData,
                _count: {
                    events: eventsResult.count || 0,
                    orders: ordersResult.count || 0,
                    tickets: ticketsResult.count || 0
                }
            }
        })
    )

    return { users: usersWithCounts, total: count || 0 }
}

export async function getUserById(userId: string) {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify admin status
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Not authorized' }
    }

    const { data, error } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        return { error: error.message }
    }

    // Get user's activity counts
    const [eventsResult, ordersResult, ticketsResult] = await Promise.all([
        adminClient.from('events').select('id, title, status', { count: 'exact' }).eq('organizer_id', userId).limit(5),
        adminClient.from('orders').select('id, total, status, created_at', { count: 'exact' }).eq('user_id', userId).limit(5),
        adminClient.from('tickets').select('id, status', { count: 'exact' }).eq('user_id', userId)
    ])

    return {
        user: {
            ...data,
            _count: {
                events: eventsResult.count || 0,
                orders: ordersResult.count || 0,
                tickets: ticketsResult.count || 0
            },
            recentEvents: eventsResult.data || [],
            recentOrders: ordersResult.data || []
        }
    }
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'organizer' | 'staff' | 'attendee') {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify admin status
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Not authorized' }
    }

    // Prevent self-demotion
    if (userId === user.id && newRole !== 'admin') {
        return { error: 'Cannot demote yourself' }
    }

    const { data, error } = await adminClient
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error updating user role:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { data }
}

export async function toggleUserSuspension(userId: string, suspend: boolean) {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify admin status
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Not authorized' }
    }

    // Prevent self-suspension
    if (userId === user.id) {
        return { error: 'Cannot suspend yourself' }
    }

    // Note: This requires an 'is_suspended' column in profiles table
    // If it doesn't exist, this will gracefully fail
    const { data, error } = await adminClient
        .from('profiles')
        .update({ is_suspended: suspend, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error toggling user suspension:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { data, message: suspend ? 'User suspended' : 'User activated' }
}

// =============================================
// PLATFORM ANALYTICS
// =============================================

export interface AnalyticsPeriod {
    period: '7d' | '30d' | '90d' | 'all'
}

export async function getAdvancedStats(options: AnalyticsPeriod = { period: '30d' }) {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Verify admin status
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return null
    }

    // Calculate date range
    const now = new Date()
    let startDate: Date | null = null
    switch (options.period) {
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
        case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
        case 'all':
            startDate = null
            break
    }

    const dateFilter = startDate ? startDate.toISOString() : null

    // Parallel queries for performance
    const queries: Promise<any>[] = [
        // Total counts
        adminClient.from('events').select('id', { count: 'exact' }).eq('status', 'pending_approval'),
        adminClient.from('events').select('id', { count: 'exact' }).eq('status', 'published'),
        adminClient.from('profiles').select('id', { count: 'exact' }),
        adminClient.from('orders').select('id', { count: 'exact' }).eq('status', 'completed'),
        adminClient.from('tickets').select('id', { count: 'exact' }),
    ]

    // Revenue query
    if (dateFilter) {
        queries.push(
            adminClient.from('orders')
                .select('total')
                .eq('status', 'completed')
                .gte('created_at', dateFilter)
        )
    } else {
        queries.push(
            adminClient.from('orders')
                .select('total')
                .eq('status', 'completed')
        )
    }

    // New users in period
    if (dateFilter) {
        queries.push(
            adminClient.from('profiles')
                .select('id', { count: 'exact' })
                .gte('created_at', dateFilter)
        )
    }

    // Top events by ticket sales
    queries.push(
        adminClient.from('events')
            .select('id, title, ticket_types(quantity_sold)')
            .eq('status', 'published')
            .limit(5)
    )

    // Recent orders
    queries.push(
        adminClient.from('orders')
            .select('id, total, status, created_at, event_id, events(title)')
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(10)
    )

    const results = await Promise.all(queries)

    const [
        pendingResult,
        publishedResult,
        usersResult,
        ordersResult,
        ticketsResult,
        revenueResult,
        newUsersResult,
        topEventsResult,
        recentOrdersResult
    ] = results

    // Calculate total revenue
    const totalRevenue = (revenueResult.data || []).reduce(
        (sum: number, order: { total: number }) => sum + (order.total || 0),
        0
    )

    // Calculate tickets sold from top events
    const topEvents = (topEventsResult.data || []).map((event: any) => {
        const ticketsSold = (event.ticket_types || []).reduce(
            (sum: number, tt: { quantity_sold: number }) => sum + (tt.quantity_sold || 0),
            0
        )
        return {
            id: event.id,
            title: event.title,
            ticketsSold
        }
    }).sort((a: any, b: any) => b.ticketsSold - a.ticketsSold)

    return {
        overview: {
            pendingEvents: pendingResult.count || 0,
            publishedEvents: publishedResult.count || 0,
            totalUsers: usersResult.count || 0,
            totalOrders: ordersResult.count || 0,
            totalTickets: ticketsResult.count || 0,
            totalRevenue,
            newUsers: newUsersResult?.count || 0
        },
        topEvents,
        recentOrders: (recentOrdersResult.data || []).map((order: any) => ({
            id: order.id,
            total: order.total,
            status: order.status,
            createdAt: order.created_at,
            eventTitle: order.events?.title || 'Unknown Event'
        })),
        period: options.period
    }
}

// =============================================
// BULK ACTIONS
// =============================================

export async function bulkApproveEvents(eventIds: string[]) {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify admin status
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Not authorized' }
    }

    const { data, error } = await adminClient
        .from('events')
        .update({
            status: 'published',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            rejection_reason: null
        })
        .in('id', eventIds)
        .select()

    if (error) {
        console.error('Error bulk approving events:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/events')
    revalidatePath('/events')
    return { data, count: data?.length || 0 }
}

export async function bulkRejectEvents(eventIds: string[], reason: string) {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify admin status
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Not authorized' }
    }

    if (!reason || reason.trim() === '') {
        return { error: 'Rejection reason is required' }
    }

    const { data, error } = await adminClient
        .from('events')
        .update({
            status: 'rejected',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            rejection_reason: reason.trim()
        })
        .in('id', eventIds)
        .select()

    if (error) {
        console.error('Error bulk rejecting events:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/events')
    return { data, count: data?.length || 0 }
}

// =============================================
// ALL EVENTS (for moderation view)
// =============================================

export interface EventFilters {
    status?: 'pending_approval' | 'published' | 'rejected' | 'draft' | 'all'
    search?: string
    page?: number
    limit?: number
}

export async function getAllEvents(filters: EventFilters = {}) {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { events: [], total: 0 }

    // Verify admin status
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { events: [], total: 0, error: 'Not authorized' }
    }

    const { status, search, page = 1, limit = 20 } = filters
    const offset = (page - 1) * limit

    let query = adminClient
        .from('events')
        .select(`
            *,
            profiles!events_organizer_id_fkey (
                full_name,
                email,
                avatar_url
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: events, count, error } = await query

    if (error) {
        console.error('Error fetching all events:', error)
        return { events: [], total: 0, error: error.message }
    }

    return { events: events || [], total: count || 0 }
}
