<?php

namespace App\Support\Gis;

use JsonException;

final class GeoJsonBoundary
{
    /**
     * Normalize a Polygon or MultiPolygon boundary when every coordinate is valid.
     *
     * @return array{type: 'Polygon'|'MultiPolygon', coordinates: array<int, mixed>}|null
     */
    public static function normalize(mixed $boundary): ?array
    {
        $boundary = self::decode($boundary);

        if (! is_array($boundary)) {
            return null;
        }

        $type = $boundary['type'] ?? null;
        $coordinates = $boundary['coordinates'] ?? null;

        if (! is_string($type) || ! is_array($coordinates)) {
            return null;
        }

        if ($type === 'Polygon' && self::isPolygon($coordinates)) {
            return [
                'type' => 'Polygon',
                'coordinates' => $coordinates,
            ];
        }

        if ($type === 'MultiPolygon' && self::isMultiPolygon($coordinates)) {
            return [
                'type' => 'MultiPolygon',
                'coordinates' => $coordinates,
            ];
        }

        return null;
    }

    /**
     * Determine whether a value contains a valid supported GeoJSON geometry.
     */
    public static function isValid(mixed $boundary): bool
    {
        return self::normalize($boundary) !== null;
    }

    /**
     * Decode JSON input while retaining already-decoded Eloquent casts.
     */
    private static function decode(mixed $boundary): mixed
    {
        if (! is_string($boundary)) {
            return $boundary;
        }

        try {
            return json_decode($boundary, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return null;
        }
    }

    /**
     * Validate a GeoJSON Polygon coordinate structure.
     *
     * @param  array<int, mixed>  $coordinates
     */
    private static function isPolygon(array $coordinates): bool
    {
        if ($coordinates === []) {
            return false;
        }

        foreach ($coordinates as $ring) {
            if (! is_array($ring) || ! self::isLinearRing($ring)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate a GeoJSON MultiPolygon coordinate structure.
     *
     * @param  array<int, mixed>  $coordinates
     */
    private static function isMultiPolygon(array $coordinates): bool
    {
        if ($coordinates === []) {
            return false;
        }

        foreach ($coordinates as $polygon) {
            if (! is_array($polygon) || ! self::isPolygon($polygon)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate a closed GeoJSON linear ring with valid longitude/latitude pairs.
     *
     * @param  array<int, mixed>  $ring
     */
    private static function isLinearRing(array $ring): bool
    {
        if (count($ring) < 4) {
            return false;
        }

        foreach ($ring as $position) {
            if (! self::isPosition($position)) {
                return false;
            }
        }

        $first = $ring[0];
        $last = $ring[array_key_last($ring)];

        return is_array($first)
            && is_array($last)
            && (float) $first[0] === (float) $last[0]
            && (float) $first[1] === (float) $last[1];
    }

    /**
     * Validate one GeoJSON position in longitude, latitude order.
     */
    private static function isPosition(mixed $position): bool
    {
        if (! is_array($position) || ! array_key_exists(0, $position) || ! array_key_exists(1, $position)) {
            return false;
        }

        $longitude = $position[0];
        $latitude = $position[1];

        if (! is_numeric($longitude) || ! is_numeric($latitude)) {
            return false;
        }

        return (float) $longitude >= -180
            && (float) $longitude <= 180
            && (float) $latitude >= -90
            && (float) $latitude <= 90;
    }
}
