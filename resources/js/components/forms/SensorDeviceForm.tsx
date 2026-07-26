import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import FormField from '@/components/forms/FormField';
import ResourceFormShell, {
    inputClassName,
} from '@/components/forms/ResourceFormShell';
import sensorRoutes from '@/routes/sensors';
import type { Farm, SensorDevice } from '@/types';

type FarmOption = Pick<Farm, 'id' | 'farm_name' | 'municipality' | 'province'>;

interface SensorDeviceFormProps {
    sensor?: SensorDevice;
    farms: FarmOption[];
    readOnly?: boolean;
}

interface SensorDeviceFormData {
    farm_id: string;
    sensor_code: string;
    device_name: string;
    device_model: string;
    serial_number: string;
    latitude: string;
    longitude: string;
    battery_level: string;
    signal_strength: string;
    firmware_version: string;
    connection_type: string;
    status: string;
    installation_status: string;
    is_active: boolean;
    installed_at: string;
    last_seen_at: string;
}

const asDateTimeLocal = (value: string | null | undefined): string => {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value.slice(0, 16);
    }

    const pad = (number: number) => number.toString().padStart(2, '0');

    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())]
        .join('-')
        .concat(`T${pad(date.getHours())}:${pad(date.getMinutes())}`);
};

const valuesFor = (sensor?: SensorDevice): SensorDeviceFormData => ({
    farm_id: sensor?.farm_id?.toString() ?? '',
    sensor_code: sensor?.sensor_code ?? '',
    device_name: sensor?.device_name ?? '',
    device_model: sensor?.device_model ?? '',
    serial_number: sensor?.serial_number ?? '',
    latitude: sensor?.latitude?.toString() ?? '',
    longitude: sensor?.longitude?.toString() ?? '',
    battery_level: sensor?.battery_level?.toString() ?? '100',
    signal_strength: sensor?.signal_strength?.toString() ?? '',
    firmware_version: sensor?.firmware_version ?? '',
    connection_type: sensor?.connection_type ?? 'wifi',
    status: sensor?.status ?? 'offline',
    installation_status: sensor?.installation_status ?? 'deployed',
    is_active: sensor?.is_active ?? true,
    installed_at: asDateTimeLocal(sensor?.installed_at),
    last_seen_at: asDateTimeLocal(sensor?.last_seen_at),
});

