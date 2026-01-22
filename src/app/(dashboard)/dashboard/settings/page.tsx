'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, User, Bell, Shield, CreditCard, Save, ExternalLink, Globe } from 'lucide-react'
import { getCurrentUserProfile, updateProfile } from '@/app/actions/profile'

interface Profile {
    id: string
    email: string
    full_name: string | null
    username: string | null
    bio: string | null
    location: string | null
    website: string | null
    phone: string | null
    avatar_url: string | null
    is_public: boolean
}

export default function SettingsPage() {
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    // Form state
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')
    const [location, setLocation] = useState('')
    const [website, setWebsite] = useState('')
    const [phone, setPhone] = useState('')
    const [isPublic, setIsPublic] = useState(false)

    useEffect(() => {
        async function loadProfile() {
            const { profile, error } = await getCurrentUserProfile()
            if (profile) {
                setProfile(profile)
                setFullName(profile.full_name || '')
                setUsername(profile.username || '')
                setBio(profile.bio || '')
                setLocation(profile.location || '')
                setWebsite(profile.website || '')
                setPhone(profile.phone || '')
                setIsPublic(profile.is_public || false)
            }
            setLoading(false)
        }
        loadProfile()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        const result = await updateProfile({
            full_name: fullName,
            username: username || undefined,
            bio: bio || undefined,
            location: location || undefined,
            website: website || undefined,
            is_public: isPublic,
        })

        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
        }

        setSaving(false)
    }

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="grid gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-1 h-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="lg:col-span-3 h-96 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Manage your account and preferences
                </p>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <nav className="space-y-1">
                        {[
                            { icon: User, label: 'Profile', active: true },
                            { icon: Bell, label: 'Notifications', active: false },
                            { icon: Shield, label: 'Security', active: false },
                            { icon: CreditCard, label: 'Billing', active: false },
                        ].map((item, index) => (
                            <button
                                key={index}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${item.active
                                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>
                                Update your personal information and public profile
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Full Name</label>
                                    <Input
                                        placeholder="Your name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Email</label>
                                    <Input type="email" value={profile?.email || ''} disabled />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
                                        Username
                                        <span className="text-slate-400 font-normal ml-1">(for public profile)</span>
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm dark:border-slate-700 dark:bg-slate-800">
                                            @
                                        </span>
                                        <Input
                                            placeholder="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            className="rounded-l-none"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">Lowercase letters, numbers, and hyphens only</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Phone Number</label>
                                    <Input
                                        placeholder="+1 (555) 000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Bio</label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    placeholder="Tell us about yourself..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Location</label>
                                    <Input
                                        placeholder="City, Country"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Website</label>
                                    <Input
                                        placeholder="https://yourwebsite.com"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Public Profile Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Public Profile
                            </CardTitle>
                            <CardDescription>
                                Control your profile visibility and share your event history
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                                <div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-white">Make profile public</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Allow others to see your profile and events you&apos;ve attended
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600"></div>
                                </label>
                            </div>

                            {username && isPublic && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <span>Your public profile:</span>
                                    <Link
                                        href={`/profile/${username}`}
                                        className="text-violet-600 hover:text-violet-700 dark:text-violet-400 flex items-center gap-1"
                                    >
                                        /profile/{username}
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>
                                Choose what notifications you want to receive
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { label: 'New orders', description: 'Get notified when someone purchases tickets' },
                                { label: 'Check-ins', description: 'Receive alerts when attendees check in' },
                                { label: 'Weekly reports', description: 'Get a summary of your events performance' },
                                { label: 'Marketing emails', description: 'Receive tips and best practices' },
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm text-slate-900 dark:text-white">{item.label}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked={index < 2} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600"></div>
                                    </label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
