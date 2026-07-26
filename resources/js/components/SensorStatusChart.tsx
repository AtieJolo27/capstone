import ReactECharts from "echarts-for-react";

const option = {
    tooltip: {
        trigger: "item",
    },

    color: [
        "#256b25",
        "#5ed65e",
        "#63c263",
    ],

    series: [
        {
            type: "pie",
            radius: ["55%", "75%"],

            label: {
                formatter: "{b}\n{c}",
            },

            data: [
                {
                    value: 120,
                    name: "Online",
                },
                {
                    value: 15,
                    name: "Maintenance",
                },
                {
                    value: 8,
                    name: "Offline",
                },
            ],
        },
    ],
};

export default function SensorStatusChart() {
    return (
        <ReactECharts
            option={option}
            style={{ height: 320 }}
        />
    );
}