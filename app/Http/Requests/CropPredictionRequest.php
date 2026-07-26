<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CropPredictionRequest extends FormRequest
{
    /**
     * Determine whether the current user can submit this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'soil_moisture' => ['nullable', 'numeric'],
            'soil_temperature' => ['nullable', 'numeric'],
            'air_temperature' => ['nullable', 'numeric'],
            'humidity' => ['nullable', 'numeric'],
            'ph' => ['nullable', 'numeric'],
            'nitrogen' => ['nullable', 'integer', 'min:0'],
            'phosphorus' => ['nullable', 'integer', 'min:0'],
            'potassium' => ['nullable', 'integer', 'min:0'],
            'best_crop' => ['required', 'string'],
            'recommendations' => ['required', 'array'],
            'reading_id' => ['nullable', 'integer', Rule::exists('sensor_readings', 'id')],
            'sensor_id' => ['nullable', 'integer', Rule::exists('sensor_devices', 'id')],
            'farm_id' => ['nullable', 'integer', Rule::exists('farms', 'id')],
            'confidence_score' => ['nullable', 'numeric'],
            'alternative_crops' => ['nullable', 'array'],
            'model_name' => ['nullable', 'string', 'max:100'],
            'model_version' => ['nullable', 'string', 'max:50'],
            'prediction_status' => ['sometimes', 'nullable', 'string', 'max:20'],
            'reviewed_at' => ['nullable', 'date'],
        ];
    }

    /**
     * Convert optional blank form controls to null before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge($this->nullableInputs([
            'soil_moisture',
            'soil_temperature',
            'air_temperature',
            'humidity',
            'ph',
            'nitrogen',
            'phosphorus',
            'potassium',
            'reading_id',
            'sensor_id',
            'farm_id',
            'confidence_score',
            'alternative_crops',
            'model_name',
            'model_version',
            'prediction_status',
            'reviewed_at',
        ]));
    }

    /**
     * @param  list<string>  $fields
     * @return array<string, null>
     */
    private function nullableInputs(array $fields): array
    {
        $values = [];

        foreach ($fields as $field) {
            if ($this->has($field) && $this->input($field) === '') {
                $values[$field] = null;
            }
        }

        return $values;
    }
}
