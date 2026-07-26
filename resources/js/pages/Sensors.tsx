import { Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    BatteryMedium,
    ChevronRight,
    Cpu,
    Filter,
    MapPinned,
    Search,
    Wifi,
    WifiOff,
    X,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type Status = 'Healthy' | 'Warning' | 'Critical' | 'Offline';

type Sensor = {
    id: string;
    farm: string;
    crop: string;
    location: string;
    status: Status;
    battery: string;
    signal: string;
    updated: string;
    moisture: string;
    ph: string;
};

const sensors: Sensor[] = [
    {
        id: 'GP-CL-001',
        farm: 'Calamba Green Acres',
        crop: 'Rice',
        location: 'Calamba, Laguna',
        status: 'Healthy',
        battery: '93%',
        signal: 'Excellent',
        updated: '2 min ago',
        moisture: '52%',
        ph: '6.8',
    },
    {
        id: 'GP-LB-002',
        farm: 'Los Ba\u00f1os Cornfield',
        crop: 'Corn',
        location: 'Los Ba\u00f1os, Laguna',
        status: 'Warning',
        battery: '71%',
        signal: 'Good',
        updated: '5 min ago',
        moisture: '48%',
        ph: '6.1',
    },
    {
        id: 'GP-BY-003',
        farm: 'Bay Organic Estate',
        crop: 'Tomato',
        location: 'Bay, Laguna',
        status: 'Critical',
        battery: '38%',
        signal: 'Weak',
        updated: '12 min ago',
        moisture: '39%',
        ph: '5.6',
    },
    {
        id: 'GP-SR-004',
        farm: 'Sta. Rosa Farmstead',
        crop: 'Eggplant',
        location: 'Sta. Rosa, Laguna',
        status: 'Healthy',
        battery: '88%',
        signal: 'Excellent',
        updated: '1 min ago',
        moisture: '55%',
        ph: '6.6',
    },
    {
        id: 'GP-SP-005',
        farm: 'San Pablo Onion Patch',
        crop: 'Onion',
        location: 'San Pablo, Laguna',
        status: 'Offline',
        battery: '\u2014',
        signal: 'Offline',
        updated: '10 hrs ago',
        moisture: '\u2014',
        ph: '\u2014',
    },
    {
        id: 'GP-SI-006',
        farm: 'Siniloan Research Field',
        crop: 'Vegetables',
        location: 'Siniloan, Laguna',
        status: 'Warning',
        battery: '79%',
        signal: 'Good',
        updated: '8 min ago',
        moisture: '49%',
        ph: '6.3',
    },
];

const statusStyle: Record<
    Status,
    { badge: string; dot: string; label: string }
> = {
    Healthy: {
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dot: 'bg-emerald-500',
        label: 'Reporting normally',
    },
    Warning: {
        badge: 'border-amber-200 bg-amber-50 text-amber-700',
        dot: 'bg-amber-500',
        label: 'Review soon',
    },
    Critical: {
        badge: 'border-rose-200 bg-rose-50 text-rose-700',
        dot: 'bg-rose-500',
        label: 'Action needed',
    },
    Offline: {
        badge: 'border-slate-200 bg-slate-100 text-slate-600',
        dot: 'bg-slate-400',
        label: 'No connection',
    },
};

const filters = ['All', 'Healthy', 'Warning', 'Critical', 'Offline'] as const;
type FilterStatus = (typeof filters)[number];

function batteryValue(battery: string) {
    return Number.parseInt(battery, 10) || 0;
}

export default function Sensors() {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<FilterStatus>('All');
    const [selectedId, setSelectedId] = useState(sensors[0].id);

    const visibleSensors = useMemo(
        () =>
            sensors.filter((sensor) => {
                const matchesFilter =
                    filter === 'All' || sensor.status === filter;
                const searchable =
                    `${sensor.id} ${sensor.farm} ${sensor.location} ${sensor.crop}`.toLowerCase();

                return (
                    matchesFilter &&
                    searchable.includes(query.trim().toLowerCase())
                );
            }),
        [filter, query],
    );

    const selectedSensor =
        visibleSensors.find((sensor) => sensor.id === selectedId) ??
        visibleSensors[0] ??
        sensors.find((sensor) => sensor.id === selectedId) ??
        sensors[0];
    const onlineSensors = sensors.filter(
        (sensor) => sensor.status !== 'Offline',
    ).length;
    const attentionSensors = sensors.filter(
        (sensor) => sensor.status === 'Warning' || sensor.status === 'Critical',
    ).length;
    const averageBattery = Math.round(
        sensors
            .filter((sensor) => sensor.status !== 'Offline')
            .reduce(
                (total, sensor) => total + batteryValue(sensor.battery),
                0,
            ) / onlineSensors,
    );

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold tracking-[0.18em] text-emerald-700 uppercase">
                            Field operations
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Sensor monitoring
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            A calm, real-time view of your field device network
                            and the readings that need a closer look.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500" role="status">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                        Network scan updated just now
                    </div>
                </header>

                <section className="mt-8 overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-xl shadow-slate-950/10">
                    <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-8">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 ring-1 ring-emerald-300/20 ring-inset">
                                    <Activity className="h-4 w-4" />
                                </span>
                                Network overview
                            </div>
                            <p className="mt-4 max-w-md text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                {onlineSensors} of {sensors.length} field
                                sensors are online.
                            </p>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                                Keep the critical and offline devices moving
                                through the maintenance queue before their next
                                field round.
                            </p>
                        </div>

                        <div className="grid w-full grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.045] px-1 py-4 lg:w-auto lg:min-w-[420px]">
                            <div className="px-4 sm:px-5">
                                <p className="text-2xl font-semibold text-white">
                                    {onlineSensors}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Online now
                                </p>
                            </div>
                            <div className="px-4 sm:px-5">
                                <p className="text-2xl font-semibold text-amber-300">
                                    {attentionSensors}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Need review
                                </p>
                            </div>
                            <div className="px-4 sm:px-5">
                                <p className="text-2xl font-semibold text-white">
                                    {averageBattery}%
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Average battery
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/10 bg-black/10 px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                        <div className="flex items-center gap-2 text-slate-300">
                            <AlertTriangle className="h-4 w-4 text-amber-300" />
                            <span>
                                {attentionSensors} device
                                {attentionSensors === 1 ? '' : 's'} require
                                review; 1 device is offline.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setFilter('Critical');
                                setSelectedId(
                                    sensors.find(
                                        (sensor) => sensor.status === 'Critical',
                                    )?.id ?? sensors[0].id,
                                );
                            }}
                            className="w-fit font-semibold text-emerald-300 transition hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950"
                        >
                            Review critical device
                        </button>
                    </div>
                </section>

                <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
                    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">
                                        Device registry
                                    </p>
                                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                                        Field sensor fleet
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500" aria-live="polite">
                                        {visibleSensors.length} of{' '}
                                        {sensors.length} devices shown
                                    </p>
                                </div>

                                <label className="relative block w-full lg:w-72">
                                    <span className="sr-only">
                                        Search sensors
                                    </span>
                                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="search"
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder="Find sensor, farm, or crop"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-10 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                    {query && (
                                        <button
                                            type="button"
                                            onClick={() => setQuery('')}
                                            aria-label="Clear sensor search"
                                            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </label>
                            </div>

                            <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
                                <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                    <Filter className="h-3.5 w-3.5" /> Status
                                </span>
                                {filters.map((status) => {
                                    const count =
                                        status === 'All'
                                            ? sensors.length
                                            : sensors.filter(
                                                  (sensor) =>
                                                      sensor.status === status,
                                              ).length;
                                    const isActive = filter === status;

                                    return (
                                        <button
                                            key={status}
                                            type="button"
                                            aria-pressed={isActive}
                                            onClick={() => setFilter(status)}
                                            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                                isActive
                                                    ? 'border-slate-900 bg-slate-900 text-white'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {status}{' '}
                                            <span className="ml-1 opacity-70">
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="hidden grid-cols-[minmax(0,1.25fr)_minmax(185px,0.9fr)_minmax(150px,0.7fr)_28px] gap-5 border-b border-slate-100 bg-slate-50/80 px-6 py-3 text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase md:grid">
                            <span>Sensor / field</span>
                            <span>Latest soil reading</span>
                            <span>Connection</span>
                            <span className="sr-only">Open details</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {visibleSensors.map((sensor) => {
                                const isSelected =
                                    sensor.id === selectedSensor.id;
                                const visual = statusStyle[sensor.status];

                                return (
                                    <button
                                        key={sensor.id}
                                        type="button"
                                        onClick={() => setSelectedId(sensor.id)}
                                        className={`grid w-full gap-4 px-5 py-5 text-left transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:px-6 md:grid-cols-[minmax(0,1.25fr)_minmax(185px,0.9fr)_minmax(150px,0.7fr)_28px] md:items-center md:gap-5 ${
                                            isSelected
                                                ? 'bg-emerald-50/70'
                                                : 'bg-white hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span
                                                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${visual.dot}`}
                                                aria-hidden="true"
                                            />
                                            <span className="min-w-0">
                                                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <span className="truncate font-semibold text-slate-900">
                                                        {sensor.farm}
                                                    </span>
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${visual.badge}`}
                                                    >
                                                        {sensor.status}
                                                    </span>
                                                </span>
                                                <span className="mt-1 block truncate text-sm text-slate-500">
                                                    {sensor.id}{' '}
                                                    <span className="px-1 text-slate-300">
                                                        /
                                                    </span>{' '}
                                                    {sensor.crop}{' '}
                                                    <span className="px-1 text-slate-300">
                                                        /
                                                    </span>{' '}
                                                    {sensor.location}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 sm:max-w-xs md:max-w-none">
                                            <div>
                                                <p className="text-[11px] font-bold tracking-[0.11em] text-slate-400 uppercase">
                                                    Moisture
                                                </p>
                                                <p className="mt-1 font-semibold text-slate-700">
                                                    {sensor.moisture}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold tracking-[0.11em] text-slate-400 uppercase">
                                                    Soil pH
                                                </p>
                                                <p className="mt-1 font-semibold text-slate-700">
                                                    {sensor.ph}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 md:block">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                                {sensor.status === 'Offline' ? (
                                                    <WifiOff className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Wifi className="h-4 w-4 text-emerald-600" />
                                                )}
                                                {sensor.signal}
                                            </div>
                                            <p className="mt-1.5 text-xs text-slate-400">
                                                Updated {sensor.updated}
                                            </p>
                                        </div>

                                        <ChevronRight
                                            className={`hidden h-5 w-5 transition md:block ${isSelected ? 'text-emerald-700' : 'text-slate-300'}`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                );
                            })}

                            {visibleSensors.length === 0 && (
                                <div className="px-6 py-16 text-center">
                                    <Cpu className="mx-auto h-8 w-8 text-slate-300" />
                                    <p className="mt-3 font-semibold text-slate-700">
                                        No sensors found
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Try a different search term or clear the
                                        active status filter.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery('');
                                            setFilter('All');
                                        }}
                                        className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                                    >
                                        Reset filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="xl:sticky xl:top-7">
                        <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">
                                            Device focus
                                        </p>
                                        <h2 className="mt-1 font-bold text-slate-900">
                                            Selected sensor
                                        </h2>
                                    </div>
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${statusStyle[selectedSensor.status].dot}`}
                                        aria-hidden="true"
                                    />
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                        <Cpu className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">
                                            {selectedSensor.farm}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {selectedSensor.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle[selectedSensor.status].badge}`}
                                        >
                                            {selectedSensor.status}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400">
                                            {
                                                statusStyle[
                                                    selectedSensor.status
                                                ].label
                                            }
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        {selectedSensor.status === 'Healthy' &&
                                            'Current readings and connectivity are within their expected range.'}
                                        {selectedSensor.status === 'Warning' &&
                                            'Review this device during the next field round to prevent a reading interruption.'}
                                        {selectedSensor.status === 'Critical' &&
                                            'This device needs prompt field attention before its conditions worsen.'}
                                        {selectedSensor.status === 'Offline' &&
                                            'The device has not reported recently. Check its power and field connection.'}
                                    </p>
                                </div>

                                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
                                    <div>
                                        <dt className="text-[11px] font-bold tracking-[0.11em] text-slate-400 uppercase">
                                            Moisture
                                        </dt>
                                        <dd className="mt-1 text-lg font-semibold text-slate-900">
                                            {selectedSensor.moisture}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-[11px] font-bold tracking-[0.11em] text-slate-400 uppercase">
                                            Soil pH
                                        </dt>
                                        <dd className="mt-1 text-lg font-semibold text-slate-900">
                                            {selectedSensor.ph}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="flex items-center gap-1 text-[11px] font-bold tracking-[0.11em] text-slate-400 uppercase">
                                            <BatteryMedium className="h-3.5 w-3.5" />{' '}
                                            Battery
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-700">
                                            {selectedSensor.battery}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="flex items-center gap-1 text-[11px] font-bold tracking-[0.11em] text-slate-400 uppercase">
                                            <Zap className="h-3.5 w-3.5" />{' '}
                                            Signal
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-700">
                                            {selectedSensor.signal}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
                                    <p className="flex items-center gap-2">
                                        <MapPinned className="h-4 w-4 text-slate-400" />{' '}
                                        {selectedSensor.location}
                                    </p>
                                    <p className="mt-2">
                                        Last report: {selectedSensor.updated}
                                    </p>
                                </div>

                                <Link
                                    href={`/gis-map-view?farm=${encodeURIComponent(selectedSensor.farm)}`}
                                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none"
                                >
                                    <MapPinned className="h-4 w-4" /> View field
                                    on map
                                </Link>
                            </div>
                        </section>

                        <p className="px-2 pt-4 text-xs leading-5 text-slate-400">
                            Select a row to inspect its latest reading and field
                            connection without leaving the monitoring queue.
                        </p>
                    </aside>
                </div>
            </div>
        </AdminLayout>
    );
}
