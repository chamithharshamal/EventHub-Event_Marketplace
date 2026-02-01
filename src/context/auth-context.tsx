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

        // Fetch full profile
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', supabaseUser.id)
                .single()

            if (profile) {
                setUser({
                    id: supabaseUser.id,
                    email: supabaseUser.email!,
                    full_name: (profile as any)?.full_name || supabaseUser.user_metadata?.full_name,
                    role: (profile as any)?.role || 'user',
                })
            }
        } catch (err) {
            console.error('[AuthContext] Profile fetch error:', err)
        }
    }

    const refreshUser = async () => {
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
            await fetchProfile(session.user)
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
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    await fetchProfile(session.user)
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
