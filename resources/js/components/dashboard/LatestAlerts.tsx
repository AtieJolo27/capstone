import { Link } from '@inertiajs/react';
import { ArrowRight, TriangleAlert } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { formatDateTime } from '@/lib/formatters';
import type { Alert } from '@/types';
import SectionHeading from './SectionHeading';

const alertStyles: Record<string, { badge: string; rail: string; icon: string }> = {
    critical: {
        badge: 'bg-rose-50 text-rose-700 ring-rose-100',
        rail: 'bg-rose-500',
        icon: 'bg-rose-50 text-rose-700',
    },
    warning: {
        badge: 'bg-amber-50 text-amber-700 ring-amber-100',
        rail: 'bg-amber-500',
        icon: 'bg-amber-50 text-amber-700',
    },
    info: {
        badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        rail: 'bg-emerald-500',
        icon: 'bg-emerald-50 text-emerald-700',
    },
};

interface LatestAlertsProps {
    alerts: Alert[];
    openAlertCount: number;
}

export default function LatestAlerts({ alerts, openAlertCount }: LatestAlertsProps) {
    return (
        <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
            <div className="p-5 sm:p-6 lg:p-7">
                <SectionHeading
                    eyebrow="Attention queue"
                    title="Latest field alerts"
                    description="Prioritized records from the active monitoring network."
                    action={(
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700">
                            <TriangleAlert className="h-4 w-4" />
                            {openAlertCount} open
                        </span>
                    )}
                />
            </div>

            <div className="border-t border-slate-100">
                {alerts.length === 0 ? (
                    <EmptyState
                        icon={TriangleAlert}
                        title="No field alerts"
                        description="New field or sensor alerts will appear here when conditions need attention."
                    />
                ) : (
                    alerts.map((alert) => {
                        const severity = alert.severity.toLowerCase();
                        const style = alertStyles[severity] ?? alertStyles.warning;

                        return (
                            <article
                                key={alert.id}
                                className="group relative px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                            >
                                <span className={`absolute inset-y-0 left-0 w-1 ${style.rail}`} />
                                <div className="flex gap-3.5">
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
                                        <TriangleAlert className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <h3 className="text-sm font-bold text-slate-900">
                                                {alert.title}
                                            </h3>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${style.badge}`}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm leading-5 text-slate-500">
                                            {alert.message}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-400">
                                            <span>{alert.farm?.farm_name ?? 'Unassigned farm'}</span>
                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                            <span>{formatDateTime(alert.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>

            <Link
                href="/alerts"
                className="flex items-center justify-center gap-2 border-t border-slate-100 px-5 py-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
                Review the monitoring queue
                <ArrowRight className="h-4 w-4" />
            </Link>
        </section>
    );
}
