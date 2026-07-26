import {
    Activity,
    AlertTriangle,
    Clock3,
    Cpu,
    Droplets,
    FlaskConical,
    MapPin,
    Radio,
    X,
} from 'lucide-react';
import type { MapSensor, MapZone, ZoneStatus } from '@/types/gis';

const statusClasses: Record<ZoneStatus, string> = {
    Healthy: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    Warning: 'bg-amber-50 text-amber-900 ring-amber-200',
    Critical: 'bg-rose-50 text-rose-800 ring-rose-200',
    Inactive: 'bg-slate-100 text-slate-700 ring-slate-200',
};

interface ZoneDetailsPanelProps {
    zone: MapZone | null;
    onClose: () => void;
}

function formatNumber(value: number | null, maximumFractionDigits = 1): string {
    if (value === null) {
        return 'Not recorded';
    }

    return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(
        value,
    );
}

function formatArea(zone: MapZone): string {
    if (zone.area === null) {
        return 'Not recorded';
    }

    return [formatNumber(zone.area, 2), zone.areaUnit]
        .filter(Boolean)
        .join(' ');
}

function formatDateTime(value: string | null): string {
    if (value === null) {
        return 'Not recorded';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Not recorded';
    }

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function sensorTone(sensor: MapSensor): string {
    const status = sensor.status.toLowerCase();

    if (status.includes('critical') || sensor.unresolvedAlertCount > 1) {
        return 'bg-rose-50 text-rose-800';
    }

    if (
        status.includes('warning') ||
        sensor.unresolvedAlertCount === 1 ||
        sensor.latestReading?.isValid === false
    ) {
        return 'bg-amber-50 text-amber-900';
    }

    if (status.includes('offline') || status.includes('inactive')) {
        return 'bg-slate-100 text-slate-700';
    }

    return 'bg-emerald-50 text-emerald-800';
}

function SensorReadingSummary({ sensor }: { sensor: MapSensor }) {
    const title = sensor.deviceName?.trim() || sensor.sensorCode;
    const hasLocation = sensor.latitude !== null && sensor.longitude !== null;

    return (
        <li className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                        {title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {sensor.sensorCode}
                    </p>
                </div>
                <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${sensorTone(sensor)}`}
                >
                    {sensor.status}
                </span>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                    <dt className="flex items-center gap-1 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">
                        <Droplets
                            className="h-3 w-3 text-emerald-700"
                            aria-hidden="true"
                        />
                        Moisture
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">
                        {sensor.latestReading?.soilMoisture === null ||
                        sensor.latestReading === null
                            ? 'Not recorded'
                            : `${formatNumber(sensor.latestReading.soilMoisture)}%`}
                    </dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                    <dt className="flex items-center gap-1 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">
                        <FlaskConical
                            className="h-3 w-3 text-emerald-700"
                            aria-hidden="true"
                        />
                        Soil pH
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">
                        {sensor.latestReading?.ph === null ||
                        sensor.latestReading === null
                            ? 'Not recorded'
                            : formatNumber(sensor.latestReading.ph, 2)}
                    </dd>
                </div>
            </dl>

            <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-1.5">
                    <Clock3
                        className="h-3.5 w-3.5 shrink-0 text-slate-400"
                        aria-hidden="true"
                    />
                    Latest reading:{' '}
                    {formatDateTime(sensor.latestReading?.recordedAt ?? null)}
                </p>
                <p className="flex items-center gap-1.5">
                    <Radio
                        className="h-3.5 w-3.5 shrink-0 text-slate-400"
                        aria-hidden="true"
                    />
                    Last seen: {formatDateTime(sensor.lastSeenAt)}
                </p>
                {!hasLocation && (
                    <p className="flex items-center gap-1.5 text-amber-800">
                        <MapPin
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                        />
                        No map position recorded
                    </p>
                )}
                {sensor.unresolvedAlertCount > 0 && (
                    <p className="flex items-center gap-1.5 font-medium text-rose-700">
                        <AlertTriangle
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                        />
                        {sensor.unresolvedAlertCount} unresolved{' '}
                        {sensor.unresolvedAlertCount === 1 ? 'alert' : 'alerts'}
                    </p>
                )}
            </div>
        </li>
    );
}

export default function ZoneDetailsPanel({
    zone,
    onClose,
}: ZoneDetailsPanelProps) {
    if (zone === null) {
        return (
            <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-slate-900">
                    Select a field
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Choose a zone boundary to review its current health,
                    deployed sensors, and latest available readings.
                </p>
                <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
                    Sensor markers appear on the map only for the selected
                    field.
                </p>
            </aside>
        );
    }

    return (
        <aside
            aria-label={`${zone.name} details`}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="border-b border-slate-100 px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold tracking-[0.14em] text-emerald-700 uppercase">
                            Selected field
                        </p>
                        <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900">
                            {zone.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {zone.farm?.name ?? 'Unassigned farm'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close field details"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:ring-4 focus:ring-emerald-100 focus:outline-none"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
                <span
                    className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusClasses[zone.status]}`}
                >
                    {zone.status}
                </span>
            </div>

            <div className="space-y-5 p-5">
                {zone.description && (
                    <p className="text-sm leading-6 text-slate-600">
                        {zone.description}
                    </p>
                )}

                {zone.farm?.location && (
                    <p className="flex items-start gap-2 text-sm leading-5 text-slate-600">
                        <MapPin
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                            aria-hidden="true"
                        />
                        {zone.farm.location}
                    </p>
                )}

                <dl className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                        <dt className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">
                            Area
                        </dt>
                        <dd className="mt-1 text-sm font-bold text-slate-800">
                            {formatArea(zone)}
                        </dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                        <dt className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">
                            Deployed
                        </dt>
                        <dd className="mt-1 text-sm font-bold text-slate-800">
                            {zone.deployedSensorCount}
                        </dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                        <dt className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">
                            Sensors
                        </dt>
                        <dd className="mt-1 text-sm font-bold text-slate-800">
                            {zone.sensorCount}
                        </dd>
                    </div>
                </dl>

                <div className="grid grid-cols-2 gap-2 border-y border-slate-100 py-4 text-sm">
                    <p>
                        <span className="block text-xs text-slate-500">
                            Current crop
                        </span>
                        <span className="mt-1 block font-semibold text-slate-800">
                            {zone.currentCrop ?? 'Not recorded'}
                        </span>
                    </p>
                    <p>
                        <span className="block text-xs text-slate-500">
                            Soil type
                        </span>
                        <span className="mt-1 block font-semibold text-slate-800">
                            {zone.soilType ?? 'Not recorded'}
                        </span>
                    </p>
                    <p className="col-span-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <Activity
                            className="h-3.5 w-3.5 text-emerald-700"
                            aria-hidden="true"
                        />
                        Updated {formatDateTime(zone.lastUpdatedAt)}
                    </p>
                </div>

                <section aria-labelledby="zone-sensors-heading">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-bold tracking-[0.14em] text-emerald-700 uppercase">
                                Current telemetry
                            </p>
                            <h3
                                id="zone-sensors-heading"
                                className="mt-1 flex items-center gap-2 text-base font-bold text-slate-900"
                            >
                                <Cpu
                                    className="h-4 w-4 text-emerald-700"
                                    aria-hidden="true"
                                />
                                Sensors and latest readings
                            </h3>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                            {zone.sensorCount}
                        </span>
                    </div>

                    {zone.sensors.length === 0 ? (
                        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
                            No sensors are currently assigned to this field.
                        </p>
                    ) : (
                        <ul className="mt-4 divide-y divide-slate-100">
                            {zone.sensors.map((sensor) => (
                                <SensorReadingSummary
                                    key={sensor.id}
                                    sensor={sensor}
                                />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </aside>
    );
}
