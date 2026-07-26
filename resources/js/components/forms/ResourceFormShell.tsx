import { Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Save } from 'lucide-react';
import type { FormEventHandler, ReactNode } from 'react';
import FlashMessages from '@/components/FlashMessages';
import PageHeader from '@/components/PageHeader';
import AdminLayout from '@/layouts/AdminLayout';

interface ResourceFormShellProps {
    eyebrow: string;
    title: string;
    description: string;
    backHref: string;
    onSubmit?: FormEventHandler<HTMLFormElement>;
    isProcessing?: boolean;
    readOnly?: boolean;
    editHref?: string;
    submitLabel?: string;
    children: ReactNode;
}

export const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

export default function ResourceFormShell({
    eyebrow,
    title,
    description,
    backHref,
    onSubmit,
    isProcessing = false,
    readOnly = false,
    editHref,
    submitLabel = 'Save changes',
    children,
}: ResourceFormShellProps) {
    return (
        <AdminLayout>
            <div className="mx-auto max-w-5xl space-y-6 px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
                <PageHeader
                    eyebrow={eyebrow}
                    title={title}
                    description={description}
                    action={(
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to list
                        </Link>
                    )}
                />

                <FlashMessages />

                <form onSubmit={onSubmit} className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
                    <fieldset disabled={readOnly || isProcessing} className="contents">
                        <div className="p-5 sm:p-7">{children}</div>
                    </fieldset>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
                        <Link
                            href={backHref}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
                        >
                            Cancel
                        </Link>
                        {readOnly ? (
                            editHref ? (
                                <Link
                                    href={editHref}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit record
                                </Link>
                            ) : null
                        ) : (
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />
                                {isProcessing ? 'Saving…' : submitLabel}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
