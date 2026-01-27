'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function switchToOrganizer(userId: string, email: string) {
    const supabase = await createClient()

    console.log('[switchToOrganizer] Starting role switch for user:', userId)

    // Update the profile role
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            email: email,
            role: 'organizer',
            updated_at: new Date().toISOString()
        } as any)

    if (profileError) {
        console.error('[switchToOrganizer] Profile update error:', profileError)
        return { success: false, error: profileError.message }
    }

    console.log('[switchToOrganizer] Profile updated successfully')

    // Revalidate paths to reflect the role change
    revalidatePath('/dashboard')
    revalidatePath('/become-organizer')

    return { success: true }
}
