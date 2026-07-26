<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SensorReadingRequest extends FormRequest
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
            'sensor_id' => ['nullable', 'integer', Rule::exists('sensor_devices', 'id')],
            'soil_moisture' => ['nullable', 'numeric', 'between:0,100'],
            'soil_temperature' => ['nullable', 'numeric', 'between:-100,100'],
            'air_temperature' => ['nullable', 'numeric', 'between:-100,100'],
            'humidity' => ['nullable', 'numeric', 'between:0,100'],
            'ph' => ['nullable', 'numeric', 'between:0,14'],
            'nitrogen' => ['nullable', 'integer', 'min:0'],
            'phosphorus' => ['nullable', 'integer', 'min:0'],
            'potassium' => ['nullable', 'integer', 'min:0'],
            'reading_status' => ['nullable', 'string', 'max:20'],
            'data_source' => ['nullable', 'string', 'max:20'],
            'is_valid' => ['sometimes', 'boolean'],
            'validation_notes' => ['nullable', 'string', 'max:5000'],
            'recorded_at' => ['nullable', 'date'],
        ];
    }

    /**
     * Convert optional blank form controls to null before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge($this->nullableInputs([
            'sensor_id',
            'soil_moisture',
            'soil_temperature',
            'air_temperature',
            'humidity',
            'ph',
            'nitrogen',
            'phosphorus',
            'potassium',
            'reading_status',
            'data_source',
            'validation_notes',
            'recorded_at',
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
