import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    CloudSun,
    Droplets,
    Leaf,
    RefreshCw,
    Sprout,
    ThermometerSun,
    Wind,
} from 'lucide-react';
import { useMemo, useState  } from 'react';
import type {ReactNode} from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type Period = '7D' | '30D' | 'Season';
type FieldScope =
    | 'All monitored fields'
    | 'Calamba Green Acres'
    | 'Los Baños Cornfield'
    | 'Bay Organic Estate';

type DistributionItem = {
    name: string;
    value: number;
    color: string;
};

type FieldProfile = {
    moistureOffset: number;
    temperatureOffset: number;
    humidityOffset: number;
    ph: number;
    phTrend: number;
    npk: [number, number, number];
    crops: DistributionItem[];
    health: DistributionItem[];
};

const fieldProfiles: Record<FieldScope, FieldProfile> = {
    'All monitored fields': {
        moistureOffset: 0,
        temperatureOffset: 0,
        humidityOffset: 0,
        ph: 6.6,
        phTrend: 0.2,
        npk: [72, 58, 65],
        crops: [
            { name: 'Rice', value: 36, color: '#15803d' },
            { name: 'Corn', value: 25, color: '#d97706' },
            { name: 'Vegetables', value: 22, color: '#0f766e' },
            { name: 'Tomato', value: 17, color: '#e11d48' },
        ],
        health: [
            { name: 'Healthy', value: 82, color: '#10b981' },
            { name: 'Needs review', value: 12, color: '#f59e0b' },
            { name: 'Offline', value: 6, color: '#94a3b8' },
        ],
    },
    'Calamba Green Acres': {
        moistureOffset: 4,
        temperatureOffset: -0.4,
        humidityOffset: 4,
        ph: 6.8,
        phTrend: 0.1,
        npk: [78, 62, 68],
        crops: [
            { name: 'Rice', value: 58, color: '#15803d' },
            { name: 'Vegetables', value: 18, color: '#0f766e' },
            { name: 'Corn', value: 14, color: '#d97706' },
            { name: 'Tomato', value: 10, color: '#e11d48' },
        ],
        health: [
            { name: 'Healthy', value: 91, color: '#10b981' },
            { name: 'Needs review', value: 7, color: '#f59e0b' },
            { name: 'Offline', value: 2, color: '#94a3b8' },
        ],
    },
    'Los Baños Cornfield': {
        moistureOffset: -2,
        temperatureOffset: 0.5,
        humidityOffset: -3,
        ph: 6.2,
        phTrend: -0.1,
        npk: [64, 52, 57],
        crops: [
            { name: 'Corn', value: 61, color: '#d97706' },
            { name: 'Rice', value: 16, color: '#15803d' },
            { name: 'Vegetables', value: 13, color: '#0f766e' },
            { name: 'Tomato', value: 10, color: '#e11d48' },
        ],
        health: [
            { name: 'Healthy', value: 76, color: '#10b981' },
            { name: 'Needs review', value: 18, color: '#f59e0b' },
            { name: 'Offline', value: 6, color: '#94a3b8' },
        ],
    },
    'Bay Organic Estate': {
        moistureOffset: -5,
        temperatureOffset: 0.9,
        humidityOffset: -5,
        ph: 5.9,
        phTrend: -0.3,
        npk: [55, 46, 51],
        crops: [
            { name: 'Tomato', value: 42, color: '#e11d48' },
            { name: 'Vegetables', value: 31, color: '#0f766e' },
            { name: 'Rice', value: 16, color: '#15803d' },
            { name: 'Corn', value: 11, color: '#d97706' },
        ],
        health: [
            { name: 'Healthy', value: 63, color: '#10b981' },
            { name: 'Needs review', value: 24, color: '#f59e0b' },
            { name: 'Offline', value: 13, color: '#94a3b8' },
        ],
    },
};

const periodData: Record<
    Period,
    {
        label: string;
        caption: string;
        labels: string[];
        moisture: number[];
        temperature: number[];
        humidity: number[];
    }
