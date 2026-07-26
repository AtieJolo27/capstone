import CropPredictionForm from '@/components/forms/CropPredictionForm';
import type { CropPredictionFormOptions } from '@/components/forms/CropPredictionForm';
import type { CropPrediction } from '@/types';

interface CropPredictionEditPageProps {
    cropPrediction: CropPrediction;
    formOptions: CropPredictionFormOptions;
    readOnly: boolean;
}

export default function CropPredictionEditPage({ cropPrediction, formOptions, readOnly }: CropPredictionEditPageProps) {
    return <CropPredictionForm cropPrediction={cropPrediction} formOptions={formOptions} readOnly={readOnly} />;
}
