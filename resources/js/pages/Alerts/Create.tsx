import AlertForm from '@/components/forms/AlertForm';

interface RelationshipOption {
    id: number | string;
    label: string;
}

interface AlertCreatePageProps {
    formOptions: {
        farms: RelationshipOption[];
        sensors: RelationshipOption[];
        sensorReadings: RelationshipOption[];
    };
}

export default function AlertCreatePage({
    formOptions,
}: AlertCreatePageProps) {
    return (
        <AlertForm
            farms={formOptions.farms}
            sensors={formOptions.sensors}
            sensorReadings={formOptions.sensorReadings}
        />
    );
}
