'use client'

import { useState } from 'react'
import { Calendar, ChevronDown, ExternalLink /* Download */ } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AddToCalendarProps {
    title: string
    description?: string
    location?: string
    startDate: string | Date
    endDate: string | Date
    className?: string
}

// Format date to YYYYMMDDTHHMMSSZ format for calendar URLs
function formatCalendarDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

// Format date for ICS file
function formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

// Generate Google Calendar URL
function getGoogleCalendarUrl(props: AddToCalendarProps): string {
    const start = new Date(props.startDate)
    const end = new Date(props.endDate)

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: props.title,
        dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
        details: props.description || '',
        location: props.location || '',
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Generate Outlook Web URL
function getOutlookUrl(props: AddToCalendarProps): string {
    const start = new Date(props.startDate)
    const end = new Date(props.endDate)

    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: props.title,
        startdt: start.toISOString(),
        enddt: end.toISOString(),
        body: props.description || '',
        location: props.location || '',
    })

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

// Generate ICS file content
function generateICS(props: AddToCalendarProps): string {
    const start = new Date(props.startDate)
    const end = new Date(props.endDate)
    const now = new Date()

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//EventHub//Event Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `DTSTAMP:${formatICSDate(now)}`,
        `UID:${Date.now()}@eventhub.com`,
        `SUMMARY:${props.title}`,
        props.description ? `DESCRIPTION:${props.description.replace(/\n/g, '\\n')}` : '',
        props.location ? `LOCATION:${props.location}` : '',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(Boolean).join('\r\n')

    return icsContent
}

// Download ICS file
function downloadICS(props: AddToCalendarProps): void {
    const icsContent = generateICS(props)
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${props.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export function AddToCalendar(props: AddToCalendarProps) {
    const [isOpen, setIsOpen] = useState(false)

    const calendarOptions = [
        {
            name: 'Google Calendar',
            icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2H9v2H4.5a.5.5 0 0 0-.5.5v15a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V15h2v4.5a2.5 2.5 0 0 1-2.5 2.5z" />
                    <path d="M22 2h-6v2h2.586l-8.293 8.293 1.414 1.414L20 5.414V8h2V2z" />
                </svg>
            ),
            action: () => window.open(getGoogleCalendarUrl(props), '_blank'),
        },
        {
            name: 'Outlook',
            icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 12.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0-7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
                    <path d="M22 8h-8v9h8a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1zm-1 7h-6v-5h6v5z" />
                    <path d="M14 21H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6h-2V5H3v14h11v-2h2v3a1 1 0 0 1-1 1z" />
                </svg>
            ),
            action: () => window.open(getOutlookUrl(props), '_blank'),
        },
        {
            name: 'Apple Calendar (.ics)',
            icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
            ),
            action: () => downloadICS(props),
        },
    ]

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className={props.className}
            >
                <Calendar className="mr-2 h-4 w-4" />
                Add to Calendar
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                        <div className="p-1">
                            {calendarOptions.map((option) => (
                                <button
                                    key={option.name}
                                    onClick={() => {
                                        option.action()
                                        setIsOpen(false)
                                    }}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    {option.icon}
                                    {option.name}
                                    {option.name !== 'Apple Calendar (.ics)' && (
                                        <ExternalLink className="ml-auto h-3 w-3 text-slate-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
