import ReactECharts from 'echarts-for-react';
import { CircleCheckBig, Leaf, Sprout } from 'lucide-react';
import SectionHeading from './SectionHeading';
import type { DashboardAverages } from './types';

interface SoilHealthAnalyticsProps {
    averages: DashboardAverages;
}

const clamp = (value: number): number => Math.max(0, Math.min(100, value));

const scoreForRange = (value: number | null, minimum: number, maximum: number): number | null => {
    if (value === null) {
        return null;
    }

    if (value >= minimum && value <= maximum) {
        return 100;
    }

    const distance = value < minimum ? minimum - value : value - maximum;

    return clamp(100 - distance * 12);
};

export default function SoilHealthAnalytics({ averages }: SoilHealthAnalyticsProps) {
    const values = [
        scoreForRange(averages.ph, 6, 7),
        scoreForRange(averages.moisture, 45, 65),
        scoreForRange(averages.soil_temperature, 20, 32),
        scoreForRange(averages.humidity, 60, 85),
        averages.nitrogen === null || averages.phosphorus === null || averages.potassium === null
            ? null
            : clamp(((averages.nitrogen + averages.phosphorus + averages.potassium) / 3) * 1.25),
    ];
    const scoredValues = values.map((value) => value ?? 0);
    const availableValues = values.filter((value): value is number => value !== null);
    const overallScore = availableValues.length
        ? Math.round(availableValues.reduce((total, value) => total + value, 0) / availableValues.length)
        : null;
    const withinRange = values.filter((value) => value !== null && value >= 80).length;
    const needsReview = values.filter((value) => value !== null && value < 80).length;

    const soilHealthOption = {
        animationDuration: 550,
        tooltip: {
            trigger: 'item',
            backgroundColor: '#ffffff',
            borderColor: '#dbe4dc',
            borderWidth: 1,
            textStyle: { color: '#1e293b' },
        },
        radar: {
            center: ['50%', '52%'],
            radius: '68%',
            indicator: [
                { name: 'pH balance', max: 100 },
                { name: 'Moisture', max: 100 },
                { name: 'Temperature', max: 100 },
                { name: 'Humidity', max: 100 },
                { name: 'Nutrients', max: 100 },
            ],
            axisName: { color: '#64748b', fontSize: 11, fontWeight: 600 },
            splitArea: { areaStyle: { color: ['#fbfdfb', '#f5f9f4'] } },
            splitLine: { lineStyle: { color: '#dbe7dc' } },
            axisLine: { lineStyle: { color: '#dbe7dc' } },
        },
        series: [
            {
                type: 'radar',
                name: 'Network soil health',
                data: [
                    {
                        value: scoredValues,
                        name: 'Current network score',
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: { color: '#1e5a1e', width: 2.5 },
                        itemStyle: { color: '#2f862f' },
                        areaStyle: { color: 'rgba(47, 134, 47, 0.20)' },
                    },
                ],
            },
        ],
    };

    const healthSignals = [
        {
            icon: CircleCheckBig,
            label: 'Indicators within guide range',
            value: `${withinRange} of ${availableValues.length}`,
            tone: 'text-emerald-700 bg-emerald-50',
        },
        {
            icon: Sprout,
            label: 'Indicators needing review',
            value: `${needsReview} of ${availableValues.length}`,
            tone: 'text-amber-700 bg-amber-50',
        },
    ];

    return (
        <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
            <SectionHeading
                eyebrow="Soil health analytics"
                title="Network soil condition"
                description="A guidance score calculated from current network averages."
            />

            <div className="mt-5 grid items-center gap-4 md:grid-cols-[minmax(220px,1fr)_minmax(190px,0.72fr)]">
                <ReactECharts
                    option={soilHealthOption}
                    style={{ height: 275, width: '100%' }}
                    opts={{ renderer: 'svg' }}
                />

                <div className="space-y-3">
                    <div className="rounded-2xl bg-[#144014] p-5 text-white">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                            <Leaf className="h-4 w-4" />
                            Average guidance score
                        </div>
                        <p className="mt-3 text-4xl font-bold tracking-tight">
                            {overallScore ?? '—'}{overallScore !== null ? <span className="text-xl text-emerald-200">/100</span> : null}
                        </p>
                        <p className="mt-2 text-sm leading-5 text-emerald-100">
                            {overallScore === null
                                ? 'Waiting for valid sensor readings.'
                                : 'Use this as an operational guide, alongside field assessment.'}
                        </p>
                    </div>

                    {healthSignals.map(({ icon: Icon, label, value, tone }) => (
                        <div key={label} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3">
                            <span className="flex min-w-0 items-center gap-2.5">
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <span className="text-sm text-slate-600">{label}</span>
                            </span>
                            <span className="shrink-0 text-sm font-bold text-slate-900">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
