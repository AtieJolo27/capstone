import {
    CheckCircle2,
    Filter,
    Mail,
    MapPin,
    Phone,
    Plus,
    Search,
    UserRoundPlus,
    UsersRound,
    Wheat,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";

type FarmerStatus = "Active" | "Pending";

type Farmer = {
    name: string;
    initials: string;
    municipality: string;
    farms: number;
    area: string;
    phone: string;
    email: string;
    status: FarmerStatus;
    primaryCrop: string;
    lastTouchpoint: string;
};

const farmers: Farmer[] = [
    {
        name: "Alden Mercado",
        initials: "AM",
        municipality: "Calamba, Laguna",
        farms: 2,
        area: "18.6 ha",
        phone: "+63 917 345 2190",
        email: "alden.mercado@example.com",
        status: "Active",
        primaryCrop: "Rice",
        lastTouchpoint: "Checked in today",
    },
    {
        name: "Mia Santos",
        initials: "MS",
        municipality: "Los Baños, Laguna",
        farms: 1,
        area: "8.8 ha",
        phone: "+63 918 821 4702",
        email: "mia.santos@example.com",
        status: "Active",
        primaryCrop: "Corn",
        lastTouchpoint: "Checked in yesterday",
    },
    {
        name: "Jade Reyes",
        initials: "JR",
        municipality: "Bay, Laguna",
        farms: 1,
        area: "6.2 ha",
        phone: "+63 905 118 9432",
        email: "jade.reyes@example.com",
        status: "Active",
        primaryCrop: "Tomato",
        lastTouchpoint: "Checked in 2 days ago",
    },
    {
        name: "Rico Dela Cruz",
        initials: "RD",
        municipality: "Sta. Rosa, Laguna",
        farms: 2,
        area: "15.1 ha",
        phone: "+63 917 911 6028",
        email: "rico.delacruz@example.com",
        status: "Active",
        primaryCrop: "Eggplant",
        lastTouchpoint: "Checked in 3 days ago",
    },
    {
        name: "Ella Cruz",
        initials: "EC",
        municipality: "San Pablo, Laguna",
        farms: 1,
        area: "7.7 ha",
        phone: "+63 906 442 8137",
        email: "ella.cruz@example.com",
        status: "Pending",
        primaryCrop: "Onion",
        lastTouchpoint: "Awaiting profile review",
    },
];

const statusStyles: Record<FarmerStatus, string> = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Pending: "bg-amber-50 text-amber-700 ring-amber-100",
};

