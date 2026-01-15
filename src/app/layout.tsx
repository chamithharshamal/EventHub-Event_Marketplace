import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'EventHub - Create, Discover & Attend Amazing Events',
  description: 'The modern platform for event management and ticketing. Create events, sell tickets, and manage attendees with ease.',
  keywords: ['events', 'tickets', 'event management', 'ticketing platform', 'conferences', 'concerts'],
  authors: [{ name: 'EventHub Team' }],
  openGraph: {
    title: 'EventHub - Create, Discover & Attend Amazing Events',
    description: 'The modern platform for event management and ticketing.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-950`}>
        {children}
      </body>
    </html>
  )
}
