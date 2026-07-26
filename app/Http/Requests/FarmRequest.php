<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FarmRequest extends FormRequest
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
            'farmer_id' => ['nullable', 'uuid'],
            'farm_name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'address' => ['nullable', 'string', 'max:255'],
            'barangay' => ['nullable', 'string', 'max:100'],
            'municipality' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'farm_size' => ['nullable', 'numeric', 'min:0'],
            'farm_size_unit' => ['nullable', 'string', 'max:20'],
            'soil_type' => ['nullable', 'string', 'max:50'],
            'current_crop' => ['nullable', 'string', 'max:100'],
            'irrigation_type' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:20'],
        ];
    }

    /**
     * Convert optional blank form controls to null before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge($this->nullableInputs([
            'farmer_id',
            'description',
            'address',
            'barangay',
            'municipality',
            'province',
            'farm_size',
            'farm_size_unit',
            'soil_type',
            'current_crop',
            'irrigation_type',
            'status',
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
