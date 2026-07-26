import {
    AlertTriangle,
    BellRing,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Cpu,
    MapPin,
    RefreshCw,
    ShieldAlert,
    Signal,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type AlertPriority = 'Critical' | 'Warning' | 'Info';
type AlertStatus = 'Open' | 'Acknowledged' | 'Resolved';
type AlertFilter = 'All' | AlertPriority;

type FieldAlert = {
    id: string;
    priority: AlertPriority;
    status: AlertStatus;
    title: string;
    description: string;
    farm: string;
    sensor: string;
    timestamp: string;
    reading: string;
};

const initialAlerts: FieldAlert[] = [
    {
        id: 'ALT-2407',
        priority: 'Critical',
        status: 'Open',
        title: 'Soil moisture below irrigation threshold',
        description:
            'Moisture has remained below 30% for two consecutive sensor reports.',
        farm: 'Calamba Green Acres',
        sensor: 'GP-CL-001',
        timestamp: '12 minutes ago',
        reading: '28% moisture',
    },
    {
        id: 'ALT-2406',
        priority: 'Critical',
        status: 'Acknowledged',
        title: 'Sensor stopped reporting',
        description:
            'The device has not checked in during its expected reporting window.',
        farm: 'Bay Organic Estate',
        sensor: 'GP-BY-003',
        timestamp: '46 minutes ago',
        reading: 'No signal for 2h 18m',
    },
    {
        id: 'ALT-2405',
        priority: 'Warning',
        status: 'Open',
        title: 'Soil pH trending acidic',
        description:
            'Current pH is outside the preferred range for the active tomato crop.',
        farm: 'Sta. Rosa Farmstead',
        sensor: 'GP-SR-004',
        timestamp: '1 hour ago',
        reading: 'pH 5.4',
    },
    {
        id: 'ALT-2404',
        priority: 'Warning',
        status: 'Acknowledged',
        title: 'Battery maintenance window',
        description:
            'Battery capacity is nearing the recommended replacement threshold.',
        farm: 'Los Baños Cornfield',
        sensor: 'GP-LB-002',
        timestamp: '3 hours ago',
        reading: '18% battery',
    },
    {
        id: 'ALT-2403',
        priority: 'Info',
        status: 'Resolved',
        title: 'Sensor connection restored',
        description:
            'The device rejoined the monitoring network and sent a valid reading.',
        farm: 'Siniloan Research Field',
        sensor: 'GP-SI-006',
        timestamp: 'Yesterday, 4:20 PM',
        reading: 'Signal: excellent',
    },
];

const priorityStyles: Record<AlertPriority, { dot: string; badge: string }> = {
    Critical: {
        dot: 'bg-rose-500',
        badge: 'border-rose-200 bg-rose-50 text-rose-700',
    },
    Warning: {
        dot: 'bg-amber-500',
        badge: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    Info: {
        dot: 'bg-slate-400',
        badge: 'border-slate-200 bg-slate-50 text-slate-700',
    },
};

const statusStyles: Record<AlertStatus, string> = {
    Open: 'text-rose-700',
    Acknowledged: 'text-amber-700',
    Resolved: 'text-emerald-700',
};

const filterOptions: AlertFilter[] = ['All', 'Critical', 'Warning', 'Info'];

export default function AlertCenter() {
    const [alerts, setAlerts] = useState(initialAlerts);
    const [priorityFilter, setPriorityFilter] = useState<AlertFilter>('All');
    const [showResolved, setShowResolved] = useState(false);
    const [selectedAlertId, setSelectedAlertId] = useState(initialAlerts[0].id);
    const [lastRefreshed, setLastRefreshed] = useState('Updated 2 min ago');

    const visibleAlerts = useMemo(
        () =>
            alerts.filter(
                (alert) =>
                    (priorityFilter === 'All' ||
                        alert.priority === priorityFilter) &&
                    (showResolved || alert.status !== 'Resolved'),
            ),
        [alerts, priorityFilter, showResolved],
    );

    const selectedAlert =
        alerts.find((alert) => alert.id === selectedAlertId) ?? alerts[0];
    const openCriticalCount = alerts.filter(
        (alert) => alert.priority === 'Critical' && alert.status !== 'Resolved',
    ).length;
    const openWarningCount = alerts.filter(
        (alert) => alert.priority === 'Warning' && alert.status !== 'Resolved',
    ).length;
    const resolvedTodayCount = alerts.filter(
        (alert) => alert.status === 'Resolved',
    ).length;

    function updateStatus(status: AlertStatus) {
        setAlerts((current) =>
            current.map((alert) =>
                alert.id === selectedAlert.id ? { ...alert, status } : alert,
            ),
        );
        setLastRefreshed('Updated just now');
    }

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1500px] p-5 sm:p-7 lg:p-10">
                <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                            Field response desk
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Alert center
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                            Prioritize field conditions that need action, then
                            keep every response visible to the monitoring team.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-medium text-slate-400">
                            {lastRefreshed}
                        </span>
                        <button
                            type="button"
                            onClick={() => setLastRefreshed('Updated just now')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-800"
                        >
                            <RefreshCw className="h-4 w-4" /> Refresh feed
                        </button>
                    </div>
                </header>

                <section className="mt-7 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-rose-900">
                                Critical now
                            </span>
                            <ShieldAlert className="h-5 w-5 text-rose-600" />
                        </div>
                        <p className="mt-5 text-3xl font-bold tracking-tight text-rose-950">
                            {openCriticalCount}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-rose-700">
                            Require immediate field coordination.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/75 p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-amber-950">
                                Watch closely
                            </span>
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="mt-5 text-3xl font-bold tracking-tight text-amber-950">
                            {openWarningCount}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-amber-800">
                            Should be reviewed on the next field round.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-emerald-950">
                                Resolved today
                            </span>
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="mt-5 text-3xl font-bold tracking-tight text-emerald-950">
                            {resolvedTodayCount}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                            Conditions closed with a recorded response.
                        </p>
                    </div>
                </section>

                <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]">
                    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Response queue
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {visibleAlerts.length} field signals in
                                        view
                                    </p>
                                </div>
                                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={showResolved}
                                        onChange={(event) =>
                                            setShowResolved(event.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                                    />
                                    Show resolved
                                </label>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setPriorityFilter(option)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                                            priorityFilter === option
                                                ? 'bg-emerald-700 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {visibleAlerts.length === 0 && (
                                <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </span>
                                    <h3 className="mt-4 text-sm font-bold text-slate-800">
                                        Nothing needs attention in this view
                                    </h3>
                                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                        Try a different priority filter or include resolved alerts to review completed work.
                                    </p>
                                </div>
                            )}
                            {visibleAlerts.map((alert) => {
                                const isSelected = alert.id === selectedAlert.id;
                                const styles = priorityStyles[alert.priority];

                                return (
                                    <button
                                        key={alert.id}
                                        type="button"
                                        onClick={() => setSelectedAlertId(alert.id)}
                                        className={`group w-full px-5 py-5 text-left transition sm:px-7 ${
                                            isSelected
                                                ? 'bg-emerald-50/70'
                                                : 'hover:bg-slate-50/70'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span
                                                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`}
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex flex-wrap items-center gap-2">
                                                    <strong className="text-sm text-slate-900">
                                                        {alert.title}
                                                    </strong>
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${styles.badge}`}
                                                    >
                                                        {alert.priority}
                                                    </span>
                                                    <span
                                                        className={`text-[11px] font-bold ${statusStyles[alert.status]}`}
                                                    >
                                                        {alert.status}
                                                    </span>
                                                </span>
                                                <span className="mt-1.5 block max-w-2xl text-sm leading-6 text-slate-500">
                                                    {alert.description}
                                                </span>
                                                <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {alert.farm}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Cpu className="h-3.5 w-3.5" />
                                                        {alert.sensor}
                                                    </span>
                                                    <span>{alert.timestamp}</span>
                                                </span>
                                            </span>
                                            <ChevronRight
                                                className={`mt-1 h-5 w-5 shrink-0 transition ${
                                                    isSelected
                                                        ? 'text-emerald-700'
                                                        : 'text-slate-300 group-hover:text-slate-500'
                                                }`}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <aside className="h-fit overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm xl:sticky xl:top-24">
                        <div className="border-b border-slate-800 bg-slate-900 px-6 py-6 text-white">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Incident detail
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <h2 className="text-xl font-bold tracking-tight">
                                            {selectedAlert.id}
                                        </h2>
                                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${priorityStyles[selectedAlert.priority].badge}`}>
                                            {selectedAlert.priority}
                                        </span>
                                    </div>
                                </div>
                                <BellRing className="h-5 w-5 text-emerald-300" />
                            </div>
                            <p className="mt-5 text-sm leading-6 text-slate-300">
                                {selectedAlert.title}
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                    Current signal
                                </p>
                                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                    {selectedAlert.reading}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {selectedAlert.description}
                                </p>
                            </div>

                            <dl className="mt-6 space-y-4 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-slate-500">Farm</dt>
                                    <dd className="font-semibold text-slate-800">
                                        {selectedAlert.farm}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-slate-500">Sensor</dt>
                                    <dd className="font-semibold text-slate-800">
                                        {selectedAlert.sensor}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-slate-500">Detected</dt>
                                    <dd className="font-semibold text-slate-800">
                                        {selectedAlert.timestamp}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-6 border-t border-slate-100 pt-5">
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                    <Clock3 className="h-4 w-4" /> Response path
                                </p>
                                <div className="mt-4 space-y-4 border-l border-slate-200 pl-4 text-sm">
                                    <div className="relative">
                                        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                                        <p className="font-semibold text-slate-800">
                                            Signal received
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Alert logged at {selectedAlert.timestamp}
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                                        <p className="font-semibold text-slate-700">
                                            Assign field response
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Coordinate the next suitable action.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-7 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                {selectedAlert.status === 'Open' && (
                                    <button
                                        type="button"
                                        onClick={() => updateStatus('Acknowledged')}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 transition hover:bg-amber-100"
                                    >
                                        <Check className="h-4 w-4" /> Acknowledge
                                    </button>
                                )}
                                {selectedAlert.status !== 'Resolved' && (
                                    <button
                                        type="button"
                                        onClick={() => updateStatus('Resolved')}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                                    >
                                        <CheckCircle2 className="h-4 w-4" /> Mark resolved
                                    </button>
                                )}
                                {selectedAlert.status === 'Resolved' && (
                                    <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800">
                                        <CheckCircle2 className="h-4 w-4" /> Response recorded
                                    </span>
                                )}
                            </div>
                            <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-slate-400">
                                <Signal className="h-3.5 w-3.5 shrink-0" />
                                Updating an alert records its operational state
                                in this session.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </AdminLayout>
    );
}
