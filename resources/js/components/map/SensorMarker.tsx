import type { PathOptions } from 'leaflet';
import { CircleMarker, Popup } from 'react-leaflet';
import type { MapSensor } from '@/types/gis';

interface SensorMarkerProps {
    sensor: MapSensor;
}

function markerStyle(sensor: MapSensor): PathOptions {
    const status = sensor.status.toLowerCase();

    if (status.includes('critical') || sensor.unresolvedAlertCount > 1) {
        return { color: '#be123c', fillColor: '#f43f5e' };
    }

    if (
        status.includes('warning') ||
        sensor.unresolvedAlertCount === 1 ||
        sensor.latestReading?.isValid === false
    ) {
        return { color: '#b45309', fillColor: '#f59e0b' };
    }

    if (status.includes('offline') || status.includes('inactive')) {
        return { color: '#64748b', fillColor: '#94a3b8' };
    }

    return { color: '#047857', fillColor: '#10b981' };
}

function formatReading(value: number | null, unit: string): string {
    return value === null ? 'Not recorded' : `${value}${unit}`;
}

export default function SensorMarker({ sensor }: SensorMarkerProps) {
    if (sensor.latitude === null || sensor.longitude === null) {
        return null;
    }

    const colors = markerStyle(sensor);
    const title = sensor.deviceName?.trim() || sensor.sensorCode;

    return (
        <CircleMarker
            center={[sensor.latitude, sensor.longitude]}
            radius={8}
            pathOptions={{
                ...colors,
                fillOpacity: 1,
                opacity: 1,
                weight: 3,
            }}
        >
            <Popup>
                <div className="min-w-48">
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {sensor.sensorCode}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <span className="rounded-lg bg-slate-50 px-2 py-1.5 text-slate-600">
                            Moisture
                            <strong className="mt-0.5 block text-sm text-slate-800">
                                {formatReading(
                                    sensor.latestReading?.soilMoisture ?? null,
                                    '%',
                                )}
                            </strong>
                        </span>
                        <span className="rounded-lg bg-slate-50 px-2 py-1.5 text-slate-600">
                            Soil pH
                            <strong className="mt-0.5 block text-sm text-slate-800">
                                {formatReading(
                                    sensor.latestReading?.ph ?? null,
                                    '',
                                )}
                            </strong>
                        </span>
                    </div>
                    <p className="mt-3 text-xs font-medium text-slate-600">
                        Status: {sensor.status}
                    </p>
                </div>
            </Popup>
        </CircleMarker>
    );
}
