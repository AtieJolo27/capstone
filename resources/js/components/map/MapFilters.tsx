import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { MapFarmOption, ZoneStatus } from '@/types/gis';

const statusOptions: ZoneStatus[] = [
    'Healthy',
    'Warning',
    'Critical',
    'Inactive',
];

const statusButtonClasses: Record<ZoneStatus, string> = {
    Healthy:
        'data-[active=true]:border-emerald-600 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-800',
    Warning:
        'data-[active=true]:border-amber-500 data-[active=true]:bg-amber-50 data-[active=true]:text-amber-900',
    Critical:
        'data-[active=true]:border-rose-500 data-[active=true]:bg-rose-50 data-[active=true]:text-rose-900',
    Inactive:
        'data-[active=true]:border-slate-500 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-800',
};

interface MapFiltersProps {
    searchTerm: string;
    selectedFarmId: number | null;
    selectedStatuses: ZoneStatus[];
    showAllFields: boolean;
    farmOptions: MapFarmOption[];
    onSearchTermChange: (value: string) => void;
    onFarmChange: (farmId: number | null) => void;
    onStatusToggle: (status: ZoneStatus) => void;
    onShowAllFieldsChange: (showAllFields: boolean) => void;
    onReset: () => void;
}

export default function MapFilters({
    searchTerm,
    selectedFarmId,
    selectedStatuses,
    showAllFields,
    farmOptions,
    onSearchTermChange,
    onFarmChange,
    onStatusToggle,
    onShowAllFieldsChange,
    onReset,
}: MapFiltersProps) {
    const handleFarmChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;

        onFarmChange(value === '' ? null : Number(value));
    };

    return (
        <section
            aria-label="Map filters"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                <div className="min-w-0 flex-1">
                    <label
                        htmlFor="map-zone-search"
                        className="text-sm font-semibold text-slate-700"
                    >
                        Search fields
                    </label>
                    <div className="relative mt-1.5">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                        />
                        <input
                            id="map-zone-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                                onSearchTermChange(event.target.value)
                            }
                            placeholder="Search by zone, farm, or crop"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-9 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        />
                    </div>
                </div>

                <div className="w-full xl:w-56">
                    <label
                        htmlFor="map-farm-filter"
                        className="text-sm font-semibold text-slate-700"
                    >
                        Farm
                    </label>
                    <select
                        id="map-farm-filter"
                        value={selectedFarmId ?? ''}
                        onChange={handleFarmChange}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    >
                        <option value="">All farms</option>
                        {farmOptions.map((farm) => (
                            <option key={farm.id} value={farm.id}>
                                {farm.name}
                            </option>
                        ))}
                    </select>
                </div>

                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:bg-white">
                    <input
                        type="checkbox"
                        checked={showAllFields}
                        onChange={(event) =>
                            onShowAllFieldsChange(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                    />
                    Show all fields
                </label>

                <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:ring-4 focus:ring-emerald-100 focus:outline-none"
                >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reset view
                </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <SlidersHorizontal
                        className="h-4 w-4 text-emerald-700"
                        aria-hidden="true"
                    />
                    Zone status
                </span>
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => {
                        const active = selectedStatuses.includes(status);

                        return (
                            <button
                                type="button"
                                key={status}
                                aria-pressed={active}
                                data-active={active}
                                onClick={() => onStatusToggle(status)}
                                className={`rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 ${statusButtonClasses[status]}`}
                            >
                                {status}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
