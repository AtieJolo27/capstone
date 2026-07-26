import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import FormField from '@/components/forms/FormField';
import ResourceFormShell, {
    inputClassName,
} from '@/components/forms/ResourceFormShell';
import reportRoutes from '@/routes/reports';
import type { Report } from '@/types';

interface ReportFormProps {
    report?: Report;
    readOnly?: boolean;
}

interface ReportFormData {
    title: string;
    report_type: string;
    description: string;
    generated_by: string;
    file_name: string;
    file_url: string;
    file_size: string;
    start_date: string;
    end_date: string;
    generated_at: string;
}

const asDateInput = (value: string | null | undefined): string => {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value.slice(0, 10);
    }

    const pad = (number: number): string => number.toString().padStart(2, '0');

    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(
        '-',
    );
};

const asDateTimeLocal = (value: string | null | undefined): string => {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value.slice(0, 16);
    }

    const pad = (number: number): string => number.toString().padStart(2, '0');

    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())]
        .join('-')
        .concat(`T${pad(date.getHours())}:${pad(date.getMinutes())}`);
};

const valuesFor = (report?: Report): ReportFormData => ({
    title: report?.title ?? '',
    report_type: report?.report_type ?? 'field_summary',
    description: report?.description ?? '',
    generated_by: report?.generated_by?.toString() ?? '',
    file_name: report?.file_name ?? '',
    file_url: report?.file_url ?? '',
    file_size: report?.file_size?.toString() ?? '',
    start_date: asDateInput(report?.start_date),
    end_date: asDateInput(report?.end_date),
    generated_at: asDateTimeLocal(report?.generated_at),
});

export default function ReportForm({ report, readOnly = false }: ReportFormProps) {
    const form = useForm<ReportFormData>(valuesFor(report));
    const isEditing = Boolean(report);

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (report) {
            form.put(reportRoutes.update.url(report));

            return;
        }

        form.post(reportRoutes.store.url());
    };

    return (
        <ResourceFormShell
            eyebrow="Reporting archive"
            title={
                readOnly
                    ? report?.title || 'Report details'
                    : isEditing
                      ? 'Edit report record'
                      : 'Create report record'
            }
            description={
                readOnly
                    ? 'Review the report scope, generation details, and linked file location.'
                    : 'Register a generated report so the archive remains searchable and traceable.'
            }
            backHref={reportRoutes.index.url()}
            editHref={report ? reportRoutes.edit.url(report) : undefined}
            onSubmit={submit}
            isProcessing={form.processing}
            readOnly={readOnly}
            submitLabel={isEditing ? 'Save report changes' : 'Create report record'}
        >
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Report details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Use a clear title and report type so archived records can
                        be found without opening every file.
                    </p>
                </div>

                <div className="md:col-span-2">
                    <FormField
                        label="Title"
                        htmlFor="title"
                        required
                        error={form.errors.title}
                    >
                        <input
                            id="title"
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData('title', event.target.value)
                            }
                            className={inputClassName}
                            maxLength={200}
                            placeholder="e.g. July soil health summary"
                            required
                        />
                    </FormField>
                </div>

                <FormField
                    label="Report type"
                    htmlFor="report_type"
                    required
                    error={form.errors.report_type}
                >
                    <input
                        id="report_type"
                        value={form.data.report_type}
                        onChange={(event) =>
                            form.setData('report_type', event.target.value)
                        }
                        className={inputClassName}
                        maxLength={50}
                        placeholder="e.g. field_summary"
                        required
                    />
                </FormField>

                <FormField
                    label="Generated by user ID"
                    htmlFor="generated_by"
                    error={form.errors.generated_by}
                >
                    <input
                        id="generated_by"
                        type="number"
                        min="1"
                        step="1"
                        value={form.data.generated_by}
                        onChange={(event) =>
                            form.setData('generated_by', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <div className="md:col-span-2">
                    <FormField
                        label="Description"
                        htmlFor="description"
                        error={form.errors.description}
                    >
                        <textarea
                            id="description"
                            rows={5}
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            className={inputClassName}
                            maxLength={5000}
                            placeholder="Summarize what the report covers and why it was generated."
                        />
                    </FormField>
                </div>

                <div className="mt-2 border-t border-slate-100 pt-6 md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Time period and file
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Record the data range separately from the generation time,
                        then link the resulting file when one is available.
                    </p>
                </div>

                <FormField
                    label="Start date"
                    htmlFor="start_date"
                    error={form.errors.start_date}
                >
                    <input
                        id="start_date"
                        type="date"
                        value={form.data.start_date}
                        onChange={(event) =>
                            form.setData('start_date', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="End date"
                    htmlFor="end_date"
                    error={form.errors.end_date}
                >
                    <input
                        id="end_date"
                        type="date"
                        value={form.data.end_date}
                        onChange={(event) =>
                            form.setData('end_date', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Generated at"
                    htmlFor="generated_at"
                    error={form.errors.generated_at}
                >
                    <input
                        id="generated_at"
                        type="datetime-local"
                        value={form.data.generated_at}
                        onChange={(event) =>
                            form.setData('generated_at', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="File name"
                    htmlFor="file_name"
                    error={form.errors.file_name}
                >
                    <input
                        id="file_name"
                        value={form.data.file_name}
                        onChange={(event) =>
                            form.setData('file_name', event.target.value)
                        }
                        className={inputClassName}
                        maxLength={255}
                        placeholder="e.g. july-soil-health.pdf"
                    />
                </FormField>

                <div className="md:col-span-2">
                    <FormField
                        label="File URL"
                        htmlFor="file_url"
                        hint="Use a secure, accessible location for the generated file."
                        error={form.errors.file_url}
                    >
                        <input
                            id="file_url"
                            type="url"
                            value={form.data.file_url}
                            onChange={(event) =>
                                form.setData('file_url', event.target.value)
                            }
                            className={inputClassName}
                            maxLength={2048}
                            placeholder="https://example.com/reports/july-soil-health.pdf"
                        />
                    </FormField>
                </div>

                <FormField
                    label="File size (bytes)"
                    htmlFor="file_size"
                    error={form.errors.file_size}
                >
                    <input
                        id="file_size"
                        type="number"
                        min="0"
                        step="1"
                        value={form.data.file_size}
                        onChange={(event) =>
                            form.setData('file_size', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>
            </div>
        </ResourceFormShell>
    );
}
