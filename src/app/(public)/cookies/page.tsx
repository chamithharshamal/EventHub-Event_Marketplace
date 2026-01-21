import { Button } from '@/components/ui/button'

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4 py-20 max-w-3xl">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
                    Cookie Policy
                </h1>
                <p className="text-sm text-slate-500 mb-12">Last updated: January 2024</p>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            What Are Cookies?
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Cookies are small text files that are placed on your computer or mobile device
                            when you visit a website. They are widely used to make websites work more
                            efficiently and provide information to website owners. Cookies allow us to
                            recognize your browser and remember certain information about your preferences.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            How We Use Cookies
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            EventHub uses cookies for several purposes:
                        </p>

                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                🔒 Essential Cookies
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                These cookies are necessary for the website to function properly. They enable
                                core functionality such as security, authentication, and session management.
                                You cannot opt out of these cookies.
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                📊 Analytics Cookies
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                We use analytics cookies to understand how visitors interact with our website.
                                This helps us improve our services. These cookies collect information such as
                                pages visited, time spent on site, and any error messages encountered.
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                ⚙️ Functional Cookies
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                These cookies enable personalized features like remembering your preferences,
                                language settings, and login details. They enhance your experience but are
                                not strictly necessary.
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                📢 Marketing Cookies
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Marketing cookies are used to track visitors across websites to display relevant
                                advertisements. They help us measure the effectiveness of our marketing campaigns.
                            </p>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Third-Party Cookies
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            We use services from third parties that may set cookies on your device:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                            <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
                            <li><strong>Supabase:</strong> Authentication and session management</li>
                            <li><strong>Google Analytics:</strong> Website usage analytics</li>
                            <li><strong>Vercel:</strong> Performance monitoring</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Managing Cookies
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            You can control and manage cookies in various ways:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 mb-6">
                            <li>
                                <strong>Browser Settings:</strong> Most browsers allow you to refuse or delete
                                cookies through settings. Refer to your browser's help section.
                            </li>
                            <li>
                                <strong>Cookie Consent:</strong> You can update your preferences using our
                                cookie consent banner.
                            </li>
                            <li>
                                <strong>Opt-Out Links:</strong> Many third-party services provide opt-out
                                mechanisms on their websites.
                            </li>
                        </ul>
                        <p className="text-slate-600 dark:text-slate-400">
                            Please note that disabling certain cookies may impact your experience on our platform.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Cookie Retention
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Different cookies are retained for different periods:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 mt-4">
                            <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                            <li><strong>Persistent cookies:</strong> Remain for up to 2 years</li>
                            <li><strong>Authentication cookies:</strong> Expire after 30 days of inactivity</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Updates to This Policy
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            We may update this Cookie Policy from time to time. We will notify you of any
                            changes by posting the new policy on this page and updating the "Last updated"
                            date at the top.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Contact Us
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            If you have questions about our use of cookies, please contact us at:
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 mt-4">
                            <strong>Email:</strong> privacy@eventhub.com<br />
                            <strong>Address:</strong> 123 Event Street, San Francisco, CA 94105
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
