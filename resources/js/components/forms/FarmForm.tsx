import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import FormField from '@/components/forms/FormField';
import ResourceFormShell, { inputClassName } from '@/components/forms/ResourceFormShell';
import farmRoutes from '@/routes/farms';
import type { Farm } from '@/types';

interface FarmFormProps {
    farm?: Farm;
    readOnly?: boolean;
}

interface FarmFormData {
    farmer_id: string;
    farm_name: string;
    description: string;
    address: string;
    barangay: string;
    municipality: string;
    province: string;
    latitude: string;
    longitude: string;
    farm_size: string;
    farm_size_unit: string;
    soil_type: string;
    current_crop: string;
    irrigation_type: string;
    status: string;
}

const valuesFor = (farm?: Farm): FarmFormData => ({
    farmer_id: farm?.farmer_id ?? '',
    farm_name: farm?.farm_name ?? '',
    description: farm?.description ?? '',
    address: farm?.address ?? '',
    barangay: farm?.barangay ?? '',
    municipality: farm?.municipality ?? '',
    province: farm?.province ?? '',
    latitude: farm?.latitude?.toString() ?? '',
    longitude: farm?.longitude?.toString() ?? '',
    farm_size: farm?.farm_size?.toString() ?? '',
    farm_size_unit: farm?.farm_size_unit ?? 'hectare',
    soil_type: farm?.soil_type ?? '',
    current_crop: farm?.current_crop ?? '',
    irrigation_type: farm?.irrigation_type ?? '',
    status: farm?.status ?? 'active',
});

export default function FarmForm({ farm, readOnly = false }: FarmFormProps) {
    const form = useForm<FarmFormData>(valuesFor(farm));
    const isEditing = Boolean(farm);

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (farm) {
            form.put(farmRoutes.update.url(farm));

            return;
        }

        form.post(farmRoutes.store.url());
    };

    return (
        <ResourceFormShell
            eyebrow="Farm portfolio"
            title={readOnly ? farm?.farm_name ?? 'Farm record' : isEditing ? 'Edit farm' : 'Register a farm'}
            description={readOnly
                ? 'Review the registered field profile and its operational location details.'
                : 'Keep the field profile accurate so devices, readings, and recommendations remain connected.'}
            backHref={farmRoutes.index.url()}
            editHref={farm ? farmRoutes.edit.url(farm) : undefined}
            onSubmit={submit}
            isProcessing={form.processing}
            readOnly={readOnly}
            submitLabel={isEditing ? 'Save farm changes' : 'Register farm'}
        >
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">Field profile</h2>
                    <p className="mt-1 text-sm text-slate-500">Basic ownership, crop, and field information.</p>
                </div>
                <FormField label="Farm name" htmlFor="farm_name" required error={form.errors.farm_name}>
                    <input id="farm_name" value={form.data.farm_name} onChange={(event) => form.setData('farm_name', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Status" htmlFor="status" required error={form.errors.status}>
                    <select id="status" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)} className={inputClassName}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                    </select>
                </FormField>
                <FormField label="Current crop" htmlFor="current_crop" error={form.errors.current_crop}>
                    <input id="current_crop" value={form.data.current_crop} onChange={(event) => form.setData('current_crop', event.target.value)} className={inputClassName} placeholder="e.g. Rice" />
                </FormField>
                <FormField label="Soil type" htmlFor="soil_type" error={form.errors.soil_type}>
                    <input id="soil_type" value={form.data.soil_type} onChange={(event) => form.setData('soil_type', event.target.value)} className={inputClassName} placeholder="e.g. Loam" />
                </FormField>
                <FormField label="Field size" htmlFor="farm_size" error={form.errors.farm_size}>
                    <input id="farm_size" type="number" min="0" step="0.01" value={form.data.farm_size} onChange={(event) => form.setData('farm_size', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Size unit" htmlFor="farm_size_unit" error={form.errors.farm_size_unit}>
                    <select id="farm_size_unit" value={form.data.farm_size_unit} onChange={(event) => form.setData('farm_size_unit', event.target.value)} className={inputClassName}>
                        <option value="hectare">Hectare</option>
                        <option value="acre">Acre</option>
                        <option value="square_meter">Square meter</option>
                    </select>
                </FormField>
                <FormField label="Irrigation type" htmlFor="irrigation_type" error={form.errors.irrigation_type}>
                    <input id="irrigation_type" value={form.data.irrigation_type} onChange={(event) => form.setData('irrigation_type', event.target.value)} className={inputClassName} placeholder="e.g. Drip irrigation" />
                </FormField>
                <FormField label="External farmer UUID" htmlFor="farmer_id" hint="Optional external Supabase identity reference." error={form.errors.farmer_id}>
                    <input id="farmer_id" value={form.data.farmer_id} onChange={(event) => form.setData('farmer_id', event.target.value)} className={inputClassName} />
                </FormField>
                <div className="md:col-span-2">
                    <FormField label="Description" htmlFor="description" error={form.errors.description}>
                        <textarea id="description" rows={3} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} className={inputClassName} />
                    </FormField>
                </div>

                <div className="md:col-span-2 mt-2 border-t border-slate-100 pt-6">
                    <h2 className="text-base font-bold text-slate-900">Location</h2>
                    <p className="mt-1 text-sm text-slate-500">Coordinates are required for mapping and field-level monitoring.</p>
                </div>
                <div className="md:col-span-2">
                    <FormField label="Address" htmlFor="address" error={form.errors.address}>
                        <input id="address" value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} className={inputClassName} />
                    </FormField>
                </div>
                <FormField label="Barangay" htmlFor="barangay" error={form.errors.barangay}>
                    <input id="barangay" value={form.data.barangay} onChange={(event) => form.setData('barangay', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Municipality" htmlFor="municipality" error={form.errors.municipality}>
                    <input id="municipality" value={form.data.municipality} onChange={(event) => form.setData('municipality', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Province" htmlFor="province" error={form.errors.province}>
                    <input id="province" value={form.data.province} onChange={(event) => form.setData('province', event.target.value)} className={inputClassName} />
                </FormField>
                <div className="hidden md:block" />
                <FormField label="Latitude" htmlFor="latitude" required error={form.errors.latitude}>
                    <input id="latitude" type="number" min="-90" max="90" step="any" value={form.data.latitude} onChange={(event) => form.setData('latitude', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Longitude" htmlFor="longitude" required error={form.errors.longitude}>
                    <input id="longitude" type="number" min="-180" max="180" step="any" value={form.data.longitude} onChange={(event) => form.setData('longitude', event.target.value)} className={inputClassName} />
                </FormField>
            </div>
        </ResourceFormShell>
    );
}
