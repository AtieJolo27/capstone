import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import FormField from '@/components/forms/FormField';
import ResourceFormShell, {
    inputClassName,
} from '@/components/forms/ResourceFormShell';
import announcementRoutes from '@/routes/announcements';
import type { Announcement } from '@/types';

interface AnnouncementFormProps {
    announcement?: Announcement;
    readOnly?: boolean;
}

interface AnnouncementFormData {
    title: string;
    message: string;
    audience: string;
    priority: string;
    status: string;
    published_at: string;
    expires_at: string;
    created_by: string;
}

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

const valuesFor = (announcement?: Announcement): AnnouncementFormData => ({
    title: announcement?.title ?? '',
    message: announcement?.message ?? '',
    audience: announcement?.audience ?? 'all',
    priority: announcement?.priority ?? 'normal',
    status: announcement?.status ?? 'draft',
    published_at: asDateTimeLocal(announcement?.published_at),
    expires_at: asDateTimeLocal(announcement?.expires_at),
    created_by: announcement?.created_by?.toString() ?? '',
});

export default function AnnouncementForm({
    announcement,
    readOnly = false,
}: AnnouncementFormProps) {
    const form = useForm<AnnouncementFormData>(valuesFor(announcement));
    const isEditing = Boolean(announcement);

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (announcement) {
            form.put(announcementRoutes.update.url(announcement));

            return;
        }

        form.post(announcementRoutes.store.url());
    };

    return (
        <ResourceFormShell
            eyebrow="Farm communication"
            title={
                readOnly
                    ? announcement?.title || 'Announcement details'
                    : isEditing
                      ? 'Edit announcement'
                      : 'Create announcement'
            }
            description={
                readOnly
                    ? 'Review the message audience, publishing state, and availability window.'
                    : 'Prepare a clear operational update for the people who need to see it.'
            }
            backHref={announcementRoutes.index.url()}
            editHref={
                announcement
                    ? announcementRoutes.edit.url(announcement)
                    : undefined
            }
            onSubmit={submit}
            isProcessing={form.processing}
            readOnly={readOnly}
            submitLabel={
                isEditing ? 'Save announcement changes' : 'Create announcement'
            }
        >
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Message
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Keep the title direct and make the message useful without
                        requiring recipients to open another screen.
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
                            placeholder="e.g. Irrigation advisory for this week"
                            required
                        />
                    </FormField>
                </div>

                <div className="md:col-span-2">
                    <FormField
                        label="Message"
                        htmlFor="message"
                        required
                        error={form.errors.message}
                    >
                        <textarea
                            id="message"
                            rows={8}
                            value={form.data.message}
                            onChange={(event) =>
                                form.setData('message', event.target.value)
                            }
                            className={inputClassName}
                            maxLength={5000}
                            placeholder="Write the complete update, including any timing or action recipients should take."
                            required
                        />
                    </FormField>
                </div>

                <div className="mt-2 border-t border-slate-100 pt-6 md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Delivery
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Set the intended audience and publishing state before the
                        message is shared.
                    </p>
                </div>

                <FormField
                    label="Audience"
                    htmlFor="audience"
                    error={form.errors.audience}
                >
                    <select
                        id="audience"
                        value={form.data.audience}
                        onChange={(event) =>
                            form.setData('audience', event.target.value)
                        }
                        className={inputClassName}
                    >
                        <option value="">Not set</option>
                        <option value="all">All users</option>
                        <option value="farmers">Farmers</option>
                        <option value="field_staff">Field staff</option>
                        <option value="administrators">Administrators</option>
                        <option value="specific_farm">Specific farm</option>
                    </select>
                </FormField>

                <FormField
                    label="Priority"
                    htmlFor="priority"
                    error={form.errors.priority}
                >
                    <select
                        id="priority"
                        value={form.data.priority}
                        onChange={(event) =>
                            form.setData('priority', event.target.value)
                        }
                        className={inputClassName}
                    >
                        <option value="">Not set</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                    </select>
                </FormField>

                <FormField
                    label="Status"
                    htmlFor="status"
                    error={form.errors.status}
                >
                    <select
                        id="status"
                        value={form.data.status}
                        onChange={(event) =>
                            form.setData('status', event.target.value)
                        }
                        className={inputClassName}
                    >
                        <option value="">Not set</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="archived">Archived</option>
                    </select>
                </FormField>

                <FormField
                    label="Created by user ID"
                    htmlFor="created_by"
                    hint="Optional internal reference to the user who prepared this announcement."
                    error={form.errors.created_by}
                >
                    <input
                        id="created_by"
                        type="number"
                        min="1"
                        step="1"
                        value={form.data.created_by}
                        onChange={(event) =>
                            form.setData('created_by', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Published at"
                    htmlFor="published_at"
                    error={form.errors.published_at}
                >
                    <input
                        id="published_at"
                        type="datetime-local"
                        value={form.data.published_at}
                        onChange={(event) =>
                            form.setData('published_at', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Expires at"
                    htmlFor="expires_at"
                    hint="Leave blank when the message should stay available."
                    error={form.errors.expires_at}
                >
                    <input
                        id="expires_at"
                        type="datetime-local"
                        value={form.data.expires_at}
                        onChange={(event) =>
                            form.setData('expires_at', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>
            </div>
        </ResourceFormShell>
    );
}
