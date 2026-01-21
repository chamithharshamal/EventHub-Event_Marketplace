'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Image as ImageIcon,
    DollarSign,
    Save,
    Eye,
    Loader2,
    Plus,
    Trash2,
    Video,
    Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const categories = [
    'Conference',
    'Workshop',
    'Concert',
    'Networking',
    'Sports',
    'Exhibition',
    'Festival',
    'Meetup',
    'Webinar',
    'Other',
]

export default function CreateEventPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'details' | 'tickets' | 'settings'>('details')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        venue_name: '',
        address: '',
        city: '',
        country: '',
        is_online: false,
        stream_url: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        timezone: 'UTC',
        banner_url: '',
        max_capacity: '',
        is_private: false,
        refund_policy: '',
    })

    const [ticketTypes, setTicketTypes] = useState([
        { id: '1', name: 'General Admission', price: 0, quantity: 100, description: '' },
    ])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }))
    }

    const addTicketType = () => {
        setTicketTypes(prev => [
            ...prev,
            { id: Date.now().toString(), name: '', price: 0, quantity: 50, description: '' },
        ])
    }

    const removeTicketType = (id: string) => {
        setTicketTypes(prev => prev.filter(t => t.id !== id))
    }

    const updateTicketType = (id: string, field: string, value: string | number) => {
        setTicketTypes(prev =>
            prev.map(t => (t.id === id ? { ...t, [field]: value } : t))
        )
    }

    const handleSubmit = async (status: 'draft' | 'published') => {
        setIsLoading(true)

        // TODO: Implement actual event creation
        console.log('Creating event:', { ...formData, status, ticketTypes })

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsLoading(false)
        router.push('/dashboard/events')
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/events">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Event</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Fill in the details to create your event
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button onClick={() => handleSubmit('published')} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800">
                <nav className="flex gap-8">
                    {[
                        { id: 'details', label: 'Event Details' },
                        { id: 'tickets', label: 'Tickets' },
                        { id: 'settings', label: 'Settings' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-violet-600 dark:text-violet-400'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Event Details Tab */}
            {activeTab === 'details' && (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 dark:text-white">
                                <Input
                                    label="Event Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter event title"
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full rounded-lg border dark:placeholder:text-slate-500 border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900"
                                        placeholder="Describe your event..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Date & Time */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 dark:text-white" />
                                    Date & Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 dark:placeholder:text-slate-500">
                                <div className="grid gap-4 sm:grid-cols-2 ">
                                    <Input
                                        label="Start Date"
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="Start Time"
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Input
                                        label="End Date"
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="End Time"
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 dark:text-white" />
                                    Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                                        <input
                                            type="radio"
                                            name="is_online"
                                            checked={!formData.is_online}
                                            onChange={() => setFormData(prev => ({ ...prev, is_online: false }))}
                                            className="h-4 w-4 text-violet-600"
                                        />
                                        <Globe className="h-4 w-4" />
                                        In-Person
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                                        <input
                                            type="radio"
                                            name="is_online"
                                            checked={formData.is_online}
                                            onChange={() => setFormData(prev => ({ ...prev, is_online: true }))}
                                            className="h-4 w-4 text-violet-600"
                                        />
                                        <Video className="h-4 w-4" />
                                        Online
                                    </label>
                                </div>

                                {formData.is_online ? (
                                    <Input
                                        label="Stream URL"
                                        name="stream_url"
                                        value={formData.stream_url}
                                        onChange={handleChange}
                                        placeholder="https://zoom.us/j/..."
                                    />
                                ) : (
                                    <>
                                        <Input
                                            label="Venue Name"
                                            name="venue_name"
                                            value={formData.venue_name}
                                            onChange={handleChange}
                                            placeholder="Enter venue name"
                                        />
                                        <Input
                                            label="Address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Street address"
                                        />
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Input
                                                label="City"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="City"
                                            />
                                            <Input
                                                label="Country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                placeholder="Country"
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Banner Image */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 dark:text-white" />
                                    Event Banner
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center hover:border-violet-500 transition-colors cursor-pointer">
                                    <ImageIcon className="h-12 w-12 mx-auto text-slate-400" />
                                    <p className="mt-2 text-sm text-slate-500">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        PNG, JPG up to 5MB
                                    </p>
                                </div>
                                <Input
                                    className="mt-4"
                                    name="banner_url"
                                    value={formData.banner_url}
                                    onChange={handleChange}
                                    placeholder="Or paste image URL"
                                />
                            </CardContent>
                        </Card>

                        {/* Capacity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Capacity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    label="Maximum Attendees"
                                    type="number"
                                    name="max_capacity"
                                    value={formData.max_capacity}
                                    onChange={handleChange}
                                    placeholder="Leave empty for unlimited"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Ticket Types</CardTitle>
                                <CardDescription>
                                    Create different ticket types with varying prices and quantities
                                </CardDescription>
                            </div>
                            <Button onClick={addTicketType}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Ticket Type
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ticketTypes.map((ticket, index) => (
                                <div
                                    key={ticket.id}
                                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <Badge>Ticket {index + 1}</Badge>
                                        {ticketTypes.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeTicketType(ticket.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <Input
                                            label="Ticket Name"
                                            value={ticket.name}
                                            onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                                            placeholder="e.g., General Admission"
                                        />
                                        <Input
                                            label="Price (USD)"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={ticket.price}
                                            onChange={(e) => updateTicketType(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                        />
                                        <Input
                                            label="Quantity"
                                            type="number"
                                            min="1"
                                            value={ticket.quantity}
                                            onChange={(e) => updateTicketType(ticket.id, 'quantity', parseInt(e.target.value) || 1)}
                                            placeholder="100"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Description (optional)
                                        </label>
                                        <textarea
                                            value={ticket.description}
                                            onChange={(e) => updateTicketType(ticket.id, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-lg border border-slate-200 bg-white dark:placeholder:text-slate-500 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900"
                                            placeholder="Describe what's included with this ticket..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visibility</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_private"
                                    checked={formData.is_private}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded text-violet-600"
                                />
                                <div>
                                    <p className="font-medium dark:text-white">Private Event</p>
                                    <p className="text-sm text-slate-500">
                                        Only people with the link can view and purchase tickets
                                    </p>
                                </div>
                            </label>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Refund Policy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                name="refund_policy"
                                value={formData.refund_policy}
                                onChange={handleChange}
                                rows={4}
                                className="w-full rounded-lg border dark:text-slate-500 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900"
                                placeholder="Describe your refund policy..."
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
