export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4 py-20 max-w-3xl">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
                    Terms of Service
                </h1>
                <p className="text-sm text-slate-500 mb-12">Last updated: January 2024</p>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            By accessing or using EventHub ("the Platform"), you agree to be bound by these
                            Terms of Service. If you disagree with any part of these terms, you may not
                            access the Platform. These terms apply to all visitors, users, and others who
                            access or use the Platform.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            2. Use of the Platform
                        </h2>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            2.1 Eligibility
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            You must be at least 18 years old to use this Platform. By using the Platform,
                            you represent that you are at least 18 years of age.
                        </p>

                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            2.2 Account Registration
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            To access certain features, you must register for an account. You agree to
                            provide accurate information and keep it updated. You are responsible for
                            maintaining the confidentiality of your account credentials.
                        </p>

                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            2.3 Prohibited Activities
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">You agree not to:</p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                            <li>Use the Platform for any illegal purpose</li>
                            <li>Violate any laws in your jurisdiction</li>
                            <li>Infringe on intellectual property rights</li>
                            <li>Transmit harmful code or malware</li>
                            <li>Attempt to gain unauthorized access</li>
                            <li>Harass or harm other users</li>
                            <li>Create fraudulent events or listings</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            3. Event Organizers
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            If you create events on the Platform, you agree to:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                            <li>Provide accurate event information</li>
                            <li>Honor all ticket sales and commitments</li>
                            <li>Comply with all applicable laws and regulations</li>
                            <li>Obtain necessary permits and licenses</li>
                            <li>Process refunds according to your stated policy</li>
                            <li>Not discriminate against attendees</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            4. Ticket Purchases
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            When you purchase tickets through the Platform:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                            <li>You are entering into a transaction with the event organizer</li>
                            <li>EventHub acts as a facilitator, not the seller</li>
                            <li>Refund policies are set by individual organizers</li>
                            <li>Tickets are non-transferable unless specified</li>
                            <li>You must present valid ID matching your ticket at check-in</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            5. Fees and Payments
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            EventHub charges service fees for transactions processed through the Platform.
                            All fees are displayed before completing a purchase. Payment processing is
                            handled by our third-party payment processor, Stripe. By using our Platform,
                            you also agree to Stripe's terms of service.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            6. Intellectual Property
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            The Platform and its original content, features, and functionality are owned
                            by EventHub and are protected by international copyright, trademark, and other
                            intellectual property laws. You may not copy, modify, or distribute any part
                            of the Platform without our prior written consent.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            7. Limitation of Liability
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            EventHub shall not be liable for any indirect, incidental, special, consequential,
                            or punitive damages arising out of your use of the Platform. We do not guarantee
                            that events will occur as described, and we are not responsible for the actions
                            of event organizers or attendees.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            8. Termination
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            We may terminate or suspend your account and access to the Platform immediately,
                            without prior notice, for conduct that we believe violates these Terms of Service
                            or is harmful to other users, us, or third parties, or for any other reason.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            9. Changes to Terms
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            We reserve the right to modify these terms at any time. We will notify users
                            of any material changes by posting the new Terms of Service on this page.
                            Your continued use of the Platform after changes constitutes acceptance of
                            the modified terms.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            10. Contact Us
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            If you have questions about these Terms of Service, please contact us at:
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 mt-4">
                            <strong>Email:</strong> legal@eventhub.com<br />
                            <strong>Address:</strong> 123 Event Street, San Francisco, CA 94105
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
