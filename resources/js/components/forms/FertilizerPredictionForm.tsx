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
    PredictionCropOption,
    PredictionFarmOption,
    PredictionReadingOption,
    PredictionSensorOption,
} from '@/components/forms/predictionFormUtils';
import ResourceFormShell, { inputClassName } from '@/components/forms/ResourceFormShell';
import { formatDateTime } from '@/lib/formatters';
import fertilizerPredictionRoutes from '@/routes/fertilizer-predictions';
import type { FertilizerPrediction } from '@/types';

export interface FertilizerPredictionFormOptions {
    farms: PredictionFarmOption[];
    sensorDevices: PredictionSensorOption[];
    sensorReadings: PredictionReadingOption[];
    cropPredictions: PredictionCropOption[];
}

interface FertilizerPredictionFormProps {
    fertilizerPrediction?: FertilizerPrediction;
    formOptions: FertilizerPredictionFormOptions;
    readOnly?: boolean;
}

interface FertilizerPredictionFormData {
    best_crop: string;
    best_fertilizer: string;
    recommendations: string;
    crop_prediction_id: string;
    reading_id: string;
    sensor_id: string;
    farm_id: string;
    application_rate: string;
    application_unit: string;
    confidence_score: string;
    alternative_fertilizers: string;
    model_name: string;
    model_version: string;
    prediction_status: string;
    reviewed_at: string;
}

const valuesFor = (fertilizerPrediction?: FertilizerPrediction): FertilizerPredictionFormData => ({
    best_crop: fertilizerPrediction?.best_crop ?? '',
    best_fertilizer: fertilizerPrediction?.best_fertilizer ?? '',
    recommendations: jsonText(fertilizerPrediction?.recommendations, ''),
    crop_prediction_id: fertilizerPrediction?.crop_prediction_id?.toString() ?? '',
    reading_id: fertilizerPrediction?.reading_id?.toString() ?? '',
    sensor_id: fertilizerPrediction?.sensor_id?.toString() ?? '',
    farm_id: fertilizerPrediction?.farm_id?.toString() ?? '',
    application_rate: fertilizerPrediction?.application_rate?.toString() ?? '',
    application_unit: fertilizerPrediction?.application_unit ?? '',
    confidence_score: fertilizerPrediction?.confidence_score?.toString() ?? '',
    alternative_fertilizers: jsonText(fertilizerPrediction?.alternative_fertilizers, ''),
    model_name: fertilizerPrediction?.model_name ?? '',
    model_version: fertilizerPrediction?.model_version ?? '',
    prediction_status: fertilizerPrediction?.prediction_status ?? 'generated',
    reviewed_at: dateTimeLocalValue(fertilizerPrediction?.reviewed_at),
});

