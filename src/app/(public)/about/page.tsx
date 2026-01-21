import { Users, Target, Heart, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const values = [
    {
        icon: Users,
        title: 'Community First',
        description: 'We believe events bring people together. Our mission is to make it easier for anyone to create meaningful experiences.'
    },
    {
        icon: Target,
        title: 'Simplicity',
        description: 'Complex tools get in the way. We build intuitive software that just works, so you can focus on what matters.'
    },
    {
        icon: Heart,
        title: 'Customer Obsessed',
        description: "Every feature we build starts with our users. We listen, learn, and iterate based on real feedback."
    },
    {
        icon: Zap,
        title: 'Innovation',
        description: "We're constantly pushing the boundaries of what's possible in event technology."
    }
]

const stats = [
    { number: '10,000+', label: 'Events Hosted' },
    { number: '500,000+', label: 'Tickets Sold' },
    { number: '50+', label: 'Countries' },
    { number: '99.9%', label: 'Uptime' }
]

const team = [
    { name: 'Sarah Chen', role: 'CEO & Co-founder', image: '/team/sarah.jpg' },
    { name: 'Marcus Johnson', role: 'CTO & Co-founder', image: '/team/marcus.jpg' },
    { name: 'Emily Rodriguez', role: 'Head of Product', image: '/team/emily.jpg' },
    { name: 'David Kim', role: 'Head of Engineering', image: '/team/david.jpg' }
]

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero */}
            <section className="py-20 lg:py-32">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                        Making Events
                        <span className="text-violet-600"> Accessible</span> to Everyone
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        EventHub was founded in 2024 with a simple mission: to democratize event
                        management. We believe everyone should have access to professional-grade
                        tools for creating memorable experiences.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-violet-600">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-violet-200">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                            Our Story
                        </h2>
                        <div className="prose prose-lg dark:prose-invert">
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                EventHub started when our founders tried to organize a local tech meetup.
                                They were frustrated by expensive, complicated tools that seemed designed
                                for enterprise conferences, not community gatherings.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                So they built something better. A platform that's powerful enough for
                                large-scale events, but simple enough for anyone to use. Today, EventHub
                                powers everything from neighborhood block parties to international conferences.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">
                                We're proud to help organizers around the world create moments that matter.
                                And we're just getting started.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
                        Our Values
                    </h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {values.map((value, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
                                    <value.icon className="h-8 w-8 text-violet-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                    {value.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {value.description}
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
                        Join Our Journey
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                        We're always looking for passionate people to join our team.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/careers">
                            <Button size="lg">View Open Positions</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" variant="outline">Start Using EventHub</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
