<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\NormalizesIndexFilters;
use App\Http\Requests\AnnouncementRequest;
use App\Models\Announcement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    use NormalizesIndexFilters;

    /**
     * Display a paginated, filterable announcement library.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $this->queryString($request, 'search'),
            'status' => $this->statusQuery($request),
            'priority' => $this->queryString($request, 'priority', 20),
        ];

        $announcements = Announcement::query()
            ->when($filters['search'] !== null, function (Builder $query) use ($filters): void {
                $search = '%'.$filters['search'].'%';

                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->whereLike('title', $search)
                        ->orWhereLike('message', $search)
                        ->orWhereLike('audience', $search);
                });
            })
            ->when($filters['status'] !== null, function (Builder $query) use ($filters): void {
                $query->where('status', $filters['status']);
            })
            ->when($filters['priority'] !== null, function (Builder $query) use ($filters): void {
                $query->where('priority', $filters['priority']);
            })
            ->latest('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Announcements/Index', [
            'announcements' => $announcements,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating an announcement.
     */
    public function create(): Response
    {
        return Inertia::render('Announcements/Create', [
            'formOptions' => [],
        ]);
    }

    /**
     * Store a newly created announcement.
     */
    public function store(AnnouncementRequest $request): RedirectResponse
    {
        Announcement::query()->create($this->payload($request));

        return to_route('announcements.index')->with('success', 'Announcement created successfully.');
    }

    /**
     * Display an announcement in a read-only form.
     */
    public function show(Announcement $announcement): Response
    {
        return Inertia::render('Announcements/Edit', [
            'announcement' => $announcement,
            'formOptions' => [],
            'readOnly' => true,
        ]);
    }

    /**
     * Show the form for editing an announcement.
     */
    public function edit(Announcement $announcement): Response
    {
        return Inertia::render('Announcements/Edit', [
            'announcement' => $announcement,
            'formOptions' => [],
            'readOnly' => false,
        ]);
    }

    /**
     * Update the specified announcement.
     */
    public function update(AnnouncementRequest $request, Announcement $announcement): RedirectResponse
    {
        $announcement->update($this->payload($request));

        return to_route('announcements.index')->with('success', 'Announcement updated successfully.');
    }

    /**
     * Remove the specified announcement.
     */
    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return to_route('announcements.index')->with('success', 'Announcement removed successfully.');
    }

    /**
     * Preserve schema defaults when optional publication controls are blank.
     *
     * @return array<string, mixed>
     */
    private function payload(AnnouncementRequest $request): array
    {
        $payload = $request->validated();

        foreach (['audience', 'priority', 'status'] as $field) {
            if (($payload[$field] ?? null) === null) {
                unset($payload[$field]);
            }
        }

        return $payload;
    }
}
