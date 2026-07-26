import { Link, router } from '@inertiajs/react';
import {
    ClipboardCheck,
    Droplets,
    Eye,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEventHandler } from 'react';
import EmptyState from '@/components/EmptyState';
import FlashMessages from '@/components/FlashMessages';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import AdminLayout from '@/layouts/AdminLayout';
import { formatDateTime, formatNumber } from '@/lib/formatters';
import sensorReadingRoutes from '@/routes/sensor-readings';
import type { Farm, Paginated, SensorDevice, SensorReading } from '@/types';

type FarmOption = Pick<Farm, 'id' | 'farm_name' | 'municipality' | 'province'>;
type SensorOption = Pick<
    SensorDevice,
    'id' | 'sensor_code' | 'device_name' | 'status'
> & {
    farm?: FarmOption | null;
};

interface SensorReadingIndexPageProps {
    readings: Paginated<SensorReading>;
    filters: {
        search: string | null;
        status: string | null;
        sensor_id: number | null;
        farm_id: number | null;
    };
    sensors: SensorOption[];
}

const statusClasses: Record<string, string> = {
    normal: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    valid: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-800 ring-amber-100',
    review: 'bg-amber-50 text-amber-800 ring-amber-100',
    critical: 'bg-rose-50 text-rose-700 ring-rose-100',
    invalid: 'bg-rose-50 text-rose-700 ring-rose-100',
};

const readingStatusClass = (status: string | null | undefined): string =>
    statusClasses[status?.toLowerCase() ?? ''] ??
    'bg-slate-100 text-slate-600 ring-slate-200';

const measurement = (
    value: number | null,
    suffix: string,
    digits = 1,
): string => (value === null ? '—' : `${formatNumber(value, digits)}${suffix}`);

