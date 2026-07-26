<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\NormalizesIndexFilters;
use App\Http\Requests\ReportRequest;
use App\Models\Report;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    use NormalizesIndexFilters;

    /**
     * Display a paginated, filterable report archive.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $this->queryString($request, 'search'),
            'report_type' => $this->queryString($request, 'report_type', 50),
        ];

        $reports = Report::query()
            ->when($filters['search'] !== null, function (Builder $query) use ($filters): void {
                $search = '%'.$filters['search'].'%';

                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->whereLike('title', $search)
                        ->orWhereLike('description', $search)
                        ->orWhereLike('file_name', $search);
                });
            })
            ->when($filters['report_type'] !== null, function (Builder $query) use ($filters): void {
                $query->where('report_type', $filters['report_type']);
            })
            ->orderByDesc('generated_at')
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Reports/Index', [
            'reports' => $reports,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a report record.
     */
    public function create(): Response
    {
        return Inertia::render('Reports/Create', [
            'formOptions' => [],
        ]);
    }

    /**
     * Store a newly created report record.
     */
    public function store(ReportRequest $request): RedirectResponse
    {
        Report::query()->create($this->payload($request));

        return to_route('reports.index')->with('success', 'Report created successfully.');
    }

    /**
     * Display a report in a read-only form.
     */
    public function show(Report $report): Response
    {
        return Inertia::render('Reports/Edit', [
            'report' => $report,
            'formOptions' => [],
            'readOnly' => true,
        ]);
    }

    /**
     * Show the form for editing a report record.
     */
    public function edit(Report $report): Response
    {
        return Inertia::render('Reports/Edit', [
            'report' => $report,
            'formOptions' => [],
            'readOnly' => false,
        ]);
    }

    /**
     * Update the specified report record.
     */
    public function update(ReportRequest $request, Report $report): RedirectResponse
    {
        $report->update($this->payload($request));

        return to_route('reports.index')->with('success', 'Report updated successfully.');
    }

    /**
     * Remove the specified report record.
     */
    public function destroy(Report $report): RedirectResponse
    {
        $report->delete();

        return to_route('reports.index')->with('success', 'Report removed successfully.');
    }

    /**
     * Allow PostgreSQL to supply its generated_at default for blank values.
     *
     * @return array<string, mixed>
     */
    private function payload(ReportRequest $request): array
    {
        $payload = $request->validated();

        if (($payload['generated_at'] ?? null) === null) {
            unset($payload['generated_at']);
        }

        return $payload;
    }
}
