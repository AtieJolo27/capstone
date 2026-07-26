import SensorReadingForm from '@/components/forms/SensorReadingForm';
import type { Farm, SensorDevice, SensorReading } from '@/types';

type SensorOption = Pick<
    SensorDevice,
    'id' | 'sensor_code' | 'device_name' | 'status'
> & {
    farm?: Pick<Farm, 'id' | 'farm_name' | 'municipality' | 'province'> | null;
};

interface SensorReadingEditPageProps {
    sensorReading: SensorReading;
    formOptions: {
        sensors: SensorOption[];
    };
    readOnly?: boolean;
}

export default function SensorReadingEditPage({
    sensorReading,
    formOptions,
    readOnly = false,
}: SensorReadingEditPageProps) {
    return (
        <SensorReadingForm
            sensorReading={sensorReading}
            sensors={formOptions.sensors}
            readOnly={readOnly}
        />
    );
}
