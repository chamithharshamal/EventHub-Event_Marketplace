'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function RegisterPage() {
    const router = useRouter()

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setIsLoading(false)
            return
        }

        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (error) {
                setError(error.message)
                return
            }

            setSuccess(true)
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        const supabase = getSupabaseClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard`,
            },
        })
    }

    if (success) {
        return (
            <Card variant="elevated" className="w-full max-w-md">
                <CardContent className="pt-6 text-center space-y-4">
                    <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Check your email
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                        Click the link to verify your account.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" className="w-full mt-4">
                            Back to Sign In
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card variant="elevated" className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create an account</CardTitle>
                <CardDescription>
                    Start creating and managing your events today
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Google Sign Up */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignUp}
                    type="button"
                >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                            or continue with email
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="password"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        By signing up, you agree to our{' '}
                        <Link href="/terms" className="text-violet-600 hover:underline dark:text-violet-400">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-violet-600 hover:underline dark:text-violet-400">
                            Privacy Policy
                        </Link>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
                    >
                        Sign in
                    </Link>
                </p>
            </CardContent>
        </Card>
    )
}
