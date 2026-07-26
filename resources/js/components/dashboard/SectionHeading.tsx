import type { ReactNode } from 'react';

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function SectionHeading({
    eyebrow,
    title,
    description,
    action,
}: SectionHeadingProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <p className="text-xs font-bold tracking-[0.12em] text-emerald-700 uppercase">
                    {eyebrow}
                </p>
                <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-950">
                    {title}
                </h2>
                {description ? (
                    <p className="mt-1.5 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
