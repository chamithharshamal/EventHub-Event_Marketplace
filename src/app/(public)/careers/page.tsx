import { MapPin, Users, Heart, Zap, Coffee, Laptop } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const perks = [
    { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision coverage' },
    { icon: Laptop, title: 'Remote First', description: 'Work from anywhere in the world' },
    { icon: Coffee, title: 'Unlimited PTO', description: 'Take the time you need to recharge' },
    { icon: Zap, title: 'Learning Budget', description: '$2,000/year for courses and conferences' },
    { icon: Users, title: 'Team Retreats', description: 'Annual company gatherings in amazing locations' },
    { icon: MapPin, title: 'Coworking Stipend', description: 'Work from your favorite café or coworking space' }
]

const openings = [
    {
        title: 'Senior Frontend Engineer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        description: 'Build beautiful, performant user interfaces with React and Next.js.'
    },
    {
        title: 'Backend Engineer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        description: 'Design and implement scalable APIs and database systems.'
    },
    {
        title: 'Product Designer',
        department: 'Design',
        location: 'Remote',
        type: 'Full-time',
        description: 'Create intuitive experiences that delight our users.'
    },
    {
        title: 'Customer Success Manager',
        department: 'Customer Success',
        location: 'Remote (US)',
        type: 'Full-time',
        description: 'Help our customers succeed with EventHub.'
    },
    {
        title: 'Marketing Lead',
        department: 'Marketing',
        location: 'Remote',
        type: 'Full-time',
        description: 'Drive growth through creative marketing campaigns.'
    }
]

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero */}
            <section className="py-20 lg:py-32 bg-gradient-to-br from-violet-600 to-indigo-700">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Join Our Team
                    </h1>
                    <p className="text-xl text-violet-100 max-w-2xl mx-auto mb-8">
                        We're building the future of events. Come help us create tools that bring
                        people together around the world.
                    </p>
                    <a href="#openings">
                        <Button size="lg" className="bg-white text-violet-700 hover:bg-violet-50">
                            View Open Positions
                        </Button>
                    </a>
                </div>
            </section>

            {/* Why Join Us */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Why Join EventHub?
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            We offer more than just a job. We offer a chance to make an impact.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                        {perks.map((perk, index) => (
                            <div key={index} className="flex gap-4 p-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 flex-shrink-0">
                                    <perk.icon className="h-6 w-6 text-violet-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                        {perk.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {perk.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section id="openings" className="py-20 bg-slate-50 dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                            Open Positions
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Find your next opportunity with us.
                        </p>
                    </div>
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {openings.map((job, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                                {job.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                {job.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary">{job.department}</Badge>
                                                <Badge variant="outline">{job.location}</Badge>
                                                <Badge variant="outline">{job.type}</Badge>
                                            </div>
                                        </div>
                                        <Button className="flex-shrink-0">Apply Now</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* No Match CTA */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                        Don't See a Match?
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-xl mx-auto">
                        We're always looking for talented people. Send us your resume and
                        we'll keep you in mind for future opportunities.
                    </p>
                    <Button variant="outline">Send General Application</Button>
                </div>
            </section>
        </div>
    )
}
