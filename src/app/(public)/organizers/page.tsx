import { Ticket, BarChart3, Users, CreditCard, Mail, QrCode, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const benefits = [
    {
        icon: Ticket,
        title: 'Sell Tickets Effortlessly',
        description: 'Create multiple ticket types, set early-bird pricing, and manage capacity with ease.'
    },
    {
        icon: BarChart3,
        title: 'Track Everything',
        description: 'Real-time analytics show you sales, revenue, and attendance metrics at a glance.'
    },
    {
        icon: Users,
        title: 'Manage Attendees',
        description: 'View attendee lists, export data, and communicate with your audience directly.'
    },
    {
        icon: CreditCard,
        title: 'Get Paid Fast',
        description: 'Receive payouts directly to your bank account. No waiting, no hassle.'
    },
    {
        icon: QrCode,
        title: 'Streamlined Check-in',
        description: 'Use the mobile app to scan tickets and check in attendees in seconds.'
    },
    {
        icon: Mail,
        title: 'Automated Communications',
        description: 'Automatic confirmation emails, reminders, and updates keep attendees informed.'
    }
]

const steps = [
    {
        number: '01',
        title: 'Create Your Event',
        description: 'Add event details, set ticket prices, and upload your banner image.'
    },
    {
        number: '02',
        title: 'Submit for Review',
        description: 'Our team reviews your event to ensure quality and approve it for publishing.'
    },
    {
        number: '03',
        title: 'Start Selling',
        description: 'Share your event link and watch the ticket sales roll in.'
    },
    {
        number: '04',
        title: 'Host Your Event',
        description: 'Use our check-in tools on event day for a smooth experience.'
    }
]

export default function OrganizersPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero */}
            <section className="relative py-20 lg:py-32 bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Built for
                            <span className="text-violet-400"> Event Organizers</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-8">
                            Whether you're hosting a small meetup or a large conference, EventHub gives you
                            the tools to succeed. Focus on creating amazing experiences—we'll handle the rest.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/register">
                                <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                                    Start Organizing
                                </Button>
                            </Link>
                            <Link href="/pricing">
                                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                                    View Pricing
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Powerful tools designed specifically for event organizers like you.
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900">
                                <benefit.icon className="h-10 w-10 text-violet-600 mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Get started in minutes with our simple process.
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
                        {steps.map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
                                    <span className="text-2xl font-bold text-violet-600">{step.number}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        Ready to Host Your Event?
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
                        Join thousands of organizers who trust EventHub. Create your account
                        and start selling tickets today.
                    </p>
                    <Link href="/register">
                        <Button size="lg">Create Free Account</Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