export default function SensorDeviceForm({
    sensor,
    farms,
    readOnly = false,
}: SensorDeviceFormProps) {
    const form = useForm<SensorDeviceFormData>(valuesFor(sensor));
    const isEditing = Boolean(sensor);

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (sensor) {
            form.put(sensorRoutes.update.url(sensor));

            return;
        }

        form.post(sensorRoutes.store.url());
    };

    return (
        <ResourceFormShell
            eyebrow="Device registry"
            title={
                readOnly
                    ? sensor?.device_name ||
                      sensor?.sensor_code ||
                      'Sensor record'
                    : isEditing
                      ? 'Edit sensor device'
                      : 'Register sensor device'
            }
            description={
                readOnly
                    ? 'Review the device identity, connection state, and installed field location.'
                    : 'Connect the device to a field and keep its installation information reliable for field monitoring.'
            }
            backHref={sensorRoutes.index.url()}
            editHref={sensor ? sensorRoutes.edit.url(sensor) : undefined}
            onSubmit={submit}
            isProcessing={form.processing}
            readOnly={readOnly}
            submitLabel={isEditing ? 'Save sensor changes' : 'Register sensor'}
        >
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Device identity
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Use a unique device code so readings and alerts always
                        resolve to the correct field unit.
                    </p>
                </div>

                <FormField
                    label="Assigned farm"
                    htmlFor="farm_id"
                    required
                    error={form.errors.farm_id}
                >
                    <select
                        id="farm_id"
                        value={form.data.farm_id}
                        onChange={(event) =>
                            form.setData('farm_id', event.target.value)
                        }
                        className={inputClassName}
                        required
                    >
                        <option value="">Select a farm</option>
                        {farms.map((farm) => (
                            <option key={farm.id} value={farm.id}>
                                {farm.farm_name}
                                {farm.municipality
                                    ? ` — ${farm.municipality}`
                                    : ''}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField
                    label="Sensor code"
                    htmlFor="sensor_code"
                    required
                    hint="This must be unique across all registered devices."
                    error={form.errors.sensor_code}
                >
                    <input
                        id="sensor_code"
                        value={form.data.sensor_code}
                        onChange={(event) =>
                            form.setData('sensor_code', event.target.value)
                        }
                        className={inputClassName}
                        maxLength={100}
                        required
                    />
                </FormField>

                <FormField
                    label="Device name"
                    htmlFor="device_name"
                    required
                    error={form.errors.device_name}
                >
                    <input
                        id="device_name"
                        value={form.data.device_name}
                        onChange={(event) =>
                            form.setData('device_name', event.target.value)
                        }
                        className={inputClassName}
                        maxLength={150}
                        placeholder="e.g. North field probe"
                        required
                    />
                </FormField>

                <FormField
                    label="Device model"
                    htmlFor="device_model"
                    error={form.errors.device_model}
                >
                    <input
                        id="device_model"
                        value={form.data.device_model}
                        onChange={(event) =>
                            form.setData('device_model', event.target.value)
                        }
                        className={inputClassName}
                        maxLength={100}
                        placeholder="e.g. SoilSense S2"
                    />
                </FormField>

                <FormField
                    label="Serial number"
                    htmlFor="serial_number"
                    error={form.errors.serial_number}
                >
                    <input
                        id="serial_number"
                        value={form.data.serial_number}
                        onChange={(event) =>
                            form.setData('serial_number', event.target.value)
                        }
                        className={inputClassName}
                        maxLength={150}
                    />
                </FormField>

                <FormField
                    label="Firmware version"
                    htmlFor="firmware_version"
                    error={form.errors.firmware_version}
                >
                    <input
                        id="firmware_version"
                        value={form.data.firmware_version}
                        onChange={(event) =>
                            form.setData('firmware_version', event.target.value)
                        }
                        className={inputClassName}
                        maxLength={50}
                        placeholder="e.g. 2.4.1"
                    />
                </FormField>

                <div className="mt-2 border-t border-slate-100 pt-6 md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Installation and connection
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Record the installation state and last known connection
                        details for the operations team.
                    </p>
                </div>

                <FormField
                    label="Operational status"
                    htmlFor="status"
                    required
                    error={form.errors.status}
                >
                    <select
                        id="status"
                        value={form.data.status}
                        onChange={(event) =>
                            form.setData('status', event.target.value)
                        }
                        className={inputClassName}
                        required
                    >
                        <option value="offline">Offline</option>
                        <option value="online">Online</option>
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </FormField>

                <FormField
                    label="Installation status"
                    htmlFor="installation_status"
                    required
                    error={form.errors.installation_status}
                >
                    <select
                        id="installation_status"
                        value={form.data.installation_status}
                        onChange={(event) =>
                            form.setData(
                                'installation_status',
                                event.target.value,
                            )
                        }
                        className={inputClassName}
                        required
                    >
                        <option value="deployed">Deployed</option>
                        <option value="installed">Installed</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="pending">Pending</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="retired">Retired</option>
                    </select>
                </FormField>

                <FormField
                    label="Connection type"
                    htmlFor="connection_type"
                    error={form.errors.connection_type}
                >
                    <select
                        id="connection_type"
                        value={form.data.connection_type}
                        onChange={(event) =>
                            form.setData('connection_type', event.target.value)
                        }
                        className={inputClassName}
                    >
                        <option value="">Not recorded</option>
                        <option value="wifi">Wi-Fi</option>
                        <option value="cellular">Cellular</option>
                        <option value="lora">LoRa</option>
                        <option value="bluetooth">Bluetooth</option>
                        <option value="other">Other</option>
                    </select>
                </FormField>

                <FormField
                    label="Installed at"
                    htmlFor="installed_at"
                    error={form.errors.installed_at}
                >
                    <input
                        id="installed_at"
                        type="datetime-local"
                        value={form.data.installed_at}
                        onChange={(event) =>
                            form.setData('installed_at', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Last seen at"
                    htmlFor="last_seen_at"
                    error={form.errors.last_seen_at}
                >
                    <input
                        id="last_seen_at"
                        type="datetime-local"
                        value={form.data.last_seen_at}
                        onChange={(event) =>
                            form.setData('last_seen_at', event.target.value)
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
                        Include in active monitoring
                    </label>
                </div>

                <div className="mt-2 border-t border-slate-100 pt-6 md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Position and telemetry
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Coordinates are optional but improve map placement and
                        field-level troubleshooting.
                    </p>
                </div>

                <FormField
                    label="Latitude"
                    htmlFor="latitude"
                    error={form.errors.latitude}
                >
                    <input
                        id="latitude"
                        type="number"
                        min="-90"
                        max="90"
                        step="any"
                        value={form.data.latitude}
                        onChange={(event) =>
                            form.setData('latitude', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Longitude"
                    htmlFor="longitude"
                    error={form.errors.longitude}
                >
                    <input
                        id="longitude"
                        type="number"
                        min="-180"
                        max="180"
                        step="any"
                        value={form.data.longitude}
                        onChange={(event) =>
                            form.setData('longitude', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Battery level (%)"
                    htmlFor="battery_level"
                    error={form.errors.battery_level}
                >
                    <input
                        id="battery_level"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form.data.battery_level}
                        onChange={(event) =>
                            form.setData('battery_level', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>

                <FormField
                    label="Signal strength"
                    htmlFor="signal_strength"
                    hint="Use the raw device value, typically RSSI in dBm."
                    error={form.errors.signal_strength}
                >
                    <input
                        id="signal_strength"
                        type="number"
                        min="-200"
                        max="200"
                        step="1"
                        value={form.data.signal_strength}
                        onChange={(event) =>
                            form.setData('signal_strength', event.target.value)
                        }
                        className={inputClassName}
                    />
                </FormField>
            </div>
        </ResourceFormShell>
    );
}
