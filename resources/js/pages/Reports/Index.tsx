import { Link, router } from '@inertiajs/react';
import {
    ExternalLink,
    Eye,
    FileText,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import EmptyState from '@/components/EmptyState';
import FlashMessages from '@/components/FlashMessages';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import AdminLayout from '@/layouts/AdminLayout';
import { formatDate, formatDateTime, formatNumber } from '@/lib/formatters';
import reportRoutes from '@/routes/reports';
import type { Paginated, Report } from '@/types';

interface ReportIndexPageProps {
    reports: Paginated<Report>;
    filters: {
        search: string | null;
        report_type: string | null;
    };
}

const fileSize = (bytes: number | null): string => {
    if (bytes === null) {
        return '—';
    }

    if (bytes < 1024) {
        return `${formatNumber(bytes, 0)} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${formatNumber(bytes / 1024, 1)} KB`;
    }

    return `${formatNumber(bytes / (1024 * 1024), 1)} MB`;
};

export default function ReportIndexPage({ reports, filters }: ReportIndexPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [reportType, setReportType] = useState(filters.report_type ?? '');

    const submitFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        router.get(
            reportRoutes.index.url(),
            {
                search: search || undefined,
                report_type: reportType || undefined,
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
        setReportType('');
        router.get(reportRoutes.index.url(), {}, { preserveScroll: true, replace: true });
    };

    const removeReport = (report: Report) => {
        if (window.confirm(`Remove “${report.title}” from the report archive?`)) {
            router.delete(reportRoutes.destroy.url(report), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1540px] space-y-6 px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
                <PageHeader
                    eyebrow="Reporting archive"
                    title="Reports"
                    description="Keep generated farm reports searchable, traceable, and ready to open when the team needs them."
                    action={(
                        <Link
                            href={reportRoutes.create.url()}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                            <Plus className="h-4 w-4" />
                            Add report
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
                                placeholder="Search titles, descriptions, or file names"
                            />
                        </label>
                        <input
                            value={reportType}
                            onChange={(event) => setReportType(event.target.value)}
                            className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            placeholder="Report type"
                            maxLength={50}
                            aria-label="Filter by report type"
                        />
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

                    {reports.data.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No reports found"
                            description="Add an existing generated report to make it available to the operations team."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-[880px] w-full text-left">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3.5">Report</th>
                                        <th className="px-5 py-3.5">Coverage</th>
                                        <th className="px-5 py-3.5">Generated</th>
                                        <th className="px-5 py-3.5">File</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reports.data.map((report) => (
                                        <tr key={report.id} className="transition hover:bg-slate-50/70">
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                        <FileText className="h-4 w-4" />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-900">{report.title}</p>
                                                        <p className="mt-0.5 text-sm text-slate-500">
                                                            {report.report_type.replaceAll('_', ' ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {report.start_date || report.end_date
                                                    ? `${formatDate(report.start_date)} – ${formatDate(report.end_date)}`
                                                    : 'No date range'}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatDateTime(report.generated_at)}
                                            </td>
                                            <td className="px-5 py-4">
                                                {report.file_url ? (
                                                    <a
                                                        href={report.file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex max-w-48 items-center gap-1.5 truncate text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                                                    >
                                                        <span className="truncate">{report.file_name ?? 'Open file'}</span>
                                                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-slate-500">
                                                        {report.file_name ?? 'No file linked'} · {fileSize(report.file_size)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1.5">
                                                    <Link
                                                        href={reportRoutes.show.url(report)}
                                                        aria-label={`View ${report.title}`}
                                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={reportRoutes.edit.url(report)}
                                                        aria-label={`Edit ${report.title}`}
                                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeReport(report)}
                                                        aria-label={`Remove ${report.title}`}
                                                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <Pagination paginator={reports} />
                </section>
            </div>
        </AdminLayout>
    );
}
