import Link from 'next/link'
import { Ticket, Github, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        product: [
            { label: 'Features', href: '/features' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'For Organizers', href: '/organizers' },
        ],
        company: [
            { label: 'About', href: '/about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Careers', href: '/careers' },
        ],
        legal: [
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
            { label: 'Cookies', href: '/cookies' },
        ],
    }

    return (
        <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                                <Ticket className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                EventHub
                            </span>
                        </Link>
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            Create, discover, and attend amazing events. The modern platform for event management and ticketing.
                        </p>
                        <div className="mt-4 flex gap-3">
                            <a
                                href="https://twitter.com"
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href="https://github.com"
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Product</h4>
                        <ul className="mt-4 space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Company</h4>
                        <ul className="mt-4 space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Legal</h4>
                        <ul className="mt-4 space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        © {currentYear} EventHub. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
