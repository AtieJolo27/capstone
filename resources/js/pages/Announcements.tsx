import {
    Bell,
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileText,
    Megaphone,
    Plus,
    Send,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type AnnouncementPriority = 'Urgent' | 'Important' | 'General';
type AnnouncementStatus = 'Published' | 'Scheduled' | 'Draft';
type AnnouncementFilter = 'All' | AnnouncementStatus;

type Announcement = {
    id: number;
    title: string;
    body: string;
    priority: AnnouncementPriority;
    audience: string;
    date: string;
    status: AnnouncementStatus;
    delivered: string;
};

const seedAnnouncements: Announcement[] = [
    {
        id: 1,
        title: 'Prepare irrigation channels before the dry week',
        body: 'Forecast conditions point to a drier stretch. Please inspect irrigation lines and keep a close watch on soil moisture alerts.',
        priority: 'Important',
        audience: 'All registered farmers',
        date: 'Today, 8:30 AM',
        status: 'Published',
        delivered: '24 of 24 farmers reached',
    },
    {
        id: 2,
        title: 'Soil sensor maintenance visit — Bay Organic Estate',
        body: 'A technician will complete a scheduled battery and calibration check at the tomato block tomorrow morning.',
        priority: 'General',
        audience: 'Bay Organic Estate',
        date: 'Tomorrow, 7:00 AM',
        status: 'Scheduled',
        delivered: 'Scheduled for delivery',
    },
    {
        id: 3,
        title: 'Action requested: acidity adjustment guidance',
        body: 'The latest soil analysis indicates that pH adjustment may be needed. Review the recommendation in your farm portal before the next application.',
        priority: 'Urgent',
        audience: 'Sta. Rosa Farmstead',
        date: 'Yesterday, 2:15 PM',
        status: 'Published',
        delivered: '1 of 1 farmer reached',
    },
    {
        id: 4,
        title: 'July soil health summary',
        body: 'A short network update covering moisture stability, crop recommendations, and resolved sensor events.',
        priority: 'General',
        audience: 'All registered farmers',
        date: 'Drafted Jul 22',
        status: 'Draft',
        delivered: 'Not sent',
    },
];

const priorityStyle: Record<AnnouncementPriority, string> = {
    Urgent: 'bg-rose-100 text-rose-700',
    Important: 'bg-amber-100 text-amber-800',
    General: 'bg-slate-100 text-slate-700',
};

const filters: AnnouncementFilter[] = [
    'All',
    'Published',
    'Scheduled',
    'Draft',
];

export default function Announcements() {
    const [announcements, setAnnouncements] = useState(seedAnnouncements);
    const [activeFilter, setActiveFilter] =
        useState<AnnouncementFilter>('All');
    const [composerOpen, setComposerOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [priority, setPriority] =
        useState<AnnouncementPriority>('General');
    const [audience, setAudience] = useState('All registered farmers');
    const [publishedNotice, setPublishedNotice] = useState<string | null>(null);

    const visibleAnnouncements = useMemo(
        () =>
            announcements.filter(
                (announcement) =>
                    activeFilter === 'All' ||
                    announcement.status === activeFilter,
            ),
        [activeFilter, announcements],
    );

    const publishedCount = announcements.filter(
        (announcement) => announcement.status === 'Published',
    ).length;
    const scheduledCount = announcements.filter(
        (announcement) => announcement.status === 'Scheduled',
    ).length;

    function publishAnnouncement() {
        const cleanTitle = title.trim();
        const cleanBody = body.trim();

        if (!cleanTitle || !cleanBody) {
            return;
        }

        const newAnnouncement: Announcement = {
            id: Math.max(...announcements.map((announcement) => announcement.id), 0) + 1,
            title: cleanTitle,
            body: cleanBody,
            priority,
            audience,
            date: 'Just now',
            status: 'Published',
            delivered:
                audience === 'All registered farmers'
                    ? '24 of 24 farmers reached'
                    : 'Delivery queued for selected farm',
        };

        setAnnouncements((current) => [newAnnouncement, ...current]);
        setPublishedNotice(`“${cleanTitle}” was published to ${audience}.`);
        setTitle('');
        setBody('');
        setPriority('General');
        setAudience('All registered farmers');
        setComposerOpen(false);
    }

    function clearComposer() {
        setTitle('');
        setBody('');
        setPriority('General');
        setAudience('All registered farmers');
    }

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1500px] p-5 sm:p-7 lg:p-10">
                <div className="grid gap-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(310px,0.6fr)] xl:items-end">
                    <header className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                            Farmer communication
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Announcement system
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                            Send timely, clear field updates without losing the
                            context of who needs to receive them.
                        </p>
                    </header>

                    <section className="rounded-[26px] bg-slate-900 p-5 text-white shadow-sm sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                                    Reach today
                                </p>
                                <p className="mt-2 text-3xl font-bold tracking-tight">
                                    24 <span className="text-base font-medium text-emerald-100">farmers</span>
                                </p>
                            </div>
                            <Users className="h-6 w-6 text-emerald-300" />
                        </div>
                        <p className="mt-5 text-sm leading-6 text-emerald-100">
                            All registered farmer accounts are available for
                            announcement delivery.
                        </p>
                    </section>
                </div>

                {publishedNotice && (
                    <div aria-live="polite" className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
                        <span className="flex items-center gap-2 leading-6">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                            {publishedNotice}
                        </span>
                        <button
                            type="button"
                            aria-label="Dismiss published notice"
                            onClick={() => setPublishedNotice(null)}
                            className="rounded-lg p-1 text-emerald-700 transition hover:bg-emerald-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <section className="mt-7 overflow-hidden rounded-[30px] border border-emerald-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_68%)] px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm">
                                <Megaphone className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Write to your farm network
                                </h2>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                                    Choose an audience, set the priority, and
                                    publish an update that farmers can act on.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setComposerOpen((current) => !current)}
                            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                        >
                            {composerOpen ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            {composerOpen ? 'Close composer' : 'New announcement'}
                        </button>
                    </div>

                    {composerOpen && (
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                publishAnnouncement();
                            }}
                            className="grid gap-5 border-t border-emerald-100 px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_220px]"
                        >
                            <div>
                                <label className="text-sm font-semibold text-slate-800" htmlFor="announcement-title">
                                    Announcement title
                                </label>
                                <input
                                    id="announcement-title"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder="e.g. Irrigation guidance for the dry week"
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                />
                                <label className="mt-5 block text-sm font-semibold text-slate-800" htmlFor="announcement-body">
                                    Message
                                </label>
                                <textarea
                                    id="announcement-body"
                                    value={body}
                                    onChange={(event) => setBody(event.target.value)}
                                    placeholder="Give farmers the action, timing, and context they need."
                                    rows={5}
                                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                />
                            </div>
                            <div className="space-y-5 rounded-2xl bg-slate-50 p-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-800" htmlFor="announcement-audience">
                                        Audience
                                    </label>
                                    <select
                                        id="announcement-audience"
                                        value={audience}
                                        onChange={(event) => setAudience(event.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
                                    >
                                        <option>All registered farmers</option>
                                        <option>Calamba Green Acres</option>
                                        <option>Bay Organic Estate</option>
                                        <option>Sta. Rosa Farmstead</option>
                                    </select>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Priority
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        {(['General', 'Important', 'Urgent'] as AnnouncementPriority[]).map(
                                            (option) => (
                                                <label
                                                    key={option}
                                                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="priority"
                                                        value={option}
                                                        checked={priority === option}
                                                        onChange={() => setPriority(option)}
                                                        className="h-4 w-4 border-slate-300 text-emerald-700 focus:ring-emerald-600"
                                                    />
                                                    {option}
                                                </label>
                                            ),
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2 border-t border-slate-200 pt-4">
                                    <button
                                        type="submit"
                                        disabled={!title.trim() || !body.trim()}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                        <Send className="h-4 w-4" /> Publish now
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearComposer}
                                        disabled={!title && !body && priority === 'General' && audience === 'All registered farmers'}
                                        className="w-full rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-300"
                                    >
                                        Clear draft
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </section>

                <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
                    <section>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                    Communication log
                                </p>
                                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                    Sent, scheduled, and drafted
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filters.map((filter) => (
                                    <button
                                        key={filter}
                                        type="button"
                                        onClick={() => setActiveFilter(filter)}
                                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                                            activeFilter === filter
                                                ? 'bg-emerald-700 text-white'
                                                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 space-y-4">
                            {visibleAnnouncements.map((announcement) => (
                                <article
                                    key={announcement.id}
                                    className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                            {announcement.status === 'Scheduled' ? (
                                                <CalendarClock className="h-5 w-5" />
                                            ) : announcement.status === 'Draft' ? (
                                                <FileText className="h-5 w-5" />
                                            ) : (
                                                <Bell className="h-5 w-5" />
                                            )}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${priorityStyle[announcement.priority]}`}>
                                                            {announcement.priority}
                                                        </span>
                                                        <span className="text-xs font-semibold text-slate-400">
                                                            {announcement.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="mt-3 text-base font-bold text-slate-900">
                                                        {announcement.title}
                                                    </h3>
                                                </div>
                                                <ChevronRight className="hidden h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-emerald-700 sm:block" />
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                {announcement.body}
                                            </p>
                                            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {announcement.audience}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    {announcement.date}
                                                </span>
                                                <span className="text-emerald-700">
                                                    {announcement.delivered}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <aside className="h-fit rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                            Delivery overview
                        </p>
                        <div className="mt-7 space-y-6">
                            <div>
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-3xl font-bold tracking-tight text-slate-900">
                                            {publishedCount}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            announcements published
                                        </p>
                                    </div>
                                    <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                                        <Send className="h-5 w-5" />
                                    </span>
                                </div>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full w-[86%] rounded-full bg-emerald-500" />
                                </div>
                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    86% of farmer accounts opened their latest
                                    network update.
                                </p>
                            </div>
                            <div className="border-t border-slate-100 pt-6">
                                <p className="text-sm font-bold text-slate-800">
                                    Next delivery
                                </p>
                                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                                    <p className="font-semibold text-slate-800">
                                        {scheduledCount} scheduled announcement{scheduledCount === 1 ? '' : 's'}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Bay Organic Estate will receive a field
                                        maintenance reminder tomorrow at 7:00 AM.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AdminLayout>
    );
}
