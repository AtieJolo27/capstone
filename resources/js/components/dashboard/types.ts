import type { LucideIcon } from 'lucide-react';

export type SensorHealth = 'Healthy' | 'Warning' | 'Critical' | 'Offline';

export type DashboardStatTone =
    | 'healthy'
    | 'warning'
    | 'critical'
    | 'offline'
    | 'farms';

export type DashboardStat = {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone: DashboardStatTone;
};

export type FieldAlert = {
    id: string;
    title: string;
    description: string;
    farm: string;
    time: string;
    priority: 'Critical' | 'Warning';
    kind: 'moisture' | 'ph' | 'connection';
};

export type Announcement = {
    id: string;
    title: string;
    message: string;
    audience: string;
    publishedAt: string;
    priority: 'Advisory' | 'Important';
};

export type SensorReading = {
    id: string;
    farm: string;
    crop: string;
    health: SensorHealth;
    moisture: string;
    ph: string;
    temperature: string;
    humidity: string;
    updated: string;
};

export type DashboardAverages = {
    moisture: number | null;
    ph: number | null;
    soil_temperature: number | null;
    air_temperature: number | null;
    humidity: number | null;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
};

export type MoistureTrendPoint = {
    date: string;
    value: number;
};
