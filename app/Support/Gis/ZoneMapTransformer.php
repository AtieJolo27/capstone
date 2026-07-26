<?php

namespace App\Support\Gis;

use App\Models\Farm;
use App\Models\SensorDevice;
use App\Models\SensorReading;
use App\Models\Zone;
use DateTimeInterface;
use Illuminate\Support\Collection;

final class ZoneMapTransformer
{
    /**
     * Transform one eagerly-loaded zone into a map-safe Inertia payload.
     *
     * Invalid GeoJSON returns null so the controller can warn the user without
     * breaking the rest of the map.
     *
     * @return array<string, mixed>|null
     */
    public static function transform(Zone $zone): ?array
    {
        $geometry = GeoJsonBoundary::normalize($zone->boundary_geojson);

        if ($geometry === null) {
            return null;
        }

        $farm = $zone->farm;
        $sensors = $zone->sensorDevices;

        return [
            'id' => $zone->id,
            'name' => $zone->name,
            'description' => $zone->description,
            'soilType' => $zone->soil_type ?? $farm?->soil_type,
            'currentCrop' => $zone->current_crop ?? $farm?->current_crop,
            'area' => $zone->area,
            'areaUnit' => $zone->area_unit,
            'status' => self::statusFor($sensors),
            'geometry' => $geometry,
            'center' => self::centerFor($zone),
            'sensorCount' => $sensors->count(),
            'deployedSensorCount' => $sensors
                ->filter(static fn (SensorDevice $sensor): bool => $sensor->installation_status === 'deployed')
                ->count(),
            'lastUpdatedAt' => self::lastUpdatedAt($zone, $sensors),
            'farm' => self::farm($farm),
            'sensors' => $sensors
                ->map(static fn (SensorDevice $sensor): array => self::sensor($sensor))
                ->values()
                ->all(),
        ];
    }

    /**
     * Calculate zone health from deployed sensor state, current readings, and unresolved alerts.
     *
     * @param  Collection<int, SensorDevice>  $sensors
     */
    private static function statusFor(Collection $sensors): string
    {
        $unresolvedAlerts = $sensors->flatMap(
            static fn (SensorDevice $sensor): Collection => $sensor->unresolvedAlerts,
        );

        if ($unresolvedAlerts->contains(
            static fn ($alert): bool => strtolower((string) $alert->severity) === 'critical',
        )) {
            return 'Critical';
        }

        if ($unresolvedAlerts->contains(static function ($alert): bool {
            return in_array(strtolower((string) $alert->severity), ['warning', 'high'], true);
        })) {
            return 'Warning';
        }

        $activeSensors = $sensors->filter(static function (SensorDevice $sensor): bool {
            return $sensor->is_active && strtolower($sensor->status) !== 'offline';
        });

        if ($activeSensors->isEmpty()) {
            return 'Inactive';
        }

        $allActiveSensorsHaveValidReadings = $activeSensors->every(
            static fn (SensorDevice $sensor): bool => $sensor->latestReading?->is_valid === true,
        );

        return $allActiveSensorsHaveValidReadings ? 'Healthy' : 'Warning';
    }

    /**
     * @return array{id: int, name: string, farmerName: null, location: string|null, address: string|null}|null
     */
    private static function farm(?Farm $farm): ?array
    {
        if (! $farm instanceof Farm) {
            return null;
        }

        $location = array_filter([
            $farm->barangay,
            $farm->municipality,
            $farm->province,
        ]);

        return [
            'id' => $farm->id,
            'name' => $farm->farm_name,
            // farmer_id is UUID while the current application user key is bigint.
            // Do not infer an unsafe relationship until that schema mismatch is resolved.
            'farmerName' => null,
            'location' => $location === [] ? null : implode(', ', $location),
            'address' => $farm->address,
        ];
    }

    /**
     * @return array{latitude: float, longitude: float}|null
     */
    private static function centerFor(Zone $zone): ?array
    {
        if ($zone->center_latitude === null || $zone->center_longitude === null) {
            return null;
        }

        return [
            'latitude' => $zone->center_latitude,
            'longitude' => $zone->center_longitude,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function sensor(SensorDevice $sensor): array
    {
        return [
            'id' => $sensor->id,
            'deviceName' => $sensor->device_name,
            'sensorCode' => $sensor->sensor_code,
            'status' => $sensor->status,
            'batteryLevel' => $sensor->battery_level,
            'signalStrength' => $sensor->signal_strength,
            'lastSeenAt' => $sensor->last_seen_at?->toIso8601String(),
            'latitude' => $sensor->latitude,
            'longitude' => $sensor->longitude,
            'unresolvedAlertCount' => $sensor->unresolvedAlerts->count(),
            'latestReading' => self::reading($sensor->latestReading),
        ];
    }

    /**
     * @return array<string, bool|float|int|string|null>|null
     */
    private static function reading(?SensorReading $reading): ?array
    {
        if (! $reading instanceof SensorReading) {
            return null;
        }

        return [
            'soilMoisture' => $reading->soil_moisture,
            'soilTemperature' => $reading->soil_temperature,
            'airTemperature' => $reading->air_temperature,
            'humidity' => $reading->humidity,
            'ph' => $reading->ph,
            'nitrogen' => $reading->nitrogen,
            'phosphorus' => $reading->phosphorus,
            'potassium' => $reading->potassium,
            'status' => $reading->reading_status,
            'isValid' => $reading->is_valid,
            'recordedAt' => $reading->recorded_at?->toIso8601String(),
        ];
    }

    /**
     * @param  Collection<int, SensorDevice>  $sensors
     */
    private static function lastUpdatedAt(Zone $zone, Collection $sensors): ?string
    {
        $timestamps = collect([$zone->updated_at]);

        foreach ($sensors as $sensor) {
            $timestamps->push($sensor->last_seen_at, $sensor->updated_at, $sensor->latestReading?->recorded_at);
        }

        $latest = $timestamps
            ->filter(static fn (mixed $timestamp): bool => $timestamp instanceof DateTimeInterface)
            ->sortByDesc(static fn (DateTimeInterface $timestamp): int => $timestamp->getTimestamp())
            ->first();

        return $latest instanceof DateTimeInterface ? $latest->format(DATE_ATOM) : null;
    }
}
