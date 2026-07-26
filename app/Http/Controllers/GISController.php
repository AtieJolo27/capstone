<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use App\Support\Gis\ZoneMapTransformer;
use Illuminate\Database\Eloquent\Relations\Relation;
use Inertia\Inertia;
use Inertia\Response;

class GISController extends Controller
{
    /**
     * Display field zones and their currently deployed sensor context.
     */
    public function __invoke(): Response
    {
        $zones = Zone::query()
            ->select([
                'id',
                'farm_id',
                'name',
                'description',
                'soil_type',
                'current_crop',
                'area',
                'area_unit',
                'boundary_geojson',
                'center_latitude',
                'center_longitude',
                'created_at',
                'updated_at',
            ])
            ->with([
                'farm' => static function (Relation $query): void {
                    $query->select([
                        'id',
                        'farm_name',
                        'farmer_id',
                        'address',
                        'barangay',
                        'municipality',
                        'province',
                        'soil_type',
                        'current_crop',
                    ]);
                },
                'sensorDevices' => static function (Relation $query): void {
                    $query
                        ->select([
                            'id',
                            'zone_id',
                            'sensor_code',
                            'device_name',
                            'status',
                            'battery_level',
                            'signal_strength',
                            'is_active',
                            'installation_status',
                            'latitude',
                            'longitude',
                            'last_seen_at',
                            'updated_at',
                        ])
                        ->orderBy('sensor_code');
                },
                'sensorDevices.latestReading' => static function (Relation $query): void {
                    $query->select([
                        'id',
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
                        'is_valid',
                        'recorded_at',
                    ]);
                },
                'sensorDevices.unresolvedAlerts' => static function (Relation $query): void {
                    $query->select(['id', 'sensor_id', 'severity', 'status', 'created_at']);
                },
            ])
            ->orderBy('name')
            ->get();

        $mapZones = [];
        $invalidZones = [];

        foreach ($zones as $zone) {
            $mapZone = ZoneMapTransformer::transform($zone);

            if ($mapZone === null) {
                $invalidZones[] = [
                    'id' => $zone->id,
                    'name' => $zone->name,
                ];

                continue;
            }

            $mapZones[] = $mapZone;
        }

        $farmOptionsById = [];

        foreach ($zones as $zone) {
            $farm = $zone->farm;

            if ($farm === null) {
                continue;
            }

            $farmOptionsById[$farm->id] = [
                'id' => $farm->id,
                'name' => $farm->farm_name,
            ];
        }

        $farmOptions = array_values($farmOptionsById);

        usort($farmOptions, static fn (array $left, array $right): int => $left['name'] <=> $right['name']);

        return Inertia::render('Gis/Index', [
            'zones' => $mapZones,
            'farmOptions' => $farmOptions,
            'invalidZones' => $invalidZones,
            'summary' => [
                'totalZones' => $zones->count(),
                'renderableZones' => count($mapZones),
                'invalidZones' => count($invalidZones),
            ],
        ]);
    }
}
