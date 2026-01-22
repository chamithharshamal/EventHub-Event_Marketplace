import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Globe, User, CalendarDays, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { getPublicProfile, getAttendedEvents } from '@/app/actions/profile'
import { createClient } from '@/lib/supabase/server'
import { ProfileEventsTabs, ProfileEventsGrid } from '@/components/profile/ProfileEvents'

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params
    const { profile, error } = await getPublicProfile(username)

    if (error || !profile) {
        // Check if profile exists but is private
        if (error === 'This profile is private') {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <User className="h-12 w-12 text-slate-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Private Profile
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            This user has chosen to keep their profile private.
                        </p>
                        <Link href="/events">
                            <Button>Discover Events</Button>
                        </Link>
                    </div>
                </div>
            )
        }
        notFound()
    }

    // Check if viewing own profile
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isOwnProfile = user?.id === profile.id

    // Get attended events
    const { upcoming, past } = await getAttendedEvents(profile.id, isOwnProfile)
    const totalEvents = upcoming.length + past.length

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Profile Header */}
            <section className="bg-gradient-to-br from-violet-600 to-indigo-700 py-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="shrink-0">
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.full_name || 'User'}
                                    className="h-28 w-28 rounded-full object-cover ring-4 ring-white/20"
                                />
                            ) : (
                                <div className="h-28 w-28 rounded-full bg-white/10 flex items-center justify-center ring-4 ring-white/20">
                                    <span className="text-4xl font-bold text-white">
                                        {(profile.full_name || 'U')[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-3xl font-bold text-white">
                                {profile.full_name || 'Anonymous User'}
                            </h1>
                            <p className="mt-1 text-violet-200">@{profile.username}</p>

                            {profile.bio && (
                                <p className="mt-3 text-white/80 max-w-xl">
                                    {profile.bio}
                                </p>
                            )}

                            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-violet-200">
                                {profile.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {profile.location}
                                    </div>
                                )}
                                {profile.website && (
                                    <a
                                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        <Globe className="h-4 w-4" />
                                        {profile.website.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                                <div className="flex items-center gap-1">
                                    <CalendarDays className="h-4 w-4" />
                                    Joined {formatDate(profile.created_at, { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {/* Edit Button (own profile) */}
                        {isOwnProfile && (
                            <Link href="/dashboard/settings">
                                <Button variant="secondary" size="sm">
                                    Edit Profile
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 max-w-md mx-auto sm:mx-0">
                        <div className="rounded-xl bg-white/10 p-4 text-center">
                            <div className="text-2xl font-bold text-white">{totalEvents}</div>
                            <div className="text-sm text-violet-200">Events</div>
                        </div>
                        <div className="rounded-xl bg-white/10 p-4 text-center">
                            <div className="text-2xl font-bold text-white">{past.length}</div>
                            <div className="text-sm text-violet-200">Attended</div>
                        </div>
                        {isOwnProfile && (
                            <div className="rounded-xl bg-white/10 p-4 text-center">
                                <div className="text-2xl font-bold text-white">{upcoming.length}</div>
                                <div className="text-sm text-violet-200">Upcoming</div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Events */}
            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {totalEvents === 0 ? (
                        <div className="text-center py-16">
                            <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Ticket className="h-12 w-12 text-slate-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                No events yet
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                {isOwnProfile
                                    ? "Start exploring events and get your first ticket!"
                                    : "This user hasn't attended any events yet."}
                            </p>
                            {isOwnProfile && (
                                <Link href="/events">
                                    <Button>Discover Events</Button>
                                </Link>
                            )}
                        </div>
                    ) : isOwnProfile ? (
                        <ProfileEventsTabs upcoming={upcoming} past={past} />
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                                Events Attended
                            </h2>
                            <ProfileEventsGrid events={past} isPast />
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}