export default function SensorReadingIndexPage({
    readings,
    filters,
    sensors,
}: SensorReadingIndexPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [sensorId, setSensorId] = useState(
        filters.sensor_id?.toString() ?? '',
    );
    const [farmId, setFarmId] = useState(filters.farm_id?.toString() ?? '');

    const farms = useMemo(() => {
        const options = new Map<number, FarmOption>();

        sensors.forEach((sensor) => {
            if (sensor.farm) {
                options.set(sensor.farm.id, sensor.farm);
            }
        });

        return Array.from(options.values()).sort((left, right) =>
            left.farm_name.localeCompare(right.farm_name),
        );
    }, [sensors]);

    const submitFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        router.get(
            sensorReadingRoutes.index.url(),
            {
                search: search.trim() || undefined,
                status: status || undefined,
                sensor_id: sensorId || undefined,
                farm_id: farmId || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setSensorId('');
        setFarmId('');
        router.get(
            sensorReadingRoutes.index.url(),
            {},
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const removeReading = (reading: SensorReading) => {
        if (
            window.confirm(
                `Remove the reading recorded ${formatDateTime(reading.recorded_at)}? Linked predictions or alerts will prevent deletion.`,
            )
        ) {
            router.delete(sensorReadingRoutes.destroy.url(reading), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1540px] space-y-6 px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
                <PageHeader
                    eyebrow="Field data log"
                    title="Sensor readings"
                    description="Review incoming soil measurements, record manual observations, and keep data quality visible before it informs recommendations."
                    action={
                        <Link
                            href={sensorReadingRoutes.create.url()}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                            <Plus className="h-4 w-4" />
                            Record reading
                        </Link>
                    }
                />

                <FlashMessages />

                <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
                    <form
                        onSubmit={submitFilters}
                        className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(0,1fr)_10rem_13rem_12rem_auto_auto] xl:items-center"
                    >
                        <label className="relative min-w-0 sm:col-span-2 xl:col-span-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 py-2.5 pr-3.5 pl-10 text-sm transition outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                placeholder="Search device code, status, or source"
                                aria-label="Search sensor readings"
                            />
                        </label>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            aria-label="Filter by reading status"
                        >
                            <option value="">All statuses</option>
                            <option value="normal">Normal</option>
                            <option value="warning">Warning</option>
                            <option value="critical">Critical</option>
                            <option value="review">Needs review</option>
                        </select>
                        <select
                            value={sensorId}
                            onChange={(event) =>
                                setSensorId(event.target.value)
                            }
                            className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            aria-label="Filter by sensor"
                        >
                            <option value="">All devices</option>
                            {sensors.map((sensor) => (
                                <option key={sensor.id} value={sensor.id}>
                                    {sensor.sensor_code}
                                </option>
                            ))}
                        </select>
                        <select
                            value={farmId}
                            onChange={(event) => setFarmId(event.target.value)}
                            className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            aria-label="Filter by farm"
                        >
                            <option value="">All farms</option>
                            {farms.map((farm) => (
                                <option key={farm.id} value={farm.id}>
                                    {farm.farm_name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                        >
                            Apply
                        </button>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                    </form>

                    {readings.data.length === 0 ? (
                        <EmptyState
                            icon={Droplets}
                            title="No readings found"
                            description="Adjust the filters or record a field observation to begin building a reliable monitoring history."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1130px] text-left">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-5 py-3.5 sm:px-6">
                                            Recorded
                                        </th>
                                        <th className="px-5 py-3.5">
                                            Device and field
                                        </th>
                                        <th className="px-5 py-3.5">
                                            Soil moisture
                                        </th>
                                        <th className="px-5 py-3.5">
                                            pH / humidity
                                        </th>
                                        <th className="px-5 py-3.5">NPK</th>
                                        <th className="px-5 py-3.5">Quality</th>
                                        <th className="px-5 py-3.5 text-right sm:px-6">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {readings.data.map((reading) => (
                                        <tr
                                            key={reading.id}
                                            className="transition hover:bg-slate-50/70"
                                        >
                                            <td className="px-5 py-4 align-top sm:px-6">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {formatDateTime(
                                                        reading.recorded_at,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500 capitalize">
                                                    {reading.data_source ||
                                                        'Not recorded'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 align-top">
                                                <p className="max-w-52 truncate font-mono text-sm font-bold text-slate-800">
                                                    {reading.sensor_device
                                                        ?.sensor_code ??
                                                        'Manual observation'}
                                                </p>
                                                <p className="mt-1 max-w-52 truncate text-xs text-slate-500">
                                                    {reading.sensor_device?.farm
                                                        ?.farm_name ??
                                                        'No linked farm'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-bold text-slate-800">
                                                    {measurement(
                                                        reading.soil_moisture,
                                                        '%',
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Soil temperature{' '}
                                                    {measurement(
                                                        reading.soil_temperature,
                                                        '°C',
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-bold text-slate-800">
                                                    pH{' '}
                                                    {measurement(
                                                        reading.ph,
                                                        '',
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Humidity{' '}
                                                    {measurement(
                                                        reading.humidity,
                                                        '%',
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {measurement(
                                                        reading.nitrogen,
                                                        '',
                                                        0,
                                                    )}{' '}
                                                    /{' '}
                                                    {measurement(
                                                        reading.phosphorus,
                                                        '',
                                                        0,
                                                    )}{' '}
                                                    /{' '}
                                                    {measurement(
                                                        reading.potassium,
                                                        '',
                                                        0,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    N / P / K
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 align-top">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ${readingStatusClass(reading.reading_status)}`}
                                                >
                                                    {reading.reading_status ||
                                                        'Unknown'}
                                                </span>
                                                <p
                                                    className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${reading.is_valid ? 'text-emerald-700' : 'text-rose-700'}`}
                                                >
                                                    <ClipboardCheck className="h-3.5 w-3.5" />
                                                    {reading.is_valid
                                                        ? 'Validated'
                                                        : 'Needs validation'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 align-top sm:px-6">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={sensorReadingRoutes.show.url(
                                                            reading,
                                                        )}
                                                        aria-label={`View reading ${reading.id}`}
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={sensorReadingRoutes.edit.url(
                                                            reading,
                                                        )}
                                                        aria-label={`Edit reading ${reading.id}`}
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeReading(
                                                                reading,
                                                            )
                                                        }
                                                        aria-label={`Remove reading ${reading.id}`}
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <Pagination paginator={readings} />
                </section>
            </div>
        </AdminLayout>
    );
}
