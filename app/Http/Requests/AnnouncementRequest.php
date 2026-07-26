<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnnouncementRequest extends FormRequest
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
            'message' => ['required', 'string', 'max:5000'],
            'audience' => ['nullable', 'string', 'max:30'],
            'priority' => ['nullable', 'string', 'max:20'],
            'status' => ['nullable', 'string', 'max:20'],
            'published_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:published_at'],
            'created_by' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * Convert optional blank form controls to null before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge($this->nullableInputs([
            'audience',
            'priority',
            'status',
            'published_at',
            'expires_at',
            'created_by',
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
