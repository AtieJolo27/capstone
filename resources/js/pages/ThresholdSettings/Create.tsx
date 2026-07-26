import ThresholdSettingForm from '@/components/forms/ThresholdSettingForm';

interface RelationshipOption {
    id: number | string;
    label: string;
}

interface ThresholdSettingCreatePageProps {
    formOptions: {
        farms: RelationshipOption[];
        sensors: RelationshipOption[];
    };
}

export default function ThresholdSettingCreatePage({
    formOptions,
}: ThresholdSettingCreatePageProps) {
    return (
        <ThresholdSettingForm
            farms={formOptions.farms}
            sensors={formOptions.sensors}
        />
    );
}
