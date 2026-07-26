export default function SensorTable() {
    const sensors = [
        {
            id: "SNS-001",
            farm: "North Farm",
            type: "Soil Moisture",
            reading: "32%",
            status: "Healthy",
        },
        {
            id: "SNS-002",
            farm: "East Farm",
            type: "Temperature",
            reading: "29°C",
            status: "Warning",
        },
        {
            id: "SNS-003",
            farm: "South Farm",
            type: "Humidity",
            reading: "74%",
            status: "Healthy",
        },
        {
            id: "SNS-004",
            farm: "West Farm",
            type: "pH Level",
            reading: "6.4",
            status: "Offline",
        },
        {
            id: "SNS-005",
            farm: "Central Farm",
            type: "Light Sensor",
            reading: "850 lux",
            status: "Healthy",
        },
    ];

    return (
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b px-6 py-5">

                <div>

                    <h2 className="text-xl font-bold text-slate-800">
                        Latest Sensor Readings
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Real-time data collected from deployed sensors
                    </p>

                </div>

                <button className="rounded-xl bg-[#144014] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#1E5A1E]">

                    View All

                </button>

            </div>

            <table className="w-full">

                <thead className="bg-slate-50">

                    <tr>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                            Sensor ID
                        </th>

                        <th className="text-left text-sm font-semibold text-slate-600">
                            Farm
                        </th>

                        <th className="text-left text-sm font-semibold text-slate-600">
                            Sensor Type
                        </th>

                        <th className="text-left text-sm font-semibold text-slate-600">
                            Reading
                        </th>

                        <th className="text-left text-sm font-semibold text-slate-600">
                            Status
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {sensors.map((sensor) => (
                        <tr
                            key={sensor.id}
                            className="border-t transition hover:bg-green-50"
                        >

                            <td className="px-6 py-4 font-medium text-slate-800">
                                {sensor.id}
                            </td>

                            <td>{sensor.farm}</td>

                            <td>{sensor.type}</td>

                            <td className="font-semibold text-[#144014]">
                                {sensor.reading}
                            </td>

                            <td>

                                <StatusBadge
                                    status={sensor.status}
                                />

                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: string;
}) {

    let style = "";

    switch (status) {

        case "Healthy":
            style =
                "bg-green-100 text-green-700";
            break;

        case "Warning":
            style =
                "bg-amber-100 text-amber-700";
            break;

        case "Offline":
            style =
                "bg-red-100 text-red-700";
            break;

        default:
            style =
                "bg-gray-100 text-gray-700";
    }

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}
        >
            {status}
        </span>
    );
}
