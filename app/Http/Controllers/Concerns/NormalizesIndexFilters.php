<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;

trait NormalizesIndexFilters
{
    /**
     * Return a bounded, non-empty query-string value.
     */
    protected function queryString(Request $request, string $key, int $maxLength = 100): ?string
    {
        $value = $request->query($key);

        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        if ($value === '') {
            return null;
        }

        return mb_substr($value, 0, $maxLength);
    }

    /**
     * Return a positive integer query-string value when one is provided.
     */
    protected function positiveIntegerQuery(Request $request, string $key): ?int
    {
        $value = $request->query($key);

        if (! is_string($value) || ! ctype_digit($value)) {
            return null;
        }

        $integer = (int) $value;

        return $integer > 0 ? $integer : null;
    }

    /**
     * Return a safely shaped status query-string value.
     */
    protected function statusQuery(Request $request): ?string
    {
        $status = $this->queryString($request, 'status', 50);

        if ($status === null) {
            return null;
        }

        return preg_match('/^[\pL\pN][\pL\pN _-]*$/u', $status) === 1
            ? $status
            : null;
    }

    /**
     * Return a UUID query-string value when it is valid.
     */
    protected function uuidQuery(Request $request, string $key): ?string
    {
        $value = $this->queryString($request, $key, 36);

        if ($value === null) {
            return null;
        }

        return preg_match(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $value,
        ) === 1 ? $value : null;
    }
}
