'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
    Menu,
    X,
    Ticket,
    Search,
    User,
    LogOut,
    LayoutDashboard,
    CalendarDays,
    Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavbarProps {
    user?: {
        id: string
        email: string
        full_name?: string | null
        role?: string
    } | null
}

export function Navbar({ user }: NavbarProps) {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navLinks = [
        { href: '/events', label: 'Discover Events', icon: CalendarDays },
    ]

    const isActive = (href: string) => pathname.startsWith(href)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
                        <Ticket className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        EventHub
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex md:items-center md:gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'flex items-center gap-1.5 text-sm font-medium transition-colors',
                                isActive(link.href)
                                    ? 'text-violet-600 dark:text-violet-400'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            )}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="hidden lg:flex lg:flex-1 lg:max-w-md lg:mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                        />
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <Link href="/wishlist" className="hidden sm:block">
                                <Button variant="ghost" size="sm">
                                    <Heart className="h-4 w-4" />
                                    Wishlist
                                </Button>
                            </Link>
                            <Link href="/my-tickets" className="hidden sm:block">
                                <Button variant="ghost" size="sm">
                                    <Ticket className="h-4 w-4" />
                                    My Tickets
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="outline" size="sm">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-medium text-white">
                                    {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hidden sm:block">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                    <div className="space-y-1 px-4 py-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive(link.href)
                                        ? 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400'
                                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        ))}
                        {user && (
                            <>
                                <Link
                                    href="/wishlist"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Heart className="h-4 w-4" />
                                    Wishlist
                                </Link>
                                <Link
                                    href="/my-tickets"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Ticket className="h-4 w-4" />
                                    My Tickets
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
