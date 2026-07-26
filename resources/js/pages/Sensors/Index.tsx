import { Link, router } from '@inertiajs/react';
import {
    BatteryMedium,
    Cpu,
    Eye,
    MapPin,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Signal,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import EmptyState from '@/components/EmptyState';
import FlashMessages from '@/components/FlashMessages';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import AdminLayout from '@/layouts/AdminLayout';
import { formatDateTime, formatNumber } from '@/lib/formatters';
import sensorRoutes from '@/routes/sensors';
import type { Farm, Paginated, SensorDevice } from '@/types';

type FarmOption = Pick<Farm, 'id' | 'farm_name' | 'municipality' | 'province'>;

interface SensorIndexPageProps {
    sensors: Paginated<SensorDevice>;
    filters: {
        search: string | null;
        status: string | null;
        farm_id: number | null;
    };
    farms: FarmOption[];
}

const statusClasses: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    online: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    healthy: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-800 ring-amber-100',
    maintenance: 'bg-amber-50 text-amber-800 ring-amber-100',
    offline: 'bg-slate-100 text-slate-600 ring-slate-200',
    inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
    critical: 'bg-rose-50 text-rose-700 ring-rose-100',
};

const sensorStatusClass = (status: string | null | undefined): string =>
    statusClasses[status?.toLowerCase() ?? ''] ??
    'bg-slate-100 text-slate-600 ring-slate-200';

const formatSignal = (value: number | null): string =>
    value === null ? '—' : `${formatNumber(value, 0)} dBm`;

export default function SensorIndexPage({
    sensors,
    filters,
    farms,
}: SensorIndexPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [farmId, setFarmId] = useState(filters.farm_id?.toString() ?? '');

    const submitFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        router.get(
            sensorRoutes.index.url(),
            {
                search: search.trim() || undefined,
                status: status || undefined,
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
        setFarmId('');
        router.get(
            sensorRoutes.index.url(),
            {},
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const removeSensor = (sensor: SensorDevice) => {
        const label = sensor.device_name || sensor.sensor_code;

        if (
            window.confirm(
                `Remove ${label}? Linked readings, alerts, and recommendations will prevent deletion.`,
            )
        ) {
            router.delete(sensorRoutes.destroy.url(sensor), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1540px] space-y-6 px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
                <PageHeader
                    eyebrow="Device registry"
                    title="Sensor monitoring"
                    description="Track field devices, their assigned farms, and the connection signals that keep monitoring reliable."
                    action={
                        <Link
                            href={sensorRoutes.create.url()}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                            <Plus className="h-4 w-4" />
                            Register sensor
                        </Link>
                    }
                />

                <FlashMessages />

                <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
                    <form
                        onSubmit={submitFilters}
                        className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(0,1fr)_12rem_13rem_auto_auto] lg:items-center"
                    >
                        <label className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 py-2.5 pr-3.5 pl-10 text-sm transition outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                placeholder="Search code, name, model, or serial number"
                                aria-label="Search sensors"
                            />
                        </label>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            aria-label="Filter by device status"
                        >
                            <option value="">All statuses</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="inactive">Inactive</option>
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

                    {sensors.data.length === 0 ? (
                        <EmptyState
                            icon={Cpu}
                            title="No sensors found"
                            description="Adjust the filters or register a device to start connecting field monitoring with a farm."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-left">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-5 py-3.5 sm:px-6">
                                            Device
                                        </th>
                                        <th className="px-5 py-3.5">
                                            Assigned farm
                                        </th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5">
                                            Telemetry
                                        </th>
                                        <th className="px-5 py-3.5">
                                            Last seen
                                        </th>
                                        <th className="px-5 py-3.5">
                                            Activity
                                        </th>
                                        <th className="px-5 py-3.5 text-right sm:px-6">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sensors.data.map((sensor) => (
                                        <tr
                                            key={sensor.id}
                                            className="transition hover:bg-slate-50/70"
                                        >
                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                        <Cpu className="h-5 w-5" />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-bold text-slate-900">
                                                            {sensor.device_name ||
                                                                sensor.sensor_code}
                                                        </p>
                                                        <p className="mt-0.5 font-mono text-xs text-slate-500">
                                                            {sensor.sensor_code}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="max-w-44 truncate text-sm font-semibold text-slate-800">
                                                    {sensor.farm?.farm_name ??
                                                        'No farm assigned'}
                                                </p>
                                                <p className="mt-0.5 max-w-44 truncate text-xs text-slate-500">
                                                    {[
                                                        sensor.farm
                                                            ?.municipality,
                                                        sensor.farm?.province,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(', ') ||
                                                        'Location not recorded'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ${sensorStatusClass(sensor.status)}`}
                                                >
                                                    {sensor.status || 'Unknown'}
                                                </span>
                                                {!sensor.is_active ? (
                                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                                        Excluded from monitoring
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1.5 text-xs text-slate-600">
                                                    <p className="flex items-center gap-1.5">
                                                        <BatteryMedium className="h-3.5 w-3.5 text-slate-400" />
                                                        {sensor.battery_level ===
                                                        null
                                                            ? 'Battery not reported'
                                                            : `${formatNumber(sensor.battery_level, 0)}% battery`}
                                                    </p>
                                                    <p className="flex items-center gap-1.5">
                                                        <Signal className="h-3.5 w-3.5 text-slate-400" />
                                                        {formatSignal(
                                                            sensor.signal_strength,
                                                        )}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatDateTime(
                                                    sensor.last_seen_at,
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {sensor.sensor_readings_count ??
                                                        0}{' '}
                                                    readings
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {sensor.alerts_count ?? 0}{' '}
                                                    alerts
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={sensorRoutes.show.url(
                                                            sensor,
                                                        )}
                                                        aria-label={`View ${sensor.sensor_code}`}
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={sensorRoutes.edit.url(
                                                            sensor,
                                                        )}
                                                        aria-label={`Edit ${sensor.sensor_code}`}
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeSensor(sensor)
                                                        }
                                                        aria-label={`Remove ${sensor.sensor_code}`}
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

                    <Pagination paginator={sensors} />
                </section>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                    Device locations can be reviewed from the GIS map once
                    coordinates are recorded.
                </div>
            </div>
        </AdminLayout>
    );
}
