import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Clock,
    Gauge,
    MapPinned,
    SlidersHorizontal,
    Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type CalibrationStatus = 'Due today' | 'Scheduled' | 'Overdue' | 'In progress';
type WorkflowStep = 1 | 2 | 3;

type CalibrationTask = {
    id: string;
    sensor: string;
    farm: string;
    field: string;
    due: string;
    lastCalibrated: string;
    calibration: string;
    technician: string;
    status: CalibrationStatus;
};

const calibrationTasks: CalibrationTask[] = [
    {
        id: 'GP-CL-001',
        sensor: 'Soil probe 01',
        farm: 'Calamba Green Acres',
        field: 'North paddy',
        due: 'Today, 3:30 PM',
        lastCalibrated: '12 Apr 2026',
        calibration: 'Moisture + pH',
        technician: 'Marco L.',
        status: 'Due today',
    },
    {
        id: 'GP-BY-003',
        sensor: 'Soil probe 03',
        farm: 'Bay Organic Estate',
        field: 'Tomato block B',
        due: 'Today, 4:15 PM',
        lastCalibrated: '05 Apr 2026',
        calibration: 'pH verification',
        technician: 'Ana R.',
        status: 'Overdue',
    },
    {
        id: 'GP-LB-002',
        sensor: 'Soil probe 02',
        farm: 'Los Baños Cornfield',
        field: 'West corn row',
        due: 'Tomorrow, 9:00 AM',
        lastCalibrated: '18 Apr 2026',
        calibration: 'Moisture baseline',
        technician: 'Marco L.',
        status: 'Scheduled',
    },
    {
        id: 'GP-SR-004',
        sensor: 'Soil probe 04',
        farm: 'Sta. Rosa Farmstead',
        field: 'East garden',
        due: '24 Jul, 10:00 AM',
        lastCalibrated: '20 Apr 2026',
        calibration: 'Full calibration',
        technician: 'Ana R.',
        status: 'Scheduled',
    },
];

const statusStyles: Record<CalibrationStatus | 'Complete', string> = {
    'Due today': 'bg-amber-100 text-amber-800',
    Scheduled: 'bg-slate-100 text-slate-700',
    Overdue: 'bg-rose-100 text-rose-800',
    'In progress': 'bg-emerald-100 text-emerald-800',
    Complete: 'bg-emerald-100 text-emerald-800',
};

const filterOptions = ['All', 'Due today', 'Overdue', 'Scheduled'] as const;

const recentCalibrations = [
    {
        sensor: 'GP-CL-001',
        farm: 'Calamba Green Acres',
        check: 'Moisture + pH',
        result: 'Within tolerance',
        technician: 'Marco L.',
        completed: 'Today, 9:12 AM',
    },
    {
        sensor: 'GP-SR-004',
        farm: 'Sta. Rosa Farmstead',
        check: 'Full calibration',
        result: 'Within tolerance',
        technician: 'Ana R.',
        completed: 'Yesterday, 3:48 PM',
    },
    {
        sensor: 'GP-SI-006',
        farm: 'Siniloan Research Field',
        check: 'Moisture baseline',
        result: 'Adjustment applied',
        technician: 'Marco L.',
        completed: '18 Jul, 11:06 AM',
    },
];

