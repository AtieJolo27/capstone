import { Link, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import EmptyState from '@/components/EmptyState';
import FlashMessages from '@/components/FlashMessages';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import AdminLayout from '@/layouts/AdminLayout';
import { formatNumber } from '@/lib/formatters';
import thresholdSettingRoutes from '@/routes/threshold-settings';
import type { Paginated, ThresholdSetting } from '@/types';

interface ThresholdSettingIndexPageProps {
    thresholdSettings: Paginated<ThresholdSetting>;
    filters: {
        search: string | null;
        farm_id: number | null;
        sensor_id: number | null;
        is_active: boolean | null;
    };
}

const limit = (value: number | null): string => (
    value === null ? '—' : formatNumber(value, 2)
);

export default function ThresholdSettingIndexPage({
    thresholdSettings,
    filters,
}: ThresholdSettingIndexPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [active, setActive] = useState(
        filters.is_active === null ? '' : filters.is_active ? 'true' : 'false',
    );

    const submitFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        router.get(
            thresholdSettingRoutes.index.url(),
            {
                search: search || undefined,
                is_active: active === '' ? undefined : active === 'true',
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setActive('');
        router.get(
            thresholdSettingRoutes.index.url(),
            {},
            { preserveScroll: true, replace: true },
        );
    };

    const removeThreshold = (thresholdSetting: ThresholdSetting) => {
        if (window.confirm(`Remove the ${thresholdSetting.parameter_name} threshold?`)) {
            router.delete(thresholdSettingRoutes.destroy.url(thresholdSetting), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1540px] space-y-6 px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
                <PageHeader
                    eyebrow="Monitoring guardrails"
                    title="Threshold settings"
                    description="Set the operating range that helps the team spot readings that need a closer look."
                    action={(
                        <Link
                            href={thresholdSettingRoutes.create.url()}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                            <Plus className="h-4 w-4" />
                            Add threshold
                        </Link>
                    )}
                />

                <FlashMessages />

                <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
                    <form
                        onSubmit={submitFilters}
                        className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5"
                    >
                        <label className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                placeholder="Search by parameter, farm, or sensor"
                            />
                        </label>
                        <select
                            value={active}
                            onChange={(event) => setActive(event.target.value)}
                            className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            aria-label="Filter by active state"
                        >
                            <option value="">All settings</option>
                            <option value="true">Active only</option>
                            <option value="false">Inactive only</option>
                        </select>
                        <button
                            type="submit"
                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                        >
                            Apply
                        </button>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            Reset
                        </button>
                    </form>

                    {thresholdSettings.data.length === 0 ? (
                        <EmptyState
                            icon={SlidersHorizontal}
                            title="No thresholds found"
                            description="Add a parameter range to make sensor monitoring more actionable."
                        />
                    ) : (
                        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                            {thresholdSettings.data.map((thresholdSetting) => (
                                <article
                                    key={thresholdSetting.id}
                                    className="flex min-w-0 flex-col rounded-2xl border border-slate-200/80 p-4 transition hover:border-emerald-200 hover:shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                            <SlidersHorizontal className="h-5 w-5" />
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${thresholdSetting.is_active
                                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                                                : 'bg-slate-100 text-slate-600 ring-slate-200'
                                                }`}
                                        >
                                            {thresholdSetting.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <h2 className="mt-4 truncate text-base font-bold text-slate-900">
                                        {thresholdSetting.parameter_name.replaceAll('_', ' ')}
                                    </h2>
                                    <p className="mt-1 truncate text-sm text-slate-500">
                                        {thresholdSetting.farm?.farm_name
                                            ?? thresholdSetting.sensor_device?.sensor_code
                                            ?? 'Applies across monitoring'}
                                    </p>

                                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
                                        <div>
                                            <dt className="text-slate-500">Normal range</dt>
                                            <dd className="mt-1 font-semibold text-slate-800">
                                                {limit(thresholdSetting.min_value)}–{limit(thresholdSetting.max_value)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Warning range</dt>
                                            <dd className="mt-1 font-semibold text-slate-800">
                                                {limit(thresholdSetting.warning_minimum)}–{limit(thresholdSetting.warning_maximum)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Unit</dt>
                                            <dd className="mt-1 font-semibold text-slate-800">
                                                {thresholdSetting.unit ?? '—'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Sensor</dt>
                                            <dd className="mt-1 truncate font-semibold text-slate-800">
                                                {thresholdSetting.sensor_device?.sensor_code ?? 'All sensors'}
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-5 flex items-center gap-2">
                                        <Link
                                            href={thresholdSettingRoutes.show.url(thresholdSetting)}
                                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={thresholdSettingRoutes.edit.url(thresholdSetting)}
                                            aria-label={`Edit ${thresholdSetting.parameter_name}`}
                                            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => removeThreshold(thresholdSetting)}
                                            aria-label={`Remove ${thresholdSetting.parameter_name}`}
                                            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    <Pagination paginator={thresholdSettings} />
                </section>
            </div>
        </AdminLayout>
    );
}
