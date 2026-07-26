import {
    AlertTriangle,
    CloudOff,
    HeartPulse,
    MapPinned,
    OctagonAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AnnouncementsFeed from '@/components/dashboard/AnnouncementsFeed';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EnvironmentalAverages from '@/components/dashboard/EnvironmentalAverages';
import FleetStatCard from '@/components/dashboard/FleetStatCard';
import LatestAlerts from '@/components/dashboard/LatestAlerts';
import LatestSensorReadings from '@/components/dashboard/LatestSensorReadings';
import MoistureTrendChart from '@/components/dashboard/MoistureTrendChart';
import type {MoistureRange} from '@/components/dashboard/MoistureTrendChart';
import NpkDistributionChart from '@/components/dashboard/NpkDistributionChart';
import SoilHealthAnalytics from '@/components/dashboard/SoilHealthAnalytics';
import type {
    DashboardAverages,
    DashboardStat,
    MoistureTrendPoint,
} from '@/components/dashboard/types';
import AdminLayout from '@/layouts/AdminLayout';
import type { Alert, Announcement, SensorReading } from '@/types';

interface DashboardProps {
    summary: {
        sensors: {
            healthy: number;
            warning: number;
            critical: number;
            offline: number;
            total: number;
        };
        farms: {
            count: number;
            active_area: number;
        };
        open_alerts: number;
    };
    latestReadings: SensorReading[];
    latestAlerts: Alert[];
    announcements: Announcement[];
    charts: {
        moistureTrend: MoistureTrendPoint[];
        averages: DashboardAverages;
    };
}

export default function Dashboard({
    summary,
    latestReadings,
    latestAlerts,
    announcements,
    charts,
}: DashboardProps) {
    const [moistureRange, setMoistureRange] = useState<MoistureRange>('7d');
    const dashboardStats = useMemo<DashboardStat[]>(
        () => [
            {
                label: 'Healthy sensors',
                value: String(summary.sensors.healthy),
                detail: `${summary.sensors.total} registered devices`,
                icon: HeartPulse,
                tone: 'healthy',
            },
            {
                label: 'Warning sensors',
                value: String(summary.sensors.warning),
                detail: 'Devices that need attention soon',
                icon: AlertTriangle,
                tone: 'warning',
            },
            {
                label: 'Critical sensors',
                value: String(summary.sensors.critical),
                detail: `${summary.open_alerts} unresolved alerts`,
                icon: OctagonAlert,
                tone: 'critical',
            },
            {
                label: 'Offline sensors',
                value: String(summary.sensors.offline),
                detail: 'Devices not currently reporting',
                icon: CloudOff,
                tone: 'offline',
            },
            {
                label: 'Registered farms',
                value: String(summary.farms.count),
                detail: `${summary.farms.active_area.toFixed(1)} hectares active`,
                icon: MapPinned,
                tone: 'farms',
            },
        ],
        [summary],
    );

    return (
        <AdminLayout>
            <div className="mx-auto max-w-[1540px] space-y-7 px-5 py-6 sm:px-7 sm:py-8 lg:space-y-8 lg:px-10 lg:py-9">
                <DashboardHeader />

                <section aria-label="Sensor network summary">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4">
                        {dashboardStats.map((stat) => (
                            <FleetStatCard key={stat.label} stat={stat} />
                        ))}
                    </div>
                </section>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(340px,0.82fr)]">
                    <SoilHealthAnalytics averages={charts.averages} />
                    <LatestAlerts alerts={latestAlerts} openAlertCount={summary.open_alerts} />
                </div>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.82fr)]">
                    <MoistureTrendChart
                        range={moistureRange}
                        onRangeChange={setMoistureRange}
                        trend={charts.moistureTrend}
                    />
                    <EnvironmentalAverages averages={charts.averages} />
                </div>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
                    <NpkDistributionChart averages={charts.averages} />
                    <LatestSensorReadings readings={latestReadings} />
                </div>

                <AnnouncementsFeed announcements={announcements} />
            </div>
        </AdminLayout>
    );
}
