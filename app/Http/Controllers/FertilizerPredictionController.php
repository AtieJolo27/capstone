<?php

namespace App\Http\Controllers;

use App\Http\Requests\FertilizerPredictionRequest;
use App\Models\CropPrediction;
use App\Models\Farm;
use App\Models\FertilizerPrediction;
use App\Models\SensorDevice;
use App\Models\SensorReading;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FertilizerPredictionController extends Controller
{
    /**
     * Display a paginated list of fertilizer predictions.
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

        $fertilizerPredictions = FertilizerPrediction::query()
            ->with($this->relations())
            ->when($search !== '', function (Builder $query) use ($search): void {
                $pattern = "%{$search}%";

                $query->where(function (Builder $query) use ($pattern): void {
                    $query
                        ->whereLike('best_crop', $pattern)
                        ->orWhereLike('best_fertilizer', $pattern)
                        ->orWhereLike('application_unit', $pattern)
                        ->orWhereLike('model_name', $pattern)
                        ->orWhereLike('model_version', $pattern)
                        ->orWhereHas('farm', fn (Builder $farm): Builder => $farm->whereLike('farm_name', $pattern))
                        ->orWhereHas('sensorDevice', function (Builder $sensor) use ($pattern): void {
                            $sensor
                                ->whereLike('sensor_code', $pattern)
                                ->orWhereLike('device_name', $pattern);
                        })
                        ->orWhereHas('cropPrediction', fn (Builder $cropPrediction): Builder => $cropPrediction->whereLike('best_crop', $pattern));
                });
            })
            ->when($status !== '', fn (Builder $query): Builder => $query->where('prediction_status', $status))
            ->when(isset($filters['farm_id']), fn (Builder $query): Builder => $query->where('farm_id', $filters['farm_id']))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('FertilizerPredictions/Index', [
            'fertilizerPredictions' => $fertilizerPredictions,
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
     * Show the form for creating a fertilizer prediction.
     */
    public function create(): Response
    {
        return Inertia::render('FertilizerPredictions/Create', [
            'formOptions' => $this->formOptions(),
        ]);
    }

    /**
     * Store a newly created fertilizer prediction.
     */
    public function store(FertilizerPredictionRequest $request): RedirectResponse
    {
        FertilizerPrediction::query()->create($this->payload($request));

        return to_route('fertilizer-predictions.index')
            ->with('success', 'Fertilizer prediction created successfully.');
    }

    /**
     * Display the specified fertilizer prediction using the edit page in read-only mode.
     */
    public function show(FertilizerPrediction $fertilizerPrediction): Response
    {
        return Inertia::render('FertilizerPredictions/Edit', [
            'fertilizerPrediction' => $fertilizerPrediction->load($this->relations()),
            'formOptions' => $this->formOptions(),
            'readOnly' => true,
        ]);
    }

    /**
     * Show the form for editing the specified fertilizer prediction.
     */
    public function edit(FertilizerPrediction $fertilizerPrediction): Response
    {
        return Inertia::render('FertilizerPredictions/Edit', [
            'fertilizerPrediction' => $fertilizerPrediction->load($this->relations()),
            'formOptions' => $this->formOptions(),
            'readOnly' => false,
        ]);
    }

    /**
     * Update the specified fertilizer prediction.
     */
    public function update(FertilizerPredictionRequest $request, FertilizerPrediction $fertilizerPrediction): RedirectResponse
    {
        $fertilizerPrediction->update($this->payload($request));

        return to_route('fertilizer-predictions.index')
            ->with('success', 'Fertilizer prediction updated successfully.');
    }

    /**
     * Remove the specified fertilizer prediction.
     */
    public function destroy(FertilizerPrediction $fertilizerPrediction): RedirectResponse
    {
        $fertilizerPrediction->delete();

        return to_route('fertilizer-predictions.index')
            ->with('success', 'Fertilizer prediction deleted successfully.');
    }

    /**
     * Relationships needed whenever a fertilizer prediction is displayed.
     *
     * @return list<string>
     */
    private function relations(): array
    {
        return ['cropPrediction', 'sensorReading', 'sensorDevice', 'farm'];
    }

    /**
     * Build bounded, eagerly-loaded select options for the fertilizer prediction form.
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
            'cropPredictions' => CropPrediction::query()
                ->with([
                    'sensorReading:id,sensor_id,recorded_at',
                    'sensorDevice:id,farm_id,sensor_code,device_name',
                    'farm:id,farm_name',
                ])
                ->latest()
                ->limit(100)
                ->get(['id', 'reading_id', 'sensor_id', 'farm_id', 'best_crop', 'created_at']),
        ];
    }

    /**
     * Keep the database default status when a form does not supply one.
     *
     * @return array<string, mixed>
     */
    private function payload(FertilizerPredictionRequest $request): array
    {
        $payload = $request->validated();

        if (($payload['prediction_status'] ?? null) === null) {
            unset($payload['prediction_status']);
        }

        return $payload;
    }
}
