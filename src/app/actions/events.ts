'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { slugify, generateId } from '@/lib/utils'
import { sendEventApprovedEmail, sendEventRejectedEmail } from '@/lib/email'

export type EventFormData = {
    title: string
    description?: string
    category?: string
    venue_name?: string
    address?: string
    city?: string
    country?: string
    is_online?: boolean
    stream_url?: string
    start_date: string
    end_date: string
    timezone?: string
    banner_url?: string
    max_capacity?: number
    is_private?: boolean
    refund_policy?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any

export async function getEvents(options?: {
    status?: string
    category?: string
    city?: string
    limit?: number
    offset?: number
}) {
    const supabase = await createClient() as SupabaseAny

    let query = supabase
        .from('events')
        .select('*, ticket_types(*)')
        .order('start_date', { ascending: true })

    if (options?.status) {
        query = query.eq('status', options.status)
    }

    if (options?.category) {
        query = query.eq('category', options.category)
    }

    if (options?.city) {
        query = query.ilike('city', `%${options.city}%`)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching events:', error)
        return []
    }

    return data
}

export async function getPublishedEvents(options?: {
    category?: string
    city?: string
    search?: string
    limit?: number
}) {
    const supabase = await createClient() as SupabaseAny

    let query = supabase
        .from('events')
        .select('*, ticket_types(id, name, price, quantity_total, quantity_sold)')
        .eq('status', 'published')
        .eq('is_private', false)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true })

    if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category)
    }

    if (options?.city) {
        query = query.ilike('city', `%${options.city}%`)
    }

    if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching published events:', error)
        return []
    }

    return data
}

export async function getEventBySlug(tenantId: string, slug: string) {
    const supabase = await createClient() as SupabaseAny

    const { data, error } = await supabase
        .from('events')
        .select('*, ticket_types(*), profiles!events_organizer_id_fkey(full_name, avatar_url)')
        .eq('tenant_id', tenantId)
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching event:', error)
        return null
    }

    return data
}

export async function getEventById(eventId: string) {
    const supabase = await createClient() as SupabaseAny

    const { data, error } = await supabase
        .from('events')
        .select('*, ticket_types(*)')
        .eq('id', eventId)
        .single()

    if (error) {
        console.error('Error fetching event:', error)
        return null
    }

    return data
}

export async function getMyEvents() {
    const supabase = await createClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data, error } = await supabase
        .from('events')
        .select('*, ticket_types(id, name, price, quantity_total, quantity_sold)')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching my events:', error)
        return []
    }

    return data
}

// Enhanced create event action with tenant resolution and tickets
export async function createEventAction(
    formData: any,
    ticketTypes: any[],
    status: 'draft' | 'published'
) {
    const supabase = await createClient() as SupabaseAny

    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Get user's profile to get tenant_id
        let tenantId: string | null = null

        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        tenantId = profile?.tenant_id

        // Tenant Resolution: If no tenant_id, find or create one
        if (!tenantId) {
            // 1. Try to find any existing tenant
            const { data: tenants } = await supabase
                .from('tenants')
                .select('id')
                .eq('email', user.email)
                .limit(1)

            if (tenants && tenants.length > 0) {
                tenantId = tenants[0].id
            } else {
                // 2. Create a default tenant if none exists
                const { data: newTenant, error: createError } = await supabase
                    .from('tenants')
                    .insert([{
                        name: 'Default Organization',
                        slug: `org-${Date.now()}`,
                        email: user.email
                    }])
                    .select()
                    .single()

                if (createError) {
                    return { success: false, error: 'Failed to create organization' }
                }
                tenantId = newTenant.id
            }

            // 3. Update profile with the tenantId
            await supabase
                .from('profiles')
                .update({ tenant_id: tenantId })
                .eq('id', user.id)
        }

        // Generate slug
        const slugBase = slugify(formData.title || 'event')
        const eventSlug = `${slugBase}-${generateId().slice(0, 5)}`

        // Combine date and time into ISO strings
        const startTimestamp = `${formData.start_date}T${formData.start_time}:00Z`
        const endTimestamp = `${formData.end_date}T${formData.end_time}:00Z`

        const eventData = {
            title: formData.title,
            slug: eventSlug,
            description: formData.description || null,
            category: formData.category || null,
            venue_name: formData.venue_name || null,
            address: formData.address || null,
            city: formData.city || null,
            country: formData.country || null,
            is_online: formData.is_online,
            stream_url: formData.is_online ? formData.stream_url : null,
            start_date: startTimestamp,
            end_date: endTimestamp,
            timezone: formData.timezone,
            banner_url: formData.banner_url || null,
            max_capacity: formData.max_capacity ? parseInt(formData.max_capacity) : null,
            is_private: formData.is_private,
            refund_policy: formData.refund_policy || null,
            status: status === 'published' ? 'pending_approval' : status,
            organizer_id: user.id,
            tenant_id: tenantId,
        }

        const { data: event, error: eventError } = await supabase
            .from('events')
            .insert([eventData])
            .select()
            .single()

        if (eventError) {
            return { success: false, error: eventError.message }
        }

        // Insert tickets
        if (ticketTypes.length > 0 && event) {
            const ticketsToInsert = ticketTypes.map(t => ({
                event_id: event.id,
                name: t.name || 'General Admission',
                description: t.description || null,
                price: t.price || 0,
                quantity_total: t.quantity || 0,
                quantity_sold: 0,
                currency: 'USD'
            }))

            const { error: ticketError } = await supabase
                .from('ticket_types')
                .insert(ticketsToInsert)

            if (ticketError) {
                console.error('Ticket creation failed:', ticketError)
                return { success: true, eventId: event.id, warning: 'Event created but ticket creation failed' }
            }
        }

        revalidatePath('/dashboard/events')
        return { success: true, eventId: event.id }

    } catch (error: any) {
        console.error('Server action error:', error)
        return { success: false, error: error.message }
    }
}

