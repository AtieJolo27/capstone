import type { ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    htmlFor: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: ReactNode;
}

export default function FormField({
    label,
    htmlFor,
    required = false,
    hint,
    error,
    children,
}: FormFieldProps) {
    return (
        <div>
            <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
                {label}
                {required ? <span className="ml-1 text-rose-600">*</span> : null}
            </label>
            <div className="mt-1.5">{children}</div>
            {error ? <p className="mt-1.5 text-sm text-rose-700">{error}</p> : null}
            {!error && hint ? <p className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</p> : null}
        </div>
    );
}
