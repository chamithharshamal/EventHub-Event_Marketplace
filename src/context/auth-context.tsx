'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserData {
    id: string
    email: string
    full_name?: string | null
    role?: string
}

interface AuthContextType {
    user: UserData | null
    loading: boolean
    signOut: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (supabaseUser: SupabaseUser) => {
        const supabase = getSupabaseClient()

        // Set user immediately with basic info
        setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            full_name: supabaseUser.user_metadata?.full_name || 'User',
            role: 'user',
        })

        // Check metadata first (fastest)
        const metadataRole = supabaseUser.user_metadata?.role
        if (metadataRole) {
            console.log('[AuthContext] Role from metadata:', metadataRole)
            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email!,
                full_name: supabaseUser.user_metadata?.full_name,
                role: metadataRole
            })
            // Still try to fetch full profile for full_name if missing, but don't block
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', supabaseUser.id)
                    .single()
                if ((profile as any)?.full_name) {
                    setUser(prev => prev ? ({ ...prev, full_name: (profile as any).full_name }) : null)
                }
            } catch (e) { console.error('Background profile fetch failed', e) }
            return
        }

        // Fallback: Fetch full profile via RPC and table fallbacks
        try {
            console.log('[AuthContext] Fetching role via RPC...')
            const { data: roleData, error: roleError } = await supabase.rpc('get_user_role')
            console.log('[AuthContext] RPC Result:', roleData, roleError)

            let fullName = supabaseUser.user_metadata?.full_name

            // Try to fetch profile for name if needed (non-blocking for role)
            // We separate this so role isn't delayed by potential RLS hangs on table
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', supabaseUser.id)
                .single()

            if ((profile as any)?.full_name) {
                fullName = (profile as any).full_name
            }

            const role = (roleData as unknown as string) || 'user'

            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email!,
                full_name: fullName,
                role: role,
            })

            console.log('[AuthContext] Final User State:', { email: supabaseUser.email, role })

        } catch (err) {
            console.error('[AuthContext] Profile fetch error:', err)
        }
    }

    const refreshUser = async () => {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await fetchProfile(user)
        }
    }

    const signOut = async () => {
        const supabase = getSupabaseClient()
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        } finally {
            setUser(null)
            router.refresh()
        }
    }

    useEffect(() => {
        const supabase = getSupabaseClient()

        // Initial session check
        const checkSession = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await fetchProfile(user)
                }
            } catch (err) {
                console.error('[AuthContext] Initial session check error:', err)
            } finally {
                setLoading(false)
            }
        }

        checkSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AuthContext] Auth event:', event)

            if (session?.user) {
                await fetchProfile(session.user)
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
