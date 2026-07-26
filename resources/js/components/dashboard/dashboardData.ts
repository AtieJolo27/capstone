import {
    AlertTriangle,
    CloudOff,
    HeartPulse,
    MapPinned,
    OctagonAlert,
} from 'lucide-react';
import type {
    Announcement,
    DashboardStat,
    FieldAlert,
    SensorReading,
} from './types';

export const dashboardStats: DashboardStat[] = [
    {
        label: 'Healthy sensors',
        value: '128',
        detail: '92% of the network is reporting normally',
        icon: HeartPulse,
        tone: 'healthy',
    },
    {
        label: 'Warning sensors',
        value: '12',
        detail: 'Readings nearing a field threshold',
        icon: AlertTriangle,
        tone: 'warning',
    },
    {
        label: 'Critical sensors',
        value: '3',
        detail: 'Require field review today',
        icon: OctagonAlert,
        tone: 'critical',
    },
    {
        label: 'Offline sensors',
        value: '5',
        detail: 'No report received in the last hour',
        icon: CloudOff,
        tone: 'offline',
    },
    {
        label: 'Registered farms',
        value: '24',
        detail: '56.4 hectares under active monitoring',
        icon: MapPinned,
        tone: 'farms',
    },
];

export const latestAlerts: FieldAlert[] = [
    {
        id: 'alert-1',
        title: 'Low soil moisture detected',
        description: 'Moisture fell below the 45% irrigation threshold.',
        farm: 'Bay Organic Estate',
        time: '8 min ago',
        priority: 'Critical',
        kind: 'moisture',
    },
    {
        id: 'alert-2',
        title: 'Soil pH needs review',
        description: 'The latest pH reading is 5.6, below the crop target.',
        farm: 'Los Baños Cornfield',
        time: '21 min ago',
        priority: 'Warning',
        kind: 'ph',
    },
    {
        id: 'alert-3',
        title: 'Sensor connection lost',
        description: 'The device has not checked in since the morning round.',
        farm: 'San Pablo Onion Patch',
        time: '42 min ago',
        priority: 'Warning',
        kind: 'connection',
    },
];

export const recentAnnouncements: Announcement[] = [
    {
        id: 'announcement-1',
        title: 'Afternoon rainfall advisory',
        message: 'Rain is expected across Laguna. Pause irrigation plans where soil moisture is already optimal.',
        audience: 'All registered farmers',
        publishedAt: 'Published today, 9:00 AM',
        priority: 'Important',
    },
    {
        id: 'announcement-2',
        title: 'July calibration window',
        message: 'Field teams will visit selected farms for scheduled sensor calibration this week.',
        audience: '6 affected farms',
        publishedAt: 'Published yesterday',
        priority: 'Advisory',
    },
    {
        id: 'announcement-3',
        title: 'Crop recommendation update',
        message: 'New soil recommendations are available for farms with completed weekly readings.',
        audience: 'All registered farmers',
        publishedAt: 'Published Jul 20',
        priority: 'Advisory',
    },
];

export const latestSensorReadings: SensorReading[] = [
    {
        id: 'GP-CL-001',
        farm: 'Calamba Green Acres',
        crop: 'Rice',
        health: 'Healthy',
        moisture: '52%',
        ph: '6.8',
        temperature: '27.4°C',
        humidity: '74%',
        updated: '2 min ago',
    },
    {
        id: 'GP-LB-002',
        farm: 'Los Baños Cornfield',
        crop: 'Corn',
        health: 'Warning',
        moisture: '48%',
        ph: '6.1',
        temperature: '28.1°C',
        humidity: '71%',
        updated: '5 min ago',
    },
    {
        id: 'GP-BY-003',
        farm: 'Bay Organic Estate',
        crop: 'Tomato',
        health: 'Critical',
        moisture: '39%',
        ph: '5.6',
        temperature: '29.0°C',
        humidity: '69%',
        updated: '8 min ago',
    },
    {
        id: 'GP-SR-004',
        farm: 'Sta. Rosa Farmstead',
        crop: 'Eggplant',
        health: 'Healthy',
        moisture: '55%',
        ph: '6.6',
        temperature: '26.8°C',
        humidity: '76%',
        updated: '11 min ago',
    },
];
