'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinWaitlist(eventId: string, email?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to join the waitlist', success: false }
    }

    // Check if already on waitlist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
        .from('waitlist')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()

    if (existing) {
        return { error: 'You are already on the waitlist', success: false }
    }

    // Get next position
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: maxPosition } = await (supabase as any)
        .from('waitlist')
        .select('position')
        .eq('event_id', eventId)
        .order('position', { ascending: false })
        .limit(1)
        .single()

    const nextPosition = (maxPosition?.position || 0) + 1

    // Get user email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

    // Add to waitlist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('waitlist')
        .insert({
            event_id: eventId,
            user_id: user.id,
            email: email || profile?.email || user.email,
            position: nextPosition,
            status: 'waiting',
        })

    if (error) {
        console.error('Error joining waitlist:', error)
        return { error: 'Failed to join waitlist', success: false }
    }

    revalidatePath(`/events`)
    return { success: true, position: nextPosition }
}

export async function leaveWaitlist(eventId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated', success: false }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('waitlist')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error leaving waitlist:', error)
        return { error: 'Failed to leave waitlist', success: false }
    }

    revalidatePath(`/events`)
    return { success: true }
}

export async function getWaitlistStatus(eventId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { isOnWaitlist: false, position: null }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: entry } = await (supabase as any)
        .from('waitlist')
        .select('id, position, status, created_at')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()

    if (!entry) {
        return { isOnWaitlist: false, position: null }
    }

    // Get total waitlist count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
        .from('waitlist')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'waiting')

    return {
        isOnWaitlist: true,
        position: entry.position,
        status: entry.status,
        totalWaiting: count || 0,
        joinedAt: entry.created_at,
    }
}

export async function getEventWaitlist(eventId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { waitlist: [], error: 'Not authenticated' }
    }

    // Verify user is the organizer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: event } = await (supabase as any)
        .from('events')
        .select('organizer_id')
        .eq('id', eventId)
        .single()

    if (!event || event.organizer_id !== user.id) {
        return { waitlist: [], error: 'Not authorized' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: waitlist, error } = await (supabase as any)
        .from('waitlist')
        .select(`
            id,
            position,
            email,
            status,
            notified_at,
            created_at,
            profiles (
                id,
                full_name,
                avatar_url
            )
        `)
        .eq('event_id', eventId)
        .order('position', { ascending: true })

    if (error) {
        console.error('Error fetching waitlist:', error)
        return { waitlist: [], error: 'Failed to load waitlist' }
    }

    return { waitlist: waitlist || [], error: null }
}

export async function getWaitlistCount(eventId: string) {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
        .from('waitlist')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'waiting')

    return count || 0
}
