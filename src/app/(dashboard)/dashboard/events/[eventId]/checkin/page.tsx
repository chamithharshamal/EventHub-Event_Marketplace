'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Users,
    Ticket,
    CheckCircle,
    Clock,
    TrendingUp,
    RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QRScanner } from '@/components/checkin/qr-scanner'
import { formatDateTime } from '@/lib/utils'

// Mock event and stats data
const mockEvent = {
    id: 'evt_001',
    title: 'Tech Innovation Summit 2026',
    start_date: '2026-02-15T09:00:00Z',
    end_date: '2026-02-15T18:00:00Z',
    venue_name: 'Moscone Center',
    city: 'San Francisco',
}

const mockStats = {
    totalTickets: 380,
    checkedIn: 127,
    pendingCheckin: 253,
    checkinsLastHour: 45,
}

const mockRecentCheckins = [
    { id: '1', name: 'John Doe', ticketType: 'VIP', time: '2 min ago' },
    { id: '2', name: 'Jane Smith', ticketType: 'General Admission', time: '5 min ago' },
    { id: '3', name: 'Mike Johnson', ticketType: 'General Admission', time: '8 min ago' },
    { id: '4', name: 'Sarah Wilson', ticketType: 'VIP', time: '12 min ago' },
    { id: '5', name: 'Chris Brown', ticketType: 'General Admission', time: '15 min ago' },
]

interface CheckinPageProps {
    params: Promise<{ eventId: string }>
}

export default function CheckinPage({ params }: CheckinPageProps) {
    const [eventId, setEventId] = useState<string>('')
    const [stats, setStats] = useState(mockStats)
    const [recentCheckins, setRecentCheckins] = useState(mockRecentCheckins)
    const [activeTab, setActiveTab] = useState<'scanner' | 'stats'>('scanner')

    useEffect(() => {
        params.then(({ eventId }) => {
            setEventId(eventId)
        })
    }, [params])

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            // In production, this would be a Supabase real-time subscription
            setStats(prev => ({
                ...prev,
                checkedIn: prev.checkedIn + Math.floor(Math.random() * 2),
            }))
        }, 30000) // Update every 30 seconds

        return () => clearInterval(interval)
    }, [])

    const handleScanResult = (result: { valid: boolean; attendee?: { name: string | null } }) => {
        if (result.valid && result.attendee?.name) {
            // Add to recent check-ins
            setRecentCheckins(prev => [
                { id: Date.now().toString(), name: result.attendee!.name || 'Guest', ticketType: 'General', time: 'Just now' },
                ...prev.slice(0, 4),
            ])

            // Update stats
            setStats(prev => ({
                ...prev,
                checkedIn: prev.checkedIn + 1,
                pendingCheckin: prev.pendingCheckin - 1,
            }))
        }
    }

    const event = mockEvent
    const checkinProgress = (stats.checkedIn / stats.totalTickets) * 100

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard/events">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="text-center">
                            <h1 className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                                {event.title}
                            </h1>
                            <p className="text-xs text-slate-500">{event.venue_name}</p>
                        </div>
                        <Badge variant="success" className="animate-pulse">
                            Live
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-lg px-4">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('scanner')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'scanner'
                                    ? 'border-violet-500 text-violet-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            Scanner
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'stats'
                                    ? 'border-violet-500 text-violet-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="mx-auto max-w-lg px-4 py-6">
                {activeTab === 'scanner' ? (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-emerald-600">{stats.checkedIn}</div>
                                    <div className="text-xs text-slate-500">Checked In</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-slate-600">{stats.pendingCheckin}</div>
                                    <div className="text-xs text-slate-500">Pending</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* QR Scanner */}
                        <QRScanner eventId={eventId} onScanResult={handleScanResult} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
                                            <Ticket className="h-5 w-5 text-violet-600" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{stats.totalTickets}</div>
                                            <div className="text-xs text-slate-500">Total Tickets</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{stats.checkedIn}</div>
                                            <div className="text-xs text-slate-500">Checked In</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                            <Clock className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{stats.pendingCheckin}</div>
                                            <div className="text-xs text-slate-500">Pending</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                            <TrendingUp className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{stats.checkinsLastHour}</div>
                                            <div className="text-xs text-slate-500">Last Hour</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Progress Bar */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Check-in Progress</span>
                                    <span className="text-sm text-slate-500">{Math.round(checkinProgress)}%</span>
                                </div>
                                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
                                        style={{ width: `${checkinProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {stats.checkedIn} of {stats.totalTickets} attendees
                                </p>
                            </CardContent>
                        </Card>

                        {/* Recent Check-ins */}
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Recent Check-ins</CardTitle>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentCheckins.map((checkin) => (
                                        <div
                                            key={checkin.id}
                                            className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{checkin.name}</p>
                                                    <p className="text-xs text-slate-500">{checkin.ticketType}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400">{checkin.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
