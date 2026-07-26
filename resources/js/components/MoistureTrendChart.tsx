import ReactECharts from "echarts-for-react";

const option = {
    color: ["#22C55E"],

    tooltip: {
        trigger: "axis",
        backgroundColor: "#ffffff",
        borderColor: "#D1D5DB",
        borderWidth: 1,
        textStyle: {
            color: "#374151",
        },
        formatter: (params: any) => {
            return `
                <strong>${params[0].axisValue}</strong><br/>
                Soil Moisture: <strong>${params[0].value}%</strong>
            `;
        },
    },

    grid: {
        left: "4%",
        right: "4%",
        top: "8%",
        bottom: "8%",
        containLabel: true,
    },

    xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

        axisLine: {
            lineStyle: {
                color: "#CBD5E1",
            },
        },

        axisTick: {
            show: false,
        },

        axisLabel: {
            color: "#64748B",
        },
    },

    yAxis: {
        type: "value",
        min: 20,
        max: 70,

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
            name: "Soil Moisture",

            type: "line",

            smooth: true,

            data: [42, 45, 39, 48, 46, 50, 52],

            symbol: "circle",

            symbolSize: 10,

            lineStyle: {
                width: 4,
                color: "#16A34A",
            },

            itemStyle: {
                color: "#15803D",
                borderColor: "#ffffff",
                borderWidth: 3,
            },

            areaStyle: {
                color: {
                    type: "linear",
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,

                    colorStops: [
                        {
                            offset: 0,
                            color: "rgba(34,197,94,0.45)",
                        },
                        {
                            offset: 1,
                            color: "rgba(34,197,94,0.03)",
                        },
                    ],
                },
            },

            markLine: {
                symbol: "none",

                lineStyle: {
                    color: "#F59E0B",
                    width: 2,
                    type: "dashed",
                },

                label: {
                    formatter: "Optimal Moisture",
                    color: "#B45309",
                },

                data: [
                    {
                        yAxis: 45,
                    },
                ],
            },
        },
    ],
};

export default function MoistureTrendChart() {
    return (
        <ReactECharts
            option={option}
            style={{ height: 320 }}
        />
    );
}