> = {
    '7D': {
        label: 'Last 7 days',
        caption: '17–23 July 2026',
        labels: [
            'Thu 17',
            'Fri 18',
            'Sat 19',
            'Sun 20',
            'Mon 21',
            'Tue 22',
            'Today',
        ],
        moisture: [46, 48, 45, 50, 49, 53, 52],
        temperature: [29.1, 29.4, 30.2, 29.8, 30.6, 31.1, 30.4],
        humidity: [76, 73, 79, 74, 71, 69, 72],
    },
    '30D': {
        label: 'Last 30 days',
        caption: '24 June–23 July 2026',
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        moisture: [44, 47, 49, 52],
        temperature: [28.9, 29.6, 30.1, 30.4],
        humidity: [78, 75, 73, 72],
    },
    Season: {
        label: 'Current season',
        caption: 'May–July 2026',
        labels: ['May', 'June', 'July'],
        moisture: [41, 46, 52],
        temperature: [29.8, 30.2, 30.4],
        humidity: [80, 76, 72],
    },
};

function ChartPanel({
    eyebrow,
    title,
    description,
    action,
    children,
    className = '',
}: {
    eyebrow: string;
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 ${className}`}
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-700 uppercase">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function MetricCard({
    label,
    value,
    detail,
    trend,
    icon,
    tone,
}: {
    label: string;
    value: string;
    detail: string;
    trend?: 'up' | 'down';
    icon: ReactNode;
    tone: string;
}) {
    return (
        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
                <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
                >
                    {icon}
                </span>
                {trend && (
                    <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                            trend === 'up'
                                ? 'text-emerald-700'
                                : 'text-rose-600'
                        }`}
                    >
                        {trend === 'up' ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        vs. prior
                    </span>
                )}
            </div>
            <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                {label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {value}
            </p>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{detail}</p>
        </article>
    );
}

function getMoistureOption(labels: string[], values: number[]): EChartsOption {
    return {
        animationDuration: 450,
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#0f172a',
            borderWidth: 0,
            textStyle: { color: '#f8fafc' },
            padding: [9, 12],
        },
        grid: { left: 12, right: 12, top: 16, bottom: 8, containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: labels,
            axisTick: { show: false },
            axisLine: { lineStyle: { color: '#e2e8f0' } },
            axisLabel: { color: '#64748b', fontSize: 11, margin: 12 },
        },
        yAxis: {
            type: 'value',
            min: 35,
            max: 65,
            interval: 10,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
                color: '#64748b',
                fontSize: 11,
                formatter: '{value}%',
            },
            splitLine: { lineStyle: { color: '#eef2f7', type: 'dashed' } },
        },
        series: [
            {
                name: 'Soil moisture',
                type: 'line',
                smooth: true,
                data: values,
                symbol: 'circle',
                symbolSize: 7,
                lineStyle: { color: '#059669', width: 3 },
                itemStyle: {
                    color: '#059669',
                    borderColor: '#ffffff',
                    borderWidth: 2,
                },
                areaStyle: { color: 'rgba(16, 185, 129, 0.16)' },
                markLine: {
                    symbol: 'none',
                    lineStyle: { type: 'dashed', color: '#f59e0b' },
                    label: {
                        formatter: 'Target 45%',
                        color: '#b45309',
                        fontSize: 10,
                    },
                    data: [{ yAxis: 45 }],
                },
            },
        ],
    };
}

function getClimateOption(
    labels: string[],
    temperature: number[],
    humidity: number[],
): EChartsOption {
    return {
        animationDuration: 450,
        color: ['#ea580c', '#0284c7'],
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#0f172a',
            borderWidth: 0,
            textStyle: { color: '#f8fafc' },
            padding: [9, 12],
        },
        legend: {
            top: 0,
            right: 0,
            icon: 'circle',
            itemWidth: 8,
            itemHeight: 8,
            textStyle: { color: '#64748b', fontSize: 11 },
        },
        grid: { left: 12, right: 12, top: 40, bottom: 8, containLabel: true },
        xAxis: {
            type: 'category',
            data: labels,
            axisTick: { show: false },
            axisLine: { lineStyle: { color: '#e2e8f0' } },
            axisLabel: { color: '#64748b', fontSize: 11, margin: 12 },
        },
        yAxis: [
            {
                type: 'value',
                min: 24,
                max: 34,
                interval: 2,
                axisTick: { show: false },
                axisLine: { show: false },
                axisLabel: {
                    color: '#64748b',
                    fontSize: 11,
                    formatter: '{value}°',
                },
                splitLine: { lineStyle: { color: '#eef2f7', type: 'dashed' } },
            },
            {
                type: 'value',
                min: 50,
                max: 90,
                interval: 10,
                axisTick: { show: false },
                axisLine: { show: false },
                axisLabel: {
                    color: '#64748b',
                    fontSize: 11,
                    formatter: '{value}%',
                },
                splitLine: { show: false },
            },
        ],
        series: [
            {
                name: 'Temperature',
                type: 'line',
                yAxisIndex: 0,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 3 },
                data: temperature,
            },
            {
                name: 'Humidity',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 3 },
                areaStyle: { color: 'rgba(14, 165, 233, 0.1)' },
                data: humidity,
            },
        ],
    };
}

