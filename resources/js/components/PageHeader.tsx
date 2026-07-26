import type { ReactNode } from 'react';

interface PageHeaderProps {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function PageHeader({
    eyebrow,
    title,
    description,
    action,
}: PageHeaderProps) {
    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                    {eyebrow}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                    {description}
                </p>
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </header>
    );
}
