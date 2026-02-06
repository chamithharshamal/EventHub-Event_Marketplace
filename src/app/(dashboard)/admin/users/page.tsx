'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    ArrowLeft,
    Search,
    Users,
    Shield,
    User,
    Calendar,
    Ticket,
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    Loader2,
    MoreHorizontal
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface UserData {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: 'admin' | 'organizer' | 'staff' | 'attendee'
    created_at: string
    is_suspended?: boolean
    _count?: {
        events: number
        orders: number
        tickets: number
    }
}

const roleColors: Record<string, string> = {
    admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    organizer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    staff: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    attendee: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
}

const roleIcons: Record<string, typeof Shield> = {
    admin: Shield,
    organizer: Calendar,
    staff: Users,
    attendee: User
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [editingRole, setEditingRole] = useState<string | null>(null)
    const limit = 20

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (roleFilter !== 'all') params.set('role', roleFilter)
            params.set('page', page.toString())
            params.set('limit', limit.toString())

            const res = await fetch(`/api/admin/users?${params}`)
            const data = await res.json()

            if (data.error) {
                console.error('Error:', data.error)
                return
            }

            setUsers(data.users || [])
            setTotal(data.total || 0)
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }, [search, roleFilter, page])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1)
            fetchUsers()
        }, 300)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search])

    const handleRoleChange = async (userId: string, newRole: string) => {
        setActionLoading(userId)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'updateRole', role: newRole })
            })
            const data = await res.json()
            if (data.success) {
                setUsers(users.map(u =>
                    u.id === userId ? { ...u, role: newRole as UserData['role'] } : u
                ))
            }
        } catch (error) {
            console.error('Failed to update role:', error)
        } finally {
            setActionLoading(null)
            setEditingRole(null)
        }
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage user roles and permissions
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value)
                        setPage(1)
                    }}
                    className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="organizer">Organizers</option>
                    <option value="staff">Staff</option>
                    <option value="attendee">Attendees</option>
                </select>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Users className="h-4 w-4" />
                <span>{total} users found</span>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="flex h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto" />
                        <p className="mt-4 text-slate-500 dark:text-slate-400">Loading users...</p>
                    </div>
                </div>
            ) : users.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-slate-400" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No users found</h3>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Try adjusting your search or filters
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {users.map((user) => {
                        const RoleIcon = roleIcons[user.role] || User
                        return (
                            <Card key={user.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.full_name || 'User'}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                                                    {(user.full_name || user.email)[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-slate-900 dark:text-white truncate">
                                                    {user.full_name || 'Unnamed User'}
                                                </h3>
                                                {user.is_suspended && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Suspended
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                {user.email}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(user.created_at)}
                                                </span>
                                                {user._count && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {user._count.events} events
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <ShoppingCart className="h-3 w-3" />
                                                            {user._count.orders} orders
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Ticket className="h-3 w-3" />
                                                            {user._count.tickets} tickets
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Role Badge / Dropdown */}
                                        <div className="flex-shrink-0">
                                            {editingRole === user.id ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        defaultValue={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        className="text-sm px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                                        disabled={actionLoading === user.id}
                                                    >
                                                        <option value="admin">Admin</option>
                                                        <option value="organizer">Organizer</option>
                                                        <option value="staff">Staff</option>
                                                        <option value="attendee">Attendee</option>
                                                    </select>
                                                    {actionLoading === user.id && (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingRole(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        className={`${roleColors[user.role]} cursor-pointer`}
                                                        onClick={() => setEditingRole(user.id)}
                                                    >
                                                        <RoleIcon className="h-3 w-3 mr-1" />
                                                        {user.role}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setEditingRole(user.id)}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
