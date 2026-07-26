import { Link } from "@inertiajs/react";
import {
    ArrowUpRight,
    Filter,
    Layers3,
    MapPinned,
    Navigation,
    Plus,
    Search,
    Sprout,
    Wifi,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";

type FarmHealth = "Healthy" | "Attention" | "Critical" | "Offline";

type Farm = {
    name: string;
    farmer: string;
    location: string;
    crop: string;
    size: string;
    sensors: number;
    health: FarmHealth;
    mapPosition: { left: string; top: string };
};

const farms: Farm[] = [
    {
        name: "Calamba Green Acres",
        farmer: "Alden Mercado",
        location: "Calamba, Laguna",
        crop: "Rice",
        size: "12.4 ha",
        sensors: 3,
        health: "Healthy",
        mapPosition: { left: "15%", top: "66%" },
    },
    {
        name: "Los Baños Cornfield",
        farmer: "Mia Santos",
        location: "Los Baños, Laguna",
        crop: "Corn",
        size: "8.8 ha",
        sensors: 2,
        health: "Attention",
        mapPosition: { left: "39%", top: "49%" },
    },
    {
        name: "Bay Organic Estate",
        farmer: "Jade Reyes",
        location: "Bay, Laguna",
        crop: "Tomato",
        size: "6.2 ha",
        sensors: 1,
        health: "Critical",
        mapPosition: { left: "59%", top: "57%" },
    },
    {
        name: "Sta. Rosa Farmstead",
        farmer: "Rico Dela Cruz",
        location: "Sta. Rosa, Laguna",
        crop: "Eggplant",
        size: "10.1 ha",
        sensors: 2,
        health: "Healthy",
        mapPosition: { left: "22%", top: "24%" },
    },
    {
        name: "San Pablo Onion Patch",
        farmer: "Ella Cruz",
        location: "San Pablo, Laguna",
        crop: "Onion",
        size: "7.7 ha",
        sensors: 1,
        health: "Offline",
        mapPosition: { left: "77%", top: "76%" },
    },
];

const healthClasses: Record<FarmHealth, string> = {
    Healthy: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Attention: "bg-amber-50 text-amber-700 ring-amber-100",
    Critical: "bg-red-50 text-red-700 ring-red-100",
    Offline: "bg-slate-100 text-slate-600 ring-slate-200",
};

const healthDotClasses: Record<FarmHealth, string> = {
    Healthy: "bg-emerald-400",
    Attention: "bg-amber-400",
    Critical: "bg-red-400",
    Offline: "bg-slate-400",
};

const mapMarkerClasses: Record<FarmHealth, string> = {
    Healthy: "bg-emerald-600 group-hover:bg-emerald-500",
    Attention: "bg-amber-500 group-hover:bg-amber-400",
    Critical: "bg-rose-600 group-hover:bg-rose-500",
    Offline: "bg-slate-600 group-hover:bg-slate-500",
};

const healthFilters = ["All", "Healthy", "Attention", "Critical", "Offline"] as const;
type HealthFilter = (typeof healthFilters)[number];

export default function Farmlands() {
    const [query, setQuery] = useState("");
    const [healthFilter, setHealthFilter] = useState<HealthFilter>("All");
    const visibleFarms = useMemo(
        () =>
            farms.filter(
                (farm) =>
                    (healthFilter === "All" || farm.health === healthFilter) &&
                    `${farm.name} ${farm.farmer} ${farm.location}`.toLowerCase().includes(query.toLowerCase()),
            ),
        [healthFilter, query],
    );

    const totalSensors = farms.reduce((total, farm) => total + farm.sensors, 0);

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1500px] space-y-8 p-5 sm:p-7 lg:space-y-10 lg:p-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Field portfolio</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Farm management</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Explore your registered fields as one connected portfolio, from crop coverage to sensor readiness.
                        </p>
                    </div>
                    <button className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
                        <Plus className="h-4 w-4" />
                        Register farm
                    </button>
                </div>

                <section className="relative isolate min-h-[252px] overflow-hidden rounded-[30px] bg-emerald-950 px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
                    <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:34px_34px]" />
                    <div className="absolute -right-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-emerald-300/20" />
                    <div className="absolute -right-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full border border-emerald-300/10" />
                    <div className="absolute bottom-0 left-[14%] h-36 w-[52%] rounded-t-[100%] border border-emerald-300/10" />

                    <div className="relative z-10 max-w-sm pointer-events-none">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur-sm">
                            <Navigation className="h-3.5 w-3.5" />
                            Laguna portfolio
                        </div>
                        <h2 className="mt-4 text-2xl font-bold tracking-tight">Five fields, one operational view</h2>
                        <p className="mt-2 text-sm leading-6 text-emerald-50/80">
                            Use a field marker for a focused handoff to its location in the GIS map.
                        </p>
                    </div>

                    {farms.map((farm, index) => (
                        <Link
                            key={farm.name}
                            href={`/gis-map-view?farm=${encodeURIComponent(farm.name)}`}
                            style={farm.mapPosition}
                            aria-label={`View ${farm.name} on map`}
                            className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
                        >
                            <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/60 text-xs font-bold text-white shadow-lg transition group-hover:scale-110 ${mapMarkerClasses[farm.health]}`}>
                                {index + 1}
                            </span>
                            <span className="absolute left-1/2 top-full mt-2 hidden w-max -translate-x-1/2 rounded-md bg-slate-950/90 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg md:block">
                                {farm.location.split(",")[0]}
                            </span>
                        </Link>
                    ))}

                    <div className="absolute bottom-5 right-5 z-10 hidden items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-emerald-50 backdrop-blur-sm sm:flex">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Healthy</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Needs review</span>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <dl className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        <div className="flex items-center gap-3 px-6 py-4 sm:px-7">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Layers3 className="h-5 w-5" /></span>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Registered fields</dt>
                                <dd className="mt-0.5 text-xl font-bold text-slate-900">{farms.length}</dd>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-4 sm:px-7">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Sprout className="h-5 w-5" /></span>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Cultivated area</dt>
                                <dd className="mt-0.5 text-xl font-bold text-slate-900">45.2 ha</dd>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-4 sm:px-7">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Wifi className="h-5 w-5" /></span>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Deployed sensors</dt>
                                <dd className="mt-0.5 text-xl font-bold text-slate-900">{totalSensors} across {farms.length} fields</dd>
                            </div>
                        </div>
                    </dl>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Field atlas</p>
                            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Your farm portfolio</h2>
                            <p className="mt-1 text-sm text-slate-500">Search a farm, owner, or municipality to locate a field.</p>
                        </div>
                        <label className="relative block w-full sm:w-80">
                            <span className="sr-only">Search fields</span>
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search the portfolio"
                                className="w-full rounded-xl bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none ring-1 ring-inset ring-slate-200 transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    aria-label="Clear field search"
                                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </label>
                    </div>

                    <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Filter fields by health">
                        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <Filter className="h-3.5 w-3.5" /> Health
                        </span>
                        {healthFilters.map((status) => {
                            const count = status === "All" ? farms.length : farms.filter((farm) => farm.health === status).length;
                            const isActive = healthFilter === status;

                            return (
                                <button
                                    key={status}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => setHealthFilter(status)}
                                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                        isActive
                                            ? "border-emerald-700 bg-emerald-700 text-white"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    {status} <span className="ml-1 opacity-70">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {visibleFarms.map((farm) => (
                            <article key={farm.name} className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                                <div className="relative h-20 overflow-hidden bg-emerald-50">
                                    <div className="absolute -right-4 -top-9 h-32 w-32 rounded-full border-[18px] border-emerald-100" />
                                    <div className="absolute bottom-0 left-0 h-10 w-full bg-[linear-gradient(135deg,transparent_49%,rgba(5,150,105,.14)_50%,transparent_51%)] bg-[length:18px_18px]" />
                                    <span className="absolute bottom-4 left-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                                        <MapPinned className="h-5 w-5" />
                                    </span>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="truncate font-bold text-slate-900">{farm.name}</h3>
                                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                                <MapPinned className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{farm.location}</span>
                                            </p>
                                        </div>
                                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${healthClasses[farm.health]}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${healthDotClasses[farm.health]}`} />
                                            {farm.health}
                                        </span>
                                    </div>

                                    <dl className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
                                        <div>
                                            <dt className="text-[11px] font-medium text-slate-400">Crop</dt>
                                            <dd className="mt-1 text-sm font-bold text-slate-700">{farm.crop}</dd>
                                        </div>
                                        <div className="border-x border-slate-200 px-2">
                                            <dt className="text-[11px] font-medium text-slate-400">Area</dt>
                                            <dd className="mt-1 text-sm font-bold text-slate-700">{farm.size}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-medium text-slate-400">Sensors</dt>
                                            <dd className="mt-1 text-sm font-bold text-slate-700">{farm.sensors}</dd>
                                        </div>
                                    </dl>

                                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                        <p className="min-w-0 text-sm text-slate-500">
                                            Owner <span className="font-semibold text-slate-700">{farm.farmer}</span>
                                        </p>
                                        <Link
                                            href={`/gis-map-view?farm=${encodeURIComponent(farm.name)}`}
                                            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                        >
                                            View map
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {visibleFarms.length === 0 && (
                            <div className="col-span-full py-14 text-center">
                                <MapPinned className="mx-auto h-7 w-7 text-slate-300" />
                                <p className="mt-3 text-sm font-medium text-slate-700">No matching fields</p>
                                <p className="mt-1 text-sm text-slate-500">Try a farm name, owner, or another municipality.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