function getNpkOption(values: [number, number, number]): EChartsOption {
    return {
        animationDuration: 450,
        color: ['#0f766e', '#cbd5e1'],
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: '#0f172a',
            borderWidth: 0,
            textStyle: { color: '#f8fafc' },
            padding: [9, 12],
        },
        legend: {
            top: 0,
            right: 0,
            icon: 'roundRect',
            itemWidth: 10,
            itemHeight: 8,
            textStyle: { color: '#64748b', fontSize: 11 },
        },
        grid: { left: 12, right: 10, top: 42, bottom: 8, containLabel: true },
        xAxis: {
            type: 'value',
            max: 100,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
                color: '#64748b',
                fontSize: 11,
                formatter: '{value}%',
            },
            splitLine: { lineStyle: { color: '#eef2f7', type: 'dashed' } },
        },
        yAxis: {
            type: 'category',
            data: ['Nitrogen', 'Phosphorus', 'Potassium'],
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: { color: '#334155', fontSize: 12, fontWeight: 600 },
        },
        series: [
            {
                name: 'Current level',
                type: 'bar',
                data: values,
                barWidth: 12,
                itemStyle: { borderRadius: [0, 8, 8, 0] },
            },
            {
                name: 'Ideal range',
                type: 'bar',
                data: [75, 65, 70],
                barWidth: 12,
                itemStyle: { borderRadius: [0, 8, 8, 0] },
            },
        ],
    };
}

function getDistributionOption(
    items: DistributionItem[],
    centerText: string,
): EChartsOption {
    return {
        animationDuration: 450,
        tooltip: {
            trigger: 'item',
            backgroundColor: '#0f172a',
            borderWidth: 0,
            textStyle: { color: '#f8fafc' },
            padding: [9, 12],
            formatter: '{b}<br/><b>{c}%</b> of monitored fields',
        },
        series: [
            {
                type: 'pie',
                radius: ['58%', '78%'],
                center: ['50%', '49%'],
                avoidLabelOverlap: true,
                label: { show: false },
                labelLine: { show: false },
                itemStyle: {
                    borderColor: '#ffffff',
                    borderWidth: 4,
                    borderRadius: 8,
                },
                emphasis: {
                    scale: true,
                    scaleSize: 7,
                    label: {
                        show: true,
                        formatter: centerText,
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: 12,
                    },
                },
                data: items.map((item) => ({
                    name: item.name,
                    value: item.value,
                    itemStyle: { color: item.color },
                })),
            },
        ],
    };
}

function DistributionLegend({ items }: { items: DistributionItem[] }) {
    return (
        <ul className="space-y-2.5">
            {items.map((item) => (
                <li
                    key={item.name}
                    className="flex items-center justify-between gap-3 text-sm"
                >
                    <span className="flex min-w-0 items-center gap-2 text-slate-600">
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.name}</span>
                    </span>
                    <strong className="text-slate-900">{item.value}%</strong>
                </li>
            ))}
        </ul>
    );
}

