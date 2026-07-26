<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AlertRequest extends FormRequest
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
            'farm_id' => ['nullable', 'integer', Rule::exists('farms', 'id')],
            'sensor_id' => ['nullable', 'integer', Rule::exists('sensor_devices', 'id')],
            'reading_id' => ['nullable', 'integer', Rule::exists('sensor_readings', 'id')],
            'alert_type' => ['required', 'string', 'max:50'],
            'severity' => ['required', 'string', 'max:20'],
            'title' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:5000'],
            'parameter_name' => ['nullable', 'string', 'max:50'],
            'parameter_value' => ['nullable', 'numeric'],
            'threshold_value' => ['nullable', 'numeric'],
            'status' => ['nullable', 'string', 'max:20'],
            'acknowledged_at' => ['nullable', 'date'],
            'resolved_at' => ['nullable', 'date'],
        ];
    }

    /**
     * Convert optional blank form controls to null before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge($this->nullableInputs([
            'farm_id',
            'sensor_id',
            'reading_id',
            'parameter_name',
            'parameter_value',
            'threshold_value',
            'status',
            'acknowledged_at',
            'resolved_at',
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
