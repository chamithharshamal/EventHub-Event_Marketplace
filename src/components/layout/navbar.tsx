'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
    Menu,
    X,
    Ticket,
    Search,
    User as UserIcon,
    LogOut,
    LayoutDashboard,
    CalendarDays,
    Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { logoutAction } from '@/app/actions/auth'

export function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, signOut } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    // Triggered when user clicks "Logout" button
    const handleLogoutClick = (e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        setShowLogoutConfirm(true)
        setDropdownOpen(false) // Close menus immediately for cleaner UI
        setMobileMenuOpen(false)
    }

    // Triggered when user confirms in the modal
    const performLogout = async () => {
        setIsLoggingOut(true)

        // Force logout after 2 seconds if server response hangs
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000))

        try {
            // Concurrent: Client-side storage clear + Server-side cookie clear
            await Promise.race([
                Promise.all([
                    signOut(), // Client Supabase
                    logoutAction() // Server Action Cookie Clear
                ]),
                timeoutPromise
            ])
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.clear()
            sessionStorage.clear()
            window.location.href = '/'
        }
    }

    // Ensure role check is case-insensitive and safe
    const userRole = user?.role?.toLowerCase() || 'user'
    console.log('[Navbar] User:', user?.email, 'Role:', userRole)
    const isOrganizerOrAdmin = userRole === 'admin' || userRole === 'organizer'

    const navLinks = [
        { href: '/events', label: 'Discover Events', icon: CalendarDays },
    ]

    const isActive = (href: string) => pathname.startsWith(href)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/95">
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
                            {/* My Tickets */}
                            <Link href="/my-tickets" className="hidden sm:block">
                                <Button variant="ghost" size="sm">
                                    <Ticket className="h-4 w-4 mr-1" />
                                    My Tickets
                                </Button>
                            </Link>

                            {/* Host an Event - only for regular users */}
                            {!isOrganizerOrAdmin && (
                                <Link href="/become-organizer" className="hidden sm:block">
                                    <Button variant="outline" size="sm" className="border-violet-300 text-violet-600 hover:bg-violet-50">
                                        <CalendarDays className="h-4 w-4 mr-1" />
                                        Host an Event
                                    </Button>
                                </Link>
                            )}

                            {/* Dashboard - only for organizer/admin */}
                            {isOrganizerOrAdmin && (
                                <Link href="/dashboard" className="hidden sm:block">
                                    <Button variant="outline" size="sm">
                                        <LayoutDashboard className="h-4 w-4 mr-1" />
                                        Dashboard
                                    </Button>
                                </Link>
                            )}

                            {/* Profile Avatar with Dropdown */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-semibold text-white cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                                >
                                    {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 z-50">
                                            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {user.full_name || 'User'}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <div className="py-1">
                                                {isOrganizerOrAdmin && (
                                                    <Link
                                                        href="/dashboard"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                                                        onClick={() => setDropdownOpen(false)}
                                                    >
                                                        <LayoutDashboard className="h-4 w-4" />
                                                        Dashboard
                                                    </Link>
                                                )}
                                                <Link
                                                    href="/my-tickets"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <Ticket className="h-4 w-4" />
                                                    My Tickets
                                                </Link>
                                                <Link
                                                    href="/wishlist"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <Heart className="h-4 w-4" />
                                                    Wishlist
                                                </Link>
                                                {!isOrganizerOrAdmin && (
                                                    <Link
                                                        href="/become-organizer"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-violet-600 hover:bg-violet-50 dark:text-violet-400"
                                                        onClick={() => setDropdownOpen(false)}
                                                    >
                                                        <CalendarDays className="h-4 w-4" />
                                                        Host an Event
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                                                <button
                                                    type="button"
                                                    onClick={handleLogoutClick}
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Log Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="secondary" size="sm">
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
                                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                                    isActive(link.href)
                                        ? 'bg-violet-50 text-violet-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        ))}
                        {user ? (
                            <>
                                <Link
                                    href="/my-tickets"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Ticket className="h-4 w-4" />
                                    My Tickets
                                </Link>
                                {isOrganizerOrAdmin && (
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                )}
                                {!isOrganizerOrAdmin && (
                                    <Link
                                        href="/become-organizer"
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <CalendarDays className="h-4 w-4" />
                                        Host an Event
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    onClick={handleLogoutClick}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <UserIcon className="h-4 w-4" />
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={performLogout}
                title="Log Out"
                description="Are you sure you want to log out of your account?"
                confirmText="Log Out"
                isLoading={isLoggingOut}
            />
        </header>
    )
}
