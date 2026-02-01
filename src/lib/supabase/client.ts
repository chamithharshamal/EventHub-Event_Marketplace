import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('[Supabase] Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
        throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.')
    }

    supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

    return supabaseClient
}

// Alias for consistency with server.ts pattern
export function createClient() {
    return getSupabaseClient()
}
