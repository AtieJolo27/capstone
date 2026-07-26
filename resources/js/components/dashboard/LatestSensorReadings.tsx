import { Link } from '@inertiajs/react';
import { ArrowUpRight, Radio, RadioTower } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { formatDateTime, formatNumber } from '@/lib/formatters';
import type { SensorReading } from '@/types';
import SectionHeading from './SectionHeading';

const sensorHealthStyle: Record<string, { dot: string; badge: string }> = {
    healthy: {
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    },
    warning: {
        dot: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-700 ring-amber-100',
    },
    critical: {
        dot: 'bg-rose-500',
        badge: 'bg-rose-50 text-rose-700 ring-rose-100',
    },
    offline: {
        dot: 'bg-slate-400',
        badge: 'bg-slate-100 text-slate-600 ring-slate-200',
    },
};

interface LatestSensorReadingsProps {
    readings: SensorReading[];
}

const percentage = (value: number | null): string => (
    value === null ? '—' : `${formatNumber(value)}%`
);

const degree = (value: number | null): string => (
    value === null ? '—' : `${formatNumber(value)}°C`
);

export default function LatestSensorReadings({ readings }: LatestSensorReadingsProps) {
    return (
        <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
            <div className="p-5 sm:p-6 lg:p-7">
                <SectionHeading
                    eyebrow="Latest telemetry"
                    title="Latest sensor readings"
                    description="Most recent readings stored from field devices."
                    action={(
                        <Link
                            href="/sensor-readings"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition hover:text-emerald-600"
                        >
                            View all
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    )}
                />
            </div>

            <div className="border-t border-slate-100">
                {readings.length === 0 ? (
                    <EmptyState
                        icon={RadioTower}
                        title="No sensor readings yet"
                        description="New readings will appear here after a device sends telemetry."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-[780px] w-full text-left">
                            <thead className="bg-slate-50/80">
                                <tr className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                                    <th className="px-5 py-3.5 sm:px-6">Sensor / field</th>
                                    <th className="px-4 py-3.5">Moisture</th>
                                    <th className="px-4 py-3.5">pH</th>
                                    <th className="px-4 py-3.5">Soil temp.</th>
                                    <th className="px-4 py-3.5">Humidity</th>
                                    <th className="px-5 py-3.5 text-right sm:px-6">Recorded</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {readings.map((reading) => {
                                    const sensor = reading.sensor_device;
                                    const status = sensor?.status?.toLowerCase() ?? 'offline';
                                    const health = sensorHealthStyle[status] ?? sensorHealthStyle.offline;

                                    return (
                                        <tr key={reading.id} className="transition hover:bg-slate-50/80">
                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex min-w-[210px] items-start gap-3">
                                                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${health.dot}`} />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-sm font-bold text-slate-900">
                                                                {sensor?.farm?.farm_name ?? 'Unassigned sensor'}
                                                            </p>
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${health.badge}`}>
                                                                {status}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                                            <Radio className="h-3.5 w-3.5 text-emerald-700" />
                                                            {sensor?.sensor_code ?? 'No device code'} · {sensor?.farm?.current_crop ?? 'No crop recorded'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                                                {percentage(reading.soil_moisture)}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                                                {formatNumber(reading.ph, 2)}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                                                {degree(reading.soil_temperature)}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                                                {percentage(reading.humidity)}
                                            </td>
                                            <td className="px-5 py-4 text-right text-sm font-medium text-slate-500 sm:px-6">
                                                {formatDateTime(reading.recorded_at)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
