import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import FormField from '@/components/forms/FormField';
import ResourceFormShell, {
    inputClassName,
} from '@/components/forms/ResourceFormShell';
import alertRoutes from '@/routes/alerts';
import type { Alert } from '@/types';

interface RelationshipOption {
    id: number | string;
    label: string;
}

interface AlertFormProps {
    alert?: Alert;
    farms: RelationshipOption[];
    sensors: RelationshipOption[];
    sensorReadings: RelationshipOption[];
    readOnly?: boolean;
}

interface AlertFormData {
    farm_id: string;
    sensor_id: string;
    reading_id: string;
    alert_type: string;
    severity: string;
    title: string;
    message: string;
    parameter_name: string;
    parameter_value: string;
    threshold_value: string;
    status: string;
    acknowledged_at: string;
    resolved_at: string;
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

const valuesFor = (alert?: Alert): AlertFormData => ({
    farm_id: alert?.farm_id?.toString() ?? '',
    sensor_id: alert?.sensor_id?.toString() ?? '',
    reading_id: alert?.reading_id?.toString() ?? '',
    alert_type: alert?.alert_type ?? 'soil_measurement',
    severity: alert?.severity ?? 'warning',
    title: alert?.title ?? '',
    message: alert?.message ?? '',
    parameter_name: alert?.parameter_name ?? '',
    parameter_value: alert?.parameter_value?.toString() ?? '',
    threshold_value: alert?.threshold_value?.toString() ?? '',
    status: alert?.status ?? 'open',
    acknowledged_at: asDateTimeLocal(alert?.acknowledged_at),
    resolved_at: asDateTimeLocal(alert?.resolved_at),
});

export default function AlertForm({
    alert,
    farms,
    sensors,
    sensorReadings,
    readOnly = false,
}: AlertFormProps) {
    const form = useForm<AlertFormData>(valuesFor(alert));
    const isEditing = Boolean(alert);

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (alert) {
            form.put(alertRoutes.update.url(alert));

            return;
        }

        form.post(alertRoutes.store.url());
    };

