import type { DashboardStat, DashboardStatTone } from './types';

const toneClasses: Record<
    DashboardStatTone,
    { icon: string; marker: string; value: string }
> = {
    healthy: {
        icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        marker: 'bg-emerald-500',
        value: 'text-emerald-950',
    },
    warning: {
        icon: 'bg-amber-50 text-amber-700 ring-amber-100',
        marker: 'bg-amber-500',
        value: 'text-slate-950',
    },
    critical: {
        icon: 'bg-rose-50 text-rose-700 ring-rose-100',
        marker: 'bg-rose-500',
        value: 'text-slate-950',
    },
    offline: {
        icon: 'bg-slate-100 text-slate-600 ring-slate-200',
        marker: 'bg-slate-400',
        value: 'text-slate-950',
    },
    farms: {
        icon: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
        marker: 'bg-emerald-500',
        value: 'text-slate-950',
    },
};

interface FleetStatCardProps {
    stat: DashboardStat;
}

export default function FleetStatCard({ stat }: FleetStatCardProps) {
    const Icon = stat.icon;
    const tone = toneClasses[stat.tone];

    return (
        <article className="group min-w-0 rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                    </p>
                    <p
                        className={
                            'mt-2 text-3xl font-bold tracking-tight ' +
                            tone.value
                        }
                    >
                        {stat.value}
                    </p>
                </div>
                <span
                    className={
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ' +
                        tone.icon
                    }
                >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
            </div>
            <p className="mt-5 flex items-start gap-2 text-sm leading-5 text-slate-500">
                <span
                    className={
                        'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ' +
                        tone.marker
                    }
                />
                {stat.detail}
            </p>
        </article>
    );
}
