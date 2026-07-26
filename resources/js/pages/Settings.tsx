import {
    BellRing,
    Check,
    ChevronRight,
    CircleUserRound,
    Gauge,
    Globe2,
    LockKeyhole,
    MonitorCog,
    Save,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type SettingsSection =
    | 'Admin profile'
    | 'Notifications'
    | 'Alert thresholds'
    | 'System preferences';

const sections = [
    {
        title: 'Admin profile' as const,
        description: 'Account and contact details',
        icon: CircleUserRound,
    },
    {
        title: 'Notifications' as const,
        description: 'Response and delivery rules',
        icon: BellRing,
    },
    {
        title: 'Alert thresholds' as const,
        description: 'Readings that open an alert',
        icon: Gauge,
    },
    {
        title: 'System preferences' as const,
        description: 'Workspace defaults',
        icon: MonitorCog,
    },
];

function Toggle({
    checked,
    onChange,
    label,
    description,
}: {
    checked: boolean;
    onChange: () => void;
    label: string;
    description: string;
}) {
    return (
        <div className="flex items-start justify-between gap-5 py-4">
            <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={onChange}
                className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${
                    checked ? 'bg-emerald-700' : 'bg-slate-300'
                }`}
            >
                <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        checked ? 'left-6' : 'left-1'
                    }`}
                />
            </button>
        </div>
    );
}