export default function Calibration() {
    const [filter, setFilter] = useState<(typeof filterOptions)[number]>('All');
    const [selectedTaskId, setSelectedTaskId] = useState(
        calibrationTasks[0].id,
    );
    const [workflowStep, setWorkflowStep] = useState<WorkflowStep>(1);
    const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

    const visibleTasks = useMemo(
        () =>
            calibrationTasks.filter(
                (task) => filter === 'All' || task.status === filter,
            ),
        [filter],
    );
    const selectedTask = useMemo(
        () =>
            visibleTasks.find((task) => task.id === selectedTaskId) ??
            visibleTasks[0] ??
            calibrationTasks[0],
        [selectedTaskId, visibleTasks],
    );
    const selectedTaskIsComplete = completedTaskIds.includes(selectedTask.id);

    function selectTask(taskId: string) {
        setSelectedTaskId(taskId);
        setWorkflowStep(1);
    }

    function advanceWorkflow() {
        if (workflowStep < 3) {
            setWorkflowStep((current) => (current + 1) as WorkflowStep);

            return;
        }

        setCompletedTaskIds((current) =>
            current.includes(selectedTask.id)
                ? current
                : [...current, selectedTask.id],
        );
    }

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1480px] p-5 sm:p-7 lg:p-10">
                <div className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold tracking-[0.22em] text-emerald-700 uppercase">
                            Field quality control
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Calibration desk
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                            Keep each soil reading dependable with a focused
                            calibration queue and a clear, guided handoff.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
                        <ClipboardCheck className="h-5 w-5 text-emerald-700" />
                        <span>
                            <strong className="font-semibold">2 tasks</strong>{' '}
                            need attention today
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(310px,0.78fr)_minmax(0,1.42fr)] xl:gap-8">
                    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 pt-6 pb-5 sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Calibration queue
                                    </h2>
                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        Prioritized by due date and field
                                        condition.
                                    </p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600" aria-live="polite">
                                    {visibleTasks.length} shown
                                </span>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                            setFilter(option);
                                            setWorkflowStep(1);
                                        }}
                                        aria-pressed={filter === option}
                                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                            filter === option
                                                ? 'bg-emerald-700 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {visibleTasks.map((task) => {
                                const taskIsComplete =
                                    completedTaskIds.includes(task.id);
                                const taskStatus = taskIsComplete
                                    ? 'Complete'
                                    : task.status;
                                const isSelected = task.id === selectedTask.id;

                                return (
                                    <button
                                        key={task.id}
                                        type="button"
                                        onClick={() => selectTask(task.id)}
                                        className={`w-full px-5 py-5 text-left transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:px-6 ${
                                            isSelected
                                                ? 'bg-emerald-50/70'
                                                : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                                    taskIsComplete
                                                        ? 'bg-emerald-500'
                                                        : task.status ===
                                                            'Overdue'
                                                          ? 'bg-rose-500'
                                                          : task.status ===
                                                              'Due today'
                                                            ? 'bg-amber-500'
                                                            : 'bg-slate-400'
                                                }`}
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex flex-wrap items-center gap-2">
                                                    <strong className="text-sm text-slate-900">
                                                        {task.sensor}
                                                    </strong>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusStyles[taskStatus]}`}
                                                    >
                                                        {taskStatus}
                                                    </span>
                                                </span>
                                                <span className="mt-1 block truncate text-sm text-slate-500">
                                                    {task.farm} · {task.field}
                                                </span>
                                                <span className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                    <Clock className="h-3.5 w-3.5" />{' '}
                                                    {task.due}
                                                </span>
                                            </span>
                                            <ChevronRight
                                                className={`mt-1 h-4 w-4 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-300'}`}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-sm">
                        <div className="border-b border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_58%)] px-5 py-6 sm:px-7 sm:py-7">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-xs font-bold tracking-[0.18em] text-emerald-700 uppercase">
                                            Selected task
                                        </p>
                                        {selectedTaskIsComplete && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                                                <CheckCircle2 className="h-3.5 w-3.5" />{' '}
                                                Recorded
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                                        {selectedTask.sensor}
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {selectedTask.farm} ·{' '}
                                        {selectedTask.field}
                                    </p>
                                </div>
                                <div className="flex w-fit flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[selectedTaskIsComplete ? 'Complete' : selectedTask.status]}`}>
                                        {selectedTaskIsComplete ? 'Complete' : selectedTask.status}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                                        <MapPinned className="h-4 w-4 text-emerald-700" />{' '}
                                        {selectedTask.id}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white bg-white/85 p-3.5">
                                    <p className="text-xs font-medium text-slate-400">
                                        Calibration type
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {selectedTask.calibration}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white bg-white/85 p-3.5">
                                    <p className="text-xs font-medium text-slate-400">
                                        Last completed
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {selectedTask.lastCalibrated}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white bg-white/85 p-3.5">
                                    <p className="text-xs font-medium text-slate-400">
                                        Assigned to
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {selectedTask.technician}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-7">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        Guided workflow
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Complete each check in the field, then
                                        record the result.
                                    </p>
                                </div>
                                <span className="hidden text-sm font-semibold text-emerald-700 sm:block">
                                    Step {workflowStep} of 3
                                </span>
                            </div>

                            <div className="mt-6 grid gap-3 md:grid-cols-3">
                                {[
                                    {
                                        step: 1 as WorkflowStep,
                                        title: 'Inspect probe',
                                        detail: 'Clean and examine the sensor tip.',
                                        icon: Wrench,
                                    },
                                    {
                                        step: 2 as WorkflowStep,
                                        title: 'Set baseline',
                                        detail: 'Use the reference sample to align readings.',
                                        icon: SlidersHorizontal,
                                    },
                                    {
                                        step: 3 as WorkflowStep,
                                        title: 'Verify output',
                                        detail: 'Confirm readings are inside tolerance.',
                                        icon: Gauge,
                                    },
                                ].map(({ step, title, detail, icon: Icon }) => {
                                    const isCurrent = step === workflowStep;
                                    const isDone =
                                        selectedTaskIsComplete ||
                                        step < workflowStep;

                                    return (
                                        <button
                                            key={step}
                                            type="button"
                                            onClick={() =>
                                                setWorkflowStep(step)
                                            }
                                            aria-current={isCurrent ? 'step' : undefined}
                                            className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                                isCurrent
                                                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-emerald-200'
                                            }`}
                                        >
                                            <span
                                                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                                    isDone
                                                        ? 'bg-emerald-600 text-white'
                                                        : isCurrent
                                                          ? 'bg-emerald-100 text-emerald-700'
                                                          : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                {isDone ? (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                ) : (
                                                    <Icon className="h-4 w-4" />
                                                )}
                                            </span>
                                            <span className="mt-4 block text-sm font-bold text-slate-900">
                                                {title}
                                            </span>
                                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                                                {detail}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
                                {workflowStep === 1 && (
                                    <>
                                        <p className="text-xs font-bold tracking-[0.18em] text-emerald-300 uppercase">
                                            Prepare
                                        </p>
                                        <h4 className="mt-2 text-lg font-bold">
                                            Inspect and clean the probe
                                        </h4>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                            Check for soil buildup, corrosion,
                                            or damaged pins. Rinse the probe
                                            with distilled water and allow it to
                                            dry before continuing.
                                        </p>
                                    </>
                                )}
                                {workflowStep === 2 && (
                                    <>
                                        <p className="text-xs font-bold tracking-[0.18em] text-emerald-300 uppercase">
                                            Reference sample
                                        </p>
                                        <h4 className="mt-2 text-lg font-bold">
                                            Set the field baseline
                                        </h4>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                            Place the probe in the approved
                                            reference sample. Adjust the reading
                                            only after it has stabilized for at
                                            least 30 seconds.
                                        </p>
                                    </>
                                )}
                                {workflowStep === 3 && (
                                    <>
                                        <p className="text-xs font-bold tracking-[0.18em] text-emerald-300 uppercase">
                                            Final check
                                        </p>
                                        <h4 className="mt-2 text-lg font-bold">
                                            Verify accuracy before release
                                        </h4>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                            Compare the output against the
                                            expected moisture and pH values.
                                            Record any variance above the
                                            allowed tolerance for review.
                                        </p>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={advanceWorkflow}
                                    disabled={selectedTaskIsComplete}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {selectedTaskIsComplete
                                        ? 'Calibration recorded'
                                        : workflowStep === 3
                                          ? 'Record calibration'
                                          : 'Continue'}
                                    {!selectedTaskIsComplete && (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-7 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                    <section className="rounded-[26px] border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <CalendarDays className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Next calibration window
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Friday, 24 July · 9:00 AM–12:00 PM · South
                                    Laguna route
                                </p>
                            </div>
                        </div>
                    </section>
                    <section className="rounded-[26px] border border-amber-100 bg-amber-50 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                            <div>
                                <h2 className="font-bold text-amber-950">
                                    Attention needed
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-amber-800">
                                    One pH verification is overdue. Complete it
                                    before the next reporting cycle.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="mt-7 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <p className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">
                                Calibration record
                            </p>
                            <h2 className="mt-1 text-lg font-bold text-slate-900">
                                Recent field completions
                            </h2>
                        </div>
                        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            Reference: ±3% moisture · ±0.2 pH
                        </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentCalibrations.map((record) => (
                            <div key={`${record.sensor}-${record.completed}`} className="grid gap-3 px-5 py-4 sm:px-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.85fr)_auto] md:items-center">
                                <div>
                                    <p className="font-semibold text-slate-900">{record.sensor}</p>
                                    <p className="mt-1 text-sm text-slate-500">{record.farm}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-[0.12em] text-slate-400 uppercase">Check</p>
                                    <p className="mt-1 text-sm font-medium text-slate-700">{record.check}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-[0.12em] text-slate-400 uppercase">Result</p>
                                    <p className="mt-1 text-sm font-semibold text-emerald-700">{record.result}</p>
                                </div>
                                <div className="text-left text-sm text-slate-500 md:text-right">
                                    <p>{record.technician}</p>
                                    <p className="mt-1 text-xs text-slate-400">{record.completed}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
