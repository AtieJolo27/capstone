<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\NormalizesIndexFilters;
use App\Http\Requests\AlertRequest;
use App\Models\Alert;
use App\Models\Farm;
use App\Models\SensorDevice;
use App\Models\SensorReading;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class AlertController extends Controller
{
    use NormalizesIndexFilters;

    /**
     * Display a paginated, filterable alert queue.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $this->queryString($request, 'search'),
            'status' => $this->statusQuery($request),
            'severity' => $this->queryString($request, 'severity', 20),
            'farm_id' => $this->positiveIntegerQuery($request, 'farm_id'),
            'sensor_id' => $this->positiveIntegerQuery($request, 'sensor_id'),
        ];

        $alerts = Alert::query()
            ->with([
                'farm:id,farm_name',
                'sensorDevice:id,farm_id,sensor_code,device_name,status',
                'sensorReading:id,sensor_id,recorded_at',
            ])
            ->when($filters['search'] !== null, function (Builder $query) use ($filters): void {
                $search = '%'.$filters['search'].'%';

                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->whereLike('alert_type', $search)
                        ->orWhereLike('title', $search)
                        ->orWhereLike('message', $search)
                        ->orWhereLike('parameter_name', $search);
                });
            })
            ->when($filters['status'] !== null, function (Builder $query) use ($filters): void {
                $query->where('status', $filters['status']);
            })
            ->when($filters['severity'] !== null, function (Builder $query) use ($filters): void {
                $query->where('severity', $filters['severity']);
            })
            ->when($filters['farm_id'] !== null, function (Builder $query) use ($filters): void {
                $query->where('farm_id', $filters['farm_id']);
            })
            ->when($filters['sensor_id'] !== null, function (Builder $query) use ($filters): void {
                $query->where('sensor_id', $filters['sensor_id']);
            })
            ->latest('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Alerts/Index', [
            'alerts' => $alerts,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating an alert.
     */
    public function create(): Response
    {
        return Inertia::render('Alerts/Create', [
            'formOptions' => $this->formOptions(),
        ]);
    }

    /**
     * Store a newly created alert.
     */
    public function store(AlertRequest $request): RedirectResponse
    {
        Alert::query()->create($this->payload($request));

        return to_route('alerts.index')->with('success', 'Alert created successfully.');
    }

    /**
     * Display an alert in a read-only form.
     */
    public function show(Alert $alert): Response
    {
        $alert->load([
            'farm:id,farm_name',
            'sensorDevice:id,farm_id,sensor_code,device_name,status',
            'sensorReading:id,sensor_id,recorded_at',
        ]);

        return Inertia::render('Alerts/Edit', [
            'alert' => $alert,
            'formOptions' => $this->formOptions(),
            'readOnly' => true,
        ]);
    }

    /**
     * Show the form for editing an alert.
     */
    public function edit(Alert $alert): Response
    {
        $alert->load([
            'farm:id,farm_name',
            'sensorDevice:id,farm_id,sensor_code,device_name,status',
            'sensorReading:id,sensor_id,recorded_at',
        ]);

        return Inertia::render('Alerts/Edit', [
            'alert' => $alert,
            'formOptions' => $this->formOptions(),
            'readOnly' => false,
        ]);
    }

    /**
     * Update the specified alert.
     */
    public function update(AlertRequest $request, Alert $alert): RedirectResponse
    {
        $alert->update($this->payload($request));

        return to_route('alerts.index')->with('success', 'Alert updated successfully.');
    }

    /**
     * Remove the specified alert.
     */
    public function destroy(Alert $alert): RedirectResponse
    {
        $alert->delete();

        return to_route('alerts.index')->with('success', 'Alert removed successfully.');
    }

    /**
     * Build compact, form-ready relationship options.
     *
     * @return array{
     *     farms: Collection<int, array{id: int|string, label: non-empty-string}>,
     *     sensors: Collection<int, array{id: int|string, label: non-empty-string}>,
     *     sensorReadings: Collection<int, array{id: int|string, label: non-falsy-string}>
     * }
     */
    private function formOptions(): array
    {
        return [
            'farms' => Farm::query()
                ->orderBy('farm_name')
                ->get(['id', 'farm_name'])
                ->map(static function (Farm $farm): array {
                    $id = $farm->getKey();
                    $farmName = $farm->getAttribute('farm_name');

                    return [
                        'id' => is_int($id) || is_string($id) ? $id : '',
                        'label' => is_string($farmName) && $farmName !== '' ? $farmName : 'Unnamed farm',
                    ];
                }),
            'sensors' => SensorDevice::query()
                ->orderBy('sensor_code')
                ->get(['id', 'sensor_code', 'device_name'])
                ->map(static function (SensorDevice $sensor): array {
                    $id = $sensor->getKey();
                    $sensorCode = $sensor->getAttribute('sensor_code');
                    $deviceName = $sensor->getAttribute('device_name');
                    $sensorLabel = is_string($sensorCode) && $sensorCode !== '' ? $sensorCode : 'Unnamed sensor';

                    return [
                        'id' => is_int($id) || is_string($id) ? $id : '',
                        'label' => is_string($deviceName) && $deviceName !== ''
                            ? sprintf('%s (%s)', $deviceName, $sensorLabel)
                            : $sensorLabel,
                    ];
                }),
            'sensorReadings' => SensorReading::query()
                ->with('sensorDevice:id,sensor_code')
                ->select(['id', 'sensor_id', 'recorded_at'])
                ->orderByDesc('recorded_at')
                ->limit(100)
                ->get()
                ->map(static function (SensorReading $reading): array {
                    $id = $reading->getKey();
                    $sensor = $reading->getRelation('sensorDevice');
                    $sensorCode = $sensor instanceof SensorDevice ? $sensor->getAttribute('sensor_code') : null;
                    $recordedAt = $reading->getAttribute('recorded_at');

                    $sensorCode = is_string($sensorCode) && $sensorCode !== '' ? $sensorCode : 'Sensor';
                    $recordedAt = $recordedAt instanceof \DateTimeInterface
                        ? $recordedAt->format('M j, Y g:i A')
                        : (is_string($recordedAt) && $recordedAt !== '' ? $recordedAt : 'No recorded time');

                    return [
                        'id' => is_int($id) || is_string($id) ? $id : '',
                        'label' => sprintf('%s · %s', $sensorCode, $recordedAt),
                    ];
                }),
        ];
    }

    /**
     * Preserve the database default status when a form leaves it blank.
     *
     * @return array<string, mixed>
     */
    private function payload(AlertRequest $request): array
    {
        $payload = $request->validated();

        if (($payload['status'] ?? null) === null) {
            unset($payload['status']);
        }

        return $payload;
    }
}
