'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, User, Bell, Shield, CreditCard, Save } from 'lucide-react'

export default function SettingsPage() {
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        // TODO: Implement save functionality
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
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
                                    <Input placeholder="Your name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Email</label>
                                    <Input type="email" placeholder="your@email.com" disabled />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Phone Number</label>
                                <Input placeholder="+1 (555) 000-0000" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Bio</label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organization Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Organization Settings
                            </CardTitle>
                            <CardDescription>
                                Configure your organization details for events
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Organization Name</label>
                                    <Input placeholder="Your organization" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Website</label>
                                    <Input placeholder="https://example.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Default Currency</label>
                                <select className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="CAD">CAD - Canadian Dollar</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Timezone</label>
                                <select className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                    <option value="Europe/London">London</option>
                                    <option value="Asia/Kolkata">Mumbai, Kolkata, New Delhi</option>
                                </select>
                            </div>
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
