import { CloudSun, Droplets, ThermometerSun } from 'lucide-react';
import SectionHeading from './SectionHeading';
import type { DashboardAverages } from './types';

interface EnvironmentalAveragesProps {
    averages: DashboardAverages;
}

const clamp = (value: number | null, max: number): number => (
    value === null ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
);

export default function EnvironmentalAverages({ averages }: EnvironmentalAveragesProps) {
    const conditions = [
        {
            label: 'Average soil pH',
            value: averages.ph === null ? '—' : averages.ph.toFixed(2),
            helper: 'Suggested range 6.0–7.0',
            progress: clamp(averages.ph, 10),
            icon: Droplets,
            color: 'bg-emerald-500',
            iconColor: 'bg-emerald-50 text-emerald-700',
        },
        {
            label: 'Average soil temperature',
            value: averages.soil_temperature === null ? '—' : `${averages.soil_temperature.toFixed(1)}°C`,
            helper: 'Latest stored soil readings',
            progress: clamp(averages.soil_temperature, 40),
            icon: ThermometerSun,
            color: 'bg-amber-500',
            iconColor: 'bg-amber-50 text-amber-700',
        },
        {
            label: 'Average humidity',
            value: averages.humidity === null ? '—' : `${averages.humidity.toFixed(1)}%`,
            helper: 'Latest stored ambient readings',
            progress: clamp(averages.humidity, 100),
            icon: CloudSun,
            color: 'bg-emerald-500',
            iconColor: 'bg-emerald-50 text-emerald-700',
        },
    ];

    return (
        <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
            <SectionHeading
                eyebrow="Field environment"
                title="Current network averages"
                description="Averages calculated from stored sensor readings."
            />

            <div className="mt-6 divide-y divide-slate-100">
                {conditions.map(({
                    label,
                    value,
                    helper,
                    progress,
                    icon: Icon,
                    color,
                    iconColor,
                }) => (
                    <div key={label} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColor}`}>
                                <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                                    <p className="shrink-0 text-lg font-bold tracking-tight text-slate-950">{value}</p>
                                </div>
                                <p className="mt-0.5 text-sm text-slate-500">{helper}</p>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`h-full rounded-full ${color}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
