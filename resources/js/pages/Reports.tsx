import type { LucideIcon } from 'lucide-react';
import {
    ArrowUpRight,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Download,
    FileCheck2,
    FileText,
    Gauge,
    Leaf,
    Mail,
    MapPinned,
    RadioTower,
    Send,
    Sparkles,
    Sprout,
} from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type ReportId =
    | 'soil-health'
    | 'sensor-performance'
    | 'farm-performance'
    | 'crop-recommendations'
    | 'monthly-monitoring';

type ReportTemplate = {
    id: ReportId;
    title: string;
    shortTitle: string;
    description: string;
    purpose: string;
    cadence: string;
    format: string;
    updated: string;
    icon: LucideIcon;
    iconTone: string;
    accent: string;
    sections: string[];
};

const reportTemplates: ReportTemplate[] = [
    {
        id: 'soil-health',
        title: 'Soil Health Report',
        shortTitle: 'Soil health',
        description:
            'A field-by-field view of moisture, pH, NPK levels, and amendment priorities.',
        purpose: 'Plan nutrient and irrigation actions',
        cadence: 'Weekly',
        format: 'PDF + CSV',
        updated: 'Data current today',
        icon: Sprout,
        iconTone: 'bg-emerald-100 text-emerald-800',
        accent: 'border-emerald-200 hover:border-emerald-400',
        sections: [
            'Soil condition score',
            'pH & NPK comparison',
            'Priority actions',
        ],
    },
    {
        id: 'sensor-performance',
        title: 'Sensor Performance Report',
        shortTitle: 'Sensor performance',
        description:
            'Device uptime, signal quality, battery risks, and maintenance events across the fleet.',
        purpose: 'Keep field telemetry dependable',
        cadence: 'Weekly',
        format: 'PDF',
        updated: '143 devices checked',
        icon: RadioTower,
        iconTone: 'bg-slate-100 text-slate-700',
        accent: 'border-slate-200 hover:border-slate-400',
        sections: [
            'Availability trend',
            'Battery watchlist',
            'Maintenance log',
        ],
    },
    {
        id: 'farm-performance',
        title: 'Farm Performance Report',
        shortTitle: 'Farm performance',
        description:
            'A comparative scorecard for field coverage, crop condition, alerts, and work completed.',
        purpose: 'Compare progress across farms',
        cadence: 'Monthly',
        format: 'PDF + XLSX',
        updated: '24 monitored fields',
        icon: MapPinned,
        iconTone: 'bg-amber-100 text-amber-800',
        accent: 'border-amber-200 hover:border-amber-400',
        sections: ['Farm scorecards', 'Alert resolution', 'Field comparison'],
    },
    {
        id: 'crop-recommendations',
        title: 'Crop Recommendation Summary',
        shortTitle: 'Crop recommendations',
        description:
            'Recommended crop mixes based on soil suitability, growing conditions, and field history.',
        purpose: 'Choose what each field is ready to grow',
        cadence: 'Per season',
        format: 'PDF',
        updated: 'Based on latest samples',
        icon: Leaf,
        iconTone: 'bg-emerald-100 text-emerald-800',
        accent: 'border-emerald-200 hover:border-emerald-400',
        sections: [
            'Suitability ranking',
            'Expected constraints',
            'Field recommendations',
        ],
    },
    {
        id: 'monthly-monitoring',
        title: 'Monthly Monitoring Report',
        shortTitle: 'Monthly monitoring',
        description:
            'An executive field brief that combines operations, soil change, sensor coverage, and next steps.',
        purpose: 'Share the full monthly monitoring picture',
        cadence: 'Monthly',
        format: 'PDF + presentation',
        updated: 'July edition in progress',
        icon: Gauge,
        iconTone: 'bg-slate-100 text-slate-700',
        accent: 'border-slate-200 hover:border-slate-400',
        sections: ['Network snapshot', 'Field exceptions', 'Next-month plan'],
    },
];

const recentReports = [
    {
        title: 'Soil Health Report · Calamba Green Acres',
        type: 'PDF + CSV',
        prepared: 'Today, 9:40 AM',
        owner: 'Marco L.',
    },
    {
        title: 'Sensor Performance Report · Network',
        type: 'PDF',
        prepared: '22 Jul, 4:15 PM',
        owner: 'System',
    },
    {
        title: 'Farm Performance Report · June',
        type: 'PDF + XLSX',
        prepared: '01 Jul, 10:02 AM',
        owner: 'Ana R.',
    },
];

