<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\NormalizesIndexFilters;
use App\Http\Requests\SensorDeviceRequest;
use App\Models\Farm;
use App\Models\SensorDevice;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SensorDeviceController extends Controller
{
    use NormalizesIndexFilters;

    /**
     * Display a paginated, filterable sensor directory.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $this->queryString($request, 'search'),
            'status' => $this->statusQuery($request),
            'farm_id' => $this->positiveIntegerQuery($request, 'farm_id'),
        ];

        $sensors = SensorDevice::query()
            ->with(['farm:id,farm_name,municipality,province'])
            ->withCount(['sensorReadings', 'alerts'])
            ->when($filters['search'] !== null, function (Builder $query) use ($filters): void {
                $search = '%'.$filters['search'].'%';

                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->whereLike('sensor_code', $search)
                        ->orWhereLike('device_name', $search)
                        ->orWhereLike('device_model', $search)
                        ->orWhereLike('serial_number', $search);
                });
            })
            ->when($filters['status'] !== null, function (Builder $query) use ($filters): void {
                $query->where('status', $filters['status']);
            })
            ->when($filters['farm_id'] !== null, function (Builder $query) use ($filters): void {
                $query->where('farm_id', $filters['farm_id']);
            })
            ->orderByDesc('last_seen_at')
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Sensors/Index', [
            'sensors' => $sensors,
            'filters' => $filters,
            'farms' => $this->farmOptions(),
        ]);
    }

    /**
     * Show the form for registering a sensor device.
     */
    public function create(): Response
    {
        return Inertia::render('Sensors/Create', [
            'formOptions' => [
                'farms' => $this->farmOptions(),
            ],
        ]);
    }

    /**
     * Store a newly registered sensor device.
     */
    public function store(SensorDeviceRequest $request): RedirectResponse
    {
        SensorDevice::query()->create($this->payload($request));

        return to_route('sensors.index')->with('success', 'Sensor device registered successfully.');
    }

    /**
     * Display sensor details without introducing a duplicate detail page.
     */
    public function show(SensorDevice $sensor): Response
    {
        $sensor->load([
            'farm:id,farm_name,municipality,province,latitude,longitude',
            'sensorReadings' => fn ($query) => $query->latest('recorded_at')->limit(12),
            'thresholdSettings',
        ])->loadCount([
            'sensorReadings',
            'cropPredictions',
            'fertilizerPredictions',
            'alerts',
        ]);

        return Inertia::render('Sensors/Edit', [
            'sensor' => $sensor,
            'readOnly' => true,
            'formOptions' => [
                'farms' => $this->farmOptions(),
            ],
        ]);
    }

    /**
     * Show the form for editing a sensor device.
     */
    public function edit(SensorDevice $sensor): Response
    {
        $sensor->load('farm:id,farm_name,municipality,province');

        return Inertia::render('Sensors/Edit', [
            'sensor' => $sensor,
            'readOnly' => false,
            'formOptions' => [
                'farms' => $this->farmOptions(),
            ],
        ]);
    }

    /**
     * Update the specified sensor device.
     */
    public function update(SensorDeviceRequest $request, SensorDevice $sensor): RedirectResponse
    {
        $sensor->update($this->payload($request));

        return to_route('sensors.index')->with('success', 'Sensor device updated successfully.');
    }

    /**
     * Remove the specified sensor device.
     */
    public function destroy(SensorDevice $sensor): RedirectResponse
    {
        if (
            $sensor->sensorReadings()->exists()
            || $sensor->cropPredictions()->exists()
            || $sensor->fertilizerPredictions()->exists()
            || $sensor->alerts()->exists()
            || $sensor->thresholdSettings()->exists()
        ) {
            return to_route('sensors.index')->with(
                'error',
                'This sensor cannot be removed while readings or related records are still linked to it.',
            );
        }

        $sensor->delete();

        return to_route('sensors.index')->with('success', 'Sensor device removed successfully.');
    }

    /**
     * @return Collection<int, Farm>
     */
    private function farmOptions()
    {
        return Farm::query()
            ->select(['id', 'farm_name', 'municipality', 'province'])
            ->orderBy('farm_name')
            ->get();
    }

    /**
     * Preserve database defaults for optional device state fields.
     *
     * @return array<string, mixed>
     */
    private function payload(SensorDeviceRequest $request): array
    {
        $payload = $request->validated();

        foreach (['status', 'installation_status'] as $field) {
            if (($payload[$field] ?? null) === null) {
                unset($payload[$field]);
            }
        }

        return $payload;
    }
}
