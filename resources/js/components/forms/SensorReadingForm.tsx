import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import FormField from '@/components/forms/FormField';
import ResourceFormShell, {
    inputClassName,
} from '@/components/forms/ResourceFormShell';
import sensorReadingRoutes from '@/routes/sensor-readings';
import type { Farm, SensorDevice, SensorReading } from '@/types';

type SensorOption = Pick<
    SensorDevice,
    'id' | 'sensor_code' | 'device_name' | 'status'
> & {
    farm?: Pick<Farm, 'id' | 'farm_name' | 'municipality' | 'province'> | null;
};

interface SensorReadingFormProps {
    sensorReading?: SensorReading;
    sensors: SensorOption[];
    readOnly?: boolean;
}

interface SensorReadingFormData {
    sensor_id: string;
    soil_moisture: string;
    soil_temperature: string;
    air_temperature: string;
    humidity: string;
    ph: string;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    reading_status: string;
    data_source: string;
    is_valid: boolean;
    validation_notes: string;
    recorded_at: string;
}

const pad = (number: number): string => number.toString().padStart(2, '0');

const currentLocalDateTime = (): string => {
    const now = new Date();

    return [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())]
        .join('-')
        .concat(`T${pad(now.getHours())}:${pad(now.getMinutes())}`);
};

const asDateTimeLocal = (value: string | null | undefined): string => {
    if (!value) {
        return currentLocalDateTime();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value.slice(0, 16);
    }

    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())]
        .join('-')
        .concat(`T${pad(date.getHours())}:${pad(date.getMinutes())}`);
};

const valuesFor = (sensorReading?: SensorReading): SensorReadingFormData => ({
    sensor_id: sensorReading?.sensor_id?.toString() ?? '',
    soil_moisture: sensorReading?.soil_moisture?.toString() ?? '',
    soil_temperature: sensorReading?.soil_temperature?.toString() ?? '',
    air_temperature: sensorReading?.air_temperature?.toString() ?? '',
    humidity: sensorReading?.humidity?.toString() ?? '',
    ph: sensorReading?.ph?.toString() ?? '',
    nitrogen: sensorReading?.nitrogen?.toString() ?? '',
    phosphorus: sensorReading?.phosphorus?.toString() ?? '',
    potassium: sensorReading?.potassium?.toString() ?? '',
    reading_status: sensorReading?.reading_status ?? 'normal',
    data_source: sensorReading?.data_source ?? 'sensor',
    is_valid: sensorReading?.is_valid ?? true,
    validation_notes: sensorReading?.validation_notes ?? '',
    recorded_at: asDateTimeLocal(sensorReading?.recorded_at),
});

