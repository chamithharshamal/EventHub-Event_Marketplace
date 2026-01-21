export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4 py-20 max-w-3xl">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
                    Privacy Policy
                </h1>
                <p className="text-sm text-slate-500 mb-12">Last updated: January 2024</p>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Introduction
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            At EventHub, we take your privacy seriously. This Privacy Policy explains how we
                            collect, use, disclose, and safeguard your information when you use our platform.
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                            Please read this privacy policy carefully. If you do not agree with the terms of
                            this privacy policy, please do not access the platform.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Information We Collect
                        </h2>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            Personal Data
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            We may collect personal identification information including:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-2">
                            <li>Name and email address</li>
                            <li>Phone number</li>
                            <li>Billing address and payment information</li>
                            <li>Profile picture</li>
                            <li>Account preferences</li>
                        </ul>

                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            Usage Data
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            We automatically collect certain information when you visit or use the platform:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                            <li>IP address and browser type</li>
                            <li>Pages visited and time spent</li>
                            <li>Device information</li>
                            <li>Referring website</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            How We Use Your Information
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                            <li>Provide and maintain our platform</li>
                            <li>Process transactions and send confirmations</li>
                            <li>Send you updates about events you're interested in</li>
                            <li>Respond to your inquiries and support requests</li>
                            <li>Improve our services and develop new features</li>
                            <li>Prevent fraud and ensure security</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Sharing Your Information
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            We may share your information in the following situations:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                            <li><strong>With Event Organizers:</strong> When you purchase tickets, organizers receive your name and email</li>
                            <li><strong>Service Providers:</strong> We share data with vendors who assist our operations (e.g., payment processors, email services)</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In connection with any merger or acquisition</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Data Security
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            We implement appropriate technical and organizational measures to protect your
                            personal data against unauthorized access, alteration, disclosure, or destruction.
                            This includes encryption, secure servers, and regular security audits. However,
                            no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Your Rights
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Depending on your location, you may have the following rights:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                            <li>Access and receive a copy of your personal data</li>
                            <li>Correct inaccurate personal data</li>
                            <li>Request deletion of your personal data</li>
                            <li>Object to processing of your personal data</li>
                            <li>Data portability</li>
                            <li>Withdraw consent</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            Contact Us
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            If you have questions or concerns about this Privacy Policy, please contact us at:
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
