'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Shield,
    Calendar,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle,
    ArrowRight
} from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState<{
        pendingEvents: number
        publishedEvents: number
        totalUsers: number
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/stats')
                const data = await res.json()

                if (data.error) {
                    setIsAdmin(false)
                } else {
                    setIsAdmin(true)
                    setStats(data)
                }
            } catch {
                setIsAdmin(false)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        redirect('/dashboard')
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Shield className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage events and users
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats?.pendingEvents || 0}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Approval</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats?.publishedEvents || 0}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Published Events</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats?.totalUsers || 0}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Link href="/admin/events">
                    <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5 dark:text-white" />
                                Event Moderation
                            </CardTitle>
                            <CardDescription>
                                Review and approve pending events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                {stats?.pendingEvents && stats.pendingEvents > 0 ? (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        {stats.pendingEvents} pending
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        All reviewed
                                    </Badge>
                                )}
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="opacity-60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5 dark:text-white" />
                            User Management
                        </CardTitle>
                        <CardDescription>
                            Manage user roles and permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Badge variant="outline">Coming Soon</Badge>
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
