import SensorDeviceForm from '@/components/forms/SensorDeviceForm';
import type { Farm } from '@/types';

type FarmOption = Pick<Farm, 'id' | 'farm_name' | 'municipality' | 'province'>;

interface SensorCreatePageProps {
    formOptions: {
        farms: FarmOption[];
    };
}

export default function SensorCreatePage({
    formOptions,
}: SensorCreatePageProps) {
    return <SensorDeviceForm farms={formOptions.farms} />;
}
