import { Head } from '@inertiajs/react';
import { AlertTriangle, Cpu, MapPinned, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import FarmMap from '@/components/map/FarmMap';
import MapFilters from '@/components/map/MapFilters';
import MapLegend from '@/components/map/MapLegend';
import ZoneDetailsPanel from '@/components/map/ZoneDetailsPanel';
import AdminLayout from '@/layouts/AdminLayout';
import type {
    InvalidMapZone,
    MapFarmOption,
    MapSummary,
    MapZone,
    ZoneStatus,
} from '@/types/gis';

interface GisIndexPageProps {
    zones: MapZone[];
    farmOptions: MapFarmOption[];
    invalidZones: InvalidMapZone[];
    summary: MapSummary;
}

function StatCard({
    label,
    value,
    description,
    icon: Icon,
    iconClassName,
}: {
    label: string;
    value: number;
    description: string;
    icon: typeof MapPinned;
    iconClassName: string;
}) {
    return (
        <article className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
            <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
            >
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
                    {value}
                </p>
                <p className="truncate text-xs text-slate-500">{description}</p>
            </div>
        </article>
    );
}

export default function Index({
    zones,
    farmOptions,
    invalidZones,
    summary,
}: GisIndexPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
    const [selectedStatuses, setSelectedStatuses] = useState<ZoneStatus[]>([]);
    const [showAllFields, setShowAllFields] = useState(true);
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
    const [resetVersion, setResetVersion] = useState(0);

    const matchingZones = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

        return zones.filter((zone) => {
            const matchesFarm =
                selectedFarmId === null || zone.farm?.id === selectedFarmId;
            const matchesStatus =
                selectedStatuses.length === 0 ||
                selectedStatuses.includes(zone.status);
            const searchableText = [
                zone.name,
                zone.farm?.name,
                zone.currentCrop,
                zone.soilType,
            ]
                .filter((value): value is string => Boolean(value))
                .join(' ')
                .toLocaleLowerCase();
            const matchesSearch =
                normalizedSearch === '' ||
                searchableText.includes(normalizedSearch);

            return matchesFarm && matchesStatus && matchesSearch;
        });
    }, [searchTerm, selectedFarmId, selectedStatuses, zones]);

    const selectedZone = useMemo(
        () => zones.find((zone) => zone.id === selectedZoneId) ?? null,
        [selectedZoneId, zones],
    );

    const statusCounts = useMemo(() => {
        const counts: Record<ZoneStatus, number> = {
            Healthy: 0,
            Warning: 0,
            Critical: 0,
            Inactive: 0,
        };

        zones.forEach((zone) => {
            counts[zone.status] += 1;
        });

        return counts;
    }, [zones]);

    const sensorsAssigned = useMemo(
        () => zones.reduce((count, zone) => count + zone.sensorCount, 0),
        [zones],
    );

    const attentionZones = statusCounts.Warning + statusCounts.Critical;

    const toggleStatus = (status: ZoneStatus) => {
        setSelectedZoneId(null);
        setSelectedStatuses((currentStatuses) =>
            currentStatuses.includes(status)
                ? currentStatuses.filter(
                      (currentStatus) => currentStatus !== status,
                  )
                : [...currentStatuses, status],
        );
    };

    const changeSearchTerm = (value: string) => {
        setSelectedZoneId(null);
        setSearchTerm(value);
    };

    const changeFarm = (farmId: number | null) => {
        setSelectedZoneId(null);
        setSelectedFarmId(farmId);
    };

    const resetView = () => {
        setSearchTerm('');
        setSelectedFarmId(null);
        setSelectedStatuses([]);
        setShowAllFields(true);
        setSelectedZoneId(null);
        setResetVersion((currentVersion) => currentVersion + 1);
    };

    const invalidZoneLabel = invalidZones
        .slice(0, 3)
        .map((zone) => zone.name)
        .join(', ');

    return (
        <AdminLayout>
            <Head title="GIS / Map View" />

            <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <section className="flex flex-col justify-between gap-5 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm sm:p-7 lg:flex-row lg:items-end">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold tracking-[0.18em] text-emerald-700 uppercase">
                            GIS workspace
                        </p>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                            Field map and zone health
                        </h1>
                        <p className="mt-2.5 text-sm leading-6 text-slate-600">
                            Review registered field boundaries first, then
                            select a zone to inspect only the sensors assigned
                            to it.
                        </p>
                    </div>
                    <p className="rounded-xl border border-emerald-100 bg-white/85 px-3.5 py-2.5 text-sm text-slate-600 shadow-sm">
                        <span className="font-semibold text-emerald-800">
                            {matchingZones.length}
                        </span>{' '}
                        of {summary.renderableZones} mapped fields shown
                    </p>
                </section>

                <section
                    aria-label="Map summary"
                    className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <StatCard
                        label="Mapped fields"
                        value={summary.renderableZones}
                        description={`${summary.totalZones} registered zone${summary.totalZones === 1 ? '' : 's'}`}
                        icon={MapPinned}
                        iconClassName="bg-emerald-50 text-emerald-700"
                    />
                    <StatCard
                        label="Needs attention"
                        value={attentionZones}
                        description="Warning or critical zone health"
                        icon={AlertTriangle}
                        iconClassName="bg-amber-50 text-amber-700"
                    />
                    <StatCard
                        label="Assigned sensors"
                        value={sensorsAssigned}
                        description="Available after selecting a field"
                        icon={Cpu}
                        iconClassName="bg-slate-100 text-slate-700"
                    />
                </section>

                {invalidZones.length > 0 && (
                    <section
                        role="alert"
                        className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-950"
                    >
                        <AlertTriangle
                            className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="font-semibold">
                                {invalidZones.length} zone
                                {invalidZones.length === 1
                                    ? ' was'
                                    : 's were'}{' '}
                                skipped because{' '}
                                {invalidZones.length === 1
                                    ? 'its boundary is'
                                    : 'their boundaries are'}{' '}
                                invalid.
                            </p>
                            <p className="mt-1 leading-6 text-amber-900">
                                {invalidZoneLabel}
                                {invalidZones.length > 3 ? ', and others' : ''}.
                                Add a closed GeoJSON Polygon or MultiPolygon
                                boundary before displaying{' '}
                                {invalidZones.length === 1 ? 'it' : 'them'} on
                                the map.
                            </p>
                        </div>
                    </section>
                )}

                <MapFilters
                    searchTerm={searchTerm}
                    selectedFarmId={selectedFarmId}
                    selectedStatuses={selectedStatuses}
                    showAllFields={showAllFields}
                    farmOptions={farmOptions}
                    onSearchTermChange={changeSearchTerm}
                    onFarmChange={changeFarm}
                    onStatusToggle={toggleStatus}
                    onShowAllFieldsChange={setShowAllFields}
                    onReset={resetView}
                />

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-bold tracking-[0.14em] text-emerald-700 uppercase">
                                Map canvas
                            </p>
                            <h2 className="mt-1 text-lg font-bold text-slate-900">
                                Registered field boundaries
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Click a boundary for the field details and its
                                current sensor markers.
                            </p>
                        </div>
                        <MapLegend counts={statusCounts} />
                    </div>

                    <div className="grid xl:grid-cols-[minmax(0,1fr)_22rem]">
                        <FarmMap
                            zones={matchingZones}
                            selectedZone={selectedZone}
                            showAllFields={showAllFields}
                            resetVersion={resetVersion}
                            onZoneSelect={setSelectedZoneId}
                        />
                        <div className="border-t border-slate-200 bg-slate-50 p-4 xl:border-t-0 xl:border-l xl:p-5">
                            <ZoneDetailsPanel
                                zone={selectedZone}
                                onClose={() => setSelectedZoneId(null)}
                            />
                        </div>
                    </div>
                </section>

                <p className="flex items-center justify-center gap-2 pb-2 text-center text-xs text-slate-500">
                    <ShieldCheck
                        className="h-3.5 w-3.5 text-emerald-700"
                        aria-hidden="true"
                    />
                    Zone health is calculated from the latest device readings
                    and unresolved alerts.
                </p>
            </div>
        </AdminLayout>
    );
}
