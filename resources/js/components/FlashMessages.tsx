import { usePage } from '@inertiajs/react';
import { CheckCircle2, CircleAlert } from 'lucide-react';

interface FlashProps {
    [key: string]: unknown;
    flash?: {
        success?: string | null;
        error?: string | null;
    };
}

export default function FlashMessages() {
    const { flash } = usePage<FlashProps>().props;

    if (!flash?.success && !flash?.error) {
        return null;
    }

    return (
        <div className="space-y-3" aria-live="polite">
            {flash.success ? (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    <p>{flash.success}</p>
                </div>
            ) : null}
            {flash.error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                    <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
                    <p>{flash.error}</p>
                </div>
            ) : null}
        </div>
    );
}
