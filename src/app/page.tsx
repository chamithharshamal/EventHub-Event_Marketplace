import Link from 'next/link'
import {
  ArrowRight,
  Ticket,
  QrCode,
  BarChart3,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
  const features = [
    {
      icon: Ticket,
      title: 'Easy Ticket Management',
      description: 'Create multiple ticket types, set pricing tiers, and manage inventory with real-time updates.',
    },
    {
      icon: QrCode,
      title: 'Secure QR Check-in',
      description: 'Military-grade encrypted QR codes with offline validation support for seamless entry.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track sales, attendee engagement, and revenue with beautiful interactive dashboards.',
    },
    {
      icon: Shield,
      title: 'Multi-tenant Security',
      description: 'Enterprise-grade data isolation ensures your event data stays private and secure.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built on modern infrastructure for sub-second page loads and real-time updates.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite staff, assign roles, and manage permissions for seamless event operations.',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Event Director, TechConf',
      content: 'EventHub transformed how we manage our annual conference. The QR check-in alone saved us hours.',
      avatar: 'SC',
    },
    {
      name: 'Marcus Johnson',
      role: 'Founder, MusicFest',
      content: 'Finally, a ticketing platform that understands large-scale events. The analytics are incredible.',
      avatar: 'MJ',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Community Manager',
      content: 'We went from Excel spreadsheets to professional event management overnight. Love it!',
      avatar: 'ER',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-violet-950/50 dark:via-slate-950 dark:to-indigo-950/50" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
                <Zap className="h-4 w-4" />
                Launching Soon — Join the Waitlist
              </div>

              {/* Headline */}
              <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
                Create Unforgettable
                <span className="block mt-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent animate-gradient">
                  Event Experiences
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400 sm:text-xl">
                The modern platform for event organizers. Create events, sell tickets,
                and manage check-ins with our secure QR technology — all in one place.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore Events
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <div className="flex -space-x-2">
                  {['bg-violet-500', 'bg-indigo-500', 'bg-blue-500', 'bg-cyan-500'].map((color, i) => (
                    <div
                      key={i}
                      className={`h-10 w-10 rounded-full ${color} border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-medium text-white`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">1,000+</span> organizers trust EventHub
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Everything you need to run
                <span className="block text-gradient">successful events</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                From ticket sales to check-in, analytics to team management — we&apos;ve got you covered.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} variant="elevated" className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/50 dark:to-indigo-900/50">
                      <feature.icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-violet-600 to-indigo-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: '10K+', label: 'Events Hosted' },
                { value: '500K+', label: 'Tickets Sold' },
                { value: '99.9%', label: 'Uptime' },
                { value: '4.9/5', label: 'User Rating' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-violet-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Loved by event organizers
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                Don&apos;t just take our word for it — hear from some of our amazing customers.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-medium text-white">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white dark:bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Ready to create your next event?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Join thousands of organizers who trust EventHub for their events.
              Start your free trial today — no credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg">
                  Get Started for Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Free 14-day trial
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
