'use server'

import { createClient } from '@/lib/supabase/server'

export type TicketTypeFormData = {
    event_id: string
    name: string
    description?: string
    price: number
    currency?: string
    quantity_total: number
    max_per_order?: number
    sales_start?: string
    sales_end?: string
    is_transferable?: boolean
    perks?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any

export async function getTicketTypes(eventId: string) {
    const supabase = await createClient() as SupabaseAny

    const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true })

    if (error) {
        console.error('Error fetching ticket types:', error)
        return []
    }

    return data
}

export async function createTicketType(formData: TicketTypeFormData) {
    const supabase = await createClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Verify user owns the event
    const { data: event } = await supabase
        .from('events')
        .select('id')
        .eq('id', formData.event_id)
        .eq('organizer_id', user.id)
        .single()

    if (!event) {
        return { error: 'Event not found or unauthorized' }
    }

    const ticketData = {
        event_id: formData.event_id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        currency: formData.currency || 'USD',
        quantity_total: formData.quantity_total,
        max_per_order: formData.max_per_order || 10,
        sales_start: formData.sales_start,
        sales_end: formData.sales_end,
        is_transferable: formData.is_transferable ?? true,
        perks: formData.perks || [],
    }

    const { data, error } = await supabase
        .from('ticket_types')
        .insert(ticketData)
        .select()
        .single()

    if (error) {
        console.error('Error creating ticket type:', error)
        return { error: error.message }
    }

    return { data }
}

export async function updateTicketType(
    ticketTypeId: string,
    formData: Partial<TicketTypeFormData>
) {
    const supabase = await createClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { data, error } = await supabase
        .from('ticket_types')
        .update(formData)
        .eq('id', ticketTypeId)
        .select()
        .single()

    if (error) {
        console.error('Error updating ticket type:', error)
        return { error: error.message }
    }

    return { data }
}

export async function deleteTicketType(ticketTypeId: string) {
    const supabase = await createClient() as SupabaseAny

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', ticketTypeId)

    if (error) {
        console.error('Error deleting ticket type:', error)
        return { error: error.message }
    }

    return { success: true }
}
