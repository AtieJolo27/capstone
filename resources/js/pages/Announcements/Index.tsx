import { Link, router } from '@inertiajs/react';
import {
    Eye,
    Megaphone,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import EmptyState from '@/components/EmptyState';
import FlashMessages from '@/components/FlashMessages';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import AdminLayout from '@/layouts/AdminLayout';
import { formatDateTime } from '@/lib/formatters';
import announcementRoutes from '@/routes/announcements';
import type { Announcement, Paginated } from '@/types';

interface AnnouncementIndexPageProps {
    announcements: Paginated<Announcement>;
    filters: {
        search: string | null;
        status: string | null;
        priority: string | null;
    };
}

const statusTone = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'published':
        case 'active':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
        case 'scheduled':
            return 'bg-sky-50 text-sky-700 ring-sky-100';
        case 'archived':
            return 'bg-slate-100 text-slate-600 ring-slate-200';
        default:
            return 'bg-amber-50 text-amber-700 ring-amber-100';
    }
};

const priorityTone = (priority: string): string => {
    if (priority === 'critical' || priority === 'high') {
        return 'text-rose-700';
    }

    if (priority === 'low') {
        return 'text-slate-500';
    }

    return 'text-emerald-700';
};

export default function AnnouncementIndexPage({
    announcements,
    filters,
}: AnnouncementIndexPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [priority, setPriority] = useState(filters.priority ?? '');

    const submitFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        router.get(
            announcementRoutes.index.url(),
            {
                search: search || undefined,
                status: status || undefined,
                priority: priority || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setPriority('');
        router.get(
            announcementRoutes.index.url(),
            {},
            { preserveScroll: true, replace: true },
        );
    };

    const removeAnnouncement = (announcement: Announcement) => {
        if (window.confirm(`Remove “${announcement.title}”?`)) {
            router.delete(announcementRoutes.destroy.url(announcement), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1540px] space-y-6 px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
                <PageHeader
                    eyebrow="Farm communication"
                    title="Announcements"
                    description="Prepare timely updates for farmers and field staff without losing track of their publishing state."
                    action={(
                        <Link
                            href={announcementRoutes.create.url()}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                            <Plus className="h-4 w-4" />
                            New announcement
                        </Link>
                    )}
                />

                <FlashMessages />

                <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
                    <form
                        onSubmit={submitFilters}
                        className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11rem_10rem_auto_auto] lg:items-center sm:p-5"
                    >
                        <label className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                placeholder="Search titles and messages"
                            />
                        </label>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            aria-label="Filter by publishing status"
                        >
                            <option value="">All statuses</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                        <select
                            value={priority}
                            onChange={(event) => setPriority(event.target.value)}
                            className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            aria-label="Filter by priority"
                        >
                            <option value="">All priorities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                        </select>
                        <button
                            type="submit"
                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                        >
                            Apply
                        </button>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            Reset
                        </button>
                    </form>

                    {announcements.data.length === 0 ? (
                        <EmptyState
                            icon={Megaphone}
                            title="No announcements found"
                            description="Create an update when farmers or field staff need a clear operational message."
                        />
                    ) : (
                        <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
                            {announcements.data.map((announcement) => (
                                <article
                                    key={announcement.id}
                                    className="flex min-w-0 flex-col rounded-2xl border border-slate-200/80 p-5 transition hover:border-emerald-200 hover:shadow-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                            <Megaphone className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="truncate font-bold text-slate-900">
                                                    {announcement.title}
                                                </h2>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusTone(announcement.status)}`}
                                                >
                                                    {announcement.status}
                                                </span>
                                            </div>
                                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                                                {announcement.message}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
                                        <div>
                                            <p className="text-slate-500">Audience</p>
                                            <p className="mt-1 font-semibold text-slate-800">
                                                {announcement.audience.replaceAll('_', ' ')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Priority</p>
                                            <p
                                                className={`mt-1 font-semibold capitalize ${priorityTone(announcement.priority)}`}
                                            >
                                                {announcement.priority}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Published</p>
                                            <p className="mt-1 font-semibold text-slate-800">
                                                {formatDateTime(announcement.published_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between gap-3">
                                        <p className="text-xs font-medium text-slate-400">
                                            Expires {formatDateTime(announcement.expires_at)}
                                        </p>
                                        <div className="flex gap-1.5">
                                            <Link
                                                href={announcementRoutes.show.url(announcement)}
                                                aria-label={`View ${announcement.title}`}
                                                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={announcementRoutes.edit.url(announcement)}
                                                aria-label={`Edit ${announcement.title}`}
                                                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => removeAnnouncement(announcement)}
                                                aria-label={`Remove ${announcement.title}`}
                                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    <Pagination paginator={announcements} />
                </section>
            </div>
        </AdminLayout>
    );
}
