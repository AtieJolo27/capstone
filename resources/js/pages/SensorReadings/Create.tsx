import SensorReadingForm from '@/components/forms/SensorReadingForm';
import type { Farm, SensorDevice } from '@/types';

type SensorOption = Pick<
    SensorDevice,
    'id' | 'sensor_code' | 'device_name' | 'status'
> & {
    farm?: Pick<Farm, 'id' | 'farm_name' | 'municipality' | 'province'> | null;
};

interface SensorReadingCreatePageProps {
    formOptions: {
        sensors: SensorOption[];
    };
}

export default function SensorReadingCreatePage({
    formOptions,
}: SensorReadingCreatePageProps) {
    return <SensorReadingForm sensors={formOptions.sensors} />;
}