function ReportCard({
    report,
    selected,
    onSelect,
}: {
    report: ReportTemplate;
    selected: boolean;
    onSelect: () => void;
}) {
    const Icon = report.icon;

    return (
        <article
            className={`group flex min-h-[264px] flex-col rounded-3xl border bg-white p-5 shadow-sm transition duration-200 sm:p-6 ${
                selected
                    ? 'border-emerald-500 ring-4 ring-emerald-100'
                    : report.accent
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${report.iconTone}`}
                >
                    <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {report.cadence}
                </span>
            </div>

            <div className="mt-5">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    {report.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    {report.description}
                </p>
            </div>

            <div className="mt-auto pt-5">
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-500">
                        {report.format}
                    </span>
                    <button
                        type="button"
                        onClick={onSelect}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
                    >
                        {selected ? 'In workspace' : 'Open report'}
                        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function Reports() {
    const [activeReport, setActiveReport] =
        useState<ReportId>('monthly-monitoring');
    const [preparedReport, setPreparedReport] = useState<ReportId | null>(null);
    const [deliveryMode, setDeliveryMode] = useState<'Schedule' | 'Manual'>(
        'Schedule',
    );

    const selectedReport =
        reportTemplates.find((report) => report.id === activeReport) ??
        reportTemplates[0];
    const SelectedIcon = selectedReport.icon;

    function prepareReport() {
        setPreparedReport(activeReport);
    }

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1540px] p-5 sm:p-7 lg:p-10">
                <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.19em] text-emerald-700 uppercase">
                            <FileText className="h-4 w-4" />
                            Report workspace
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Field reports, ready for a clear decision.
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            Build concise monitoring reports from current field
                            data, then share the right version with growers and
                            the operations team.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setActiveReport('monthly-monitoring')}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
                    >
                        <Sparkles className="h-4 w-4" />
                        Build monthly brief
                    </button>
                </header>

                <section className="mt-7 grid overflow-hidden rounded-[30px] border border-emerald-100 bg-emerald-50/60 shadow-sm xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="p-6 sm:p-8 lg:p-9">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-emerald-800 uppercase">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Active report builder
                        </div>
                        <div className="mt-5 flex items-start gap-4">
                            <span
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ${selectedReport.iconTone.split(' ')[1]}`}
                            >
                                <SelectedIcon className="h-6 w-6" />
                            </span>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {selectedReport.title}
                                </h2>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                                    {selectedReport.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-7 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4">
                                <p className="text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                                    Purpose
                                </p>
                                <p className="mt-1.5 text-sm leading-5 font-semibold text-slate-800">
                                    {selectedReport.purpose}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4">
                                <p className="text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                                    Cadence
                                </p>
                                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                    {selectedReport.cadence}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4">
                                <p className="text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                                    Deliverables
                                </p>
                                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                    {selectedReport.format}
                                </p>
                            </div>
                        </div>

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={prepareReport}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                            >
                                <FileCheck2 className="h-4 w-4" />
                                {preparedReport === activeReport
                                    ? 'Report prepared'
                                    : 'Prepare report'}
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-white"
                            >
                                <Download className="h-4 w-4" />
                                View latest
                            </button>
                            {preparedReport === activeReport && (
                            <span aria-live="polite" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Ready to send
                                </span>
                            )}
                        </div>
                    </div>

                    <aside className="border-t border-emerald-100 bg-white/70 p-6 sm:p-8 xl:border-t-0 xl:border-l xl:p-9">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase">
                                    Report contents
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                    A concise, field-ready structure
                                </p>
                            </div>
                            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                                {selectedReport.updated}
                            </span>
                        </div>

                        <ol className="mt-6 space-y-3">
                            {selectedReport.sections.map((section, index) => (
                                <li
                                    key={section}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-800">
                                        {section}
                                    </span>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-6 rounded-2xl bg-slate-900 p-4 text-emerald-50">
                            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-emerald-200 uppercase">
                                <Clock3 className="h-4 w-4" />
                                Source freshness
                            </p>
                            <p className="mt-2 text-sm leading-6 text-emerald-50/80">
                                Sensor readings and field records are synced
                                through today, 11:52 AM.
                            </p>
                        </div>
                    </aside>
                </section>

                <section className="mt-9">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-700 uppercase">
                                Report library
                            </p>
                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                Choose a field question to answer
                            </h2>
                        </div>
                        <p className="text-sm text-slate-500">
                            Five ready-to-build agriculture reports
                        </p>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {reportTemplates.map((report) => (
                            <ReportCard
                                key={report.id}
                                report={report}
                                selected={activeReport === report.id}
                                onSelect={() => setActiveReport(report.id)}
                            />
                        ))}
                    </div>
                </section>

                <section className="mt-9 grid gap-5 pb-5 xl:grid-cols-[1.25fr_0.75fr]">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-700 uppercase">
                                    Recent files
                                </p>
                                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                                    Prepared reports
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
                            >
                                View archive
                            </button>
                        </div>

                        <div className="mt-5 divide-y divide-slate-100">
                            {recentReports.map((report) => (
                                <article
                                    key={report.title}
                                    className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                            <FileText className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-bold text-slate-800">
                                                {report.title}
                                            </h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {report.type} ·{' '}
                                                {report.prepared} ·{' '}
                                                {report.owner}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
                                    >
                                        Open
                                        <ArrowUpRight className="h-4 w-4" />
                                    </button>
                                </article>
                            ))}
                        </div>
                    </section>

                    <aside className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm sm:p-6">
                        <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-emerald-300 uppercase">
                            <Mail className="h-4 w-4" />
                            Delivery desk
                        </p>
                        <h2 className="mt-2 text-xl font-bold tracking-tight">
                            July monitoring dispatch
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Send the monthly monitoring report to the field
                            operations group when the July data window closes.
                        </p>

                        <div className="mt-6 flex rounded-xl bg-white/10 p-1">
                            {(['Schedule', 'Manual'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setDeliveryMode(mode)}
                                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition ${
                                        deliveryMode === mode
                                            ? 'bg-white text-slate-900'
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                                <span className="text-slate-400">Report</span>
                                <strong className="text-right text-white">
                                    Monthly Monitoring
                                </strong>
                            </div>
                            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                                <span className="text-slate-400">
                                    Recipients
                                </span>
                                <strong className="text-right text-white">
                                    6 team members
                                </strong>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-400">
                                    {deliveryMode === 'Schedule'
                                        ? 'Scheduled for'
                                        : 'Ready for'}
                                </span>
                                <strong className="text-right text-white">
                                    {deliveryMode === 'Schedule'
                                        ? '01 Aug · 8:00 AM'
                                        : 'Send when approved'}
                                </strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300"
                        >
                            <Send className="h-4 w-4" />
                            {deliveryMode === 'Schedule'
                                ? 'Review scheduled delivery'
                                : 'Prepare for sending'}
                        </button>
                    </aside>
                </section>
            </div>
        </AdminLayout>
    );
}
