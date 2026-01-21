import { Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for getting started with small events',
        features: [
            'Up to 100 tickets per event',
            '1 event per month',
            'Basic analytics',
            'Email support',
            'QR code tickets',
            'Basic check-in'
        ],
        cta: 'Get Started',
        popular: false
    },
    {
        name: 'Pro',
        price: '$29',
        period: '/month',
        description: 'For growing organizers with regular events',
        features: [
            'Unlimited tickets',
            'Unlimited events',
            'Advanced analytics',
            'Priority support',
            'Custom branding',
            'Team members (up to 5)',
            'Attendee export',
            'Refund management'
        ],
        cta: 'Start Free Trial',
        popular: true
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For large organizations with complex needs',
        features: [
            'Everything in Pro',
            'Unlimited team members',
            'API access',
            'White-label solution',
            'Dedicated account manager',
            'Custom integrations',
            'SLA guarantee',
            'On-premise option'
        ],
        cta: 'Contact Sales',
        popular: false
    }
]

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero */}
            <section className="py-20 lg:py-32">
                <div className="container mx-auto px-4 text-center">
                    <Badge className="mb-4">Simple Pricing</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Choose the Right Plan for You
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Start free and scale as you grow. No hidden fees, no surprises.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                        {plans.map((plan, index) => (
                            <Card
                                key={index}
                                className={`relative ${plan.popular ? 'border-violet-500 shadow-xl scale-105' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-violet-600">Most Popular</Badge>
                                    </div>
                                )}
                                <CardHeader className="text-center pb-8 pt-6">
                                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold text-slate-900 dark:text-white">
                                            {plan.price}
                                        </span>
                                        <span className="text-slate-500">{plan.period}</span>
                                    </div>
                                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                                <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href="/register">
                                        <Button
                                            className="w-full"
                                            variant={plan.popular ? 'default' : 'outline'}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                We accept all major credit cards via Stripe. Attendees can pay with Visa, Mastercard,
                                American Express, and more.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                What are the platform fees?
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                We charge 2% + $0.50 per ticket on the Free plan. Pro plans have reduced fees of
                                1% + $0.30 per ticket. Enterprise plans have custom pricing.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                Can I cancel anytime?
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Yes! You can cancel your subscription at any time. Your access will continue until
                                the end of your billing period.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
