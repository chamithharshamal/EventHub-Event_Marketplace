'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    CalendarDays,
    Ticket,
    BarChart3,
    Settings,
    Users,
    QrCode,
    LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
    userRole?: 'admin' | 'organizer' | 'staff' | 'attendee'
}

export function Sidebar({ userRole = 'organizer' }: SidebarProps) {
    const pathname = usePathname()

    const organizerLinks = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/events', label: 'Events', icon: CalendarDays },
        { href: '/dashboard/orders', label: 'Orders', icon: Ticket },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/attendees', label: 'Attendees', icon: Users },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]

    const staffLinks = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/events', label: 'Events', icon: CalendarDays },
        { href: '/dashboard/checkin', label: 'Check-in', icon: QrCode },
    ]

    const links = userRole === 'staff' ? staffLinks : organizerLinks

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    return (
        <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                        <Ticket className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                        EventHub
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                            isActive(link.href)
                                ? 'bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 dark:from-violet-950 dark:to-indigo-950 dark:text-violet-300'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        )}
                    >
                        <link.icon className={cn(
                            'h-5 w-5',
                            isActive(link.href) ? 'text-violet-600 dark:text-violet-400' : ''
                        )} />
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
