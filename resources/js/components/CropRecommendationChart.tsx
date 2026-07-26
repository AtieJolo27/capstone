import ReactECharts from "echarts-for-react";

const option = {
    color: ["#16A34A"],

    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "shadow",
        },
    },

    grid: {
        left: "5%",
        right: "5%",
        bottom: "3%",
        top: "3%",
        containLabel: true,
    },

    xAxis: {
        type: "value",
        splitLine: {
            lineStyle: {
                color: "#E5E7EB",
            },
        },
    },

    yAxis: {
        type: "category",
        data: [
            "Rice",
            "Corn",
            "Tomato",
            "Eggplant",
            "Onion",
        ],
    },

    series: [
        {
            name: "Recommendations",
            type: "bar",
            data: [32, 22, 18, 15, 13],
            barWidth: 18,

            itemStyle: {
                borderRadius: [0, 10, 10, 0],
            },

            label: {
                show: true,
                position: "right",
                color: "#14532D",
                fontWeight: "bold",
            },
        },
    ],
};

export default function CropRecommendationChart() {
    return (
        <ReactECharts
            option={option}
            style={{ height: 320 }}
        />
    );
}