export default function HistoricalAnalytics() {
    const [period, setPeriod] = useState<Period>('7D');
    const [fieldScope, setFieldScope] = useState<FieldScope>(
        'All monitored fields',
    );

    const profile = fieldProfiles[fieldScope];
    const selectedPeriod = periodData[period];

    const values = useMemo(() => {
        const moisture = selectedPeriod.moisture.map((value) =>
            Math.min(64, Math.max(35, value + profile.moistureOffset)),
        );
        const temperature = selectedPeriod.temperature.map((value) =>
            Number((value + profile.temperatureOffset).toFixed(1)),
        );
        const humidity = selectedPeriod.humidity.map((value) =>
            Math.min(88, Math.max(50, value + profile.humidityOffset)),
        );

        return { moisture, temperature, humidity };
    }, [profile, selectedPeriod]);

    const average = (series: number[]) =>
        series.reduce((sum, value) => sum + value, 0) / series.length;

    const averageMoisture = Math.round(average(values.moisture));
    const averageTemperature = average(values.temperature).toFixed(1);
    const averageHumidity = Math.round(average(values.humidity));
    const onlineSensors = profile.health.find(
        (item) => item.name === 'Healthy',
    )?.value;

    const lastUpdated = `${selectedPeriod.caption} · synced 8 min ago`;

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1540px] p-5 sm:p-7 lg:p-10">
                <section className="overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900 px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8 lg:px-10">
                    <div className="flex flex-col justify-between gap-7 xl:flex-row xl:items-end">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.19em] text-emerald-200 uppercase">
                                <Leaf className="h-4 w-4" />
                                Historical analytics
                            </div>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Read the story beneath the soil.
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/80">
                                Compare field conditions across time, identify
                                emerging nutrient gaps, and turn sensor
                                observations into a clearer growing plan.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div aria-label="Data coverage: 24 fields and 143 active sensors" className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
                                <p className="text-[10px] font-bold tracking-[0.16em] text-emerald-200/80 uppercase">
                                    Data coverage
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                    24 fields · 143 active sensors
                                </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-950">
                                <CheckCircle2 className="h-4 w-4" />
                                All feeds synced
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:p-5">
                    <div
                        className="flex flex-wrap items-center gap-2"
                        role="tablist"
                        aria-label="Analytics period"
                    >
                        {(Object.keys(periodData) as Period[]).map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setPeriod(item)}
                                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${
                                    period === item
                                        ? 'bg-emerald-700 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                                }`}
                                aria-pressed={period === item}
                                aria-selected={period === item}
                                role="tab"
                            >
                                {periodData[item].label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <p className="flex items-center gap-2 px-1 text-xs font-medium text-slate-500">
                            <CalendarDays className="h-4 w-4 text-emerald-700" />
                            {selectedPeriod.caption}
                        </p>
                        <label className="relative block">
                            <span className="sr-only">Choose field scope</span>
                            <select
                                value={fieldScope}
                                onChange={(event) =>
                                    setFieldScope(
                                        event.target.value as FieldScope,
                                    )
                                }
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3.5 text-sm font-semibold text-slate-700 transition outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 sm:w-60"
                            >
                                {(
                                    Object.keys(fieldProfiles) as FieldScope[]
                                ).map((scope) => (
                                    <option key={scope} value={scope}>
                                        {scope}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </label>
                    </div>
                </section>

                <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Average moisture"
                        value={`${averageMoisture}%`}
                        detail="Within the 45–60% operating band"
                        trend="up"
                        tone="bg-emerald-50 text-emerald-700"
                        icon={<Droplets className="h-5 w-5" />}
                    />
                    <MetricCard
                        label="Average pH"
                        value={profile.ph.toFixed(1)}
                        detail={
                            profile.ph >= 6.0 && profile.ph <= 7.0
                                ? 'Balanced for most monitored crops'
                                : 'Review liming plan for this field'
                        }
                        trend={profile.phTrend >= 0 ? 'up' : 'down'}
                        tone="bg-emerald-50 text-emerald-700"
                        icon={<Sprout className="h-5 w-5" />}
                    />
                    <MetricCard
                        label="Mean temperature"
                        value={`${averageTemperature}°C`}
                        detail="Weekly field-level daytime reading"
                        trend="up"
                        tone="bg-amber-50 text-amber-700"
                        icon={<ThermometerSun className="h-5 w-5" />}
                    />
                    <MetricCard
                        label="Relative humidity"
                        value={`${averageHumidity}%`}
                        detail={`${onlineSensors}% of sensors reporting normally`}
                        trend="down"
                        tone="bg-slate-100 text-slate-700"
                        icon={<Wind className="h-5 w-5" />}
                    />
                </section>

                <section className="mt-8">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-700 uppercase">
                                Field conditions
                            </p>
                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                Moisture and microclimate over time
                            </h2>
                        </div>
                        <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <RefreshCw className="h-3.5 w-3.5 text-emerald-700" />
                            {lastUpdated}
                        </p>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
                        <ChartPanel
                            eyebrow="Daily soil moisture"
                            title="Root-zone moisture"
                            description="Field average from the selected monitoring scope."
                            action={
                                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                    Target 45–60%
                                </span>
                            }
                        >
                            <ReactECharts
                                option={getMoistureOption(
                                    selectedPeriod.labels,
                                    values.moisture,
                                )}
                                style={{ height: 292 }}
                                notMerge
                                lazyUpdate
                            />
                        </ChartPanel>

                        <ChartPanel
                            eyebrow="Weekly temperature"
                            title="Climate pattern"
                            description="Temperature and humidity at sensor height."
                            action={
                                <CloudSun className="h-5 w-5 text-amber-500" />
                            }
                        >
                            <ReactECharts
                                option={getClimateOption(
                                    selectedPeriod.labels,
                                    values.temperature,
                                    values.humidity,
                                )}
                                style={{ height: 292 }}
                                notMerge
                                lazyUpdate
                            />
                        </ChartPanel>
                    </div>
                </section>

                <section className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <ChartPanel
                        eyebrow="Nutrient balance"
                        title="NPK comparison"
                        description="Current field readings compared with the crop-ready range."
                        action={
                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                Soil sample 23 Jul
                            </span>
                        }
                    >
                        <ReactECharts
                            option={getNpkOption(profile.npk)}
                            style={{ height: 250 }}
                            notMerge
                            lazyUpdate
                        />
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                            <span>
                                <strong className="text-slate-700">N</strong>{' '}
                                supports leafy growth
                            </span>
                            <span>
                                <strong className="text-slate-700">P</strong>{' '}
                                supports root development
                            </span>
                            <span>
                                <strong className="text-slate-700">K</strong>{' '}
                                supports crop resilience
                            </span>
                        </div>
                    </ChartPanel>

                    <section className="overflow-hidden rounded-3xl bg-[#f6f1e7] p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.18em] text-amber-800 uppercase">
                                    Soil chemistry
                                </p>
                                <h2 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
                                    pH outlook
                                </h2>
                            </div>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-amber-700 shadow-sm">
                                <Sprout className="h-5 w-5" />
                            </span>
                        </div>
                        <div className="mt-7 flex items-end gap-3">
                            <p className="text-5xl font-bold tracking-tight text-slate-900">
                                {profile.ph.toFixed(1)}
                            </p>
                            <p className="pb-1.5 text-sm font-semibold text-amber-800">
                                {profile.ph >= 6.0 && profile.ph <= 7.0
                                    ? 'In a stable range'
                                    : 'Needs correction'}
                            </p>
                        </div>
                        <div className="mt-6 h-3 rounded-full bg-amber-100 p-0.5">
                            <div className="relative h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-500">
                                <span
                                    className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-4 border-white bg-slate-900 shadow"
                                    style={{
                                        left: `${Math.min(
                                            92,
                                            Math.max(
                                                8,
                                                ((profile.ph - 4) / 4) * 100,
                                            ),
                                        )}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mt-2 flex justify-between text-[11px] font-semibold text-amber-800/75">
                            <span>Acidic 4.0</span>
                            <span>Preferred 6.0–7.0</span>
                            <span>Alkaline 8.0</span>
                        </div>
                        <p className="mt-7 border-t border-amber-900/10 pt-5 text-sm leading-6 text-slate-600">
                            {profile.ph >= 6.0 && profile.ph <= 7.0
                                ? 'The soil is well-positioned for nutrient uptake. Keep the current amendment schedule and sample again after the next rainfall.'
                                : 'This field is trending acidic. Review compost and lime application before the next crop cycle.'}
                        </p>
                    </section>
                </section>

                <section className="mt-8 pb-4">
                    <div>
                        <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-700 uppercase">
                            Planning signals
                        </p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Where to focus next
                        </h2>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <ChartPanel
                            eyebrow="Crop recommendation mix"
                            title="Recommended crop distribution"
                            description="Current recommendations based on field condition and crop fit."
                        >
                            <div className="grid items-center gap-4 sm:grid-cols-[1fr_0.8fr]">
                                <ReactECharts
                                    option={getDistributionOption(
                                        profile.crops,
                                        'Crop\nfit',
                                    )}
                                    style={{ height: 220 }}
                                    notMerge
                                    lazyUpdate
                                />
                                <DistributionLegend items={profile.crops} />
                            </div>
                        </ChartPanel>

                        <ChartPanel
                            eyebrow="Sensor fleet"
                            title="Sensor health distribution"
                            description="Reporting state for sensors in the selected monitoring scope."
                        >
                            <div className="grid items-center gap-4 sm:grid-cols-[1fr_0.8fr]">
                                <ReactECharts
                                    option={getDistributionOption(
                                        profile.health,
                                        'Sensor\nhealth',
                                    )}
                                    style={{ height: 220 }}
                                    notMerge
                                    lazyUpdate
                                />
                                <div>
                                    <DistributionLegend
                                        items={profile.health}
                                    />
                                    <div className="mt-5 rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-600">
                                        <strong className="text-slate-800">
                                            {100 - (onlineSensors ?? 0)}% need
                                            attention.
                                        </strong>{' '}
                                        Prioritize low battery checks before the
                                        next field round.
                                    </div>
                                </div>
                            </div>
                        </ChartPanel>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
