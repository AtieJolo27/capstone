import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import SectionHeading from './SectionHeading';
import type { MoistureTrendPoint } from './types';

export type MoistureRange = '7d' | '30d';

interface MoistureTrendChartProps {
    range: MoistureRange;
    onRangeChange: (range: MoistureRange) => void;
    trend: MoistureTrendPoint[];
}

const labelForDate = (value: string, range: MoistureRange): string => (
    new Intl.DateTimeFormat('en-PH', {
        month: range === '7d' ? undefined : 'short',
        day: 'numeric',
        weekday: range === '7d' ? 'short' : undefined,
    }).format(new Date(`${value}T00:00:00`))
);

export default function MoistureTrendChart({
    range,
    onRangeChange,
    trend,
}: MoistureTrendChartProps) {
    const data = useMemo(() => trend.slice(range === '7d' ? -7 : -30), [range, trend]);
    const average = data.length
        ? data.reduce((total, point) => total + point.value, 0) / data.length
        : null;
    const labels = data.map((point) => labelForDate(point.date, range));
    const values = data.map((point) => point.value);

    const moistureOption = {
        animationDuration: 450,
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#ffffff',
            borderColor: '#dbe4dc',
            borderWidth: 1,
            textStyle: { color: '#1e293b' },
            valueFormatter: (value: number) => `${value}%`,
        },
        grid: {
            top: 22,
            right: 16,
            bottom: 8,
            left: 8,
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: labels,
            axisLine: { lineStyle: { color: '#dbe4dc' } },
            axisTick: { show: false },
            axisLabel: { color: '#64748b', fontSize: 11 },
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: {
                color: '#64748b',
                fontSize: 11,
                formatter: '{value}%',
            },
            splitLine: {
                lineStyle: {
                    color: '#e7eee7',
                    type: 'dashed',
                },
            },
        },
        series: [
            {
                name: 'Average moisture',
                type: 'line',
                smooth: true,
                data: values,
                symbol: 'circle',
                symbolSize: 7,
                lineStyle: { color: '#2f862f', width: 3 },
                itemStyle: {
                    color: '#1e5a1e',
                    borderColor: '#ffffff',
                    borderWidth: 2,
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(47, 134, 47, 0.25)' },
                            { offset: 1, color: 'rgba(47, 134, 47, 0.02)' },
                        ],
                    },
                },
                markLine: {
                    symbol: 'none',
                    lineStyle: {
                        color: '#d97706',
                        type: 'dashed',
                    },
                    label: {
                        color: '#92400e',
                        fontSize: 10,
                        formatter: 'Irrigation guide',
                    },
                    data: [{ yAxis: 45 }],
                },
            },
        ],
    };

    return (
        <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
            <SectionHeading
                eyebrow="Moisture trends"
                title="Average field moisture"
                description={data.length ? `Daily averages from the last ${data.length} reporting days.` : 'No stored moisture readings in this period.'}
                action={(
                    <div className="flex rounded-xl bg-slate-100 p-1">
                        {(['7d', '30d'] as MoistureRange[]).map((option) => (
                            <button
                                key={option}
                                type="button"
                                aria-pressed={range === option}
                                onClick={() => onRangeChange(option)}
                                className={range === option
                                    ? 'rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm'
                                    : 'rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-800'}
                            >
                                {option === '7d' ? '7 days' : '30 days'}
                            </button>
                        ))}
                    </div>
                )}
            />

            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-950">
                    {average === null ? '—' : `${average.toFixed(1)}%`}
                </span>
                <span className="text-sm font-medium text-emerald-700">
                    Suggested range: 45–65%
                </span>
            </div>
            <ReactECharts
                option={moistureOption}
                style={{ height: 245, width: '100%' }}
                opts={{ renderer: 'svg' }}
            />
        </section>
    );
}
