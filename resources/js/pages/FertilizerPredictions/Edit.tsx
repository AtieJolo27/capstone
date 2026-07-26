import FertilizerPredictionForm from '@/components/forms/FertilizerPredictionForm';
import type { FertilizerPredictionFormOptions } from '@/components/forms/FertilizerPredictionForm';
import type { FertilizerPrediction } from '@/types';

interface FertilizerPredictionEditPageProps {
    fertilizerPrediction: FertilizerPrediction;
    formOptions: FertilizerPredictionFormOptions;
    readOnly: boolean;
}

export default function FertilizerPredictionEditPage({
    fertilizerPrediction,
    formOptions,
    readOnly,
}: FertilizerPredictionEditPageProps) {
    return <FertilizerPredictionForm fertilizerPrediction={fertilizerPrediction} formOptions={formOptions} readOnly={readOnly} />;
}
