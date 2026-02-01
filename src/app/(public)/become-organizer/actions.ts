'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function switchToOrganizer(userId: string, email: string) {
    const supabase = createAdminClient()

    console.log('[switchToOrganizer] Starting role switch for user:', userId)

    // 2. Grant 'organizer' role in profiles table (database level)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'organizer' } as any)
        .eq('id', userId)

    if (profileError) {
        console.error('Error updating profile role:', profileError)
        return { success: false, error: 'Failed to update user role' }
    }

    // 3. Sync role to auth.users metadata (session level)
    // This ensures getUser() returns the role immediately without DB queries
    // First, get the user to retrieve existing metadata
    const { data: userData, error: userFetchError } = await supabase.auth.admin.getUserById(userId);

    if (userFetchError || !userData?.user) {
        console.error('Error fetching user for metadata update:', userFetchError);
        // Don't fail, as profile is updated, but log the issue
    } else {
        const { error: authError } = await supabase.auth.admin.updateUserById(
            userId,
            { user_metadata: { ...userData.user.user_metadata, role: 'organizer' } }
        )

        if (authError) {
            console.error('Error syncing auth metadata:', authError)
            // detailed log but don't fail, as profile is updated
        }
    }

    console.log('[switchToOrganizer] Profile updated successfully')

    // Revalidate paths to reflect the role change
    revalidatePath('/dashboard')
    revalidatePath('/become-organizer')

    return { success: true }
}
