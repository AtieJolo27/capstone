import SensorDeviceForm from '@/components/forms/SensorDeviceForm';
import type { Farm, SensorDevice } from '@/types';

type FarmOption = Pick<Farm, 'id' | 'farm_name' | 'municipality' | 'province'>;

interface SensorEditPageProps {
    sensor: SensorDevice;
    formOptions: {
        farms: FarmOption[];
    };
    readOnly?: boolean;
}

export default function SensorEditPage({
    sensor,
    formOptions,
    readOnly = false,
}: SensorEditPageProps) {
    return (
        <SensorDeviceForm
            sensor={sensor}
            farms={formOptions.farms}
            readOnly={readOnly}
        />
    );
}
