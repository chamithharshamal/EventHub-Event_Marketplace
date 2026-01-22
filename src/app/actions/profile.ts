'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ProfileUpdateData {
    full_name?: string
    username?: string
    bio?: string
    location?: string
    website?: string
    is_public?: boolean
    avatar_url?: string
}

export async function getPublicProfile(username: string) {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, username, bio, avatar_url, location, website, is_public, created_at')
        .eq('username', username)
        .single()

    if (error || !profile) {
        return { profile: null, error: 'Profile not found' }
    }

    // Check if profile is public or belongs to current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!profile.is_public && (!user || user.id !== profile.id)) {
        return { profile: null, error: 'This profile is private' }
    }

    return { profile, error: null }
}

export async function getAttendedEvents(userId: string, isOwnProfile: boolean = false) {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // Get events the user has tickets for
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tickets, error } = await (supabase as any)
        .from('tickets')
        .select(`
            id,
            status,
            events (
                id,
                title,
                slug,
                description,
                banner_url,
                category,
                city,
                country,
                start_date,
                end_date,
                status,
                ticket_types (
                    price
                )
            )
        `)
        .eq('user_id', userId)
        .in('status', ['valid', 'used'])

    if (error) {
        console.error('Error fetching attended events:', error)
        return { upcoming: [], past: [] }
    }

    // Extract unique events
    const eventsMap = new Map()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tickets?.forEach((ticket: any) => {
        if (ticket.events && !eventsMap.has(ticket.events.id)) {
            eventsMap.set(ticket.events.id, {
                ...ticket.events,
                ticketStatus: ticket.status
            })
        }
    })

    const events = Array.from(eventsMap.values())

    // Split into upcoming and past
    const upcoming = events
        .filter(e => new Date(e.start_date) >= new Date())
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

    const past = events
        .filter(e => new Date(e.start_date) < new Date())
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

    // If not own profile, only show past events (privacy)
    if (!isOwnProfile) {
        return { upcoming: [], past }
    }

    return { upcoming, past }
}

export async function getCurrentUserProfile() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { profile: null, error: 'Not authenticated' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return { profile: null, error: 'Failed to load profile' }
    }

    return { profile, error: null }
}

export async function updateProfile(data: ProfileUpdateData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated', success: false }
    }

    // Validate username if provided
    if (data.username) {
        // Check format
        if (!/^[a-z0-9-]+$/.test(data.username)) {
            return { error: 'Username can only contain lowercase letters, numbers, and hyphens', success: false }
        }
        if (data.username.length < 3 || data.username.length > 30) {
            return { error: 'Username must be between 3 and 30 characters', success: false }
        }

        // Check uniqueness
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('username', data.username)
            .neq('id', user.id)
            .single()

        if (existing) {
            return { error: 'This username is already taken', success: false }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('profiles')
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: 'Failed to update profile', success: false }
    }

    revalidatePath('/dashboard/settings')
    if (data.username) {
        revalidatePath(`/profile/${data.username}`)
    }

    return { error: null, success: true }
}

export async function checkUsernameAvailable(username: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

    // Available if not exists or belongs to current user
    return !existing || (user && existing.id === user.id)
}
