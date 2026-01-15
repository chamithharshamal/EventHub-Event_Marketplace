import { Navbar } from '@/components/layout/navbar'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                {children}
            </main>
        </div>
    )
}
