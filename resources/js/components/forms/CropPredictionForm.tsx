import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import FormField from '@/components/forms/FormField';
import {
    dateTimeLocalValue,
    jsonText,
    nullableValue,
    parseJsonArray,
} from '@/components/forms/predictionFormUtils';
import type {
    PredictionFarmOption,
    PredictionReadingOption,
    PredictionSensorOption,
} from '@/components/forms/predictionFormUtils';
import ResourceFormShell, { inputClassName } from '@/components/forms/ResourceFormShell';
import { formatDateTime } from '@/lib/formatters';
import cropPredictionRoutes from '@/routes/crop-predictions';
import type { CropPrediction } from '@/types';

export interface CropPredictionFormOptions {
    farms: PredictionFarmOption[];
    sensorDevices: PredictionSensorOption[];
    sensorReadings: PredictionReadingOption[];
}

interface CropPredictionFormProps {
    cropPrediction?: CropPrediction;
    formOptions: CropPredictionFormOptions;
    readOnly?: boolean;
}

interface CropPredictionFormData {
    soil_moisture: string;
    soil_temperature: string;
    air_temperature: string;
    humidity: string;
    ph: string;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    best_crop: string;
    recommendations: string;
    reading_id: string;
    sensor_id: string;
    farm_id: string;
    confidence_score: string;
    alternative_crops: string;
    model_name: string;
    model_version: string;
    prediction_status: string;
    reviewed_at: string;
}

const valuesFor = (cropPrediction?: CropPrediction): CropPredictionFormData => ({
    soil_moisture: cropPrediction?.soil_moisture?.toString() ?? '',
    soil_temperature: cropPrediction?.soil_temperature?.toString() ?? '',
    air_temperature: cropPrediction?.air_temperature?.toString() ?? '',
    humidity: cropPrediction?.humidity?.toString() ?? '',
    ph: cropPrediction?.ph?.toString() ?? '',
    nitrogen: cropPrediction?.nitrogen?.toString() ?? '',
    phosphorus: cropPrediction?.phosphorus?.toString() ?? '',
    potassium: cropPrediction?.potassium?.toString() ?? '',
    best_crop: cropPrediction?.best_crop ?? '',
    recommendations: jsonText(cropPrediction?.recommendations, '[]'),
    reading_id: cropPrediction?.reading_id?.toString() ?? '',
    sensor_id: cropPrediction?.sensor_id?.toString() ?? '',
    farm_id: cropPrediction?.farm_id?.toString() ?? '',
    confidence_score: cropPrediction?.confidence_score?.toString() ?? '',
    alternative_crops: jsonText(cropPrediction?.alternative_crops, ''),
    model_name: cropPrediction?.model_name ?? '',
    model_version: cropPrediction?.model_version ?? '',
    prediction_status: cropPrediction?.prediction_status ?? 'generated',
    reviewed_at: dateTimeLocalValue(cropPrediction?.reviewed_at),
});

