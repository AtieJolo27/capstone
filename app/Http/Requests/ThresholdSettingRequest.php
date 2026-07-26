<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ThresholdSettingRequest extends FormRequest
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
            'parameter_name' => ['required', 'string', 'max:50'],
            'min_value' => ['nullable', 'numeric'],
            'max_value' => ['nullable', 'numeric'],
            'warning_minimum' => ['nullable', 'numeric'],
            'warning_maximum' => ['nullable', 'numeric'],
            'unit' => ['nullable', 'string', 'max:30'],
            'is_active' => ['sometimes', 'boolean'],
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
            'min_value',
            'max_value',
            'warning_minimum',
            'warning_maximum',
            'unit',
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
