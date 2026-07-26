import CropPredictionForm from '@/components/forms/CropPredictionForm';
import type { CropPredictionFormOptions } from '@/components/forms/CropPredictionForm';

interface CropPredictionCreatePageProps {
    formOptions: CropPredictionFormOptions;
}

export default function CropPredictionCreatePage({ formOptions }: CropPredictionCreatePageProps) {
    return <CropPredictionForm formOptions={formOptions} />;
}