export default function CropPredictionForm({
    cropPrediction,
    formOptions,
    readOnly = false,
}: CropPredictionFormProps) {
    const form = useForm<CropPredictionFormData>(valuesFor(cropPrediction));
    const isEditing = Boolean(cropPrediction);

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.clearErrors('recommendations', 'alternative_crops');

        const recommendations = parseJsonArray(form.data.recommendations, 'Recommendations', true);
        const alternatives = parseJsonArray(form.data.alternative_crops, 'Alternative crops');

        if (recommendations.error || alternatives.error) {
            if (recommendations.error) {
                form.setError('recommendations', recommendations.error);
            }

            if (alternatives.error) {
                form.setError('alternative_crops', alternatives.error);
            }

            return;
        }

        form.transform((data) => ({
            ...data,
            soil_moisture: nullableValue(data.soil_moisture),
            soil_temperature: nullableValue(data.soil_temperature),
            air_temperature: nullableValue(data.air_temperature),
            humidity: nullableValue(data.humidity),
            ph: nullableValue(data.ph),
            nitrogen: nullableValue(data.nitrogen),
            phosphorus: nullableValue(data.phosphorus),
            potassium: nullableValue(data.potassium),
            recommendations: recommendations.value,
            reading_id: nullableValue(data.reading_id),
            sensor_id: nullableValue(data.sensor_id),
            farm_id: nullableValue(data.farm_id),
            confidence_score: nullableValue(data.confidence_score),
            alternative_crops: alternatives.value,
            model_name: nullableValue(data.model_name),
            model_version: nullableValue(data.model_version),
            prediction_status: nullableValue(data.prediction_status),
            reviewed_at: nullableValue(data.reviewed_at),
        }));

        if (cropPrediction) {
            form.put(cropPredictionRoutes.update.url(cropPrediction));

            return;
        }

        form.post(cropPredictionRoutes.store.url());
    };

    return (
        <ResourceFormShell
            eyebrow="Crop intelligence"
            title={readOnly ? `${cropPrediction?.best_crop ?? 'Crop'} prediction` : isEditing ? 'Edit crop prediction' : 'Create crop prediction'}
            description={readOnly
                ? 'Review the soil inputs, selected source, and generated crop guidance.'
                : 'Record the soil inputs and recommendation used to guide the field plan.'}
            backHref={cropPredictionRoutes.index.url()}
            editHref={cropPrediction ? cropPredictionRoutes.edit.url(cropPrediction) : undefined}
            onSubmit={submit}
            isProcessing={form.processing}
            readOnly={readOnly}
            submitLabel={isEditing ? 'Save prediction changes' : 'Create prediction'}
        >
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">Recommendation</h2>
                    <p className="mt-1 text-sm text-slate-500">Keep the recommendation traceable to the farm, device, and reading that informed it.</p>
                </div>
                <FormField label="Recommended crop" htmlFor="best_crop" required error={form.errors.best_crop}>
                    <input id="best_crop" value={form.data.best_crop} onChange={(event) => form.setData('best_crop', event.target.value)} className={inputClassName} placeholder="e.g. Rice" />
                </FormField>
                <FormField label="Prediction status" htmlFor="prediction_status" hint="Leave as generated until an agronomist reviews it." error={form.errors.prediction_status}>
                    <input id="prediction_status" value={form.data.prediction_status} onChange={(event) => form.setData('prediction_status', event.target.value)} className={inputClassName} placeholder="generated" maxLength={20} />
                </FormField>
                <FormField label="Farm" htmlFor="farm_id" error={form.errors.farm_id}>
                    <select id="farm_id" value={form.data.farm_id} onChange={(event) => form.setData('farm_id', event.target.value)} className={inputClassName}>
                        <option value="">No farm linked</option>
                        {formOptions.farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farm_name}</option>)}
                    </select>
                </FormField>
                <FormField label="Sensor device" htmlFor="sensor_id" error={form.errors.sensor_id}>
                    <select id="sensor_id" value={form.data.sensor_id} onChange={(event) => form.setData('sensor_id', event.target.value)} className={inputClassName}>
                        <option value="">No sensor linked</option>
                        {formOptions.sensorDevices.map((sensor) => (
                            <option key={sensor.id} value={sensor.id}>
                                {sensor.sensor_code}{sensor.device_name ? ` · ${sensor.device_name}` : ''}{sensor.farm ? ` · ${sensor.farm.farm_name}` : ''}
                            </option>
                        ))}
                    </select>
                </FormField>
                <div className="md:col-span-2">
                    <FormField label="Source reading" htmlFor="reading_id" hint="The 100 most recent readings are available for selection." error={form.errors.reading_id}>
                        <select id="reading_id" value={form.data.reading_id} onChange={(event) => form.setData('reading_id', event.target.value)} className={inputClassName}>
                            <option value="">No reading linked</option>
                            {formOptions.sensorReadings.map((reading) => (
                                <option key={reading.id} value={reading.id}>
                                    #{reading.id}{reading.sensor_device ? ` · ${reading.sensor_device.sensor_code}` : ''} · {formatDateTime(reading.recorded_at)}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>
                <FormField label="Confidence score" htmlFor="confidence_score" error={form.errors.confidence_score}>
                    <input id="confidence_score" type="number" step="any" value={form.data.confidence_score} onChange={(event) => form.setData('confidence_score', event.target.value)} className={inputClassName} placeholder="Optional" />
                </FormField>
                <FormField label="Reviewed at" htmlFor="reviewed_at" error={form.errors.reviewed_at}>
                    <input id="reviewed_at" type="datetime-local" value={form.data.reviewed_at} onChange={(event) => form.setData('reviewed_at', event.target.value)} className={inputClassName} />
                </FormField>

                <div className="md:col-span-2 mt-2 border-t border-slate-100 pt-6">
                    <h2 className="text-base font-bold text-slate-900">Soil measurements</h2>
                    <p className="mt-1 text-sm text-slate-500">These optional values capture the conditions used when the recommendation was generated.</p>
                </div>
                <FormField label="Soil moisture" htmlFor="soil_moisture" error={form.errors.soil_moisture}>
                    <input id="soil_moisture" type="number" step="any" value={form.data.soil_moisture} onChange={(event) => form.setData('soil_moisture', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Soil temperature" htmlFor="soil_temperature" error={form.errors.soil_temperature}>
                    <input id="soil_temperature" type="number" step="any" value={form.data.soil_temperature} onChange={(event) => form.setData('soil_temperature', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Air temperature" htmlFor="air_temperature" error={form.errors.air_temperature}>
                    <input id="air_temperature" type="number" step="any" value={form.data.air_temperature} onChange={(event) => form.setData('air_temperature', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Humidity" htmlFor="humidity" error={form.errors.humidity}>
                    <input id="humidity" type="number" step="any" value={form.data.humidity} onChange={(event) => form.setData('humidity', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Soil pH" htmlFor="ph" error={form.errors.ph}>
                    <input id="ph" type="number" step="any" value={form.data.ph} onChange={(event) => form.setData('ph', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Nitrogen" htmlFor="nitrogen" error={form.errors.nitrogen}>
                    <input id="nitrogen" type="number" min="0" step="1" value={form.data.nitrogen} onChange={(event) => form.setData('nitrogen', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Phosphorus" htmlFor="phosphorus" error={form.errors.phosphorus}>
                    <input id="phosphorus" type="number" min="0" step="1" value={form.data.phosphorus} onChange={(event) => form.setData('phosphorus', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Potassium" htmlFor="potassium" error={form.errors.potassium}>
                    <input id="potassium" type="number" min="0" step="1" value={form.data.potassium} onChange={(event) => form.setData('potassium', event.target.value)} className={inputClassName} />
                </FormField>

                <div className="md:col-span-2 mt-2 border-t border-slate-100 pt-6">
                    <h2 className="text-base font-bold text-slate-900">Recommendation details</h2>
                    <p className="mt-1 text-sm text-slate-500">Enter JSON arrays so the structured guidance remains ready for reporting and automation.</p>
                </div>
                <div className="md:col-span-2">
                    <FormField label="Recommendations" htmlFor="recommendations" required hint={'Use a JSON array, for example ["Maintain soil moisture"].'} error={form.errors.recommendations}>
                        <textarea id="recommendations" rows={7} value={form.data.recommendations} onChange={(event) => form.setData('recommendations', event.target.value)} className={`${inputClassName} font-mono text-xs leading-5`} spellCheck={false} />
                    </FormField>
                </div>
                <div className="md:col-span-2">
                    <FormField label="Alternative crops" htmlFor="alternative_crops" hint="Optional JSON array of crop alternatives." error={form.errors.alternative_crops}>
                        <textarea id="alternative_crops" rows={4} value={form.data.alternative_crops} onChange={(event) => form.setData('alternative_crops', event.target.value)} className={`${inputClassName} font-mono text-xs leading-5`} spellCheck={false} />
                    </FormField>
                </div>
                <FormField label="Model name" htmlFor="model_name" error={form.errors.model_name}>
                    <input id="model_name" value={form.data.model_name} onChange={(event) => form.setData('model_name', event.target.value)} className={inputClassName} maxLength={100} />
                </FormField>
                <FormField label="Model version" htmlFor="model_version" error={form.errors.model_version}>
                    <input id="model_version" value={form.data.model_version} onChange={(event) => form.setData('model_version', event.target.value)} className={inputClassName} maxLength={50} />
                </FormField>
            </div>
        </ResourceFormShell>
    );
}
