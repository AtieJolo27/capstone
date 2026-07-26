import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
    return (
        <div className="px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">{title}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
        </div>
    );
}
