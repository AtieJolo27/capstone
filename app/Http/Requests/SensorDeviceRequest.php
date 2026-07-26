<?php

namespace App\Http\Requests;

use App\Models\SensorDevice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SensorDeviceRequest extends FormRequest
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
        /** @var SensorDevice|string|int|null $sensor */
        $sensor = $this->route('sensor');

        return [
            'farm_id' => ['required', 'integer', Rule::exists('farms', 'id')],
            'sensor_code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('sensor_devices', 'sensor_code')->ignore(
                    $sensor instanceof SensorDevice ? $sensor->getKey() : $sensor,
                ),
            ],
            'device_name' => ['nullable', 'string', 'max:150'],
            'device_model' => ['nullable', 'string', 'max:100'],
            'serial_number' => [
                'nullable',
                'string',
                'max:150',
                Rule::unique('sensor_devices', 'serial_number')->ignore(
                    $sensor instanceof SensorDevice ? $sensor->getKey() : $sensor,
                ),
            ],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'battery_level' => ['nullable', 'numeric', 'between:0,100'],
            'signal_strength' => ['nullable', 'integer', 'between:-200,200'],
            'firmware_version' => ['nullable', 'string', 'max:50'],
            'connection_type' => ['nullable', 'string', 'max:30'],
            'status' => ['nullable', 'string', 'max:20'],
            'installation_status' => ['nullable', 'string', 'max:30'],
            'is_active' => ['sometimes', 'boolean'],
            'installed_at' => ['nullable', 'date'],
            'last_seen_at' => ['nullable', 'date'],
        ];
    }

    /**
     * Convert optional blank form controls to null before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge($this->nullableInputs([
            'device_model',
            'serial_number',
            'latitude',
            'longitude',
            'battery_level',
            'signal_strength',
            'firmware_version',
            'connection_type',
            'status',
            'installation_status',
            'installed_at',
            'last_seen_at',
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