export async function createEvent(formData: EventFormData) {
    const supabase = await createClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const slug = slugify(formData.title) + '-' + generateId().slice(0, 8)

    const eventData = {
        organizer_id: user.id,
        title: formData.title,
        slug,
        description: formData.description,
        category: formData.category,
        status: 'draft',
        venue_name: formData.venue_name,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        is_online: formData.is_online || false,
        stream_url: formData.stream_url,
        start_date: formData.start_date,
        end_date: formData.end_date,
        timezone: formData.timezone || 'UTC',
        banner_url: formData.banner_url,
        max_capacity: formData.max_capacity,
        is_private: formData.is_private || false,
        refund_policy: formData.refund_policy,
    }

    const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()

    if (error) {
        console.error('Error creating event:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/events')
    return { data }
}

export async function updateEvent(eventId: string, formData: Partial<EventFormData>) {
    const supabase = await createClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const updateData: Record<string, unknown> = { ...formData }

    // If title changed, update slug
    if (formData.title) {
        updateData.slug = slugify(formData.title) + '-' + generateId().slice(0, 8)
    }

    const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .eq('organizer_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating event:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/events')
    revalidatePath(`/dashboard/events/${eventId}`)
    return { data }
}

export async function publishEvent(eventId: string) {
    const supabase = await createClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Submit for approval instead of directly publishing
    const { data, error } = await supabase
        .from('events')
        .update({
            status: 'pending_approval',
            rejection_reason: null // Clear any previous rejection
        })
        .eq('id', eventId)
        .eq('organizer_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error submitting event for approval:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/events')
    return { data, message: 'Event submitted for approval' }
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('organizer_id', user.id)

    if (error) {
        console.error('Error deleting event:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/events')
    redirect('/dashboard/events')
}

// =============================================
// ADMIN FUNCTIONS
// =============================================

export async function isAdmin() {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    // Use admin client to bypass RLS and check role
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role === 'admin'
}

export async function getPendingEvents() {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Check if user is admin (use admin client to bypass RLS)
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return []
    }

    const { data: events, error } = await supabase
        .from('events')
        .select(`
            *,
            profiles!events_organizer_id_fkey (
                full_name,
                email,
                avatar_url
            )
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching pending events:', error)
        return []
    }

    return events
}

export async function approveEvent(eventId: string) {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Check if user is admin (use admin client to bypass RLS)
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
        .eq('id', eventId)
        .select(`
            *,
            profiles!events_organizer_id_fkey (
                full_name,
                email
            )
        `)
        .single()

    if (error) {
        console.error('Error approving event:', error)
        return { error: error.message }
    }

    // Send approval email to organizer
    if (data?.profiles?.email) {
        try {
            await sendEventApprovedEmail({
                to: data.profiles.email,
                organizerName: data.profiles.full_name || 'Organizer',
                eventTitle: data.title,
                eventSlug: data.slug
            })
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError)
        }
    }

    revalidatePath('/admin/events')
    revalidatePath('/events')
    revalidatePath('/dashboard/events')
    return { data }
}

export async function rejectEvent(eventId: string, reason: string) {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Check if user is admin (use admin client to bypass RLS)
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
        .eq('id', eventId)
        .select(`
            *,
            profiles!events_organizer_id_fkey (
                full_name,
                email
            )
        `)
        .single()

    if (error) {
        console.error('Error rejecting event:', error)
        return { error: error.message }
    }

    // Send rejection email to organizer
    if (data?.profiles?.email) {
        try {
            await sendEventRejectedEmail({
                to: data.profiles.email,
                organizerName: data.profiles.full_name || 'Organizer',
                eventTitle: data.title,
                rejectionReason: reason.trim()
            })
        } catch (emailError) {
            console.error('Failed to send rejection email:', emailError)
        }
    }

    revalidatePath('/admin/events')
    revalidatePath('/dashboard/events')
    return { data }
}

export async function getAdminStats() {
    const supabase = await createClient() as SupabaseAny
    const adminClient = createAdminClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Check if user is admin (use admin client to bypass RLS)
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return null
    }

    // Get counts
    const [pendingResult, publishedResult, usersResult] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact' }).eq('status', 'pending_approval'),
        supabase.from('events').select('id', { count: 'exact' }).eq('status', 'published'),
        supabase.from('profiles').select('id', { count: 'exact' })
    ])

    return {
        pendingEvents: pendingResult.count || 0,
        publishedEvents: publishedResult.count || 0,
        totalUsers: usersResult.count || 0
    }
}

