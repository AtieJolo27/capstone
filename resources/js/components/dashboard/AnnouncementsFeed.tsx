import { Link } from '@inertiajs/react';
import { ArrowUpRight, Megaphone } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { formatDateTime } from '@/lib/formatters';
import type { Announcement } from '@/types';
import SectionHeading from './SectionHeading';

const priorityStyle: Record<string, string> = {
    urgent: 'bg-rose-100 text-rose-800',
    important: 'bg-amber-100 text-amber-800',
    normal: 'bg-emerald-100 text-emerald-800',
};

interface AnnouncementsFeedProps {
    announcements: Announcement[];
}

export default function AnnouncementsFeed({ announcements }: AnnouncementsFeedProps) {
    return (
        <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
            <SectionHeading
                eyebrow="Farmer communications"
                title="Recent announcements"
                description="Published updates currently shared with the farmer network."
            />

            {announcements.length === 0 ? (
                <EmptyState
                    icon={Megaphone}
                    title="No published announcements"
                    description="Published farmer updates will appear here."
                />
            ) : (
                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                    {announcements.map((announcement) => (
                        <Link
                            key={announcement.id}
                            href={`/announcements/${announcement.id}/edit`}
                            aria-label={`View announcement: ${announcement.title}`}
                            className="group flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-slate-100">
                                    <Megaphone className="h-4 w-4" />
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${priorityStyle[announcement.priority.toLowerCase()] ?? 'bg-slate-100 text-slate-600'}`}>
                                    {announcement.priority}
                                </span>
                            </div>
                            <h3 className="mt-4 text-sm font-bold text-slate-900">
                                {announcement.title}
                            </h3>
                            <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-500">
                                {announcement.message}
                            </p>
                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 text-sm">
                                <span className="truncate font-medium text-slate-500">
                                    {announcement.audience}
                                </span>
                                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-emerald-700" />
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                                {formatDateTime(announcement.published_at ?? announcement.created_at)}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
