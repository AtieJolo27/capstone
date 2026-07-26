import { Link, router } from '@inertiajs/react';
import { Eye, FlaskConical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import EmptyState from '@/components/EmptyState';
import FlashMessages from '@/components/FlashMessages';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import AdminLayout from '@/layouts/AdminLayout';
import { formatDateTime, formatNumber } from '@/lib/formatters';
import type { Farm, FertilizerPrediction, Paginated } from '@/types';

interface FertilizerPredictionIndexPageProps {
    fertilizerPredictions: Paginated<FertilizerPrediction>;
    filters: {
        search: string | null;
        status: string | null;
        farm_id: number | null;
    };
    farms: Pick<Farm, 'id' | 'farm_name'>[];
}

const statusClassName = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes('review')) {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (normalizedStatus.includes('pending')) {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-slate-100 text-slate-700 ring-slate-200';
};

export default function FertilizerPredictionIndexPage({ fertilizerPredictions, filters, farms }: FertilizerPredictionIndexPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [farmId, setFarmId] = useState(filters.farm_id?.toString() ?? '');

    const submitFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        router.get('/fertilizer-predictions', {
            search: search || undefined,
            status: status || undefined,
            farm_id: farmId || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setFarmId('');
        router.get('/fertilizer-predictions', {}, { preserveScroll: true, replace: true });
    };

    const removePrediction = (prediction: FertilizerPrediction) => {
        const label = prediction.best_fertilizer ?? 'this fertilizer prediction';

        if (window.confirm(`Remove ${label}?`)) {
            router.delete(`/fertilizer-predictions/${prediction.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1540px] space-y-6 px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
                <PageHeader
                    eyebrow="Nutrient planning"
                    title="Fertilizer predictions"
                    description="Review field-ready nutrient guidance with its crop, sensor, and farm context in one place."
                    action={(
                        <Link href="/fertilizer-predictions/create" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
                            <Plus className="h-4 w-4" />
                            Create prediction
                        </Link>
                    )}
                />

                <FlashMessages />

                <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
                    <form onSubmit={submitFilters} className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(0,1fr)_12rem_14rem_auto_auto] lg:items-center sm:p-5">
                        <label className="relative min-w-0">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="Search fertilizer, crop, farm, or sensor" />
                        </label>
                        <input value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="Filter status" maxLength={20} aria-label="Filter by status" />
                        <select value={farmId} onChange={(event) => setFarmId(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" aria-label="Filter by farm">
                            <option value="">All farms</option>
                            {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farm_name}</option>)}
                        </select>
                        <button type="submit" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100">Apply</button>
                        <button type="button" onClick={resetFilters} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">Reset</button>
                    </form>

                    {fertilizerPredictions.data.length === 0 ? (
                        <EmptyState icon={FlaskConical} title="No fertilizer predictions found" description="Adjust the filters or add fertilizer guidance for a field recommendation." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-[960px] w-full text-left">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3.5">Fertilizer guidance</th>
                                        <th className="px-5 py-3.5">Field source</th>
                                        <th className="px-5 py-3.5">Rate</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5">Created</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {fertilizerPredictions.data.map((prediction) => (
                                        <tr key={prediction.id} className="transition hover:bg-slate-50/70">
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><FlaskConical className="h-4 w-4" /></span>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-900">{prediction.best_fertilizer ?? 'Unspecified fertilizer'}</p>
                                                        <p className="mt-0.5 text-sm text-slate-500">{prediction.best_crop ?? prediction.crop_prediction?.best_crop ?? 'No crop context'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-800">{prediction.farm?.farm_name ?? 'No farm linked'}</p>
                                                <p className="mt-0.5 text-sm text-slate-500">{prediction.sensor_device?.sensor_code ?? (prediction.crop_prediction ? `Crop prediction #${prediction.crop_prediction_id}` : 'No source linked')}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-800">{prediction.application_rate === null ? '—' : `${formatNumber(prediction.application_rate, 2)} ${prediction.application_unit ?? ''}`.trim()}</td>
                                            <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusClassName(prediction.prediction_status)}`}>{prediction.prediction_status}</span></td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{formatDateTime(prediction.created_at)}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1.5">
                                                    <Link href={`/fertilizer-predictions/${prediction.id}`} aria-label={`View ${prediction.best_fertilizer ?? 'fertilizer'} prediction`} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"><Eye className="h-4 w-4" /></Link>
                                                    <Link href={`/fertilizer-predictions/${prediction.id}/edit`} aria-label={`Edit ${prediction.best_fertilizer ?? 'fertilizer'} prediction`} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"><Pencil className="h-4 w-4" /></Link>
                                                    <button type="button" onClick={() => removePrediction(prediction)} aria-label={`Remove ${prediction.best_fertilizer ?? 'fertilizer'} prediction`} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination paginator={fertilizerPredictions} />
                </section>
            </div>
        </AdminLayout>
    );
}
