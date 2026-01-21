import { Ticket, QrCode, BarChart3, CreditCard, Mail, Shield, Globe, Zap, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const features = [
    {
        icon: Calendar,
        title: 'Event Management',
        description: 'Create and manage events with ease. Set up ticket types, pricing tiers, and capacity limits in minutes.'
    },
    {
        icon: Ticket,
        title: 'Digital Ticketing',
        description: 'Issue beautiful digital tickets with unique QR codes. Attendees receive instant email confirmations.'
    },
    {
        icon: QrCode,
        title: 'Fast Check-in',
        description: 'Scan QR codes for lightning-fast check-in. Real-time attendance tracking and duplicate prevention.'
    },
    {
        icon: CreditCard,
        title: 'Secure Payments',
        description: 'Accept payments via Stripe. Support for multiple currencies and automatic payouts.'
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        description: 'Track sales, revenue, and attendance in real-time. Export reports and gain insights.'
    },
    {
        icon: Mail,
        title: 'Email Notifications',
        description: 'Automated emails for confirmations, reminders, and updates. Beautiful, branded templates.'
    },
    {
        icon: Shield,
        title: 'Admin Approval',
        description: 'Event moderation system ensures quality. Admins review and approve events before going live.'
    },
    {
        icon: Globe,
        title: 'Online & In-Person',
        description: 'Support for both virtual and physical events. Stream URLs and venue management.'
    },
    {
        icon: Zap,
        title: 'Instant Setup',
        description: 'Go from idea to ticket sales in under 5 minutes. No technical knowledge required.'
    }
]

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero */}
            <section className="relative py-20 lg:py-32 bg-gradient-to-br from-violet-600 to-indigo-700">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Everything You Need to Run
                        <br />
                        <span className="text-violet-200">Successful Events</span>
                    </h1>
                    <p className="text-xl text-violet-100 max-w-2xl mx-auto mb-8">
                        From ticket sales to check-in, EventHub provides all the tools you need to create
                        unforgettable experiences.
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="bg-white text-violet-700 hover:bg-violet-50">
                            Get Started Free
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 mb-6">
                                    <feature.icon className="h-7 w-7 text-violet-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                        Join thousands of organizers who trust EventHub for their events.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg">Create Your First Event</Button>
                        </Link>
                        <Link href="/events">
                            <Button size="lg" variant="outline">Browse Events</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