export default function Settings() {
    const [selectedSection, setSelectedSection] =
        useState<SettingsSection>('Admin profile');
    const [saveState, setSaveState] = useState('All changes saved');
    const [profile, setProfile] = useState({
        name: 'Maria Santos',
        email: 'maria.santos@geo-pulse.test',
        phone: '+63 917 000 4421',
    });
    const [notifications, setNotifications] = useState({
        critical: true,
        dailyDigest: true,
        announcements: true,
        maintenance: false,
    });
    const [thresholds, setThresholds] = useState({
        moisture: '30',
        phLow: '5.5',
        phHigh: '7.5',
        battery: '20',
    });
    const [preferences, setPreferences] = useState({
        refresh: '5 minutes',
        landing: 'Dashboard',
        units: 'Metric',
        timezone: 'Asia/Manila (GMT+8)',
    });

    function markSaved() {
        setSaveState('Saved just now');
    }

    function toggleNotification(key: keyof typeof notifications) {
        setNotifications((current) => ({
            ...current,
            [key]: !current[key],
        }));
        setSaveState('Unsaved changes');
    }

    const selectedMeta = sections.find(
        (section) => section.title === selectedSection,
    );
    const hasUnsavedChanges = saveState === 'Unsaved changes';

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1420px] p-5 sm:p-7 lg:p-10">
                <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                            Workspace control
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Settings
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            Shape how the Geo-Pulse monitoring workspace alerts,
                            reports, and supports your field team.
                        </p>
                    </div>
                    <div aria-live="polite" className={`inline-flex w-fit items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                        hasUnsavedChanges
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                    }`}>
                        {hasUnsavedChanges ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />} {saveState}
                    </div>
                </header>

                <div className="mt-8 grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="h-fit rounded-[26px] border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
                        <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Configuration
                        </p>
                        <div className="space-y-1">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                const isActive = selectedSection === section.title;

                                return (
                                    <button
                                        key={section.title}
                                        type="button"
                                        onClick={() => setSelectedSection(section.title)}
                                        className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                                            isActive
                                                ? 'bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                isActive
                                                    ? 'bg-emerald-700 text-white'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            <Icon className="h-4.5 w-4.5" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-bold">
                                                {section.title}
                                            </span>
                                            <span
                                                className={`mt-0.5 block truncate text-xs ${
                                                    isActive
                                                    ? 'text-emerald-700'
                                                        : 'text-slate-400'
                                                }`}
                                            >
                                                {section.description}
                                            </span>
                                        </span>
                                        <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="m-3 mt-6 rounded-2xl bg-slate-900 p-4 text-white">
                            <ShieldCheck className="h-5 w-5 text-emerald-300" />
                            <p className="mt-4 text-sm font-bold">Secure workspace</p>
                            <p className="mt-1 text-xs leading-5 text-slate-300">
                                Your current session is protected and managed by
                                your administrator role.
                            </p>
                        </div>
                    </aside>

                    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-start gap-4 border-b border-emerald-100 bg-emerald-50/45 px-5 py-6 sm:px-8">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-slate-100">
                                {selectedMeta && <selectedMeta.icon className="h-5 w-5" />}
                            </span>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    {selectedSection}
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {selectedMeta?.description}. Update the
                                    defaults that guide your monitoring team.
                                </p>
                            </div>
                        </div>

                        <div className="px-5 py-6 sm:px-8 sm:py-8">
                            {selectedSection === 'Admin profile' && (
                                <div className="max-w-2xl">
                                    <div className="flex items-center gap-4 rounded-2xl bg-emerald-50 p-4">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-lg font-bold text-white">
                                            MS
                                        </span>
                                        <div>
                                            <p className="font-bold text-emerald-950">
                                                Admin account
                                            </p>
                                            <p className="mt-1 text-sm text-emerald-800">
                                                Primary contact for the Geo-Pulse
                                                operations workspace.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Full name
                                            <input
                                                value={profile.name}
                                                onChange={(event) => {
                                                    setProfile((current) => ({ ...current, name: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </label>
                                        <label className="text-sm font-semibold text-slate-700">
                                            Work email
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(event) => {
                                                    setProfile((current) => ({ ...current, email: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </label>
                                        <label className="text-sm font-semibold text-slate-700">
                                            Mobile number
                                            <input
                                                value={profile.phone}
                                                onChange={(event) => {
                                                    setProfile((current) => ({ ...current, phone: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </label>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                                                Role
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                                System administrator
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedSection === 'Notifications' && (
                                <div className="max-w-3xl divide-y divide-slate-100">
                                    <Toggle
                                        checked={notifications.critical}
                                        onChange={() => toggleNotification('critical')}
                                        label="Critical field alerts"
                                        description="Receive immediate notification when a sensor reports a critical field condition or goes offline."
                                    />
                                    <Toggle
                                        checked={notifications.dailyDigest}
                                        onChange={() => toggleNotification('dailyDigest')}
                                        label="Daily monitoring digest"
                                        description="Send a summary of network health, open alerts, and farm activity at the start of each day."
                                    />
                                    <Toggle
                                        checked={notifications.announcements}
                                        onChange={() => toggleNotification('announcements')}
                                        label="Announcement delivery updates"
                                        description="Confirm when a farmer announcement is published, scheduled, or cannot be delivered."
                                    />
                                    <Toggle
                                        checked={notifications.maintenance}
                                        onChange={() => toggleNotification('maintenance')}
                                        label="Maintenance reminders"
                                        description="Receive a reminder before planned sensor calibration and battery maintenance windows."
                                    />
                                </div>
                            )}

                            {selectedSection === 'Alert thresholds' && (
                                <div className="max-w-3xl">
                                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                                        <span className="font-bold">Operational note:</span>{' '}
                                        changes here affect when incoming sensor
                                        readings enter the Alert Center. Review
                                        thresholds with your agriculture lead.
                                    </div>
                                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Low soil moisture (%)
                                            <input
                                                inputMode="decimal"
                                                value={thresholds.moisture}
                                                onChange={(event) => {
                                                    setThresholds((current) => ({ ...current, moisture: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </label>
                                        <label className="text-sm font-semibold text-slate-700">
                                            Low soil pH
                                            <input
                                                inputMode="decimal"
                                                value={thresholds.phLow}
                                                onChange={(event) => {
                                                    setThresholds((current) => ({ ...current, phLow: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </label>
                                        <label className="text-sm font-semibold text-slate-700">
                                            High soil pH
                                            <input
                                                inputMode="decimal"
                                                value={thresholds.phHigh}
                                                onChange={(event) => {
                                                    setThresholds((current) => ({ ...current, phHigh: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </label>
                                        <label className="text-sm font-semibold text-slate-700">
                                            Low sensor battery (%)
                                            <input
                                                inputMode="decimal"
                                                value={thresholds.battery}
                                                onChange={(event) => {
                                                    setThresholds((current) => ({ ...current, battery: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {selectedSection === 'System preferences' && (
                                <div className="max-w-3xl space-y-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Sensor refresh interval
                                            <select
                                                value={preferences.refresh}
                                                onChange={(event) => {
                                                    setPreferences((current) => ({ ...current, refresh: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500"
                                            >
                                                <option>1 minute</option>
                                                <option>5 minutes</option>
                                                <option>15 minutes</option>
                                            </select>
                                        </label>
                                        <label className="text-sm font-semibold text-slate-700">
                                            Default landing page
                                            <select
                                                value={preferences.landing}
                                                onChange={(event) => {
                                                    setPreferences((current) => ({ ...current, landing: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500"
                                            >
                                                <option>Dashboard</option>
                                                <option>GIS / Map View</option>
                                                <option>Sensor Monitoring</option>
                                            </select>
                                        </label>
                                        <label className="text-sm font-semibold text-slate-700">
                                            Measurement units
                                            <select
                                                value={preferences.units}
                                                onChange={(event) => {
                                                    setPreferences((current) => ({ ...current, units: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500"
                                            >
                                                <option>Metric</option>
                                                <option>Imperial</option>
                                            </select>
                                        </label>
                                        <label className="text-sm font-semibold text-slate-700">
                                            Workspace timezone
                                            <select
                                                value={preferences.timezone}
                                                onChange={(event) => {
                                                    setPreferences((current) => ({ ...current, timezone: event.target.value }));
                                                    setSaveState('Unsaved changes');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-500"
                                            >
                                                <option>Asia/Manila (GMT+8)</option>
                                                <option>Asia/Singapore (GMT+8)</option>
                                                <option>UTC (GMT+0)</option>
                                            </select>
                                        </label>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                        <Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                                        These preferences apply to this admin
                                        workspace and help keep data labels and
                                        update times consistent for the team.
                                    </div>
                                </div>
                            )}

                            <div className="mt-9 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <p className="flex items-center gap-2 text-xs leading-5 text-slate-400">
                                    <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
                                    Review unsaved changes before leaving this page.
                                </p>
                                <button
                                    type="button"
                                    onClick={markSaved}
                                    disabled={!hasUnsavedChanges}
                                    className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    <Save className="h-4 w-4" /> Save changes
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
