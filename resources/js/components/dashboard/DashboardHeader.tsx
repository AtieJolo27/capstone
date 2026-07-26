import { Link } from '@inertiajs/react';
import { ArrowUpRight, Map, Radio } from 'lucide-react';

export default function DashboardHeader() {
    return (
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
                <p className="text-xs font-bold tracking-[0.2em] text-emerald-700 uppercase">
                    Network command center
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    Farm operations overview
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                    A focused view of sensor health, soil conditions, and field
                    activity across every monitored farm.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    Current database view
                </div>
                <Link
                    href="/gis-map-view"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#144014] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E5A1E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                    <Map className="h-4 w-4" />
                    Open map
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                    href="/sensors"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                >
                    <Radio className="h-4 w-4 text-emerald-700" />
                    Sensor fleet
                </Link>
            </div>
        </header>
    );
}
