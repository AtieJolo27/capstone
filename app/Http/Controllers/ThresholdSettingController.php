<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\NormalizesIndexFilters;
use App\Http\Requests\ThresholdSettingRequest;
use App\Models\Farm;
use App\Models\SensorDevice;
use App\Models\ThresholdSetting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ThresholdSettingController extends Controller
{
    use NormalizesIndexFilters;

    /**
     * Display a paginated, filterable threshold configuration list.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $this->queryString($request, 'search'),
            'farm_id' => $this->positiveIntegerQuery($request, 'farm_id'),
            'sensor_id' => $this->positiveIntegerQuery($request, 'sensor_id'),
            'is_active' => $this->booleanQuery($request, 'is_active'),
        ];

        $thresholdSettings = ThresholdSetting::query()
            ->with([
                'farm:id,farm_name',
                'sensorDevice:id,farm_id,sensor_code,device_name,status',
            ])
            ->when($filters['search'] !== null, function (Builder $query) use ($filters): void {
                $search = '%'.$filters['search'].'%';

                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->whereLike('parameter_name', $search)
                        ->orWhereLike('unit', $search);
                });
            })
            ->when($filters['farm_id'] !== null, function (Builder $query) use ($filters): void {
                $query->where('farm_id', $filters['farm_id']);
            })
            ->when($filters['sensor_id'] !== null, function (Builder $query) use ($filters): void {
                $query->where('sensor_id', $filters['sensor_id']);
            })
            ->when($filters['is_active'] !== null, function (Builder $query) use ($filters): void {
                $query->where('is_active', $filters['is_active']);
            })
            ->latest('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('ThresholdSettings/Index', [
            'thresholdSettings' => $thresholdSettings,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a threshold setting.
     */
    public function create(): Response
    {
        return Inertia::render('ThresholdSettings/Create', [
            'formOptions' => $this->formOptions(),
        ]);
    }

    /**
     * Store a newly created threshold setting.
     */
    public function store(ThresholdSettingRequest $request): RedirectResponse
    {
        ThresholdSetting::query()->create($request->validated());

        return to_route('threshold-settings.index')->with('success', 'Threshold setting created successfully.');
    }

    /**
     * Display a threshold setting in a read-only form.
     */
    public function show(ThresholdSetting $thresholdSetting): Response
    {
        $thresholdSetting->load([
            'farm:id,farm_name',
            'sensorDevice:id,farm_id,sensor_code,device_name,status',
        ]);

        return Inertia::render('ThresholdSettings/Edit', [
            'thresholdSetting' => $thresholdSetting,
            'formOptions' => $this->formOptions(),
            'readOnly' => true,
        ]);
    }

    /**
     * Show the form for editing a threshold setting.
     */
    public function edit(ThresholdSetting $thresholdSetting): Response
    {
        $thresholdSetting->load([
            'farm:id,farm_name',
            'sensorDevice:id,farm_id,sensor_code,device_name,status',
        ]);

        return Inertia::render('ThresholdSettings/Edit', [
            'thresholdSetting' => $thresholdSetting,
            'formOptions' => $this->formOptions(),
            'readOnly' => false,
        ]);
    }

    /**
     * Update the specified threshold setting.
     */
    public function update(ThresholdSettingRequest $request, ThresholdSetting $thresholdSetting): RedirectResponse
    {
        $thresholdSetting->update($request->validated());

        return to_route('threshold-settings.index')->with('success', 'Threshold setting updated successfully.');
    }

    /**
     * Remove the specified threshold setting.
     */
    public function destroy(ThresholdSetting $thresholdSetting): RedirectResponse
    {
        $thresholdSetting->delete();

        return to_route('threshold-settings.index')->with('success', 'Threshold setting removed successfully.');
    }

    /**
     * Build compact, form-ready relationship options.
     *
     * @return array{
     *     farms: Collection<int, array{id: int|string, label: non-empty-string}>,
     *     sensors: Collection<int, array{id: int|string, label: non-empty-string}>
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
        ];
    }

    /**
     * Return a strictly parsed boolean query-string value when present.
     */
    private function booleanQuery(Request $request, string $key): ?bool
    {
        $value = $request->query($key);

        if (! is_string($value)) {
            return null;
        }

        return match (strtolower($value)) {
            '1', 'true' => true,
            '0', 'false' => false,
            default => null,
        };
    }
}
