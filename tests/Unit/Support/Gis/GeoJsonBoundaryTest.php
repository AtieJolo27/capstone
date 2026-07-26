<?php

namespace Tests\Unit\Support\Gis;

use App\Support\Gis\GeoJsonBoundary;
use Tests\TestCase;

class GeoJsonBoundaryTest extends TestCase
{
    public function test_it_accepts_a_closed_polygon_geometry(): void
    {
        $boundary = [
            'type' => 'Polygon',
            'coordinates' => [
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 0],
                ],
            ],
        ];

        self::assertTrue(GeoJsonBoundary::isValid($boundary));
        self::assertSame($boundary, GeoJsonBoundary::normalize($boundary));
    }

    public function test_it_accepts_a_closed_multipolygon_geometry(): void
    {
        $boundary = [
            'type' => 'MultiPolygon',
            'coordinates' => [
                [
                    [
                        [0, 0],
                        [1, 0],
                        [1, 1],
                        [0, 0],
                    ],
                ],
            ],
        ];

        self::assertTrue(GeoJsonBoundary::isValid($boundary));
    }

    public function test_it_rejects_an_open_or_unsupported_geometry(): void
    {
        $openPolygon = [
            'type' => 'Polygon',
            'coordinates' => [
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                ],
            ],
        ];

        self::assertFalse(GeoJsonBoundary::isValid($openPolygon));
        self::assertFalse(GeoJsonBoundary::isValid([
            'type' => 'Point',
            'coordinates' => [0, 0],
        ]));
    }
}
