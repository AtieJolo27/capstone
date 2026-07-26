<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\Announcement;
use App\Models\Farm;
use App\Models\SensorDevice;
use App\Models\SensorReading;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the database-backed operations overview.
     */
    public function __invoke(): Response
    {
        $deviceStatusCounts = SensorDevice::query()
            ->selectRaw('lower(status) as status, count(*) as total')
            ->groupByRaw('lower(status)')
            ->pluck('total', 'status');

        $latestReadings = SensorReading::query()
            ->with([
                'sensorDevice:id,farm_id,sensor_code,status',
                'sensorDevice.farm:id,farm_name,current_crop',
            ])
            ->latest('recorded_at')
            ->limit(6)
            ->get();

        $latestAlerts = Alert::query()
            ->with([
                'farm:id,farm_name',
                'sensorDevice:id,sensor_code,status',
                'sensorReading:id,sensor_id,recorded_at',
            ])
            ->latest()
            ->limit(5)
            ->get();

        $announcements = Announcement::query()
            ->whereIn('status', ['published', 'active'])
            ->latest('published_at')
            ->limit(3)
            ->get();

        $trendStart = now()->subDays(29)->startOfDay();
        $moistureTrend = SensorReading::query()
            ->whereNotNull('soil_moisture')
            ->where('recorded_at', '>=', $trendStart)
            ->selectRaw('date(recorded_at) as date, avg(soil_moisture) as value')
            ->groupByRaw('date(recorded_at)')
            ->orderBy('date')
            ->get()
            ->map(static fn (SensorReading $reading): array => [
                'date' => Carbon::parse((string) $reading->getAttribute('date'))->toDateString(),
                'value' => round((float) $reading->getAttribute('value'), 1),
            ])
            ->values();

        $averages = SensorReading::query()
            ->selectRaw('avg(soil_moisture) as moisture')
            ->selectRaw('avg(ph) as ph')
            ->selectRaw('avg(soil_temperature) as soil_temperature')
            ->selectRaw('avg(air_temperature) as air_temperature')
            ->selectRaw('avg(humidity) as humidity')
            ->selectRaw('avg(nitrogen) as nitrogen')
            ->selectRaw('avg(phosphorus) as phosphorus')
            ->selectRaw('avg(potassium) as potassium')
            ->first();

        return Inertia::render('Dashboard', [
            'summary' => [
                'sensors' => [
                    'healthy' => (int) ($deviceStatusCounts['healthy'] ?? 0),
                    'warning' => (int) ($deviceStatusCounts['warning'] ?? 0),
                    'critical' => (int) ($deviceStatusCounts['critical'] ?? 0),
                    'offline' => (int) ($deviceStatusCounts['offline'] ?? 0),
                    'total' => (int) $deviceStatusCounts->sum(),
                ],
                'farms' => [
                    'count' => Farm::query()->count(),
                    'active_area' => round((float) Farm::query()->where('status', 'active')->sum('farm_size'), 2),
                ],
                'open_alerts' => Alert::query()->where('status', '!=', 'resolved')->count(),
            ],
            'latestReadings' => $latestReadings,
            'latestAlerts' => $latestAlerts,
            'announcements' => $announcements,
            'charts' => [
                'moistureTrend' => $moistureTrend,
                'averages' => [
                    'moisture' => $this->nullableRounded($averages?->getAttribute('moisture')),
                    'ph' => $this->nullableRounded($averages?->getAttribute('ph')),
                    'soil_temperature' => $this->nullableRounded($averages?->getAttribute('soil_temperature')),
                    'air_temperature' => $this->nullableRounded($averages?->getAttribute('air_temperature')),
                    'humidity' => $this->nullableRounded($averages?->getAttribute('humidity')),
                    'nitrogen' => $this->nullableRounded($averages?->getAttribute('nitrogen')),
                    'phosphorus' => $this->nullableRounded($averages?->getAttribute('phosphorus')),
                    'potassium' => $this->nullableRounded($averages?->getAttribute('potassium')),
                ],
            ],
        ]);
    }

    /**
     * Convert database aggregate results into nullable dashboard values.
     */
    private function nullableRounded(mixed $value): ?float
    {
        return $value === null ? null : round((float) $value, 1);
    }
}
