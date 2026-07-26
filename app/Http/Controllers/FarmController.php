<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\NormalizesIndexFilters;
use App\Http\Requests\FarmRequest;
use App\Models\Farm;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FarmController extends Controller
{
    use NormalizesIndexFilters;

    /**
     * Display a paginated farm directory.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $this->queryString($request, 'search'),
            'status' => $this->statusQuery($request),
            'farmer_id' => $this->uuidQuery($request, 'farmer_id'),
        ];

        $farms = Farm::query()
            ->with([
                'sensorDevices:id,farm_id,sensor_code,device_name,status,last_seen_at',
            ])
            ->withCount(['sensorDevices', 'alerts'])
            ->when($filters['search'] !== null, function (Builder $query) use ($filters): void {
                $search = '%'.$filters['search'].'%';

                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->whereLike('farm_name', $search)
                        ->orWhereLike('barangay', $search)
                        ->orWhereLike('municipality', $search)
                        ->orWhereLike('province', $search)
                        ->orWhereLike('current_crop', $search);
                });
            })
            ->when($filters['status'] !== null, function (Builder $query) use ($filters): void {
                $query->where('status', $filters['status']);
            })
            ->when($filters['farmer_id'] !== null, function (Builder $query) use ($filters): void {
                $query->where('farmer_id', $filters['farmer_id']);
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Farms/Index', [
            'farms' => $farms,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a farm.
     */
    public function create(): Response
    {
        return Inertia::render('Farms/Create');
    }

    /**
     * Store a newly created farm.
     */
    public function store(FarmRequest $request): RedirectResponse
    {
        Farm::query()->create($this->payload($request));

        return to_route('farms.index')->with('success', 'Farm created successfully.');
    }

    /**
     * Display a farm without introducing a separate duplicate detail page.
     */
    public function show(Farm $farm): Response
    {
        $farm->load([
            'sensorDevices' => fn ($query) => $query->latest('last_seen_at'),
            'thresholdSettings.sensorDevice',
            'alerts.sensorDevice',
        ])->loadCount(['sensorDevices', 'alerts', 'cropPredictions', 'fertilizerPredictions']);

        return Inertia::render('Farms/Edit', [
            'farm' => $farm,
            'readOnly' => true,
        ]);
    }

    /**
     * Show the form for editing a farm.
     */
    public function edit(Farm $farm): Response
    {
        return Inertia::render('Farms/Edit', [
            'farm' => $farm,
            'readOnly' => false,
        ]);
    }

    /**
     * Update the specified farm.
     */
    public function update(FarmRequest $request, Farm $farm): RedirectResponse
    {
        $farm->update($this->payload($request));

        return to_route('farms.index')->with('success', 'Farm updated successfully.');
    }

    /**
     * Remove the specified farm.
     */
    public function destroy(Farm $farm): RedirectResponse
    {
        if (
            $farm->sensorDevices()->exists()
            || $farm->cropPredictions()->exists()
            || $farm->fertilizerPredictions()->exists()
            || $farm->alerts()->exists()
            || $farm->thresholdSettings()->exists()
        ) {
            return to_route('farms.index')->with(
                'error',
                'This farm cannot be removed while operational records are still linked to it.',
            );
        }

        $farm->delete();

        return to_route('farms.index')->with('success', 'Farm removed successfully.');
    }

    /**
     * Preserve database defaults when an optional form status is blank.
     *
     * @return array<string, mixed>
     */
    private function payload(FarmRequest $request): array
    {
        $payload = $request->validated();

        if (($payload['status'] ?? null) === null) {
            unset($payload['status']);
        }

        return $payload;
    }
}
