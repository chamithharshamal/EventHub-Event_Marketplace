'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function getCurrentUser() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*, tenants(*)')
        .eq('id', user.id)
        .single()

    return {
        ...user,
        profile,
    }
}

export async function updateProfile(formData: {
    full_name?: string
    phone?: string
    avatar_url?: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from('profiles')
        .update(formData)
        .eq('id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating profile:', error)
        return { error: error.message }
    }

    return { data }
}

export async function createTenant(formData: {
    name: string
    email: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Create tenant
    const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tenant, error: tenantError } = await (supabase as any)
        .from('tenants')
        .insert({
            name: formData.name,
            slug,
            email: formData.email,
        })
        .select()
        .single()

    if (tenantError) {
        console.error('Error creating tenant:', tenantError)
        return { error: tenantError.message }
    }

    // Update user's profile with tenant_id and organizer role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
            tenant_id: tenant.id,
            role: 'organizer',
        })
        .eq('id', user.id)

    if (profileError) {
        console.error('Error updating profile:', profileError)
        return { error: profileError.message }
    }

    return { data: tenant }
}
