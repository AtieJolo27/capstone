<?php

namespace App\Http\Controllers;

use App\Http\Requests\CropPredictionRequest;
use App\Models\CropPrediction;
use App\Models\Farm;
use App\Models\SensorDevice;
use App\Models\SensorReading;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CropPredictionController extends Controller
{
    /**
     * Display a paginated list of crop predictions.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'max:20'],
            'farm_id' => ['nullable', 'integer', Rule::exists('farms', 'id')],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $status = trim((string) ($filters['status'] ?? ''));

        $cropPredictions = CropPrediction::query()
            ->with($this->relations())
            ->when($search !== '', function (Builder $query) use ($search): void {
                $pattern = "%{$search}%";

                $query->where(function (Builder $query) use ($pattern): void {
                    $query
                        ->whereLike('best_crop', $pattern)
                        ->orWhereLike('model_name', $pattern)
                        ->orWhereLike('model_version', $pattern)
                        ->orWhereHas('farm', fn (Builder $farm): Builder => $farm->whereLike('farm_name', $pattern))
                        ->orWhereHas('sensorDevice', function (Builder $sensor) use ($pattern): void {
                            $sensor
                                ->whereLike('sensor_code', $pattern)
                                ->orWhereLike('device_name', $pattern);
                        });
                });
            })
            ->when($status !== '', fn (Builder $query): Builder => $query->where('prediction_status', $status))
            ->when(isset($filters['farm_id']), fn (Builder $query): Builder => $query->where('farm_id', $filters['farm_id']))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('CropPredictions/Index', [
            'cropPredictions' => $cropPredictions,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'farm_id' => $filters['farm_id'] ?? null,
            ],
            'farms' => Farm::query()
                ->orderBy('farm_name')
                ->get(['id', 'farm_name']),
        ]);
    }

    /**
     * Show the form for creating a crop prediction.
     */
    public function create(): Response
    {
        return Inertia::render('CropPredictions/Create', [
            'formOptions' => $this->formOptions(),
        ]);
    }

    /**
     * Store a newly created crop prediction.
     */
    public function store(CropPredictionRequest $request): RedirectResponse
    {
        CropPrediction::query()->create($this->payload($request));

        return to_route('crop-predictions.index')
            ->with('success', 'Crop prediction created successfully.');
    }

    /**
     * Display the specified crop prediction using the edit page in read-only mode.
     */
    public function show(CropPrediction $cropPrediction): Response
    {
        return Inertia::render('CropPredictions/Edit', [
            'cropPrediction' => $cropPrediction->load($this->relations()),
            'formOptions' => $this->formOptions(),
            'readOnly' => true,
        ]);
    }

    /**
     * Show the form for editing the specified crop prediction.
     */
    public function edit(CropPrediction $cropPrediction): Response
    {
        return Inertia::render('CropPredictions/Edit', [
            'cropPrediction' => $cropPrediction->load($this->relations()),
            'formOptions' => $this->formOptions(),
            'readOnly' => false,
        ]);
    }

    /**
     * Update the specified crop prediction.
     */
    public function update(CropPredictionRequest $request, CropPrediction $cropPrediction): RedirectResponse
    {
        $cropPrediction->update($this->payload($request));

        return to_route('crop-predictions.index')
            ->with('success', 'Crop prediction updated successfully.');
    }

    /**
     * Remove the specified crop prediction when no fertilizer records depend on it.
     */
    public function destroy(CropPrediction $cropPrediction): RedirectResponse
    {
        if ($cropPrediction->fertilizerPredictions()->exists()) {
            return to_route('crop-predictions.index')
                ->with('error', 'This crop prediction cannot be removed while fertilizer predictions reference it.');
        }

        $cropPrediction->delete();

        return to_route('crop-predictions.index')
            ->with('success', 'Crop prediction deleted successfully.');
    }

    /**
     * Relationships needed whenever a crop prediction is displayed.
     *
     * @return list<string>
     */
    private function relations(): array
    {
        return ['sensorReading', 'sensorDevice', 'farm'];
    }

    /**
     * Build bounded, eagerly-loaded select options for the crop prediction form.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'farms' => Farm::query()
                ->orderBy('farm_name')
                ->get(['id', 'farm_name']),
            'sensorDevices' => SensorDevice::query()
                ->with('farm:id,farm_name')
                ->orderBy('sensor_code')
                ->get(['id', 'farm_id', 'sensor_code', 'device_name']),
            'sensorReadings' => SensorReading::query()
                ->with('sensorDevice:id,farm_id,sensor_code,device_name')
                ->latest('recorded_at')
                ->limit(100)
                ->get(['id', 'sensor_id', 'recorded_at']),
        ];
    }

    /**
     * Keep the database default status when a form does not supply one.
     *
     * @return array<string, mixed>
     */
    private function payload(CropPredictionRequest $request): array
    {
        $payload = $request->validated();

        if (($payload['prediction_status'] ?? null) === null) {
            unset($payload['prediction_status']);
        }

        return $payload;
    }
}
