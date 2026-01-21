import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const posts = [
    {
        slug: 'launch-announcement',
        title: 'Introducing EventHub: A New Way to Manage Events',
        excerpt: "We're excited to announce the launch of EventHub, a modern platform designed to make event management accessible to everyone.",
        date: '2024-01-15',
        category: 'Announcements',
        readTime: '3 min read',
        image: '/blog/launch.jpg'
    },
    {
        slug: 'tips-for-first-event',
        title: '10 Tips for Hosting Your First Event',
        excerpt: 'Planning your first event can be overwhelming. Here are our top tips to ensure your event is a success.',
        date: '2024-01-20',
        category: 'Tips & Guides',
        readTime: '5 min read',
        image: '/blog/tips.jpg'
    },
    {
        slug: 'qr-code-checkin',
        title: 'How QR Code Check-in Transformed Event Management',
        excerpt: 'Learn how digital check-in is replacing paper lists and making events run smoother than ever.',
        date: '2024-01-25',
        category: 'Technology',
        readTime: '4 min read',
        image: '/blog/qr.jpg'
    },
    {
        slug: 'virtual-events-guide',
        title: 'The Complete Guide to Virtual Events in 2024',
        excerpt: 'Virtual events are here to stay. Learn how to create engaging online experiences that rival in-person gatherings.',
        date: '2024-02-01',
        category: 'Tips & Guides',
        readTime: '7 min read',
        image: '/blog/virtual.jpg'
    },
    {
        slug: 'pricing-strategies',
        title: 'Event Ticket Pricing: Strategies That Work',
        excerpt: 'From early-bird discounts to tiered pricing, discover the best strategies to maximize ticket sales.',
        date: '2024-02-08',
        category: 'Business',
        readTime: '6 min read',
        image: '/blog/pricing.jpg'
    },
    {
        slug: 'community-events',
        title: 'Building Community Through Local Events',
        excerpt: 'Small local events can have a big impact. Here\'s how organizers are bringing communities together.',
        date: '2024-02-15',
        category: 'Stories',
        readTime: '4 min read',
        image: '/blog/community.jpg'
    }
]

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        EventHub Blog
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Tips, stories, and insights for event organizers. Learn how to create
                        unforgettable experiences.
                    </p>
                </div>
            </section>

            {/* Featured Post */}
            <section className="pb-12">
                <div className="container mx-auto px-4">
                    <Card className="overflow-hidden">
                        <div className="grid md:grid-cols-2">
                            <div className="h-64 md:h-auto bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-6xl">🎉</span>
                            </div>
                            <CardContent className="p-8 flex flex-col justify-center">
                                <Badge className="w-fit mb-4">{posts[0].category}</Badge>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                    {posts[0].title}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                    {posts[0].excerpt}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span>{formatDate(posts[0].date)}</span>
                                    <span>•</span>
                                    <span>{posts[0].readTime}</span>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.slice(1).map((post, index) => (
                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                                    <span className="text-4xl">📝</span>
                                </div>
                                <CardContent className="p-6">
                                    <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span>{formatDate(post.date)}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900">
                <div className="container mx-auto px-4 text-center max-w-xl">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                        Subscribe to Our Newsletter
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Get the latest tips and updates delivered to your inbox.
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <button className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}
