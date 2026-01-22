'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(eventId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated', success: false }
    }

    // Check if already favorited
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .single()

    if (existing) {
        // Remove from favorites
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('favorites')
            .delete()
            .eq('id', existing.id)

        if (error) {
            console.error('Error removing favorite:', error)
            return { error: 'Failed to remove from wishlist', success: false }
        }

        revalidatePath('/wishlist')
        revalidatePath('/events')
        return { success: true, action: 'removed' }
    } else {
        // Add to favorites
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('favorites')
            .insert({
                user_id: user.id,
                event_id: eventId,
            })

        if (error) {
            console.error('Error adding favorite:', error)
            return { error: 'Failed to add to wishlist', success: false }
        }

        revalidatePath('/wishlist')
        revalidatePath('/events')
        return { success: true, action: 'added' }
    }
}

export async function getFavorites() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { events: [], error: 'Not authenticated' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: favorites, error } = await (supabase as any)
        .from('favorites')
        .select(`
            id,
            created_at,
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
                status,
                ticket_types (
                    price
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching favorites:', error)
        return { events: [], error: 'Failed to load wishlist' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events = favorites?.map((f: any) => ({
        ...f.events,
        favoriteId: f.id,
        favoritedAt: f.created_at,
    })) || []

    return { events, error: null }
}

export async function getFavoriteIds() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: favorites } = await (supabase as any)
        .from('favorites')
        .select('event_id')
        .eq('user_id', user.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return favorites?.map((f: any) => f.event_id) || []
}

export async function isFavorited(eventId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .single()

    return !!data
}
