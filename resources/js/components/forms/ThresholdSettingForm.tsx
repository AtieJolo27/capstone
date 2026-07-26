import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import FormField from '@/components/forms/FormField';
import ResourceFormShell, {
    inputClassName,
} from '@/components/forms/ResourceFormShell';
import thresholdSettingRoutes from '@/routes/threshold-settings';
import type { ThresholdSetting } from '@/types';

interface RelationshipOption {
    id: number | string;
    label: string;
}

interface ThresholdSettingFormProps {
    thresholdSetting?: ThresholdSetting;
    farms: RelationshipOption[];
    sensors: RelationshipOption[];
    readOnly?: boolean;
}

interface ThresholdSettingFormData {
    farm_id: string;
    sensor_id: string;
    parameter_name: string;
    min_value: string;
    max_value: string;
    warning_minimum: string;
    warning_maximum: string;
    unit: string;
    is_active: boolean;
}

const valuesFor = (
    thresholdSetting?: ThresholdSetting,
): ThresholdSettingFormData => ({
    farm_id: thresholdSetting?.farm_id?.toString() ?? '',
    sensor_id: thresholdSetting?.sensor_id?.toString() ?? '',
    parameter_name: thresholdSetting?.parameter_name ?? 'soil_moisture',
    min_value: thresholdSetting?.min_value?.toString() ?? '',
    max_value: thresholdSetting?.max_value?.toString() ?? '',
    warning_minimum: thresholdSetting?.warning_minimum?.toString() ?? '',
    warning_maximum: thresholdSetting?.warning_maximum?.toString() ?? '',
    unit: thresholdSetting?.unit ?? '%',
    is_active: thresholdSetting?.is_active ?? true,
});

export default function ThresholdSettingForm({
    thresholdSetting,
    farms,
    sensors,
    readOnly = false,
}: ThresholdSettingFormProps) {
    const form = useForm<ThresholdSettingFormData>(
        valuesFor(thresholdSetting),
    );
    const isEditing = Boolean(thresholdSetting);

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (thresholdSetting) {
            form.put(thresholdSettingRoutes.update.url(thresholdSetting));

            return;
        }

        form.post(thresholdSettingRoutes.store.url());
    };

    return (
        <ResourceFormShell
            eyebrow="Monitoring rules"
            title={
                readOnly
                    ? `${thresholdSetting?.parameter_name || 'Threshold'} rule`
                    : isEditing
                      ? 'Edit threshold setting'
                      : 'Create threshold setting'
            }
            description={
                readOnly
                    ? 'Review the operating range used to flag unexpected field measurements.'
                    : 'Set clear operating and warning ranges so field alerts remain meaningful.'
            }
            backHref={thresholdSettingRoutes.index.url()}
            editHref={
                thresholdSetting
                    ? thresholdSettingRoutes.edit.url(thresholdSetting)
                    : undefined
            }
            onSubmit={submit}
            isProcessing={form.processing}
            readOnly={readOnly}
            submitLabel={
                isEditing ? 'Save threshold changes' : 'Create threshold rule'
            }
        >
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Scope
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Apply a rule to a farm, a device, or both. Leaving both
                        blank keeps the rule available as a general reference.
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
                        <option value="">All farms</option>
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
                        <option value="">All sensors</option>
                        {sensors.map((sensor) => (
                            <option key={sensor.id} value={sensor.id}>
                                {sensor.label}
                            </option>
                        ))}
                    </select>
                </FormField>

                <div className="mt-2 border-t border-slate-100 pt-6 md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Measurement range
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Define the acceptable range first, then use the warning
                        range to notify staff before the hard limit is reached.
                    </p>
                </div>

                <FormField
                    label="Parameter name"
                    htmlFor="parameter_name"
                    required
                    hint="Use the same name reported by the device, such as soil_moisture or ph."
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
                        required
                    />
                </FormField>

                <FormField label="Unit" htmlFor="unit" error={form.errors.unit}>
                    <input
                        id="unit"
                        value={form.data.unit}
                        onChange={(event) =>
                            form.setData('unit', event.target.value)
                        }
                        className={inputClassName}
                        maxLength={30}
                        placeholder="e.g. %, °C, pH"
                    />
                </FormField>

                <FormField
                    label="Minimum acceptable value"
                    htmlFor="min_value"
                    error={form.errors.min_value}
                >
                    <input
                        id="min_value"
                        type="number"
                        step="any"
                        value={form.data.min_value}
                        onChange={(event) =>
                            form.setData('min_value', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Maximum acceptable value"
                    htmlFor="max_value"
                    error={form.errors.max_value}
                >
                    <input
                        id="max_value"
                        type="number"
                        step="any"
                        value={form.data.max_value}
                        onChange={(event) =>
                            form.setData('max_value', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Warning minimum"
                    htmlFor="warning_minimum"
                    error={form.errors.warning_minimum}
                >
                    <input
                        id="warning_minimum"
                        type="number"
                        step="any"
                        value={form.data.warning_minimum}
                        onChange={(event) =>
                            form.setData('warning_minimum', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Warning maximum"
                    htmlFor="warning_maximum"
                    error={form.errors.warning_maximum}
                >
                    <input
                        id="warning_maximum"
                        type="number"
                        step="any"
                        value={form.data.warning_maximum}
                        onChange={(event) =>
                            form.setData('warning_maximum', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <div className="flex items-end pb-1">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold text-slate-700">
                        <input
                            id="is_active"
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(event) =>
                                form.setData('is_active', event.target.checked)
                            }
                            className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                        />
                        Use this threshold for monitoring
                    </label>
                </div>
            </div>
        </ResourceFormShell>
    );
}