export default function FarmerManagement() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<"All" | FarmerStatus>("All");

    const visibleFarmers = useMemo(
        () =>
            farmers.filter(
                (farmer) =>
                    (status === "All" || farmer.status === status) &&
                    `${farmer.name} ${farmer.municipality}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
            ),
        [query, status],
    );

    const activeFarmers = farmers.filter((farmer) => farmer.status === "Active").length;
    const totalFarms = farmers.reduce((total, farmer) => total + farmer.farms, 0);

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1500px] space-y-8 p-5 sm:p-7 lg:space-y-10 lg:p-10">
                <section className="relative overflow-hidden rounded-[30px] bg-slate-950 px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8 lg:px-10">
                    <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />
                    <div className="absolute bottom-0 left-[38%] h-36 w-36 rounded-full border border-white/10" />

                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                                Grower network
                            </p>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Farmer management
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                                A relationship-first view of every registered grower, their farm portfolio, and the details needed to support them.
                            </p>
                        </div>

                        <button className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/20">
                            <Plus className="h-4 w-4" />
                            Add farmer
                        </button>
                    </div>

                    <dl className="relative mt-8 grid divide-y divide-white/10 border-t border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        <div className="py-4 sm:pr-7">
                            <dt className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                <UsersRound className="h-4 w-4 text-emerald-300" />
                                Registered growers
                            </dt>
                            <dd className="mt-2 text-2xl font-bold">{farmers.length}</dd>
                        </div>
                        <div className="py-4 sm:px-7">
                            <dt className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                Active profiles
                            </dt>
                            <dd className="mt-2 text-2xl font-bold">{activeFarmers}</dd>
                        </div>
                        <div className="py-4 sm:pl-7">
                            <dt className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                <Wheat className="h-4 w-4 text-emerald-300" />
                                Managed farm coverage
                            </dt>
                            <dd className="mt-2 text-2xl font-bold">56.4 ha</dd>
                        </div>
                    </dl>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <label className="relative block w-full lg:max-w-md">
                            <span className="sr-only">Search farmer profiles</span>
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by farmer or municipality"
                                className="w-full rounded-xl bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none ring-1 ring-inset ring-slate-200 transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    aria-label="Clear farmer search"
                                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </label>

                        <div className="flex flex-wrap items-center gap-2" aria-label="Filter farmers by profile status">
                            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                <Filter className="h-3.5 w-3.5" />
                                Profile status
                            </span>
                            {(["All", "Active", "Pending"] as const).map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setStatus(item)}
                                    aria-pressed={status === item}
                                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                        status === item
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-8">
                    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-1 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Profile directory</p>
                                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Growers and their coverage</h2>
                            </div>
                            <p className="text-sm text-slate-500">
                                {visibleFarmers.length} of {farmers.length} profiles shown
                            </p>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {visibleFarmers.map((farmer) => (
                                <article key={farmer.email} className="p-5 transition-colors hover:bg-slate-50/80 sm:p-6">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex min-w-0 items-start gap-4">
                                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-800 ring-4 ring-emerald-50">
                                                {farmer.initials}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-bold text-slate-900">{farmer.name}</h3>
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[farmer.status]}`}>
                                                        {farmer.status}
                                                    </span>
                                                </div>
                                                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                    {farmer.municipality}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                                        Primary crop: {farmer.primaryCrop}
                                                    </span>
                                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                                        {farmer.lastTouchpoint}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2 lg:w-[440px]">
                                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
                                                <p className="text-xs font-medium text-slate-400">Farm portfolio</p>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {farmer.farms} farm{farmer.farms === 1 ? "" : "s"} <span className="font-medium text-slate-400">·</span> {farmer.area}
                                                </p>
                                            </div>
                                            <div className="space-y-1.5 text-sm text-slate-600">
                                                <p className="flex items-center gap-2 truncate">
                                                    <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                                    <span className="truncate">{farmer.phone}</span>
                                                </p>
                                                <p className="flex items-center gap-2 truncate">
                                                    <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                                    <span className="truncate">{farmer.email}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}

                            {visibleFarmers.length === 0 && (
                                <div className="px-6 py-16 text-center sm:px-7">
                                    <Search className="mx-auto h-6 w-6 text-slate-300" />
                                    <p className="mt-3 text-sm font-medium text-slate-700">No farmer profiles found</p>
                                    <p className="mt-1 text-sm text-slate-500">Try a different name, municipality, or profile status.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="space-y-5 xl:sticky xl:top-6">
                        <section className="rounded-[26px] border border-emerald-100 bg-emerald-50/70 p-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                                <UserRoundPlus className="h-5 w-5" />
                            </div>
                            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Onboarding</p>
                            <h2 className="mt-1 text-lg font-bold text-slate-900">One profile needs review</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Ella Cruz has a registered farm and is ready for profile verification.
                            </p>
                            <div className="mt-5 rounded-xl border border-emerald-100 bg-white/80 p-3.5">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                                    <span>Profile completion</span>
                                    <span className="text-emerald-700">80%</span>
                                </div>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                                    <div className="h-full w-4/5 rounded-full bg-emerald-600" />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStatus("Pending")}
                                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            >
                                Review pending profile
                                <span aria-hidden="true">→</span>
                            </button>
                        </section>

                        <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Network snapshot</p>
                            <dl className="mt-5 space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-sm text-slate-500">Farm portfolios</dt>
                                    <dd className="text-sm font-bold text-slate-900">{totalFarms}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-sm text-slate-500">Profile activation</dt>
                                    <dd className="text-sm font-bold text-slate-900">80%</dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-sm text-slate-500">Primary region</dt>
                                    <dd className="text-sm font-bold text-slate-900">Laguna</dd>
                                </div>
                            </dl>
                        </section>
                    </aside>
                </div>
            </div>
        </AdminLayout>
    );
}
