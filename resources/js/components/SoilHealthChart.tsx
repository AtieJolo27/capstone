import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";

const farms = [
    { name: "North Farm", value: 92 },
    { name: "East Farm", value: 80 },
    { name: "South Farm", value: 74 },
    { name: "West Farm", value: 65 },
    { name: "Central Farm", value: 88 },
];

const option = {
    animationDuration: 1200,

    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "shadow",
        },
        backgroundColor: "#ffffff",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        textStyle: {
            color: "#374151",
        },
        formatter: (params: any) => {
            const farm = params[0];

            return `
                <strong>${farm.name}</strong><br/>
                Farm Health Score:
                <strong>${farm.value}%</strong>
            `;
        },
    },

    grid: {
        left: "5%",
        right: "4%",
        top: "10%",
        bottom: "8%",
        containLabel: true,
    },

    xAxis: {
        type: "category",
        data: farms.map((farm) => farm.name),

        axisLine: {
            lineStyle: {
                color: "#D1D5DB",
            },
        },

        axisTick: {
            show: false,
        },

        axisLabel: {
            color: "#64748B",
            fontWeight: 500,
        },
    },

    yAxis: {
        type: "value",
        min: 0,
        max: 100,

        axisLine: {
            show: false,
        },

        axisTick: {
            show: false,
        },

        axisLabel: {
            formatter: "{value}%",
            color: "#64748B",
        },

        splitLine: {
            lineStyle: {
                color: "#E5E7EB",
                type: "dashed",
            },
        },
    },

    series: [
        {
            type: "bar",

            data: farms.map((farm) => ({
                value: farm.value,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: "#4ADE80",
                        },
                        {
                            offset: 0.5,
                            color: "#22C55E",
                        },
                        {
                            offset: 1,
                            color: "#14532D",
                        },
                    ]),
                },
            })),

            barWidth: "45%",

            label: {
                show: true,
                position: "top",
                formatter: "{c}%",
                color: "#14532D",
                fontWeight: "bold",
                fontSize: 13,
            },

            itemStyle: {
                borderRadius: [12, 12, 0, 0],
            },

            emphasis: {
                itemStyle: {
                    shadowBlur: 18,
                    shadowColor: "rgba(34,197,94,0.45)",
                },
            },

            markLine: {
                symbol: "none",

                lineStyle: {
                    color: "#16A34A",
                    width: 2,
                    type: "dashed",
                },

                label: {
                    formatter: "Target (80%)",
                    color: "#166534",
                    fontWeight: "bold",
                },

                data: [
                    {
                        yAxis: 80,
                    },
                ],
            },
        },
    ],
};

export default function SoilHealthChart() {
    return (
        <ReactECharts
            option={option}
            style={{ height: 340 }}
        />
    );
}