export default function FertilizerPredictionForm({
    fertilizerPrediction,
    formOptions,
    readOnly = false,
}: FertilizerPredictionFormProps) {
    const form = useForm<FertilizerPredictionFormData>(valuesFor(fertilizerPrediction));
    const isEditing = Boolean(fertilizerPrediction);

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        form.clearErrors('recommendations', 'alternative_fertilizers');

        const recommendations = parseJsonArray(form.data.recommendations, 'Recommendations');
        const alternatives = parseJsonArray(form.data.alternative_fertilizers, 'Alternative fertilizers');

        if (recommendations.error || alternatives.error) {
            if (recommendations.error) {
                form.setError('recommendations', recommendations.error);
            }

            if (alternatives.error) {
                form.setError('alternative_fertilizers', alternatives.error);
            }

            return;
        }

        form.transform((data) => ({
            ...data,
            best_crop: nullableValue(data.best_crop),
            best_fertilizer: nullableValue(data.best_fertilizer),
            recommendations: recommendations.value,
            crop_prediction_id: nullableValue(data.crop_prediction_id),
            reading_id: nullableValue(data.reading_id),
            sensor_id: nullableValue(data.sensor_id),
            farm_id: nullableValue(data.farm_id),
            application_rate: nullableValue(data.application_rate),
            application_unit: nullableValue(data.application_unit),
            confidence_score: nullableValue(data.confidence_score),
            alternative_fertilizers: alternatives.value,
            model_name: nullableValue(data.model_name),
            model_version: nullableValue(data.model_version),
            prediction_status: nullableValue(data.prediction_status),
            reviewed_at: nullableValue(data.reviewed_at),
        }));

        if (fertilizerPrediction) {
            form.put(fertilizerPredictionRoutes.update.url(fertilizerPrediction));

            return;
        }

        form.post(fertilizerPredictionRoutes.store.url());
    };

    return (
        <ResourceFormShell
            eyebrow="Nutrient planning"
            title={readOnly ? fertilizerPrediction?.best_fertilizer ?? 'Fertilizer prediction' : isEditing ? 'Edit fertilizer prediction' : 'Create fertilizer prediction'}
            description={readOnly
                ? 'Review the recommended fertilizer, application guidance, and linked evidence.'
                : 'Record nutrient guidance with the source conditions that support it.'}
            backHref={fertilizerPredictionRoutes.index.url()}
            editHref={fertilizerPrediction ? fertilizerPredictionRoutes.edit.url(fertilizerPrediction) : undefined}
            onSubmit={submit}
            isProcessing={form.processing}
            readOnly={readOnly}
            submitLabel={isEditing ? 'Save prediction changes' : 'Create prediction'}
        >
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <h2 className="text-base font-bold text-slate-900">Fertilizer guidance</h2>
                    <p className="mt-1 text-sm text-slate-500">Capture the recommended product and an application rate that can be reviewed by the field team.</p>
                </div>
                <FormField label="Recommended fertilizer" htmlFor="best_fertilizer" error={form.errors.best_fertilizer}>
                    <input id="best_fertilizer" value={form.data.best_fertilizer} onChange={(event) => form.setData('best_fertilizer', event.target.value)} className={inputClassName} placeholder="e.g. Complete fertilizer" />
                </FormField>
                <FormField label="Recommended crop" htmlFor="best_crop" error={form.errors.best_crop}>
                    <input id="best_crop" value={form.data.best_crop} onChange={(event) => form.setData('best_crop', event.target.value)} className={inputClassName} placeholder="Optional crop context" />
                </FormField>
                <FormField label="Application rate" htmlFor="application_rate" error={form.errors.application_rate}>
                    <input id="application_rate" type="number" step="any" value={form.data.application_rate} onChange={(event) => form.setData('application_rate', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Application unit" htmlFor="application_unit" error={form.errors.application_unit}>
                    <input id="application_unit" value={form.data.application_unit} onChange={(event) => form.setData('application_unit', event.target.value)} className={inputClassName} placeholder="e.g. kg/ha" maxLength={30} />
                </FormField>
                <FormField label="Confidence score" htmlFor="confidence_score" error={form.errors.confidence_score}>
                    <input id="confidence_score" type="number" step="any" value={form.data.confidence_score} onChange={(event) => form.setData('confidence_score', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Prediction status" htmlFor="prediction_status" error={form.errors.prediction_status}>
                    <input id="prediction_status" value={form.data.prediction_status} onChange={(event) => form.setData('prediction_status', event.target.value)} className={inputClassName} placeholder="generated" maxLength={20} />
                </FormField>
                <FormField label="Reviewed at" htmlFor="reviewed_at" error={form.errors.reviewed_at}>
                    <input id="reviewed_at" type="datetime-local" value={form.data.reviewed_at} onChange={(event) => form.setData('reviewed_at', event.target.value)} className={inputClassName} />
                </FormField>

                <div className="md:col-span-2 mt-2 border-t border-slate-100 pt-6">
                    <h2 className="text-base font-bold text-slate-900">Linked evidence</h2>
                    <p className="mt-1 text-sm text-slate-500">Link any available crop prediction, farm, device, or reading for a clear decision trail.</p>
                </div>
                <div className="md:col-span-2">
                    <FormField label="Crop prediction" htmlFor="crop_prediction_id" error={form.errors.crop_prediction_id}>
                        <select id="crop_prediction_id" value={form.data.crop_prediction_id} onChange={(event) => form.setData('crop_prediction_id', event.target.value)} className={inputClassName}>
                            <option value="">No crop prediction linked</option>
                            {formOptions.cropPredictions.map((cropPrediction) => (
                                <option key={cropPrediction.id} value={cropPrediction.id}>
                                    #{cropPrediction.id} · {cropPrediction.best_crop}{cropPrediction.farm ? ` · ${cropPrediction.farm.farm_name}` : ''}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>
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

                <div className="md:col-span-2 mt-2 border-t border-slate-100 pt-6">
                    <h2 className="text-base font-bold text-slate-900">Recommendation details</h2>
                    <p className="mt-1 text-sm text-slate-500">Use JSON arrays to keep recommendations compatible with downstream reports.</p>
                </div>
                <div className="md:col-span-2">
                    <FormField label="Recommendations" htmlFor="recommendations" hint="Optional JSON array of application instructions." error={form.errors.recommendations}>
                        <textarea id="recommendations" rows={7} value={form.data.recommendations} onChange={(event) => form.setData('recommendations', event.target.value)} className={`${inputClassName} font-mono text-xs leading-5`} spellCheck={false} />
                    </FormField>
                </div>
                <div className="md:col-span-2">
                    <FormField label="Alternative fertilizers" htmlFor="alternative_fertilizers" hint="Optional JSON array of substitute fertilizers." error={form.errors.alternative_fertilizers}>
                        <textarea id="alternative_fertilizers" rows={4} value={form.data.alternative_fertilizers} onChange={(event) => form.setData('alternative_fertilizers', event.target.value)} className={`${inputClassName} font-mono text-xs leading-5`} spellCheck={false} />
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
