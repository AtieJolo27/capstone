import { Link, router } from '@inertiajs/react';
import { MapPinned, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import EmptyState from '@/components/EmptyState';
import FlashMessages from '@/components/FlashMessages';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import AdminLayout from '@/layouts/AdminLayout';
import { formatNumber } from '@/lib/formatters';
import type { Farm, Paginated } from '@/types';

interface FarmIndexPageProps {
    farms: Paginated<Farm>;
    filters: {
        search: string | null;
        status: string | null;
        farmer_id: string | null;
    };
}

const statusStyle: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
    archived: 'bg-amber-50 text-amber-700 ring-amber-100',
};

export default function FarmIndexPage({ farms, filters }: FarmIndexPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const submitSearch: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        router.get('/farms', { search: search || undefined, status: status || undefined }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const removeFarm = (farm: Farm) => {
        if (window.confirm(`Remove ${farm.farm_name}? Linked operational records will prevent deletion.`)) {
            router.delete(`/farms/${farm.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1540px] space-y-6 px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
                <PageHeader
                    eyebrow="Farm portfolio"
                    title="Farm management"
                    description="Register fields, keep location details accurate, and review their connected monitoring coverage."
                    action={(
                        <Link href="/farms/create" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
                            <Plus className="h-4 w-4" />
                            Register farm
                        </Link>
                    )}
                />

                <FlashMessages />

                <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
                    <form onSubmit={submitSearch} className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5">
                        <label className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="Search farms, locations, or crops" />
                        </label>
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                            <option value="">All statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="archived">Archived</option>
                        </select>
                        <button type="submit" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100">Apply</button>
                    </form>

                    {farms.data.length === 0 ? (
                        <EmptyState icon={MapPinned} title="No farms found" description="Adjust the search or register the first field in your portfolio." />
                    ) : (
                        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                            {farms.data.map((farm) => (
                                <article key={farm.id} className="flex min-w-0 flex-col rounded-2xl border border-slate-200/80 p-4 transition hover:border-emerald-200 hover:shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><MapPinned className="h-5 w-5" /></span>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyle[farm.status ?? ''] ?? statusStyle.inactive}`}>{farm.status ?? 'Unknown'}</span>
                                    </div>
                                    <h2 className="mt-4 truncate text-base font-bold text-slate-900">{farm.farm_name}</h2>
                                    <p className="mt-1 truncate text-sm text-slate-500">{[farm.municipality, farm.province].filter(Boolean).join(', ') || 'Location not completed'}</p>
                                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
                                        <div><dt className="text-slate-500">Current crop</dt><dd className="mt-1 font-semibold text-slate-800">{farm.current_crop ?? '—'}</dd></div>
                                        <div><dt className="text-slate-500">Coverage</dt><dd className="mt-1 font-semibold text-slate-800">{farm.sensor_devices_count ?? 0} sensors</dd></div>
                                        <div><dt className="text-slate-500">Field size</dt><dd className="mt-1 font-semibold text-slate-800">{farm.farm_size === null ? '—' : `${formatNumber(farm.farm_size, 2)} ${farm.farm_size_unit ?? 'ha'}`}</dd></div>
                                        <div><dt className="text-slate-500">Alerts</dt><dd className="mt-1 font-semibold text-slate-800">{farm.alerts_count ?? 0}</dd></div>
                                    </dl>
                                    <div className="mt-5 flex items-center gap-2">
                                        <Link href={`/farms/${farm.id}`} className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">View</Link>
                                        <Link href={`/farms/${farm.id}/edit`} aria-label={`Edit ${farm.farm_name}`} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"><Pencil className="h-4 w-4" /></Link>
                                        <button type="button" onClick={() => removeFarm(farm)} aria-label={`Remove ${farm.farm_name}`} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                    <Pagination paginator={farms} />
                </section>
            </div>
        </AdminLayout>
    );
}
