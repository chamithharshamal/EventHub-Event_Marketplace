'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadAvatarAction(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) {
        return { error: 'No file provided', url: null }
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated', url: null }
    }

    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        // Convert File to ArrayBuffer for server-side upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return { error: uploadError.message, url: null }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)

        return { error: null, url: publicUrl }
    } catch (err) {
        console.error('Server upload error:', err)
        return { error: 'Upload failed', url: null }
    }
}
