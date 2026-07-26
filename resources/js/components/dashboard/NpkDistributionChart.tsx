import ReactECharts from 'echarts-for-react';
import { FlaskConical } from 'lucide-react';
import SectionHeading from './SectionHeading';
import type { DashboardAverages } from './types';

interface NpkDistributionChartProps {
    averages: DashboardAverages;
}

export default function NpkDistributionChart({ averages }: NpkDistributionChartProps) {
    const values = [
        averages.nitrogen ?? 0,
        averages.phosphorus ?? 0,
        averages.potassium ?? 0,
    ];
    const lowestIndex = values.every((value) => value === 0)
        ? null
        : values.indexOf(Math.min(...values));
    const nutrientNames = ['Nitrogen', 'Phosphorus', 'Potassium'];
    const maxValue = Math.max(80, ...values.map((value) => Math.ceil(value / 10) * 10));

    const npkOption = {
        animationDuration: 500,
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: '#ffffff',
            borderColor: '#dbe4dc',
            borderWidth: 1,
            textStyle: { color: '#1e293b' },
            valueFormatter: (value: number) => `${value} mg/kg`,
        },
        grid: {
            top: 16,
            right: 14,
            bottom: 12,
            left: 18,
            containLabel: true,
        },
        xAxis: {
            type: 'value',
            max: maxValue,
            axisLabel: { color: '#64748b', fontSize: 11 },
            splitLine: {
                lineStyle: { color: '#e7eee7', type: 'dashed' },
            },
        },
        yAxis: {
            type: 'category',
            data: nutrientNames,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: { color: '#334155', fontWeight: 600 },
        },
        series: [
            {
                type: 'bar',
                name: 'Network average',
                data: [
                    { value: values[0], itemStyle: { color: '#2f862f' } },
                    { value: values[1], itemStyle: { color: '#d97706' } },
                    { value: values[2], itemStyle: { color: '#0f766e' } },
                ],
                barWidth: 18,
                label: {
                    show: true,
                    position: 'right',
                    color: '#475569',
                    fontSize: 11,
                    formatter: '{c} mg/kg',
                },
                itemStyle: { borderRadius: [0, 8, 8, 0] },
            },
        ],
    };

    return (
        <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
            <SectionHeading
                eyebrow="Nutrient distribution"
                title="Network NPK profile"
                description="Average nutrient levels from stored sensor readings."
            />

            <ReactECharts
                option={npkOption}
                style={{ height: 236, width: '100%' }}
                opts={{ renderer: 'svg' }}
            />

            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700 shadow-sm">
                    <FlaskConical className="h-4 w-4" />
                </span>
                <p>
                    {lowestIndex === null
                        ? 'Nutrient averages will appear after sensor readings include NPK values.'
                        : `${nutrientNames[lowestIndex]} is currently the lowest average nutrient level in the network.`}
                </p>
            </div>
        </section>
    );
}
