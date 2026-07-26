<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FertilizerPredictionRequest extends FormRequest
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
            'best_crop' => ['nullable', 'string'],
            'best_fertilizer' => ['nullable', 'string'],
            'recommendations' => ['nullable', 'array'],
            'crop_prediction_id' => ['nullable', 'integer', Rule::exists('crop_predictions', 'id')],
            'reading_id' => ['nullable', 'integer', Rule::exists('sensor_readings', 'id')],
            'sensor_id' => ['nullable', 'integer', Rule::exists('sensor_devices', 'id')],
            'farm_id' => ['nullable', 'integer', Rule::exists('farms', 'id')],
            'application_rate' => ['nullable', 'numeric'],
            'application_unit' => ['nullable', 'string', 'max:30'],
            'confidence_score' => ['nullable', 'numeric'],
            'alternative_fertilizers' => ['nullable', 'array'],
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
            'best_crop',
            'best_fertilizer',
            'recommendations',
            'crop_prediction_id',
            'reading_id',
            'sensor_id',
            'farm_id',
            'application_rate',
            'application_unit',
            'confidence_score',
            'alternative_fertilizers',
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
