import type { ZoneStatus } from '@/types/gis';

const legendItems: Array<{
    status: ZoneStatus;
    className: string;
}> = [
    { status: 'Healthy', className: 'bg-emerald-500' },
    { status: 'Warning', className: 'bg-amber-500' },
    { status: 'Critical', className: 'bg-rose-500' },
    { status: 'Inactive', className: 'bg-slate-400' },
];

interface MapLegendProps {
    counts: Record<ZoneStatus, number>;
}

export default function MapLegend({ counts }: MapLegendProps) {
    return (
        <section
            aria-label="Zone status legend"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
        >
            <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                Zone status
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2">
                {legendItems.map(({ status, className }) => (
                    <span
                        key={status}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600"
                    >
                        <span
                            className={`h-2.5 w-2.5 rounded-full ${className}`}
                            aria-hidden="true"
                        />
                        {status}
                        <span className="text-slate-400">{counts[status]}</span>
                    </span>
                ))}
            </div>
        </section>
    );
}
