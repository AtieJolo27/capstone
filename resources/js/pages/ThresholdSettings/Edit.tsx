import ThresholdSettingForm from '@/components/forms/ThresholdSettingForm';
import type { ThresholdSetting } from '@/types';

interface RelationshipOption {
    id: number | string;
    label: string;
}

interface ThresholdSettingEditPageProps {
    thresholdSetting: ThresholdSetting;
    formOptions: {
        farms: RelationshipOption[];
        sensors: RelationshipOption[];
    };
    readOnly?: boolean;
}

export default function ThresholdSettingEditPage({
    thresholdSetting,
    formOptions,
    readOnly = false,
}: ThresholdSettingEditPageProps) {
    return (
        <ThresholdSettingForm
            thresholdSetting={thresholdSetting}
            farms={formOptions.farms}
            sensors={formOptions.sensors}
            readOnly={readOnly}
        />
    );
}
