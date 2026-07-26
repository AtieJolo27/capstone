import AlertForm from '@/components/forms/AlertForm';
import type { Alert } from '@/types';

interface RelationshipOption {
    id: number | string;
    label: string;
}

interface AlertEditPageProps {
    alert: Alert;
    formOptions: {
        farms: RelationshipOption[];
        sensors: RelationshipOption[];
        sensorReadings: RelationshipOption[];
    };
    readOnly?: boolean;
}

export default function AlertEditPage({
    alert,
    formOptions,
    readOnly = false,
}: AlertEditPageProps) {
    return (
        <AlertForm
            alert={alert}
            farms={formOptions.farms}
            sensors={formOptions.sensors}
            sensorReadings={formOptions.sensorReadings}
            readOnly={readOnly}
        />
    );
}
