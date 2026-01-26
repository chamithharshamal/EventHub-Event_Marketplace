import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient
    }

    supabaseClient = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    return supabaseClient
}

// Alias for consistency with server.ts pattern
export function createClient() {
    return getSupabaseClient()
}
