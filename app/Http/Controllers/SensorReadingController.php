<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\NormalizesIndexFilters;
use App\Http\Requests\SensorReadingRequest;
use App\Models\SensorDevice;
use App\Models\SensorReading;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SensorReadingController extends Controller
{
    use NormalizesIndexFilters;

    /**
     * Display a paginated, filterable sensor-reading log.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $this->queryString($request, 'search'),
            'status' => $this->statusQuery($request),
            'sensor_id' => $this->positiveIntegerQuery($request, 'sensor_id'),
            'farm_id' => $this->positiveIntegerQuery($request, 'farm_id'),
        ];

        $readings = SensorReading::query()
            ->with(['sensorDevice.farm:id,farm_name,municipality,province'])
            ->withCount(['cropPredictions', 'fertilizerPredictions', 'alerts'])
            ->when($filters['search'] !== null, function (Builder $query) use ($filters): void {
                $search = '%'.$filters['search'].'%';

                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->whereLike('reading_status', $search)
                        ->orWhereLike('data_source', $search)
                        ->orWhereHas('sensorDevice', function (Builder $sensorQuery) use ($search): void {
                            $sensorQuery
                                ->whereLike('sensor_code', $search)
                                ->orWhereLike('device_name', $search);
                        });
                });
            })
            ->when($filters['status'] !== null, function (Builder $query) use ($filters): void {
                $query->where('reading_status', $filters['status']);
            })
            ->when($filters['sensor_id'] !== null, function (Builder $query) use ($filters): void {
                $query->where('sensor_id', $filters['sensor_id']);
            })
            ->when($filters['farm_id'] !== null, function (Builder $query) use ($filters): void {
                $query->whereHas('sensorDevice', function (Builder $sensorQuery) use ($filters): void {
                    $sensorQuery->where('farm_id', $filters['farm_id']);
                });
            })
            ->orderByDesc('recorded_at')
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('SensorReadings/Index', [
            'readings' => $readings,
            'filters' => $filters,
            'sensors' => $this->sensorOptions(),
        ]);
    }

    /**
     * Show the form for recording a reading.
     */
    public function create(): Response
    {
        return Inertia::render('SensorReadings/Create', [
            'formOptions' => [
                'sensors' => $this->sensorOptions(),
            ],
        ]);
    }

    /**
     * Store a newly recorded sensor reading.
     */
    public function store(SensorReadingRequest $request): RedirectResponse
    {
        SensorReading::query()->create($this->payload($request));

        return to_route('sensor-readings.index')->with('success', 'Sensor reading recorded successfully.');
    }

    /**
     * Display a sensor reading without introducing a duplicate detail page.
     */
    public function show(SensorReading $sensorReading): Response
    {
        $sensorReading->load([
            'sensorDevice.farm:id,farm_name,municipality,province,latitude,longitude',
            'cropPredictions.fertilizerPredictions',
            'fertilizerPredictions',
            'alerts.sensorDevice',
        ])->loadCount(['cropPredictions', 'fertilizerPredictions', 'alerts']);

        return Inertia::render('SensorReadings/Edit', [
            'sensorReading' => $sensorReading,
            'readOnly' => true,
            'formOptions' => [
                'sensors' => $this->sensorOptions(),
            ],
        ]);
    }

    /**
     * Show the form for editing a sensor reading.
     */
    public function edit(SensorReading $sensorReading): Response
    {
        $sensorReading->load('sensorDevice.farm:id,farm_name,municipality,province');

        return Inertia::render('SensorReadings/Edit', [
            'sensorReading' => $sensorReading,
            'readOnly' => false,
            'formOptions' => [
                'sensors' => $this->sensorOptions(),
            ],
        ]);
    }

    /**
     * Update the specified sensor reading.
     */
    public function update(SensorReadingRequest $request, SensorReading $sensorReading): RedirectResponse
    {
        $sensorReading->update($this->payload($request));

        return to_route('sensor-readings.index')->with('success', 'Sensor reading updated successfully.');
    }

    /**
     * Remove the specified sensor reading.
     */
    public function destroy(SensorReading $sensorReading): RedirectResponse
    {
        if (
            $sensorReading->cropPredictions()->exists()
            || $sensorReading->fertilizerPredictions()->exists()
            || $sensorReading->alerts()->exists()
        ) {
            return to_route('sensor-readings.index')->with(
                'error',
                'This reading cannot be removed while predictions or alerts still reference it.',
            );
        }

        $sensorReading->delete();

        return to_route('sensor-readings.index')->with('success', 'Sensor reading removed successfully.');
    }

    /**
     * @return Collection<int, SensorDevice>
     */
    private function sensorOptions()
    {
        return SensorDevice::query()
            ->with('farm:id,farm_name,municipality,province')
            ->select(['id', 'farm_id', 'sensor_code', 'device_name', 'status'])
            ->orderBy('sensor_code')
            ->get();
    }

    /**
     * Preserve database defaults for optional reading state fields.
     *
     * @return array<string, mixed>
     */
    private function payload(SensorReadingRequest $request): array
    {
        $payload = $request->validated();

        foreach (['reading_status', 'data_source', 'recorded_at'] as $field) {
            if (($payload[$field] ?? null) === null) {
                unset($payload[$field]);
            }
        }

        return $payload;
    }
}
