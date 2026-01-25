'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    CalendarDays,
    Zap,
    BarChart3,
    Users,
    Shield,
    ArrowRight,
    Loader2,
    CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getSupabaseClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { type Profile } from '@/types/database'


export default function BecomeOrganizerPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [pageLoading, setPageLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            const supabase = getSupabaseClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login?redirectTo=/become-organizer')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            const typedProfile = profile as Profile | null

            if (typedProfile?.role === 'organizer' || typedProfile?.role === 'admin') {
                router.push('/dashboard')
                return
            }

            setUser(user)
            setPageLoading(false)
        }

        checkUser()
    }, [router])

    const handleSwitchRole = async () => {
        if (!user) {
            router.push('/login?redirectTo=/become-organizer')
            return
        }

        setIsLoading(true)
        try {
            const supabase = getSupabaseClient()

            // Use upsert to handle case where profile doesn't exist
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email!, // Email is required for profiles
                    role: 'organizer',
                    updated_at: new Date().toISOString()
                } as any) // Use as any for the upsert object if needed to satisfy Supabase's strict Insert type vs partial updates

            if (error) throw error

            // Update auth metadata too just in case it's used elsewhere
            await supabase.auth.updateUser({
                data: { role: 'organizer' }
            })

            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            console.error('Error switching role:', error)
            alert('Failed to update role. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (pageLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        )
    }

    const benefits = [
        {
            icon: CalendarDays,
            title: 'Create Unlimited Events',
            description: 'From intimate workshops to massive festivals, host any event type with ease.'
        },
        {
            icon: BarChart3,
            title: 'Powerful Analytics',
            description: 'Track sales, revenue, and attendee growth with real-time dashboards.'
        },
        {
            icon: Users,
            title: 'Attendee Management',
            description: 'Manage ticket tiers, check-ins, and communication with your audience.'
        },
        {
            icon: Zap,
            title: 'Instant Payouts',
            description: 'Connect with Stripe and get paid directly for every ticket sold.'
        }
    ]

    return (
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300 mb-6">
                    <Shield className="h-4 w-4" />
                    Join 1,000+ top event organizers
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                    Take control of your
                    <span className="block mt-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        Event Journey
                    </span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400 sm:text-xl">
                    Whether you&apos;re a hobbyist or a professional event planner, EventHub provides the tools you need to succeed.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button size="lg" onClick={handleSwitchRole} disabled={isLoading} className="w-full sm:w-auto px-8">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <ArrowRight className="h-4 w-4 mr-2" />
                        )}
                        Become an Organizer
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-20">
                {benefits.map((benefit, index) => (
                    <Card key={index} className="border-none shadow-sm bg-slate-50 dark:bg-slate-900/50">
                        <CardContent className="p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 mb-4">
                                <benefit.icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                {benefit.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {benefit.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 sm:p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -transtlate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10 max-w-3xl">
                    <h2 className="text-3xl font-bold mb-6">Ready to start?</h2>
                    <ul className="space-y-4 mb-8">
                        {[
                            'Free to start, no monthly subscription',
                            'Small fee only on paid tickets',
                            'No fee for free community events',
                            'Dedicated support team'
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-violet-200" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <Button variant="secondary" size="lg" onClick={handleSwitchRole} disabled={isLoading}>
                        Switch to Organizer Now
                    </Button>
                </div>
            </div>
        </div>
    )
}