    return (
        <ResourceFormShell
            eyebrow="Monitoring response"
            title={
                readOnly
                    ? alert?.title || 'Alert details'
                    : isEditing
                      ? 'Edit alert'
                      : 'Create alert'
            }
            description={
                readOnly
                    ? 'Review the affected field, measurement, and response state for this alert.'
                    : 'Document a field issue clearly so the operations team can prioritize and follow up.'
            }
            backHref={alertRoutes.index.url()}
            editHref={alert ? alertRoutes.edit.url(alert) : undefined}
            onSubmit={submit}
            isProcessing={form.processing}
            readOnly={readOnly}
            submitLabel={isEditing ? 'Save alert changes' : 'Create alert'}
        >
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Alert details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Give the alert a concise title, a clear severity, and
                        enough context for someone to take action.
                    </p>
                </div>

                <FormField
                    label="Alert type"
                    htmlFor="alert_type"
                    required
                    error={form.errors.alert_type}
                >
                    <input
                        id="alert_type"
                        value={form.data.alert_type}
                        onChange={(event) =>
                            form.setData('alert_type', event.target.value)
                        }
                        className={inputClassName}
                        maxLength={50}
                        placeholder="e.g. soil_moisture"
                        required
                    />
                </FormField>

                <FormField
                    label="Severity"
                    htmlFor="severity"
                    required
                    error={form.errors.severity}
                >
                    <select
                        id="severity"
                        value={form.data.severity}
                        onChange={(event) =>
                            form.setData('severity', event.target.value)
                        }
                        className={inputClassName}
                        required
                    >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="warning">Warning</option>
                        <option value="low">Low</option>
                        <option value="info">Information</option>
                    </select>
                </FormField>

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
                            maxLength={150}
                            placeholder="e.g. Low soil moisture needs attention"
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
                            rows={5}
                            value={form.data.message}
                            onChange={(event) =>
                                form.setData('message', event.target.value)
                            }
                            className={inputClassName}
                            maxLength={5000}
                            placeholder="Explain what was observed and the recommended next step."
                            required
                        />
                    </FormField>
                </div>

                <div className="mt-2 border-t border-slate-100 pt-6 md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Related monitoring record
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        These links are optional, but they make the issue easier
                        to trace back to a field device and measurement.
                    </p>
                </div>

                <FormField
                    label="Farm"
                    htmlFor="farm_id"
                    error={form.errors.farm_id}
                >
                    <select
                        id="farm_id"
                        value={form.data.farm_id}
                        onChange={(event) =>
                            form.setData('farm_id', event.target.value)
                        }
                        className={inputClassName}
                    >
                        <option value="">No farm linked</option>
                        {farms.map((farm) => (
                            <option key={farm.id} value={farm.id}>
                                {farm.label}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField
                    label="Sensor device"
                    htmlFor="sensor_id"
                    error={form.errors.sensor_id}
                >
                    <select
                        id="sensor_id"
                        value={form.data.sensor_id}
                        onChange={(event) =>
                            form.setData('sensor_id', event.target.value)
                        }
                        className={inputClassName}
                    >
                        <option value="">No sensor linked</option>
                        {sensors.map((sensor) => (
                            <option key={sensor.id} value={sensor.id}>
                                {sensor.label}
                            </option>
                        ))}
                    </select>
                </FormField>

                <div className="md:col-span-2">
                    <FormField
                        label="Sensor reading"
                        htmlFor="reading_id"
                        hint="Only the 100 most recent readings are listed."
                        error={form.errors.reading_id}
                    >
                        <select
                            id="reading_id"
                            value={form.data.reading_id}
                            onChange={(event) =>
                                form.setData('reading_id', event.target.value)
                            }
                            className={inputClassName}
                        >
                            <option value="">No reading linked</option>
                            {sensorReadings.map((reading) => (
                                <option key={reading.id} value={reading.id}>
                                    {reading.label}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>

                <div className="mt-2 border-t border-slate-100 pt-6 md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Threshold and response
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Capture the measurement that triggered the alert and the
                        current response status when those details are known.
                    </p>
                </div>

                <FormField
                    label="Measured parameter"
                    htmlFor="parameter_name"
                    error={form.errors.parameter_name}
                >
                    <input
                        id="parameter_name"
                        value={form.data.parameter_name}
                        onChange={(event) =>
                            form.setData('parameter_name', event.target.value)
                        }
                        className={inputClassName}
                        maxLength={50}
                        placeholder="e.g. soil_moisture"
                    />
                </FormField>

                <FormField
                    label="Current value"
                    htmlFor="parameter_value"
                    error={form.errors.parameter_value}
                >
                    <input
                        id="parameter_value"
                        type="number"
                        step="any"
                        value={form.data.parameter_value}
                        onChange={(event) =>
                            form.setData('parameter_value', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Threshold value"
                    htmlFor="threshold_value"
                    error={form.errors.threshold_value}
                >
                    <input
                        id="threshold_value"
                        type="number"
                        step="any"
                        value={form.data.threshold_value}
                        onChange={(event) =>
                            form.setData('threshold_value', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Response status"
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
                        <option value="open">Open</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                    </select>
                </FormField>

                <FormField
                    label="Acknowledged at"
                    htmlFor="acknowledged_at"
                    error={form.errors.acknowledged_at}
                >
                    <input
                        id="acknowledged_at"
                        type="datetime-local"
                        value={form.data.acknowledged_at}
                        onChange={(event) =>
                            form.setData('acknowledged_at', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Resolved at"
                    htmlFor="resolved_at"
                    error={form.errors.resolved_at}
                >
                    <input
                        id="resolved_at"
                        type="datetime-local"
                        value={form.data.resolved_at}
                        onChange={(event) =>
                            form.setData('resolved_at', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>
            </div>
        </ResourceFormShell>
    );
}
