import type { MultiPolygon, Polygon } from 'geojson';

export type ZoneStatus = 'Healthy' | 'Warning' | 'Critical' | 'Inactive';

export type ZoneGeometry = Polygon | MultiPolygon;

export interface MapFarmOption {
    id: number;
    name: string;
}

export interface ZoneFarm {
    id: number;
    name: string;
    farmerName: string | null;
    location: string | null;
    address: string | null;
}

export interface LatestSensorReading {
    soilMoisture: number | null;
    soilTemperature: number | null;
    airTemperature: number | null;
    humidity: number | null;
    ph: number | null;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
    status: string | null;
    isValid: boolean;
    recordedAt: string | null;
}

export interface MapSensor {
    id: number;
    deviceName: string | null;
    sensorCode: string;
    status: string;
    batteryLevel: number | null;
    signalStrength: number | null;
    lastSeenAt: string | null;
    latitude: number | null;
    longitude: number | null;
    unresolvedAlertCount: number;
    latestReading: LatestSensorReading | null;
}

export interface MapZone {
    id: number;
    name: string;
    description: string | null;
    soilType: string | null;
    currentCrop: string | null;
    area: number | null;
    areaUnit: string | null;
    status: ZoneStatus;
    geometry: ZoneGeometry;
    center: {
        latitude: number;
        longitude: number;
    } | null;
    sensorCount: number;
    deployedSensorCount: number;
    lastUpdatedAt: string | null;
    farm: ZoneFarm | null;
    sensors: MapSensor[];
}

export interface InvalidMapZone {
    id: number;
    name: string;
}

export interface MapSummary {
    totalZones: number;
    renderableZones: number;
    invalidZones: number;
}
