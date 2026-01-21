'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { slugify, generateId } from '@/lib/utils'

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

    const { data, error } = await supabase
        .from('events')
        .update({ status: 'published' })
        .eq('id', eventId)
        .eq('organizer_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error publishing event:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/events')
    revalidatePath('/events')
    return { data }
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
