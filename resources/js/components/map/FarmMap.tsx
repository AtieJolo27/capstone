import 'leaflet/dist/leaflet.css';

import { geoJSON } from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    MapContainer,
    ScaleControl,
    TileLayer,
    useMap,
    ZoomControl,
} from 'react-leaflet';
import SensorMarker from '@/components/map/SensorMarker';
import ZoneLayer from '@/components/map/ZoneLayer';
import type { MapZone } from '@/types/gis';

const initialCenter: [number, number] = [0, 0];
const initialZoom = 2;

interface FarmMapProps {
    zones: MapZone[];
    selectedZone: MapZone | null;
    showAllFields: boolean;
    resetVersion: number;
    onZoneSelect: (zoneId: number) => void;
}

function fitZones(map: LeafletMap, zones: MapZone[]): void {
    if (zones.length === 0) {
        map.setView(initialCenter, initialZoom);

        return;
    }

    const boundaryLayer = geoJSON(zones.map((zone) => zone.geometry));
    const bounds = boundaryLayer.getBounds();

    if (bounds.isValid()) {
        map.fitBounds(bounds, {
            padding: [44, 44],
            maxZoom: zones.length === 1 ? 16 : 14,
        });
    }
}

interface MapViewportProps {
    zones: MapZone[];
    selectedZone: MapZone | null;
    resetVersion: number;
}

function MapViewport({ zones, selectedZone, resetVersion }: MapViewportProps) {
    const map = useMap();
    const initialFitComplete = useRef(false);

    useEffect(() => {
        if (initialFitComplete.current) {
            return;
        }

        fitZones(map, zones);
        initialFitComplete.current = true;
    }, [map, zones]);

    useEffect(() => {
        if (resetVersion > 0) {
            fitZones(map, zones);
        }
    }, [map, resetVersion, zones]);

    useEffect(() => {
        if (selectedZone !== null) {
            fitZones(map, [selectedZone]);
        }
    }, [map, selectedZone]);

    return null;
}

export default function FarmMap({
    zones,
    selectedZone,
    showAllFields,
    resetVersion,
    onZoneSelect,
}: FarmMapProps) {
    const [tileState, setTileState] = useState<'loading' | 'ready' | 'error'>(
        'loading',
    );
    const [tileVersion, setTileVersion] = useState(0);

    const retryTiles = () => {
        setTileState('loading');
        setTileVersion((version) => version + 1);
    };

    const zonesToRender = useMemo(() => {
        if (selectedZone === null || showAllFields) {
            return zones;
        }

        return [selectedZone];
    }, [selectedZone, showAllFields, zones]);
    const hasNoZones = zones.length === 0;
    const visibleSensors = selectedZone?.sensors ?? [];

    return (
        <div
            className="relative h-[min(58vh,620px)] min-h-[440px] overflow-hidden bg-slate-100"
            aria-busy={tileState === 'loading'}
        >
            <MapContainer
                center={initialCenter}
                zoom={initialZoom}
                zoomControl={false}
                scrollWheelZoom
                className="h-full w-full"
            >
                <MapViewport
                    zones={zones}
                    selectedZone={selectedZone}
                    resetVersion={resetVersion}
                />
                <TileLayer
                    key={tileVersion}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                    eventHandlers={{
                        tileload: () => setTileState('ready'),
                        tileerror: () => {
                            setTileState((currentState) =>
                                currentState === 'ready'
                                    ? currentState
                                    : 'error',
                            );
                        },
                    }}
                />
                <ScaleControl position="bottomleft" />
                <ZoomControl position="bottomright" />

                {zonesToRender.map((zone) => (
                    <ZoneLayer
                        key={zone.id}
                        zone={zone}
                        selected={zone.id === selectedZone?.id}
                        dimmed={
                            selectedZone !== null && zone.id !== selectedZone.id
                        }
                        onSelect={onZoneSelect}
                    />
                ))}

                {visibleSensors.map((sensor) => (
                    <SensorMarker key={sensor.id} sensor={sensor} />
                ))}
            </MapContainer>

            <div className="pointer-events-none absolute top-4 left-4 z-[500] max-w-[calc(100%-2rem)] rounded-xl border border-white/80 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold text-slate-700">
                    {hasNoZones
                        ? 'No mapped fields are available yet'
                        : selectedZone === null
                          ? 'Select a field boundary to show its sensors'
                          : `${visibleSensors.length} sensor${visibleSensors.length === 1 ? '' : 's'} assigned to this field`}
                </p>
            </div>

            {hasNoZones && tileState !== 'error' && (
                <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-5">
                    <div className="max-w-sm rounded-2xl border border-white/80 bg-white/95 p-5 text-center shadow-lg backdrop-blur">
                        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                            <AlertCircle
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </span>
                        <h2 className="mt-3 text-base font-bold text-slate-900">
                            No mapped fields yet
                        </h2>
                        <p className="mt-1.5 text-sm leading-6 text-slate-600">
                            The base map is ready. Add a zone with a valid
                            Polygon or MultiPolygon boundary to place a field
                            here.
                        </p>
                    </div>
                </div>
            )}

            {tileState === 'loading' && (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[500] flex justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/85 px-3 py-2 text-xs font-medium text-white shadow-lg">
                        <LoaderCircle
                            className="h-3.5 w-3.5 animate-spin"
                            aria-hidden="true"
                        />
                        Loading map tiles
                    </span>
                </div>
            )}

            {tileState === 'error' && (
                <div
                    role="alert"
                    className="absolute inset-0 z-[600] flex items-center justify-center bg-slate-50/90 p-5 backdrop-blur-sm"
                >
                    <div className="max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl ring-1 ring-slate-200">
                        <AlertCircle
                            className="mx-auto h-7 w-7 text-amber-600"
                            aria-hidden="true"
                        />
                        <h2 className="mt-3 text-base font-bold text-slate-900">
                            Map tiles could not load
                        </h2>
                        <p className="mt-1.5 text-sm leading-6 text-slate-500">
                            Check the connection and try loading the
                            OpenStreetMap layer again.
                        </p>
                        <button
                            type="button"
                            onClick={retryTiles}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-200 focus:outline-none"
                        >
                            <RefreshCw className="h-4 w-4" aria-hidden="true" />
                            Retry map
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
