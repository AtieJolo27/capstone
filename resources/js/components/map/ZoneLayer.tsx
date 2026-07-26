import type { PathOptions } from 'leaflet';
import { GeoJSON, Tooltip } from 'react-leaflet';
import type { MapZone, ZoneStatus } from '@/types/gis';

const statusStyles: Record<
    ZoneStatus,
    Pick<PathOptions, 'color' | 'fillColor'>
> = {
    Healthy: { color: '#047857', fillColor: '#10b981' },
    Warning: { color: '#b45309', fillColor: '#f59e0b' },
    Critical: { color: '#be123c', fillColor: '#f43f5e' },
    Inactive: { color: '#64748b', fillColor: '#94a3b8' },
};

interface ZoneLayerProps {
    zone: MapZone;
    selected: boolean;
    dimmed: boolean;
    onSelect: (zoneId: number) => void;
}

export default function ZoneLayer({
    zone,
    selected,
    dimmed,
    onSelect,
}: ZoneLayerProps) {
    const statusStyle = statusStyles[zone.status];
    const pathOptions: PathOptions = {
        color: statusStyle.color,
        fillColor: statusStyle.fillColor,
        fillOpacity: dimmed ? 0.05 : selected ? 0.3 : 0.16,
        opacity: dimmed ? 0.38 : 0.95,
        weight: selected ? 3 : 2,
    };

    return (
        <GeoJSON
            data={zone.geometry}
            style={() => pathOptions}
            eventHandlers={{
                click: () => onSelect(zone.id),
            }}
        >
            <Tooltip sticky direction="top" opacity={0.95}>
                <div className="min-w-36">
                    <p className="font-semibold text-slate-900">{zone.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {zone.farm?.name ?? 'Unassigned farm'}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-emerald-800">
                        {zone.status}
                    </p>
                </div>
            </Tooltip>
        </GeoJSON>
    );
}