export default function SensorReadingForm({
    sensorReading,
    sensors,
    readOnly = false,
}: SensorReadingFormProps) {
    const form = useForm<SensorReadingFormData>(valuesFor(sensorReading));
    const isEditing = Boolean(sensorReading);

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (sensorReading) {
            form.put(sensorReadingRoutes.update.url(sensorReading));

            return;
        }

        form.post(sensorReadingRoutes.store.url());
    };

    return (
        <ResourceFormShell
            eyebrow="Reading log"
            title={
                readOnly
                    ? 'Sensor reading'
                    : isEditing
                      ? 'Edit sensor reading'
                      : 'Record sensor reading'
            }
            description={
                readOnly
                    ? 'Review the captured soil and environmental measurements with their validation state.'
                    : 'Enter a complete field observation so downstream monitoring and recommendations have reliable inputs.'
            }
            backHref={sensorReadingRoutes.index.url()}
            editHref={
                sensorReading
                    ? sensorReadingRoutes.edit.url(sensorReading)
                    : undefined
            }
            onSubmit={submit}
            isProcessing={form.processing}
            readOnly={readOnly}
            submitLabel={isEditing ? 'Save reading changes' : 'Record reading'}
        >
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Capture details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        A reading can be entered manually when no device is
                        available, or linked to a registered sensor.
                    </p>
                </div>

                <FormField
                    label="Sensor device"
                    htmlFor="sensor_id"
                    hint="Optional for a manual field observation."
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
                        <option value="">Manual / no device selected</option>
                        {sensors.map((sensor) => (
                            <option key={sensor.id} value={sensor.id}>
                                {sensor.sensor_code}
                                {sensor.device_name
                                    ? ` — ${sensor.device_name}`
                                    : ''}
                                {sensor.farm?.farm_name
                                    ? ` (${sensor.farm.farm_name})`
                                    : ''}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField
                    label="Recorded at"
                    htmlFor="recorded_at"
                    required
                    error={form.errors.recorded_at}
                >
                    <input
                        id="recorded_at"
                        type="datetime-local"
                        value={form.data.recorded_at}
                        onChange={(event) =>
                            form.setData('recorded_at', event.target.value)
                        }
                        className={inputClassName}
                        required
                    />
                </FormField>

                <FormField
                    label="Reading status"
                    htmlFor="reading_status"
                    required
                    error={form.errors.reading_status}
                >
                    <select
                        id="reading_status"
                        value={form.data.reading_status}
                        onChange={(event) =>
                            form.setData('reading_status', event.target.value)
                        }
                        className={inputClassName}
                        required
                    >
                        <option value="normal">Normal</option>
                        <option value="warning">Warning</option>
                        <option value="critical">Critical</option>
                        <option value="review">Needs review</option>
                    </select>
                </FormField>

                <FormField
                    label="Data source"
                    htmlFor="data_source"
                    required
                    error={form.errors.data_source}
                >
                    <select
                        id="data_source"
                        value={form.data.data_source}
                        onChange={(event) =>
                            form.setData('data_source', event.target.value)
                        }
                        className={inputClassName}
                        required
                    >
                        <option value="sensor">Sensor</option>
                        <option value="manual">Manual entry</option>
                        <option value="import">Imported data</option>
                        <option value="api">External API</option>
                    </select>
                </FormField>

                <div className="flex items-end pb-1">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold text-slate-700">
                        <input
                            id="is_valid"
                            type="checkbox"
                            checked={form.data.is_valid}
                            onChange={(event) =>
                                form.setData('is_valid', event.target.checked)
                            }
                            className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                        />
                        Measurement is validated
                    </label>
                </div>

                <div className="mt-2 border-t border-slate-100 pt-6 md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Soil and environmental readings
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Leave a measure blank when it was not collected. Numeric
                        limits help prevent accidental values.
                    </p>
                </div>

                <FormField
                    label="Soil moisture (%)"
                    htmlFor="soil_moisture"
                    error={form.errors.soil_moisture}
                >
                    <input
                        id="soil_moisture"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form.data.soil_moisture}
                        onChange={(event) =>
                            form.setData('soil_moisture', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Soil temperature (°C)"
                    htmlFor="soil_temperature"
                    error={form.errors.soil_temperature}
                >
                    <input
                        id="soil_temperature"
                        type="number"
                        min="-100"
                        max="100"
                        step="0.1"
                        value={form.data.soil_temperature}
                        onChange={(event) =>
                            form.setData('soil_temperature', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Air temperature (°C)"
                    htmlFor="air_temperature"
                    error={form.errors.air_temperature}
                >
                    <input
                        id="air_temperature"
                        type="number"
                        min="-100"
                        max="100"
                        step="0.1"
                        value={form.data.air_temperature}
                        onChange={(event) =>
                            form.setData('air_temperature', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Humidity (%)"
                    htmlFor="humidity"
                    error={form.errors.humidity}
                >
                    <input
                        id="humidity"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form.data.humidity}
                        onChange={(event) =>
                            form.setData('humidity', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField label="Soil pH" htmlFor="ph" error={form.errors.ph}>
                    <input
                        id="ph"
                        type="number"
                        min="0"
                        max="14"
                        step="0.1"
                        value={form.data.ph}
                        onChange={(event) =>
                            form.setData('ph', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <div className="hidden md:block" />

                <FormField
                    label="Nitrogen (N)"
                    htmlFor="nitrogen"
                    error={form.errors.nitrogen}
                >
                    <input
                        id="nitrogen"
                        type="number"
                        min="0"
                        step="1"
                        value={form.data.nitrogen}
                        onChange={(event) =>
                            form.setData('nitrogen', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Phosphorus (P)"
                    htmlFor="phosphorus"
                    error={form.errors.phosphorus}
                >
                    <input
                        id="phosphorus"
                        type="number"
                        min="0"
                        step="1"
                        value={form.data.phosphorus}
                        onChange={(event) =>
                            form.setData('phosphorus', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Potassium (K)"
                    htmlFor="potassium"
                    error={form.errors.potassium}
                >
                    <input
                        id="potassium"
                        type="number"
                        min="0"
                        step="1"
                        value={form.data.potassium}
                        onChange={(event) =>
                            form.setData('potassium', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <div className="hidden md:block" />

                <div className="md:col-span-2">
                    <FormField
                        label="Validation notes"
                        htmlFor="validation_notes"
                        hint="Explain any corrected values, field conditions, or quality concerns."
                        error={form.errors.validation_notes}
                    >
                        <textarea
                            id="validation_notes"
                            rows={4}
                            value={form.data.validation_notes}
                            onChange={(event) =>
                                form.setData(
                                    'validation_notes',
                                    event.target.value,
                                )
                            }
                            className={inputClassName}
                            maxLength={5000}
                        />
                    </FormField>
                </div>
            </div>
        </ResourceFormShell>
    );
}
