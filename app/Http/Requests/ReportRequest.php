<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:200'],
            'report_type' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:5000'],
            'generated_by' => ['nullable', 'integer', 'min:1'],
            'file_name' => ['nullable', 'string', 'max:255'],
            'file_url' => ['nullable', 'string', 'max:2048'],
            'file_size' => ['nullable', 'integer', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'generated_at' => ['nullable', 'date'],
        ];
    }

    /**
     * Convert optional blank form controls to null before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge($this->nullableInputs([
            'description',
            'generated_by',
            'file_name',
            'file_url',
            'file_size',
            'start_date',
            'end_date',
            'generated_at',
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
