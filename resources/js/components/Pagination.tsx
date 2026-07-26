import { Link } from '@inertiajs/react';
import type { Paginated } from '@/types';

interface PaginationProps<T> {
    paginator: Paginated<T>;
}

const readableLabel = (label: string) => label
    .replace(/&laquo;/g, '‹')
    .replace(/&raquo;/g, '›')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '');

export default function Pagination<T>({ paginator }: PaginationProps<T>) {
    if (paginator.last_page <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="Pagination"
            className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
            <p className="text-sm text-slate-500">
                Showing {paginator.from ?? 0}–{paginator.to ?? 0} of {paginator.total}
            </p>
            <div className="flex flex-wrap gap-1">
                {paginator.links.map((link) => (
                    <Link
                        key={`${link.label}-${link.url ?? 'disabled'}`}
                        href={link.url ?? '#'}
                        preserveScroll
                        aria-current={link.active ? 'page' : undefined}
                        aria-disabled={!link.url}
                        className={`min-w-9 rounded-lg px-2.5 py-2 text-center text-sm font-semibold transition ${link.active
                            ? 'bg-emerald-700 text-white'
                            : link.url
                                ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                                : 'cursor-not-allowed text-slate-300'
                            }`}
                        onClick={(event) => {
                            if (!link.url) {
                                event.preventDefault();
                            }
                        }}
                    >
                        {readableLabel(link.label)}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
